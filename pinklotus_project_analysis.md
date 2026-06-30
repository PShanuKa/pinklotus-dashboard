# 🪷 Pink Lotus Project — සම්පූර්ණ Analysis Report

> **Analysis Date**: 2026-06-30  
> **Analyzed Projects**: `pinklotus-website`, `pinklotus-backend`, `pinklotus-dashboard`

---

## 📋 Executive Summary

Pink Lotus project එකේ **Website (frontend)** එක පමණක් ආරම්භ කර ඇත — එයද landing page සහ basic UI shells පමණි. **Backend** සහ **Dashboard** repositories දෙකම **Empty** (initialized Git repos only). Requirements වලින් **~15-20%** පමණක් partially implement වී ඇත, ඉතිරි **~80-85%** ක් තවම implement කර නැත.

| Project | Status | Completion |
|---------|--------|------------|
| `pinklotus-website` | 🟡 In Progress | ~20% |
| `pinklotus-backend` | 🔴 Not Started | 0% |
| `pinklotus-dashboard` | 🔴 Not Started | 0% |

---

## 1. 🏨 Booking System

### Requirement
> Rooms wise සහ Apartment wise booking functionality

### Current State

| Feature | Status | Notes |
|---------|--------|-------|
| Room listing page | 🟡 UI Only | Static hardcoded cards — no API data |
| Room detail page (`/rooms/[slug]`) | 🟡 UI Only | Static content, lorem ipsum text |
| Booking form (Check-in/out, Adults, Children) | 🟡 UI Only | Rendered in room detail sidebar but **non-functional** |
| "Book Now" button | 🟡 UI Only | No click handler, no checkout redirect |
| Room type differentiation (Room vs Apartment) | ❌ Missing | All cards show same "Our Apartments" label |
| Date picker integration | ❌ Missing | Hardcoded date "20 Jun, 2026" |
| Availability checking | ❌ Missing | No backend to check |
| Price calculation logic | ❌ Missing | Hardcoded "$600" total |
| Booking confirmation flow | ❌ Missing | — |
| Booking history / My Bookings | ❌ Missing | — |

### Missing Implementation

- Date picker component (check-in / check-out)
- Guest count selector (increment/decrement)
- Room type categorization (Room, Suite, Apartment)
- Availability calendar API integration
- Dynamic pricing calculation
- Booking creation API call
- Booking confirmation page
- Booking email notification

---

## 2. 👤 User Flow

### Requirement
> Profile page, Register page, Checkout page — සම්පූර්ණ flow එකක්

### Current State

| Page | Status | Notes |
|------|--------|-------|
| Login page (`/login`) | 🟡 UI Only | Email + Password fields + Google login button. **No form validation, no API call, no auth logic** |
| Register page | ❌ Missing | No `/register` route exists |
| Profile page | ❌ Missing | No `/profile` route exists |
| Checkout page | ❌ Missing | No `/checkout` route exists |
| Forgot Password | ❌ Missing | — |
| Email verification | ❌ Missing | — |
| Auth state management | ❌ Missing | No auth context/provider |
| Protected route guard | ❌ Missing | `(protected)` route group exists but is **empty** |
| Session/Token management | ❌ Missing | No JWT/Cookie handling |

### Login Page Issues ([page.tsx](file:///c:/Users/shanu/Desktop/Project%20Git/pinklotus-website/app/(auth)/login/page.tsx))

- Password input `type="text"` → should be `type="password"` (Line 50)
- No form `<form>` wrapper — cannot submit with Enter key
- No form validation (email format, password length)
- Google Sign-in button is non-functional
- No "Register" link or "Forgot Password" link
- No loading state on submit
- Layout imports (`PriceBg`, `Button`, `logo`, `Iconlotus`, `Google`, icons) are in the page but some are used only in the layout — potential duplicate imports

### Required Pages/Components

```
app/
  (auth)/
    login/page.tsx        ← Exists (UI only)
    register/page.tsx     ← 🆕 NEEDED
    forgot-password/page.tsx  ← 🆕 NEEDED
    verify-email/page.tsx     ← 🆕 NEEDED
  (protected)/
    profile/page.tsx      ← 🆕 NEEDED
    checkout/page.tsx     ← 🆕 NEEDED
    bookings/page.tsx     ← 🆕 NEEDED (Booking history)
```

---

## 3. 🛠️ Tech Stack

### Requirement
> Backend: Fastify | Dashboard: Next.js | Database: PostgreSQL | ORM: Prisma | API: TanStack Query + Axios

### Current State

| Tech | Required | Current | Status |
|------|----------|---------|--------|
| **Website Framework** | Next.js | Next.js 16.2.9 | ✅ Done |
| **CSS Framework** | — | Tailwind CSS v4 | ✅ Done |
| **Backend Framework** | Fastify | — | ❌ Not Started |
| **Dashboard Framework** | Next.js | — | ❌ Not Started |
| **Database** | PostgreSQL | — | ❌ Not Started |
| **ORM** | Prisma | — | ❌ Not Started |
| **API Client (Dashboard)** | TanStack Query + Axios | — | ❌ Not Started |
| **API Client (Website)** | Not specified | — | ❌ Not Started |
| **Authentication** | Required (Google + Credentials) | — | ❌ Not Started |
| **Image Hosting** | — | Cloudinary | ✅ Configured |

### Website Dependencies (Current)

```json
{
  "@react-google-maps/api": "^2.20.8",
  "clsx": "^2.1.1",
  "next": "16.2.9",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "react-icons": "^5.6.0",
  "tailwind-merge": "^3.6.0"
}
```

### Missing Dependencies (Website)

- `axios` — HTTP client for API calls
- `@tanstack/react-query` — Server state management (optional for website)
- `next-auth` / custom auth — Authentication
- `react-datepicker` or `date-fns` — Date selection
- `react-hot-toast` / `sonner` — Toast notifications
- `zod` — Form validation
- `zustand` / `jotai` — Client state management (cart/booking)

### Backend Setup Needed (`pinklotus-backend`)

```
pinklotus-backend/
  src/
    server.ts              ← Fastify server entry
    routes/                ← API routes
      auth.ts
      rooms.ts
      bookings.ts
      hotels.ts
      users.ts
      payments.ts
    plugins/               ← Fastify plugins
    middleware/             ← Auth, validation middleware
    services/              ← Business logic
    utils/                 ← Utilities
  prisma/
    schema.prisma          ← Database schema
    migrations/            ← DB migrations
  package.json
  tsconfig.json
  .env
```

### Dashboard Setup Needed (`pinklotus-dashboard`)

```
pinklotus-dashboard/
  app/
    (auth)/login/
    (dashboard)/
      overview/
      bookings/
      rooms/
      hotels/
      users/
      pos/
      settings/
  lib/
    api/                   ← Axios + TanStack Query setup
  components/
  package.json
```

---

## 4. 👥 User Roles

### Requirement
> Customer / User roles 2ක්, Super Admin + Admin dashboard

### Current State

**❌ සම්පූර්ණයෙන් Missing** — Auth system එකක්, role management එකක් හෝ backend එකක් නැත.

### Required Role Structure

| Role | Access | Description |
|------|--------|-------------|
| **Customer** | Website only | Online booking, profile, booking history |
| **User** | Website + Limited | Extended features (unclear — needs clarification) |
| **Admin** | Dashboard | Hotel management, bookings, POS |
| **Super Admin** | Full Dashboard | All Admin + user management, hotel add/remove, system settings |

### Required Implementation

- Database: `users` table with `role` enum (`CUSTOMER`, `USER`, `ADMIN`, `SUPER_ADMIN`)
- Backend: Role-based middleware/guards
- Dashboard: Role-based route protection
- Website: Auth context with role awareness

> [!IMPORTANT]
> **"Customer" සහ "User" roles 2 ක් වෙන වෙනම define කර ඇත, නමුත් ඒවා අතර difference එක clarify කරන්න ඕන.** Customer = online booker, User = walk-in guest/registered visitor? මේ clarification implement කිරීමට පෙර අවශ්‍යයි.

---

## 5. 💳 POS System

### Requirement
> Admin dashboard ඇතුළත POS system — physically hotel එකට ඇවිත් room book කරන විට record කරගන්න

### Current State

**❌ සම්පූර්ණයෙන් Missing** — Dashboard project එකම empty.

### Required Features

| Feature | Priority | Notes |
|---------|----------|-------|
| Walk-in booking creation | 🔴 High | Quick room selection + guest info |
| Guest search/creation | 🔴 High | Search existing or create new guest |
| Room availability view (real-time) | 🔴 High | Calendar/grid view |
| Payment recording (cash/card) | 🔴 High | Record payment method + amount |
| Receipt generation | 🟡 Medium | Print/PDF receipt |
| Check-in / Check-out management | 🔴 High | Mark room status |
| Quick billing | 🟡 Medium | Additional charges during stay |
| Daily report | 🟡 Medium | Revenue + occupancy summary |

---

## 6. 🏢 Hotel Management

### Requirement
> Hotels add/disable/remove

### Current State

**❌ සම්පූර්ණයෙන් Missing**

### Required Implementation

| Feature | Component | Notes |
|---------|-----------|-------|
| Add new hotel | Dashboard + Backend | Hotel name, address, contact, images |
| Edit hotel details | Dashboard + Backend | Update info |
| Disable hotel | Dashboard + Backend | Soft disable (not accepting bookings) |
| Remove/Delete hotel | Dashboard + Backend | Soft delete recommended |
| Hotel room management | Dashboard + Backend | Add/edit/remove rooms per hotel |
| Hotel gallery | Dashboard + Backend | Image upload for each hotel |
| Multi-hotel support | Database schema | Hotels → Rooms relationship |

### Suggested Database Schema (Prisma)

```prisma
model Hotel {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  address     String
  city        String
  description String?
  images      String[]
  isActive    Boolean  @default(true)
  isDeleted   Boolean  @default(false)
  phone       String?
  email       String?
  rooms       Room[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Room {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  type        RoomType
  price       Decimal
  size        Int?      // in sq meters
  maxGuests   Int
  beds        String?
  description String?
  amenities   String[]
  images      String[]
  isActive    Boolean   @default(true)
  hotel       Hotel     @relation(fields: [hotelId], references: [id])
  hotelId     String
  bookings    Booking[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum RoomType {
  SINGLE
  DOUBLE
  SUITE
  APARTMENT
}
```

---

## 7. 💰 Payment Gateway

### Requirement
> Payment gateway integration

### Current State

**❌ සම්පූර්ණයෙන් Missing**

### Recommended Options for Sri Lanka

| Gateway | SL Support | Difficulty | Notes |
|---------|-----------|------------|-------|
| **PayHere** | ✅ Native SL | 🟢 Easy | Most popular in SL, LKR support |
| **Stripe** | 🟡 Limited | 🟡 Medium | International cards only |
| **Genie (Dialog)** | ✅ Native SL | 🟡 Medium | Mobile payments |

### Required Implementation

| Feature | Priority |
|---------|----------|
| Payment initiation from checkout | 🔴 High |
| Payment callback/webhook handling | 🔴 High |
| Payment status tracking | 🔴 High |
| Refund handling | 🟡 Medium |
| Payment history (user side) | 🟡 Medium |
| Revenue reports (admin side) | 🟡 Medium |
| Invoice/receipt generation | 🟡 Medium |

---

## 8. 📄 Reference Page Analysis (`/rooms/[slug]`)

### Requirement
> `/rooms/hdh` page එකේ basic details — reference එක විදිහට check කරන්න

### Current State ([page.tsx](file:///c:/Users/shanu/Desktop/Project%20Git/pinklotus-website/app/(public)/rooms/[slug]/page.tsx))

මෙම page එකේ UI layout එක reasonable, නමුත් පහත issues/gaps ඇත:

### ✅ What's Working (UI Only)

- Room hero image banner
- Room title & subtitle
- Room specs (size, guests, beds)
- Room description area
- Amenities list (12 items)
- "What's included in this suite" list (9 items)
- Booking sidebar (price, check-in/out, adults/children, total, Book Now)
- Image gallery (3 images)
- "Similar Rooms" section

### ❌ Issues & Missing Items

| Issue | Severity | Details |
|-------|----------|---------|
| **All data is hardcoded** | 🔴 Critical | Room name, price, description, amenities — all static |
| **Lorem ipsum content** | 🔴 High | Description contains placeholder text |
| **No dynamic slug handling** | 🔴 High | `slug` param is not used — same content for every URL |
| **Hardcoded dates** | 🔴 High | "20 Jun, 2026" is static text |
| **No date picker** | 🔴 High | User cannot select dates |
| **No guest count selector** | 🔴 High | Numbers are static (2 adults, 0 children) |
| **No price calculation** | 🔴 High | Total "$600" is hardcoded |
| **Book Now does nothing** | 🔴 High | No onClick handler |
| **Same image for everything** | 🟡 Medium | All 3 gallery images use the same Cloudinary URL |
| **Similar Rooms are static** | 🟡 Medium | Same 3 identical cards |
| **No image carousel/lightbox** | 🟡 Medium | Gallery images not interactive |
| **No reviews section** | 🟡 Medium | No guest reviews/ratings |
| **No room availability indicator** | 🟡 Medium | No visual availability status |
| **No breadcrumb navigation** | 🟢 Low | `/rooms/room-name` path not shown |
| **No share/wishlist buttons** | 🟢 Low | Social sharing missing |

---

## 9. 🌐 Website Pages — Full Gap Analysis

### Existing Pages

| Page | Route | Status | Notes |
|------|-------|--------|-------|
| Home | `/` | 🟡 Partial | UI complete, all data hardcoded |
| Login | `/login` | 🟡 Partial | UI only, non-functional |
| Rooms Listing | `/rooms` | 🟡 Partial | Static cards, no filtering |
| Room Detail | `/rooms/[slug]` | 🟡 Partial | Static, non-functional booking |

### Missing Pages

| Page | Route | Priority | Description |
|------|-------|----------|-------------|
| Register | `/register` | 🔴 High | User registration form |
| Profile | `/profile` | 🔴 High | User info, change password |
| Checkout | `/checkout` | 🔴 High | Booking confirmation + payment |
| My Bookings | `/bookings` | 🔴 High | Booking history list |
| Booking Detail | `/bookings/[id]` | 🔴 High | Single booking details |
| About Us | `/about` | 🟡 Medium | Navbar link exists, page missing |
| Gallery | `/gallery` | 🟡 Medium | Navbar link exists, page missing |
| Services | `/services` | 🟡 Medium | Navbar link exists, page missing |
| Contact | `/contact` | 🟡 Medium | Navbar link exists, page missing |
| Forgot Password | `/forgot-password` | 🟡 Medium | Password recovery |
| Payment Success | `/payment/success` | 🟡 Medium | Post-payment confirmation |
| Payment Failed | `/payment/failed` | 🟡 Medium | Payment error page |
| 404 Page | `not-found.tsx` | 🟢 Low | Custom error page |
| Terms & Conditions | `/terms` | 🟢 Low | Legal page |
| Privacy Policy | `/privacy` | 🟢 Low | Legal page |

---

## 10. 🔧 Code Quality Issues

### [Home Page](file:///c:/Users/shanu/Desktop/Project%20Git/pinklotus-website/app/(public)/page.tsx)
- **Massive single file** (592 lines) — All sections (`HeaderSection`, `OverViewSection`, `CommitmentSection`, `PriceSection`, `Facilities`, `GoalSection`, `Position`) are in one file. Should be split into separate component files.
- Hardcoded prices: `$45`, `$55`, `$72` (Lines 319, 346, 365)
- Placeholder text in price cards: "Proin lacinia vehicula amet..." (Lines 322-326)
- Contact phone placeholder: "071 XXX XXXX" (Line 569)
- `dangerouslySetInnerHTML` used for carousel titles (Line 89-91) — potential XSS if data comes from API later

### [Navbar](file:///c:/Users/shanu/Desktop/Project%20Git/pinklotus-website/layout/Navbar.tsx)
- Links to `/about`, `/gallery`, `/services`, `/contact` — **none of these pages exist** (404)
- "Book Now" button has no `href` or navigation

### [Auth Layout](file:///c:/Users/shanu/Desktop/Project%20Git/pinklotus-website/app/(auth)/layout.tsx)
- Imports `Button`, `RiLockPasswordFill`, `MdEmail`, `Google` but **doesn't use them** — these are used in the login page instead. Unused imports.
- "Home Page" button has no navigation link

### [Rooms Listing](file:///c:/Users/shanu/Desktop/Project%20Git/pinklotus-website/app/(public)/rooms/page.tsx)
- All 6 `RoomCard` components render identical content
- No link to room detail page (`/rooms/[slug]`)
- "Discover More" button doesn't navigate anywhere
- No filtering/search functionality
- No room type differentiation

### General
- No error boundaries
- No loading states (Suspense/skeletons)
- No SEO meta tags per page (only root layout has basic metadata)
- No accessibility (ARIA labels, keyboard navigation)
- `next.config.ts` uses deprecated `domains` for images — should use `remotePatterns`

---

## 11. 📊 Implementation Priority Matrix

### Phase 1 — Foundation (Week 1-2) 🔴

| Task | Project | Priority |
|------|---------|----------|
| Backend setup (Fastify + Prisma + PostgreSQL) | `pinklotus-backend` | 🔴 Critical |
| Database schema design (Hotels, Rooms, Users, Bookings, Payments) | `pinklotus-backend` | 🔴 Critical |
| Auth system (Register, Login, JWT, Google OAuth) | `pinklotus-backend` | 🔴 Critical |
| API routes: Auth, Hotels, Rooms | `pinklotus-backend` | 🔴 Critical |

### Phase 2 — Website Integration (Week 2-3) 🔴

| Task | Project | Priority |
|------|---------|----------|
| Auth context + protected routes | `pinklotus-website` | 🔴 Critical |
| Register page | `pinklotus-website` | 🔴 Critical |
| Fix Login page (form validation, API integration) | `pinklotus-website` | 🔴 Critical |
| Profile page | `pinklotus-website` | 🔴 High |
| Dynamic rooms listing (from API) | `pinklotus-website` | 🔴 High |
| Dynamic room detail page | `pinklotus-website` | 🔴 High |
| Functional booking form (date picker, guest count) | `pinklotus-website` | 🔴 High |
| Checkout page | `pinklotus-website` | 🔴 High |

### Phase 3 — Dashboard (Week 3-5) 🟡

| Task | Project | Priority |
|------|---------|----------|
| Dashboard setup (Next.js + TanStack Query + Axios) | `pinklotus-dashboard` | 🔴 Critical |
| Admin auth + role-based access | `pinklotus-dashboard` | 🔴 Critical |
| Hotel management (CRUD) | `pinklotus-dashboard` | 🔴 High |
| Room management (CRUD per hotel) | `pinklotus-dashboard` | 🔴 High |
| Booking management | `pinklotus-dashboard` | 🔴 High |
| User management (Super Admin) | `pinklotus-dashboard` | 🟡 Medium |
| POS system | `pinklotus-dashboard` | 🟡 Medium |

### Phase 4 — Payment & Polish (Week 5-6) 🟡

| Task | Project | Priority |
|------|---------|----------|
| Payment gateway integration (PayHere recommended) | Backend + Website | 🔴 High |
| Payment success/failure pages | `pinklotus-website` | 🔴 High |
| Missing website pages (About, Gallery, Services, Contact) | `pinklotus-website` | 🟡 Medium |
| Booking history / My Bookings | `pinklotus-website` | 🟡 Medium |
| POS receipt/invoice generation | `pinklotus-dashboard` | 🟡 Medium |
| Email notifications (booking confirmation) | `pinklotus-backend` | 🟡 Medium |

### Phase 5 — QA & Optimization (Week 6-7) 🟢

| Task | Project | Priority |
|------|---------|----------|
| Error handling & validation | All | 🟡 Medium |
| Responsive design review | Website + Dashboard | 🟡 Medium |
| SEO optimization (meta tags, OG images) | `pinklotus-website` | 🟡 Medium |
| Performance optimization (lazy loading, caching) | All | 🟢 Low |
| Accessibility (ARIA, keyboard nav) | Website + Dashboard | 🟢 Low |
| Unit & integration tests | All | 🟢 Low |

---

## 12. 📈 Completion Summary

| Requirement Category | Completion | Status |
|---------------------|------------|--------|
| Booking System | ~10% (UI shells only) | 🔴 |
| User Flow (Login/Register/Profile/Checkout) | ~10% (Login UI only) | 🔴 |
| Tech Stack — Website | ~80% (Next.js setup done) | 🟡 |
| Tech Stack — Backend (Fastify + Prisma + PostgreSQL) | 0% | 🔴 |
| Tech Stack — Dashboard (Next.js + TanStack Query + Axios) | 0% | 🔴 |
| User Roles (Customer/User/Admin/SuperAdmin) | 0% | 🔴 |
| POS System | 0% | 🔴 |
| Hotel Management | 0% | 🔴 |
| Payment Gateway | 0% | 🔴 |
| Reference Page (`/rooms/[slug]`) | ~30% (UI layout done) | 🟡 |

### Overall Project Completion: **~12%**

---

## 13. 🎯 Recommendations

1. **Backend එක ප්‍රථමයෙන් build කරන්න** — Website එකේ features backend නැතුව functional කරන්න බැහැ. Fastify + Prisma + PostgreSQL stack එක setup කිරීම ප්‍රථම priority එක විය යුතුයි.

2. **Database schema design එක carefully plan කරන්න** — Hotels → Rooms → Bookings → Users → Payments relationship structure එක අනිවාර්යයෙන් ER diagram එකකින් plan කරගෙන ඉන්පසු implement කරන්න.

3. **Auth system එක centralize කරන්න** — Website එකටත් Dashboard එකටත් එකම auth backend එක use කරන්න. JWT tokens use කරන්න recommend කරනවා.

4. **"Customer" vs "User" role difference clarify කරන්න** — මේ two roles අතර functional difference එක define කර නැත. Implementation කිරීමට පෙර clarify කරන්න.

5. **Payment gateway early decide කරන්න** — Sri Lanka context එකේ PayHere recommend කරනවා. Gateway selection එක booking flow design එකට affect කරන නිසා early decision එකක් ගන්න ඕන.

6. **Code structure improve කරන්න** — Home page එකේ 592 lines single file එකට split කරන්න. Reusable components (`DatePicker`, `GuestSelector`, `PriceCard`, etc.) create කරන්න.

7. **Navbar dead links fix කරන්න** — About, Gallery, Services, Contact pages implement කරන්න හෝ temporarily remove කරන්න.

---

> [!CAUTION]
> **Backend සහ Dashboard projects දෙකම 0% ය.** Full system එක functional කරන්නම් estimated effort **6-8 weeks** (full-time developer 1-2 denekට). Backend setup නැතුව website features functional කරන්න බැහැ.
