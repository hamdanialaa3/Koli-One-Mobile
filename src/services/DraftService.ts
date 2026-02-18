/**
 * DraftService — Cloud-persistent auto-save for the sell wizard
 *
 * Saves wizard state (form + images + step) to Firestore under
 * users/{uid}/sell_drafts/active so it survives app reinstalls
 * and device switches.
 *
 * - scheduleSave()  → debounced write (2 s)
 * - saveDraft()     → immediate write
 * - loadDraft()     → read active draft
 * - deleteDraft()   → clean up after publish
 */

import { db, auth } from './firebase';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from './logger-service';
import { VehicleFormData } from '../types/sellTypes';
import { ImageItem } from '../store/useSellStore';

/* ─── Types ─────────────────────────────────────────── */

export interface DraftData {
    form: Partial<VehicleFormData>;
    images: ImageItem[];
    step: number;
    updatedAt: any;
}

/* ─── Service ───────────────────────────────────────── */

export class DraftService {
    private static saveTimeout: ReturnType<typeof setTimeout> | null = null;

    /** Firestore ref → users/{uid}/sell_drafts/active */
    private static getDraftRef() {
        if (!auth.currentUser) return null;
        return doc(db, 'users', auth.currentUser.uid, 'sell_drafts', 'active');
    }

    /* ── Debounced save (2 s) ───────────────────────── */
    static scheduleSave(form: Partial<VehicleFormData>, images: ImageItem[], step: number) {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);

        this.saveTimeout = setTimeout(() => {
            this.saveDraft(form, images, step);
        }, 2000);
    }

    /* ── Immediate save ─────────────────────────────── */
    static async saveDraft(
        form: Partial<VehicleFormData>,
        images: ImageItem[],
        step: number,
    ): Promise<void> {
        const ref = this.getDraftRef();
        if (!ref) return; // not authenticated

        try {
            // Serialise images — keep only fields Firestore can store
            const serializableImages = images.map(img => ({
                id: img.id,
                uri: img.uri,
                status: img.status,
                progress: img.progress,
            }));

            await setDoc(
                ref,
                {
                    form,
                    images: serializableImages,
                    step,
                    updatedAt: serverTimestamp(),
                },
                { merge: true },
            );

            logger.debug('Draft auto-saved to Firestore');
        } catch (error) {
            logger.error('DraftService: failed to save draft', error);
        }
    }

    /* ── Load active draft ──────────────────────────── */
    static async loadDraft(): Promise<DraftData | null> {
        const ref = this.getDraftRef();
        if (!ref) return null;

        try {
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;
            return snap.data() as DraftData;
        } catch (error) {
            logger.error('DraftService: failed to load draft', error);
            return null;
        }
    }

    /* ── Delete after successful publish ────────────── */
    static async deleteDraft(): Promise<void> {
        const ref = this.getDraftRef();
        if (!ref) return;

        try {
            await deleteDoc(ref);
            logger.info('DraftService: draft deleted after publish');
        } catch (error) {
            logger.error('DraftService: failed to delete draft', error);
        }
    }

    /* ── Housekeeping ───────────────────────────────── */
    static cancelPendingSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }
    }
}
