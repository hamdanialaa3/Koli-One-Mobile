/**
 * Koli One — Master Animation System
 * Centralized animation presets for production-grade mobile UX
 */
import {
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  SlideInRight,
  SlideInLeft,
  SlideOutRight,
  SlideOutLeft,
  ZoomIn,
  ZoomOut,
  Layout,
  type AnimationCallback,
} from 'react-native-reanimated';

// ─── Spring Configs ───────────────────────────────
export const springs = {
  /** Snappy, responsive — buttons, toggles */
  snappy: { damping: 20, stiffness: 300, mass: 0.8 },
  /** Smooth, elegant — modals, sheets */
  smooth: { damping: 18, stiffness: 200, mass: 1 },
  /** Bouncy, playful — cards, badges */
  bouncy: { damping: 12, stiffness: 180, mass: 0.9 },
  /** Gentle, slow — page transitions */
  gentle: { damping: 20, stiffness: 120, mass: 1.2 },
  /** Heavy, grounded — drag and drop */
  heavy: { damping: 25, stiffness: 250, mass: 1.5 },
};

// ─── Timing Configs ───────────────────────────────
export const timings = {
  fast: { duration: 200, easing: Easing.out(Easing.cubic) },
  normal: { duration: 300, easing: Easing.inOut(Easing.cubic) },
  slow: { duration: 500, easing: Easing.inOut(Easing.cubic) },
  entrance: { duration: 400, easing: Easing.out(Easing.exp) },
  exit: { duration: 250, easing: Easing.in(Easing.cubic) },
};

// ─── Entering Animations ──────────────────────────
export const entering = {
  fadeIn: FadeIn.duration(300),
  fadeInDown: FadeInDown.duration(400).springify().damping(18),
  fadeInUp: FadeInUp.duration(400).springify().damping(18),
  fadeInLeft: FadeInLeft.duration(350).springify().damping(20),
  fadeInRight: FadeInRight.duration(350).springify().damping(20),
  slideInRight: SlideInRight.duration(300).springify(),
  slideInLeft: SlideInLeft.duration(300).springify(),
  zoomIn: ZoomIn.duration(350).springify().damping(15),
  /** Staggered entrance for list items */
  staggered: (index: number, base = 50) =>
    FadeInUp.delay(index * base)
      .duration(400)
      .springify()
      .damping(18),
  /** Card entrance with slight scale */
  cardEntrance: (index: number) =>
    FadeInDown.delay(index * 80)
      .duration(450)
      .springify()
      .damping(16)
      .stiffness(140),
};

// ─── Exiting Animations ──────────────────────────
export const exiting = {
  fadeOut: FadeOut.duration(200),
  slideOutRight: SlideOutRight.duration(250),
  slideOutLeft: SlideOutLeft.duration(250),
  zoomOut: ZoomOut.duration(200),
};

// ─── Layout Animations ───────────────────────────
export const layoutAnimation = Layout.springify().damping(18).stiffness(200);

// ─── Preset Animated Values ──────────────────────
export const animateValue = {
  /** Smooth opacity transition */
  opacity: (to: number) => withTiming(to, timings.normal),
  /** Spring scale — press feedback */
  pressScale: (pressed: boolean) =>
    withSpring(pressed ? 0.95 : 1, springs.snappy),
  /** Bounce scale — attention */
  bounceScale: (to: number) => withSpring(to, springs.bouncy),
  /** Slide value */
  slide: (to: number) => withSpring(to, springs.smooth),
  /** Delayed entrance */
  delayedFade: (delay: number) =>
    withDelay(delay, withTiming(1, timings.entrance)),
};

// ─── Screen Transition Presets ───────────────────
export const screenTransitions = {
  /** Standard iOS push */
  push: {
    animation: 'slide_from_right' as const,
    animationDuration: 300,
  },
  /** Modal presentation */
  modal: {
    animation: 'slide_from_bottom' as const,
    animationDuration: 350,
  },
  /** Fade transition */
  fade: {
    animation: 'fade' as const,
    animationDuration: 250,
  },
  /** Flip card transition */
  flip: {
    animation: 'flip' as const,
    animationDuration: 400,
  },
};

// ─── Tab Animation Helpers ───────────────────────
export const tabAnimations = {
  /** Active tab icon bounce */
  iconScale: (active: boolean) =>
    withSpring(active ? 1.15 : 1, springs.snappy),
  /** Tab label fade */
  labelOpacity: (active: boolean) =>
    withTiming(active ? 1 : 0.6, timings.fast),
  /** Badge pop-in */
  badgeScale: (visible: boolean) =>
    withSpring(visible ? 1 : 0, springs.bouncy),
};
