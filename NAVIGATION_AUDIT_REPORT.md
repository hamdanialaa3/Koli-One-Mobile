# Mobile App Navigation & CSS Audit Report

**Date:** 2026-02-14  
**Scope:** `mobile_new/` Expo Router app  
**Total route files found:** 73  
**Total unique navigation targets audited:** ~50  

---

## 1. All Route Files Found (`app/` directory)

### Core
| # | File | Route |
|---|------|-------|
| 1 | `app/_layout.tsx` | Root layout |
| 2 | `app/index.tsx` | `/` → Redirects to `/(tabs)` |
| 3 | `app/+not-found.tsx` | 404 handler |
| 4 | `app/+html.tsx` | Web HTML wrapper |
| 5 | `app/modal.tsx` | `/modal` (dead code — never navigated to) |

### Tabs (`(tabs)/`)
| # | File | Route |
|---|------|-------|
| 6 | `app/(tabs)/_layout.tsx` | Tab layout |
| 7 | `app/(tabs)/index.tsx` | `/(tabs)` — Home |
| 8 | `app/(tabs)/search.tsx` | `/(tabs)/search` |
| 9 | `app/(tabs)/sell.tsx` | `/(tabs)/sell` |
| 10 | `app/(tabs)/messages.tsx` | `/(tabs)/messages` |
| 11 | `app/(tabs)/profile.tsx` | `/(tabs)/profile` |

### Auth (`(auth)/`)
| # | File | Route |
|---|------|-------|
| 12 | `app/(auth)/_layout.tsx` | Auth layout |
| 13 | `app/(auth)/login.tsx` | `/(auth)/login` |
| 14 | `app/(auth)/register.tsx` | `/(auth)/register` |
| 15 | `app/(auth)/forgot-password.tsx` | `/(auth)/forgot-password` |
| 16 | `app/(auth)/email-verification.tsx` | `/(auth)/email-verification` |

### Car
| # | File | Route |
|---|------|-------|
| 17 | `app/car/[id].tsx` | `/car/:id` |
| 18 | `app/car/[id]/history.tsx` | `/car/:id/history` |

### Chat
| # | File | Route |
|---|------|-------|
| 19 | `app/chat/[id].tsx` | `/chat/:id` |

### Profile
| # | File | Route |
|---|------|-------|
| 20 | `app/profile/[id].tsx` | `/profile/:id` |
| 21 | `app/profile/edit.tsx` | `/profile/edit` |
| 22 | `app/profile/settings.tsx` | `/profile/settings` |
| 23 | `app/profile/my-ads.tsx` | `/profile/my-ads` |
| 24 | `app/profile/favorites.tsx` | `/profile/favorites` |
| 25 | `app/profile/drafts.tsx` | `/profile/drafts` |
| 26 | `app/profile/dashboard.tsx` | `/profile/dashboard` |
| 27 | `app/profile/analytics.tsx` | `/profile/analytics` |
| 28 | `app/profile/campaigns.tsx` | `/profile/campaigns` |
| 29 | `app/profile/consultations.tsx` | `/profile/consultations` |
| 30 | `app/profile/saved-searches.tsx` | `/profile/saved-searches` |
| 31 | `app/profile/users.tsx` | `/profile/users` |
| 32 | `app/profile/following.tsx` | `/profile/following` |
| 33 | `app/profile/billing.tsx` | `/profile/billing` |
| 34 | `app/profile/subscription.tsx` | `/profile/subscription` |
| 35 | `app/profile/edit-listing/[id].tsx` | `/profile/edit-listing/:id` |
| 36 | `app/profile/admin-sections.tsx` | `/profile/admin-sections` |

### AI
| # | File | Route |
|---|------|-------|
| 37 | `app/ai/advisor.tsx` | `/ai/advisor` |
| 38 | `app/ai/valuation.tsx` | `/ai/valuation` |
| 39 | `app/ai/history.tsx` | `/ai/history` |
| 40 | `app/ai/analysis.tsx` | `/ai/analysis` |

### Marketplace
| # | File | Route |
|---|------|-------|
| 41 | `app/marketplace/index.tsx` | `/marketplace` |
| 42 | `app/marketplace/[productId].tsx` | `/marketplace/:productId` |
| 43 | `app/marketplace/cart.tsx` | `/marketplace/cart` |
| 44 | `app/marketplace/checkout.tsx` | `/marketplace/checkout` |
| 45 | `app/marketplace/order-success.tsx` | `/marketplace/order-success` |

### Dealer
| # | File | Route |
|---|------|-------|
| 46 | `app/dealer/[slug].tsx` | `/dealer/:slug` |
| 47 | `app/dealer/register.tsx` | `/dealer/register` |

### Blog
| # | File | Route |
|---|------|-------|
| 48 | `app/blog/index.tsx` | `/blog` |
| 49 | `app/blog/[slug].tsx` | `/blog/:slug` |

### Social / Financing / Discovery
| # | File | Route |
|---|------|-------|
| 50 | `app/social.tsx` | `/social` |
| 51 | `app/social/create-post.tsx` | `/social/create-post` |
| 52 | `app/financing/compare.tsx` | `/financing/compare` |
| 53 | `app/notifications.tsx` | `/notifications` |
| 54 | `app/price-alerts.tsx` | `/price-alerts` |
| 55 | `app/saved-searches.tsx` | `/saved-searches` |
| 56 | `app/my-reviews.tsx` | `/my-reviews` |
| 57 | `app/VisualSearch.tsx` | `/VisualSearch` |
| 58 | `app/advanced-search.tsx` | `/advanced-search` |
| 59 | `app/all-cars.tsx` | `/all-cars` |
| 60 | `app/brand-gallery.tsx` | `/brand-gallery` |
| 61 | `app/top-brands.tsx` | `/top-brands` |
| 62 | `app/compare.tsx` | `/compare` |
| 63 | `app/report.tsx` | `/report` |
| 64 | `app/faq.tsx` | `/faq` |
| 65 | `app/finance.tsx` | `/finance` |
| 66 | `app/dealers.tsx` | `/dealers` |
| 67 | `app/onboarding.tsx` | `/onboarding` |

### Legal
| # | File | Route |
|---|------|-------|
| 68 | `app/privacy-policy.tsx` | `/privacy-policy` |
| 69 | `app/terms-of-service.tsx` | `/terms-of-service` |
| 70 | `app/about.tsx` | `/about` |
| 71 | `app/contact.tsx` | `/contact` |
| 72 | `app/help.tsx` | `/help` |
| 73 | `app/data-deletion.tsx` | `/data-deletion` |

---

## 2. Navigation Targets — Cross-Reference

### ❌ BROKEN ROUTES (5 navigations to non-existent routes)

| # | File | Line | Navigation Call | Problem |
|---|------|------|----------------|---------|
| 1 | `app/profile/drafts.tsx` | 126 | `router.push('/sell?draftId=${item.id}')` | **No `/sell` route exists.** `sell` is only at `/(tabs)/sell`. Should be `/(tabs)/sell?draftId=${item.id}` |
| 2 | `app/profile/drafts.tsx` | 144 | `router.push('/sell')` | **Same — no `/sell` route.** Should be `/(tabs)/sell` |
| 3 | `app/profile/campaigns.tsx` | 112 | `router.push('/sell' as any)` | **Same — no `/sell` route.** Should be `/(tabs)/sell` |
| 4 | `app/saved-searches.tsx` | 280 | `router.push('/search')` | **No `/search` route exists.** `search` is only at `/(tabs)/search`. Should be `/(tabs)/search` |
| 5 | `app/saved-searches.tsx` | 317 | `router.push('/search')` | **Same — no `/search` route.** Should be `/(tabs)/search` |

### ✅ VALID ROUTES (all other navigation targets resolve correctly)

| Navigation Target | Route File | Used From |
|--------------------|-----------|-----------|
| `/(tabs)` | `app/(tabs)/index.tsx` | _layout, OnboardingContainer, login, register, email-verification, data-deletion, order-success, dealer/register |
| `/(tabs)/sell` | `app/(tabs)/sell.tsx` | SmartSellFlow, SmartSellStrip, AISmartSellButton, UnifiedSmartSell, OnboardingContainer, WizardOrchestrator |
| `/(tabs)/search` | `app/(tabs)/search.tsx` | FloatingSearchBar, SearchWidget, UnifiedSmartSell, SmartHeroRecommendations, RecentStrips, MobileDeHome, CategoriesSection, ai/valuation, profile/saved-searches |
| `/(tabs)/profile` | `app/(tabs)/profile.tsx` | MobileHeader, MobileDeHeader, MobileDeHome, messages |
| `/(tabs)/messages` | `app/(tabs)/messages.tsx` | MobileDeHeader, MobileDeHome |
| `/(auth)/login` | `app/(auth)/login.tsx` | sell, profile, register |
| `/(auth)/register` | `app/(auth)/register.tsx` | login, LoyaltyBanner |
| `/(auth)/forgot-password` | `app/(auth)/forgot-password.tsx` | login |
| `/notifications` | `app/notifications.tsx` | MobileHeader (2x), MobileDeHeader |
| `/profile/settings` | `app/profile/settings.tsx` | MobileHeader (2x), profile menu |
| `/profile/edit` | `app/profile/edit.tsx` | profile |
| `/profile/my-ads` | `app/profile/my-ads.tsx` | profile menu |
| `/profile/drafts` | `app/profile/drafts.tsx` | profile menu |
| `/profile/favorites` | `app/profile/favorites.tsx` | profile menu |
| `/profile/dashboard` | `app/profile/dashboard.tsx` | profile menu |
| `/profile/analytics` | `app/profile/analytics.tsx` | profile menu |
| `/profile/admin-sections` | `app/profile/admin-sections.tsx` | profile/settings |
| `/profile/edit-listing/[id]` | `app/profile/edit-listing/[id].tsx` | profile/my-ads |
| `/profile/:id` (dynamic) | `app/profile/[id].tsx` | DealersSpotlight, dealers, profile/users |
| `/car/:id` (dynamic) | `app/car/[id].tsx` | CarCard, price-alerts, profile/favorites, profile/my-ads, social, dealer/[slug] |
| `/chat/:id` (dynamic) | `app/chat/[id].tsx` | profile/[id], car/[id], messages |
| `/ai/advisor` | `app/ai/advisor.tsx` | MobeeBanner |
| `/dealers` | `app/dealers.tsx` | DealersSpotlight |
| `/saved-searches` | `app/saved-searches.tsx` | (tabs)/search, price-alerts |
| `/price-alerts` | `app/price-alerts.tsx` | saved-searches |
| `/contact` | `app/contact.tsx` | help |
| `/privacy-policy` | `app/privacy-policy.tsx` | help, profile/settings |
| `/terms-of-service` | `app/terms-of-service.tsx` | help, profile/settings |
| `/about` | `app/about.tsx` | help |
| `/help` | `app/help.tsx` | profile/settings, profile |
| `/data-deletion` | `app/data-deletion.tsx` | profile/settings |
| `/all-cars` | `app/all-cars.tsx` | top-brands, brand-gallery |
| `/advanced-search` | `app/advanced-search.tsx` | all-cars |
| `/marketplace` | `app/marketplace/index.tsx` | marketplace/cart, marketplace/order-success |
| `/marketplace/checkout` | `app/marketplace/checkout.tsx` | marketplace/cart |
| `/marketplace/order-success` | `app/marketplace/order-success.tsx` | marketplace/checkout |
| `/` | `app/index.tsx` | +not-found |
| Dynamic (notification data) | Unknown | `useNotifications.ts:32` — `router.push(data.url)` |

### ⚠️ DEAD ROUTES (route files that exist but are never navigated to)

| File | Route | Notes |
|------|-------|-------|
| `app/modal.tsx` | `/modal` | Expo template boilerplate, never navigated to, not declared in layout |
| `app/(auth)/email-verification.tsx` | `/(auth)/email-verification` | Used internally (user lands here), but no `router.push` to it |
| `app/profile/consultations.tsx` | `/profile/consultations` | Registered in layout but never navigated to |
| `app/profile/following.tsx` | `/profile/following` | Registered in layout but never navigated to |
| `app/profile/billing.tsx` | `/profile/billing` | Registered in layout but never navigated to |
| `app/profile/subscription.tsx` | `/profile/subscription` | Registered in layout but never navigated to |
| `app/profile/users.tsx` | `/profile/users` | Registered in layout but never navigated to from profile menu |
| `app/blog/index.tsx` | `/blog` | Registered in layout but never navigated to |
| `app/blog/[slug].tsx` | `/blog/:slug` | Registered in layout but never navigated to |
| `app/social/create-post.tsx` | `/social/create-post` | Registered in layout but never navigated to |
| `app/financing/compare.tsx` | `/financing/compare` | Registered in layout but never navigated to |
| `app/compare.tsx` | `/compare` | Registered in layout but never navigated to |
| `app/report.tsx` | `/report` | Registered in layout but never navigated to |
| `app/top-brands.tsx` | `/top-brands` | Registered in layout but never navigated to from home |
| `app/brand-gallery.tsx` | `/brand-gallery` | Registered in layout but never navigated to from home |
| `app/my-reviews.tsx` | `/my-reviews` | Registered in layout but never navigated to |
| `app/VisualSearch.tsx` | `/VisualSearch` | Registered in layout but never navigated to (home has a teaser component but no navigation) |

---

## 3. Empty / Placeholder Button Handlers

**No completely empty `() => {}` onPress handlers found.** All `onPress` handlers have either real logic or delegate to named functions.

However, one commented-out TODO was found:

| # | File | Line | Issue |
|---|------|------|-------|
| 1 | `src/services/ListingService.ts` | 40 | `// TODO: Log to analytics/crashlytics here` — missing error logging in catch block |
| 2 | `src/components/shared/WebViewScreen.tsx` | 177 | `// router.push(...)` — commented-out native car details navigation |
| 3 | `src/components/shared/WebViewScreen.tsx` | 180 | `// router.push(...)` — commented-out native search navigation |

---

## 4. Linear-Gradient Usage

**No CSS string `linear-gradient` found in styled-components.** ✅

All 35 files that use linear gradients properly import from `expo-linear-gradient`:
```tsx
import { LinearGradient } from 'expo-linear-gradient';
```
This is the correct approach for React Native — no issues here.

---

## 5. Unsupported CSS in Styled-Components

### 🔴 CRITICAL: `box-shadow` in styled-components (11 instances)

React Native does NOT support CSS `box-shadow` syntax. Use `shadow-color`, `shadow-offset`, `shadow-opacity`, `shadow-radius` (iOS) + `elevation` (Android) instead.

| # | File | Line | CSS |
|---|------|------|-----|
| 1 | `src/components/common/EmptyState.tsx` | 60 | `box-shadow: 0px 4px 8px ${props.theme.colors.primary.main}4D;` |
| 2 | `src/components/home/AIAnalysisBanner.tsx` | 22 | `box-shadow: 0px 8px 20px rgba(139, 92, 246, 0.3);` |
| 3 | `src/components/home/AISmartSellButton.tsx` | 22 | `box-shadow: 0px 8px 16px rgba(96, 165, 250, 0.3);` |
| 4 | `src/components/home/CategoriesSection.tsx` | 91 | `box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);` |
| 5 | `src/components/home/LifeMomentsBrowse.tsx` | 144 | `box-shadow: 0px 8px 24px ${gradient}66;` |
| 6 | `src/components/home/LoyaltyBanner.tsx` | 19 | `box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);` |
| 7 | `src/components/home/SearchWidget.tsx` | 103 | `box-shadow: 0px 4px 8px rgba(123, 47, 190, 0.3);` |
| 8 | `src/components/home/SmartSellStrip.tsx` | 19 | `box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);` |
| 9 | `src/components/home/VisualSearchTeaser.tsx` | 29 | `box-shadow: 0px 12px 30px rgba(147, 51, 234, 0.25);` |
| 10 | `src/components/home/VisualSearchTeaser.tsx` | 105 | `box-shadow: 0px 0px 15px rgba(147, 51, 234, 0.4);` |
| 11 | `src/components/CarCard.tsx` | 33 | `box-shadow: 0px 8px 12px rgba(0, 0, 0, 0.15);` |

**Exception (safe):** `app/finance.tsx:26` — guarded with `Platform.OS === 'web'` check ✅

### 🔴 CRITICAL: `transform: translateX(-50%)` CSS string (1 instance)

React Native transforms must use array syntax and do NOT support percentage values.

| # | File | Line | CSS |
|---|------|------|-----|
| 1 | `src/components/pricing/PriceGauge.tsx` | 76 | `transform: translateX(-50%);` |

**Fix:** Remove this and use JS-calculated offset or `Animated.View` with measured width.

### 🟡 WARNING: `display: flex` + `align-items` on Text (1 instance)

React Native Text does not support flexbox layout properties.

| # | File | Line | CSS |
|---|------|------|-----|
| 1 | `src/components/mobile_de/MobileDeHeader.tsx` | 35-36 | `display: flex; align-items: center;` on a `styled.Text` |

**Fix:** Wrap in a `styled.View` with these flex properties, or remove them.

### 🟡 WARNING: String pixel values in inline styles (3 instances)

React Native requires numeric dimension values, not strings with `px` units.

| # | File | Line | CSS |
|---|------|------|-----|
| 1 | `app/marketplace/checkout.tsx` | 58 | `{ width: '100px' }` — should be `{ width: 100 }` |
| 2 | `src/components/SmartCamera.tsx` | 120 | `{ width: '40px' as any }` — should be `{ width: 40 }` |
| 3 | `src/components/SmartCamera.tsx` | 130 | `{ width: '40px' as any }` — should be `{ width: 40 }` |

### ✅ Safe: `text-transform` in styled-components (37 instances)

`text-transform: uppercase | capitalize` IS supported by React Native's `textTransform` style prop and is correctly handled by styled-components/native. No action needed.

### ✅ Safe: `text-decoration-line` in styled-components (2 instances)

`text-decoration-line: underline | line-through` IS the correct React Native property (vs web's `text-decoration`). No action needed.

---

## 6. Additional Issues Found

### `profile/admin-sections` not declared in `_layout.tsx` Stack
- `app/profile/admin-sections.tsx` exists and is navigated to from `profile/settings.tsx:810`
- However, it is NOT declared as a `<Stack.Screen>` in `app/_layout.tsx`
- In Expo Router, undeclared screens auto-discover from the filesystem and use default options (header visible), which may cause visual inconsistency

### `modal.tsx` is scaffold boilerplate
- `app/modal.tsx` is a default Expo template file
- Not declared in the layout, never navigated to
- Should be deleted to avoid confusion

### `VisualSearch.tsx` uses uppercase filename
- Route is `/VisualSearch` (capital V) which is unconventional
- Not navigated to from anywhere in the app — the `VisualSearchTeaser` component exists on the home screen but has no navigation wired up

### `profile/users.tsx` not in profile menu
- File exists and is declared in layout, but NOT listed in the profile `menuItems` array
- Only accessible if another screen navigates to it directly

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| Broken navigation targets (no route file) | **5** | 🔴 Critical |
| Dead/unreachable routes | **17** | 🟡 Medium |
| `box-shadow` CSS in styled-components | **11** | 🔴 Critical |
| `transform` CSS string (unsupported) | **1** | 🔴 Critical |
| `display: flex` on Text component | **1** | 🟡 Medium |
| String pixel values in `style={}` | **3** | 🟡 Medium |
| Route not declared in layout Stack | **1** | 🟢 Low |
| Boilerplate dead code | **1** | 🟢 Low |

### Recommended Priority Fixes
1. **Fix 5 broken routes** (`/sell` → `/(tabs)/sell`, `/search` → `/(tabs)/search`)
2. **Replace 11 `box-shadow` CSS** with `shadow-*` + `elevation` properties
3. **Fix `transform: translateX(-50%)`** in PriceGauge
4. **Fix 3 string pixel values** — remove `px` suffix
5. **Fix `display: flex` on Text** in MobileDeHeader
6. **Delete `modal.tsx`** boilerplate (move to `DDD/` per project rules)
7. **Wire up dead routes** or remove unused route files
