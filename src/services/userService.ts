// src/services/userService.ts
import { doc, getDoc, setDoc, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore';

// ... (other imports)

export const updatePushToken = async (uid: string, token: string): Promise<void> => {
    try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        await updateDoc(userRef, {
            pushToken: token,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating push token:', error);
    }
};
import { db } from './firebase';
import { BulgarianUser, BaseProfile } from '../types/user/bulgarian-user.types';
import { User } from 'firebase/auth';

const USERS_COLLECTION = 'users';
const COUNTERS_COLLECTION = 'counters';
const USER_COUNTER_DOC = 'users';

export const getUserProfile = async (uid: string): Promise<BulgarianUser | null> => {
    try {
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
        if (userDoc.exists()) {
            return userDoc.data() as BulgarianUser;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
};

export const createUserProfile = async (authUser: User): Promise<BulgarianUser | null> => {
    try {
        // 1. Check if user already exists
        const existingProfile = await getUserProfile(authUser.uid);
        if (existingProfile) return existingProfile;

        // 2. Generate Numeric ID with Transaction
        let numericId = 0;
        try {
            await runTransaction(db, async (transaction) => {
                const counterRef = doc(db, COUNTERS_COLLECTION, USER_COUNTER_DOC);
                const counterDoc = await transaction.get(counterRef);

                if (!counterDoc.exists()) {
                    // Initialize counter if not exists (start at 1000 for safety)
                    transaction.set(counterRef, { count: 1000 });
                    numericId = 1001;
                } else {
                    const newCount = counterDoc.data().count + 1;
                    transaction.update(counterRef, { count: newCount });
                    numericId = newCount;
                }
            });
        } catch (e) {
            console.error("Transaction failed: ", e);
            // Fallback or retry logic could go here
            // For basic safety, we might standardly fail or use a random large number (not ideal for constitution)
            numericId = Math.floor(Date.now() / 1000);
        }

        // 3. Create User Document
        const newProfile: BaseProfile = {
            uid: authUser.uid,
            email: authUser.email || '',
            displayName: authUser.displayName || 'User',
            photoURL: authUser.photoURL || undefined,
            numericId: numericId,
            phoneCountryCode: '+359',
            preferredLanguage: 'bg',
            currency: 'EUR',
            profileType: 'private',
            planTier: 'free',
            permissions: {
                canAddListings: true,
                maxListings: 2,
                maxMonthlyListings: 2,
                canEditLockedFields: false,
                maxFlexEditsPerMonth: 0,
                canBulkUpload: false,
                bulkUploadLimit: 0,
                canCloneListing: false,
                hasAnalytics: false,
                hasAdvancedAnalytics: false,
                hasTeam: false,
                canExportData: false,
                hasPrioritySupport: false,
                canUseQuickReplies: false,
                canBulkEdit: false,
                canImportCSV: false,
                canUseAPI: false,
                themeMode: 'standard'
            },
            verification: {
                email: authUser.emailVerified,
                phone: false,
                id: false,
                business: false
            },
            stats: {
                totalListings: 0,
                activeListings: 0,
                totalViews: 0,
                totalMessages: 0,
                trustScore: 50
            },
            createdAt: serverTimestamp() as any, // Timestamp handling depends on SDK version, casting for now
            updatedAt: serverTimestamp() as any,
            isActive: true,
            isBanned: false
        };

        // Cast to Union Type (PrivateProfile defaults)
        const userDoc: BulgarianUser = {
            ...newProfile,
            profileType: 'private',
            // Private specific fields
        };

        await setDoc(doc(db, USERS_COLLECTION, authUser.uid), userDoc);
        return userDoc;

    } catch (error) {
        console.error('Error creating user profile:', error);
        return null;
    }
};
