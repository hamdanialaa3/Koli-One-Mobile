import { rtdb, auth } from './firebase';
import {
    ref,
    push,
    set,
    get,
    onValue,
    update,
    serverTimestamp,
    query,
    orderByChild,
    limitToLast,
    off
} from 'firebase/database';

export interface RealtimeMessage {
    id: string;
    channelId: string;
    senderId: number;
    senderFirebaseId: string;
    recipientId: number;
    recipientFirebaseId: string;
    content: string;
    type: 'text' | 'offer' | 'image' | 'system' | 'location';
    timestamp: number;
    read: boolean;
    status: 'sent' | 'delivered' | 'read';
}

export interface RealtimeChannel {
    id: string;
    buyerNumericId: number;
    sellerNumericId: number;
    buyerName: string;
    sellerName: string;
    carTitle: string;
    carPrice: number;
    carImage: string;
    updatedAt: number;
    lastMessage?: {
        content: string;
        timestamp: number;
    };
}

export class MessagingService {
    /**
     * Generate unique channel ID between 2 users for a specific car
     * Format: msg_{smallerId}_{largerId}_car_{carNumericId}
     */
    static generateChannelId(u1: number, u2: number, carId: number): string {
        const sorted = [u1, u2].sort((a, b) => a - b);
        return `msg_${sorted[0]}_${sorted[1]}_car_${carId}`;
    }

    /**
     * Send message to RTDB
     */
    static async sendMessage(channelId: string, message: Partial<RealtimeMessage>) {
        if (!auth.currentUser) throw new Error("Auth required");

        const msgRef = push(ref(rtdb, `messages/${channelId}`));
        const now = Date.now();

        const fullMessage = {
            ...message,
            id: msgRef.key,
            channelId,
            timestamp: now,
            read: false,
            status: 'sent'
        };

        await set(msgRef, fullMessage);

        // Update channel metadata
        const channelRef = ref(rtdb, `channels/${channelId}`);
        await update(channelRef, {
            updatedAt: now,
            lastMessage: {
                content: message.content,
                timestamp: now
            }
        });
    }

    /**
     * Listen for messages in a channel
     */
    static subscribeToMessages(channelId: string, callback: (msgs: RealtimeMessage[]) => void) {
        const msgsRef = query(
            ref(rtdb, `messages/${channelId}`),
            orderByChild('timestamp'),
            limitToLast(100)
        );

        return onValue(msgsRef, (snapshot) => {
            const msgs: RealtimeMessage[] = [];
            snapshot.forEach((child) => {
                msgs.push({ id: child.key, ...child.val() });
            });
            callback(msgs);
        });
    }

    /**
     * Get user's active conversations
     */
    static subscribeToUserChannels(userNumericId: number, callback: (channels: RealtimeChannel[]) => void) {
        const userChannelsRef = ref(rtdb, `user_channels/${userNumericId}`);
        let isActive = true;

        const unsub = onValue(userChannelsRef, async (snapshot) => {
            if (!isActive) return;
            if (!snapshot.exists()) {
                callback([]);
                return;
            }

            const channelIds = Object.keys(snapshot.val());
            const channels: RealtimeChannel[] = [];

            for (const id of channelIds) {
                if (!isActive) return;
                const cRef = ref(rtdb, `channels/${id}`);
                const cSnap = await get(cRef);
                if (!isActive) return;
                if (cSnap.exists()) {
                    channels.push({ id, ...cSnap.val() });
                }
            }
            if (isActive) {
                callback(channels.sort((a, b) => b.updatedAt - a.updatedAt));
            }
        });

        return () => {
            isActive = false;
            unsub();
        };
    }

    // ── Typing Indicators ──────────────────────────────────────────

    /**
     * Set current user's typing status in a channel.
     * Writes to `typing/{channelId}/{userId}` with a timestamp.
     * Call with `isTyping = false` or let a timeout clear it.
     */
    static async setTyping(channelId: string, isTyping: boolean): Promise<void> {
        if (!auth.currentUser) return;
        const uid = auth.currentUser.uid;
        const typingRef = ref(rtdb, `typing/${channelId}/${uid}`);
        if (isTyping) {
            await set(typingRef, { typing: true, ts: serverTimestamp() });
        } else {
            await set(typingRef, null);
        }
    }

    /**
     * Subscribe to typing status for a given channel.
     * Calls back with an array of user UIDs currently typing.
     */
    static subscribeToTyping(
        channelId: string,
        callback: (typingUids: string[]) => void
    ) {
        const typingRef = ref(rtdb, `typing/${channelId}`);
        return onValue(typingRef, (snapshot) => {
            if (!snapshot.exists()) { callback([]); return; }
            const data = snapshot.val() as Record<string, { typing: boolean; ts: number }>;
            const now = Date.now();
            const active = Object.entries(data)
                .filter(([, v]) => v.typing && (now - (v.ts || 0)) < 15_000) // 15s timeout
                .map(([uid]) => uid);
            callback(active);
        });
    }

    // ── Read Receipts ──────────────────────────────────────────────

    /**
     * Mark all unread messages in a channel as read for the current user.
     * Updates `read: true` and `status: 'read'` on each message not sent by this user.
     */
    static async markAsRead(channelId: string): Promise<void> {
        if (!auth.currentUser) return;
        const uid = auth.currentUser.uid;

        const msgsRef = query(
            ref(rtdb, `messages/${channelId}`),
            orderByChild('timestamp'),
            limitToLast(100)
        );
        const snapshot = await get(msgsRef);
        if (!snapshot.exists()) return;

        const updates: Record<string, any> = {};
        snapshot.forEach((child) => {
            const msg = child.val();
            if (msg.senderFirebaseId !== uid && !msg.read) {
                updates[`messages/${channelId}/${child.key}/read`] = true;
                updates[`messages/${channelId}/${child.key}/status`] = 'read';
                updates[`messages/${channelId}/${child.key}/readAt`] = serverTimestamp();
            }
        });

        if (Object.keys(updates).length > 0) {
            const rootRef = ref(rtdb);
            await update(rootRef, updates);
        }
    }

    // ── Offer Accept / Reject ──────────────────────────────────────

    /**
     * Send a system message recording offer acceptance or rejection.
     */
    static async respondToOffer(
        channelId: string,
        originalMessageId: string,
        action: 'accept' | 'reject',
        senderNumericId: number,
        recipientNumericId: number,
    ): Promise<void> {
        if (!auth.currentUser) throw new Error('Auth required');

        // Mark the original offer message
        const offerRef = ref(rtdb, `messages/${channelId}/${originalMessageId}`);
        await update(offerRef, { offerStatus: action });

        // Send a system message
        const label = action === 'accept' ? 'прие офертата' : 'отхвърли офертата';
        await MessagingService.sendMessage(channelId, {
            content: `${auth.currentUser.displayName || 'Потребител'} ${label}.`,
            type: 'system',
            senderId: senderNumericId,
            senderFirebaseId: auth.currentUser.uid,
            recipientId: recipientNumericId,
            recipientFirebaseId: '', // filled by caller if needed
        });
    }
}
