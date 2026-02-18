# Koli One — Google Play Release Checklist

## ✅ App Configuration
- [x] Package name: `com.hamdani.kolione`
- [x] Version: 1.0.0 / versionCode: 1
- [x] Target SDK: 35 (Android 15)
- [x] Min SDK: 24 (Android 7.0)
- [x] Adaptive icon configured
- [x] Splash screen configured (orange #FF7900)
- [x] Deep linking enabled (koli.one)
- [x] Proguard + shrink resources enabled
- [x] EAS production build profile configured

## ✅ Core Screens (45+ screens)
### Tabs
- [x] Home (12 sections: Hero, AI Banner, Categories, Featured, Recommendations, AI Insights, Recent, Dealers, Brands, Recent Browsing, Loyalty, Trust)
- [x] Search
- [x] Sell (create listing)
- [x] Messages (real-time Firebase RTDB)
- [x] Profile

### Car & Discovery
- [x] Car detail — car/[id]
- [x] Car history — car/[id]/history (VIN check, timeline)
- [x] Advanced search — full filter UI
- [x] All cars — grid/list view with sort
- [x] Brand gallery — brand browser with trending
- [x] Top brands — ranking with stats
- [x] Compare cars — side-by-side comparison
- [x] Visual search — camera-based search

### AI Features
- [x] AI Advisor — chat-based car recommendations
- [x] AI Valuation — instant car price estimation
- [x] AI History — VIN-based history reports
- [x] AI Analysis — photo recognition (snap → identify make/model/price)

### Marketplace
- [x] Marketplace index — product grid with categories
- [x] Product detail — gallery, specs, seller card
- [x] Cart — quantity controls, summary
- [x] Checkout — 3-step (delivery, payment, review)
- [x] Order success — confirmation with tracking

### Social
- [x] Social feed
- [x] Create post — image picker, tags, location

### Messaging
- [x] Conversations list (Firebase RTDB)
- [x] Chat — text messages, offers, quick replies

### Dealer
- [x] Dealers directory
- [x] Dealer profile — [slug] with stats, cars
- [x] Dealer registration — 3-step form

### Profile
- [x] Edit profile
- [x] My ads
- [x] Favorites
- [x] Drafts
- [x] Dashboard
- [x] Analytics
- [x] Campaigns
- [x] Consultations
- [x] Saved searches
- [x] Following/followers
- [x] Billing & payment history
- [x] Subscription plans (Free/Premium/Dealer Pro)
- [x] Settings (notifications, privacy, account)
- [x] Edit listing

### Finance
- [x] Finance overview
- [x] Bank comparison calculator

### Blog
- [x] Blog index
- [x] Blog post detail

### Legal & Support (Google Play Required)
- [x] Privacy policy
- [x] Terms of service
- [x] About
- [x] Contact
- [x] Help
- [x] Data deletion
- [x] FAQ
- [x] Report listing (flag content)

### Other
- [x] Notifications
- [x] Price alerts
- [x] Saved searches
- [x] My reviews
- [x] Onboarding

## ✅ Shared UI Components
- [x] FullScreenGallery — pinch-to-zoom image viewer
- [x] FilterBottomSheet — reusable filter sheet with chips
- [x] RatingStars — interactive star rating
- [x] PriceTag — formatted price with discount
- [x] StatusBadge — listing status indicators
- [x] CustomTabBar — animated tab navigation with badges
- [x] EmptyState — branded empty states
- [x] MobileHeader — adaptive header component

## ✅ Navigation & UX
- [x] Custom animated tab bar with orange sell button
- [x] Slide transitions (right for push, bottom for modals)
- [x] Haptic feedback on interactions
- [x] Pull-to-refresh patterns
- [x] Unread message badges (Firebase RTDB)
- [x] Auth guard (redirect to login if needed)

## ✅ Google Play Compliance
- [x] Privacy Policy screen accessible
- [x] Terms of Service screen accessible
- [x] Data deletion mechanism (GDPR)
- [x] Report/flag content mechanism
- [x] Content ratings appropriate
- [x] No prohibited content
- [x] Camera/storage permission strings set
- [x] Deep links configured

## 🔲 Before Submission (Manual Steps)
- [ ] Replace Firebase API keys in `app.json` extra
- [ ] Replace Algolia keys in `app.json` extra
- [ ] Add `google-services.json` file
- [ ] Create notification icon at `assets/images/notification-icon.png` (24x24 white on transparent)
- [ ] Create feature graphic (1024x500)
- [ ] Create screenshots (phone + tablet)
- [ ] Run `eas build --platform android --profile production`
- [ ] Run `eas submit --platform android --profile production`
- [ ] Set up Google Play IAP products (Premium subscription, Dealer Pro subscription)
- [ ] Configure Firebase Cloud Messaging for push notifications
- [ ] Set up Crashlytics / Sentry for error reporting

## Store Listing Content

### Short Description (80 chars max)
Купувай и продавай коли в България с AI оценка и проверка на история.

### Full Description
Koli One е водещата платформа за покупка и продажба на автомобили в България.

🚗 **Търси и Намери**
Разширено търсене с 20+ филтъра. Търси по марка, модел, цена, година, гориво и още. AI подбира коли специално за теб.

🤖 **AI Функции**
• AI Оценка — моментална пазарна цена за всеки автомобил
• AI Съветник — персонализирани препоръки чрез чат
• Визуално разпознаване — снимай кола и разбери всичко за нея
• Проверка на история — VIN доклад за ДТП, собственици, километраж

💬 **Безопасни Комуникации**
Чатвай с продавачи директно в приложението. Изпращай оферти, бързи отговори и договаряй цена.

🏪 **Маркетплейс за Части**
Нови и употребявани авточасти от верифицирани продавачи. Двигатели, спирачки, осветление и още.

📊 **За Дилъри**
Дилърски профил с аналитика, неограничени обяви и приоритетно показване.

💰 **Финансиране**
Сравни оферти от 5 банки. Калкулатор за лизинг с различни срокове.

### Keywords
коли, автомобили, авто, покупка, продажба, AI, оценка, история, VIN, дилър, части, България, кола, bmw, mercedes, audi
