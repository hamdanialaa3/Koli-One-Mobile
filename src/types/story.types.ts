// src/types/story.types.ts
// Car Story Types - أنواع قصص السيارات
// الهدف: قصص Instagram-style للسيارات (صوت المحرك، الداخلية، إلخ)
// ✅ CONSTITUTIONAL COMPLIANCE: Numeric ID System enforced

export type StoryType =
    | 'engine_sound'        // صوت المحرك
    | 'interior_360'        // 360 درجة داخلية
    | 'exterior_walkaround' // جولة خارجية
    | 'defect_highlight';   // عيوب واضحة

export interface CarStory {
    id: string;
    carNumericId: number;
    sellerNumericId: number;
    authorId: string;
    type: StoryType;
    videoUrl: string;
    thumbnailUrl: string;
    durationSec: number;
    createdAt: number;
    expiresAt: number;
    status: 'active' | 'expired' | 'deleted';
    viewCount: number;
    viewedBy: string[];
    reactions?: { [userId: string]: string };
    visibility: 'public' | 'followers' | 'close_friends';
    authorInfo?: {
        displayName: string;
        profileImage?: string;
        profileType?: 'private' | 'dealer' | 'company';
        isVerified?: boolean;
    };
    order?: number;
}
