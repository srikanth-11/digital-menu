# 🍽️ Digital Menu — Modern Restaurant Menu Builder

A full-featured restaurant menu builder built using **Next.js App Router**, **tRPC**, **Prisma**, **UploadThing**, **Tailwind**, and **JWT-based authentication**.  
Supports **public menus**, **owner dashboards**, **QR-code access**, and **real-time editing**.

**🚀 Live Demo:** https://digital-menu-hazel.vercel.app/

---

## ⭐ Overview

Digital Menu allows restaurant owners to create and manage their menu digitally, while customers can browse a clean, mobile-first interface optimized for real-world restaurant usage.

The system supports:
- Public restaurant pages
- Owner-only dashboard & editing
- Categories + dishes mapping
- Dish images, spice level, veg indicators
- QR code generation per restaurant
- Secure, fast OTP login

---

## 🛠️ Tech Stack

- **Next.js 15 (App Router)**
- **TypeScript (strict mode)**
- **tRPC v10** — End-to-end typesafe APIs
- **Prisma ORM + PostgreSQL**
- **JWT + HttpOnly Cookies** for auth
- **UploadThing** for image uploads
- **Tailwind CSS + shadcn/ui**
- **Vercel Deployment**

---


---

## 🎯 Features

### Public User
- View restaurant menu
- Mobile-friendly scroll-based category highlighting
- Dish cards with image, veg icon, spice badge
- Quick navigation using Menu Sheet
- Auto-generated QR code per restaurant

### Restaurant Owner
- Secure OTP login
- Create/edit/delete:
  - Restaurants
  - Categories
  - Dishes
- Upload dish images
- Assign multiple categories to a dish
- Server-side authorization for all edits
- Fully validated inputs using Zod

---

## 🧠 Project Approach

### 1. **Strict Type Safety**
- Removed all `any` usage.
- Resolved ESLint issues:
  - `no-explicit-any`
  - `no-unsafe-assignment`
  - `no-unsafe-member-access`
- Ensured type inference between TRPC & Prisma models.
- Added model-level types for Restaurant, Category, Dish with nested relations.

### 2. **Separation of Public & Owner Logic**
Instead of duplicating pages:
- Public & Owner use **same UI** (`RestaurantView`)
- Editing actions appear only if `canEdit === true`
- Server-side validation ensures security

### 3. **Database Consistency**
- Used Prisma transactions for linking dish ↔ category
- Enforced:
  - Slug uniqueness
  - Category ownership validation
  - Restaurant ownership validation
  - Consistent relational mapping in seeding

### 4. **UI Architecture**
- Reusable Modals: `RestaurantModal`, `CategoryModal`, `DishModal`
- `MenuSheet` for top navigation
- IntersectionObserver tracking live-active categories
- Mobile-first layout
- Smooth animations and transitions using shadcn/ui

### 5. **Authentication**
Implemented OTP-based login using:
- Email input → OTP generation → Verification endpoint  
- JWT stored in HttpOnly cookie  
- Automatic session fetch on every SSR page load

---

## 🤖 AI Tools Used

### Models
- **ChatGPT GPT-5.1**
- **ChatGPT GPT-4o Mini**

### Tasks AI Helped With
- Refactoring `any`-heavy code into typed TRPC structures
- Fixing callback-ref typing issues (React strict mode)
- Solving Prisma relational type mismatches
- Drafting reusable modal UI patterns
- Designing QR code generation architecture
- Optimizing the RestaurantView scroll behavior

### Mistakes AI Made (that were corrected)
- Provided invalid TRPC signatures not matching Zod inputs
- Incorrectly typed Next.js `params` as Promise
- Added fields that didn't exist in Prisma schema
- Suggested UploadThing handlers returning wrong types
- Proposed category/dish types missing Prisma relational data

AI was extremely helpful, but **all final debugging, re-architecture, and fixes were done manually**.

---

## 🔥 Prompts Used (Advanced)

I used highly technical prompts, such as:

- “Resolve the TRPC union type mismatch between owner and public restaurant queries without suppressing TypeScript.”
- “Create a fully typed DishModal component that supports create/edit/delete modes using discriminated unions.”
- “Clean all eslint errors related to no-explicit-any and no-unsafe-member-access across the entire project.”
- “Fix callback refs typing for categoryRefs under React 18 strict mode.”
- “Assist in creating transaction-safe dish–category linking with Prisma.”

---

## 🧪 Edge Cases Considered & Implemented

### Auth & Security
- Invalid OTP → error feedback
- Expired OTP → resend required
- JWT expiration handling
- Unauthorized edits blocked on server
- Prevent editing of restaurants that don’t belong to the user

### Data Consistency
- Category mismatch (cannot assign dish to another restaurant)
- Missing categories → graceful UI fallback
- Dishes without images → placeholder handling
- Slug collisions solved with incremental suffixing

### UI
- Active category stays updated while scrolling
- Image aspect ratio handled to avoid stretching/cropping
- No dishes → show empty state messaging
- Prevent layout shift when editing multiple categories

---

## ⏳ Edge Cases Not Implemented (Future Work)

- Category & dish drag-and-drop reordering  
- Add restaurant staff roles  
- Real-time updates with WebSockets  
- Global OTP rate limiting  
- Full analytics dashboard (views, popular dishes)  
- Public page caching (ISR) for faster QR load  
- Offline-first PWA support  

---

## 💻 IDE Used
- **Visual Studio Code**





