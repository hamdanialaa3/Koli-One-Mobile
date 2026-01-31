import { db } from './firebase';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    orderBy,
    onSnapshot,
    Timestamp,
    setDoc,
    getDoc,
    limit
} from 'firebase/firestore';
import { Message, Conversation } from '../types/Messaging';

export class ConversationService {
    /**
     * Get or create a conversation between two users about a specific car
     */
    static async getOrCreateConversation(
        buyerId: string,
        sellerId: string,
        carId: string,
        carData: { title: string, image?: string }
    ): Promise<string> {
        const conversationId = [buyerId, sellerId, carId].sort().join('_');
        const convRef = doc(db, 'conversations', conversationId);
        const convSnap = await getDoc(convRef);

        if (!convSnap.exists()) {
            await setDoc(convRef, {
                id: conversationId,
                participants: [buyerId, sellerId],
                carId,
                carTitle: carData.title,
                carImage: carData.image || null,
                createdAt: Date.now(),
                lastMessageTime: Date.now(),
                lastMessage: 'Conversation started',
                unreadCount: 0
            });
        }

        return conversationId;
    }

    /**
     * Send a message in a conversation
     */
    static async sendMessage(
        conversationId: string,
        senderId: string,
        text: string
    ): Promise<void> {
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const now = Date.now();

        await addDoc(messagesRef, {
            senderId,
            text,
            createdAt: now,
            read: false
        });

        // Update last message in conversation
        const convRef = doc(db, 'conversations', conversationId);
        await updateDoc(convRef, {
            lastMessage: text,
            lastMessageTime: now
        });
    }

    /**
     * Listen to active conversations for a user
     */
    static subscribeToConversations(userId: string, onUpdate: (convs: Conversation[]) => void) {
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', userId),
            orderBy('lastMessageTime', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const convs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Conversation));
            onUpdate(convs);
        });
    }

    /**
     * Listen to messages in a specific conversation
     */
    static subscribeToMessages(conversationId: string, onUpdate: (msgs: Message[]) => void) {
        const q = query(
            collection(db, 'conversations', conversationId, 'messages'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        return onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            onUpdate(msgs);
        });
    }
}
