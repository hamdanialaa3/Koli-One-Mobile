/**
 * Story Types — Instagram-style short video content for cars.
 *
 * ✅ CONSTITUTIONAL COMPLIANCE: Numeric ID System enforced
 * @since Phase 4.1 — Visual Immersion Protocol
 */

export type StoryType =
  | 'engine_sound'
  | 'interior_360'
  | 'exterior_walkaround'
  | 'defect_highlight';

export interface Story {
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
  reactions?: Record<string, string>;
  visibility: 'public' | 'followers' | 'close_friends';
  authorInfo?: StoryAuthorInfo;
  order?: number;
}

export interface StoryAuthorInfo {
  displayName: string;
  profileImage?: string;
  profileType?: 'private' | 'dealer' | 'company';
  isVerified?: boolean;
}
