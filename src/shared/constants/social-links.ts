/**
 * Social Links — Official Koli One social media profiles.
 * Used across both web and mobile for footer/about pages.
 */
export const SOCIAL_LINKS = {
  INSTAGRAM: 'https://www.instagram.com/kolione/',
  TIKTOK: 'https://www.tiktok.com/@mobilebg.eu',
  THREADS: 'https://www.threads.com/@kolione',
  LINKEDIN: 'https://www.linkedin.com/in/koli-one-a011993a9/',
  FACEBOOK: 'https://www.facebook.com/koli.one/',
  YOUTUBE: 'https://www.youtube.com/@Kolionebg',
  X: 'https://x.com/kolionebg',
} as const;

export type SocialPlatform = keyof typeof SOCIAL_LINKS;
