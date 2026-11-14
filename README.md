# UNMADE GALLERY — MERN Stack Developer Guide

Ye project ab cleanly separated **MERN Stack (`MongoDB + Express + React + Node.js`)** architecture mein structured hai jahan `backend/` aur `frontend/` alag-alag modules ke roop mein kaam karte hain (aur AI Studio / single-server deployment ke liye root unified bridge bhi supported hai).

---

## 1. Project Architecture (Folder Structure)

```text
├── backend/                     # Standalone Express + Mongoose REST API Server (Port 5000)
│   ├── config/db.js             # MongoDB connection + automatic JSON fallback
│   ├── data/
│   │   ├── seedData.js          # Default products, collections, reviews, orders & commissions
│   │   └── uploads/             # Admin panel se upload ki gayi product photos (.png/.jpg/.webp)
│   ├── middleware/              # JWT auth, requireAdmin RBAC, rate limiters, Zod validation, safe errors
│   ├── models/                  # Mongoose Schemas (Product, GalleryConfig, Order, CustomOrder, User)
│   ├── routes/galleryRoutes.js  # Protected & public REST API routes (/api/products, /api/orders, /api/auth, etc.)
│   ├── scripts/createAdmin.js   # Safe CLI script to create/promote an Admin account
│   ├── services/galleryStore.js # Unified MongoDB + JSON store, image save/cleanup, JWT auth & revocation
│   ├── utils/                   # jwt.js (secret validation/signing), productHelpers.js (validation & image cleanup)
│   ├── app.js                   # Express app factory (Helmet, strict CORS allowlist, JSON limit 15mb, static /data)
│   ├── server.js                # Standalone backend entrypoint
│   ├── seed.js                  # Database / JSON seed script
│   └── package.json
│
├── frontend/                    # Standalone React + Vite + Tailwind CSS App (Port 5173)
│   ├── src/
│   │   ├── components/          # Hero, FeaturedCollections, ProductGrid, AdminLoginGate, AdminDashboard, Checkout, AccountView, etc.
│   │   ├── data/products.js     # Initial client fallback catalog data
│   │   ├── lib/
│   │   │   ├── api.js           # API_BASE_URL, apiUrl(), resolveMediaUrl() helper
│   │   │   ├── ecommerceLogic.js# Sorting, GST/shipping math, product form validation
│   │   │   └── storage.js       # Cart/wishlist/local preference storage helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js           # Proxies /api and /data -> http://localhost:5000 in dev
│   └── package.json
│
├── server.js                    # Unified bridge (Express API + Vite middleware / dist/ on Port 3000)
├── vite.config.js               # Root Vite build config (reads frontend/, outputs to dist/)
└── package.json                 # Root scripts (dev, start, build, lint)
```

---

## 2. Prerequisites (System Requirements)

- **Node.js v20+ LTS** aur **npm**
- **MongoDB** (Optional in local dev):
  - Agar `MONGODB_URI` set hai aur MongoDB (Local ya MongoDB Atlas) reachable hai, toh sab data **MongoDB** mein persist hoga.
  - Agar MongoDB running nahi hai ya `MONGODB_URI` empty hai, toh backend automatically `backend/data/*.json` files mein data persist karta rahega (`storage mode: json-fallback`), taaki project bina kisi database blocker ke turant run ho sake.

Check versions:
```bash
node -v
npm -v
```

---

## 3. Environment Variables Setup

### Backend (`backend/.env`)
```bash
cp backend/.env.example backend/.env
```
Important variables inside `backend/.env`:
- `PORT=5000`
- `MONGODB_URI=mongodb://127.0.0.1:27017/unmade_gallery` (ya apna MongoDB Atlas URI)
- `JWT_SECRET=<minimum 32 random characters>` (Production mein **mandatory** hai; dev mein unset hone par per-process random secret generate hota hai. Generate karne ke liye: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
- `CORS_ORIGINS=http://localhost:5173,http://localhost:3000` (Allowed frontend origins ki comma-separated list)
- `FRONTEND_URL=http://localhost:5173`
- *(Optional, sirf CLI script ke liye)* `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`

### Frontend (`frontend/.env`)
```bash
cp frontend/.env.example frontend/.env
```
- Local development mein `VITE_API_URL` ko empty rakh sakte hain kyunki `frontend/vite.config.js` `/api` aur `/data` requests ko automatically `http://localhost:5000` par proxy karta hai.
- Production mein jab frontend aur backend alag domains par deploy hon, tab `VITE_API_URL=https://your-backend-domain.com` set karein.

---

## 4. Separated MERN Mode Mein Run Karein (Recommended for Local Dev)

Do alag terminal windows open karein:

### Terminal 1 — Backend Server (`:5000`)
```bash
cd backend
npm install
npm run seed    # Initial products, collections, sample orders aur custom requests seed karne ke liye
npm run dev     # Starts node --watch server.js on http://localhost:5000
```

### Terminal 2 — Frontend Client (`:5173`)
```bash
cd frontend
npm install
npm run dev     # Starts Vite React dev server on http://localhost:5173
```

Browser mein open karein: **`http://localhost:5173`**

---

## 5. Unified Single-Server Mode (Root Folder Se)

Agar aap ek hi port (`3000`) par frontend + backend ek saath run ya preview karna chahte hain:

```bash
npm install
npm run dev
```

Browser mein open karein: **`http://localhost:3000`**

---

## 6. Admin Panel Access Kaise Karein & Password Setup

Security ke liye project mein **koi bhi default ya hardcoded admin password nahi rakha gaya hai** (`backend/data/users.json` initially empty `[]` rehta hai), aur public signup (`/api/auth/register`) hamesha sirf `customer` account hi banata hai.

### Step 1: Apna Admin Account & Password Create Karein (CLI)
Project root folder se ye command run karke apni pasand ka email aur strong password (minimum **10 characters**) set karein:

```bash
node backend/scripts/createAdmin.js --name "Studio Admin" --email "admin@unmadegallery.com" --password "ApnaStrongPassword123!"
```

*(Ya aap `backend/.env` mein `ADMIN_EMAIL` aur `ADMIN_PASSWORD` set karke `node backend/scripts/createAdmin.js` bhi run kar sakte hain. Agar user pehle se exist karta hai, toh ye command uska password update karke role ko `admin` par promote kar degi.)*

### Step 2: Browser Mein Admin Panel Open & Login Karein
1. Direct Admin URL open karein:
   - Unified mode (`npm run dev` from root): **`http://localhost:3000/?page=admin`**
   - Separated MERN mode (`frontend/` dev server): **`http://localhost:5173/?page=admin`**
2. Pehle **Atelier Admin Access** login screen open hogi — wahan wahi email aur password enter karein jo aapne Step 1 mein set kiya hai.
3. **Role-Based Security**:
   - Normal visitors aur signed-in customers ko Header ya Footer mein `Admin` buttons **dikhai nahi dete**.
   - Agar koi signed-in customer `/?page=admin` open kare, toh use **Restricted Console** screen dikhti hai aur backend admin APIs `403 Forbidden` return karti hain.
   - Sirf authenticated `admin` user ko hi `Admin` navigation link aur **Studio Atelier Console** ka access milta hai.
4. **Sign Out**: Admin Dashboard mein **Sign Out** click karne par token server-side (`tokenVersion` increment via `POST /api/auth/logout`) turant revoke ho jaata hai.

---

## 7. Key Features & Data Flow (IMP for Developers)

1. **Dynamic Gallery Sync (`backend/services/galleryStore.js`)**:
   - **Featured Collections**, **Best Sellers**, **Every Piece Has Its Own Story**, aur **Gallery Collection** sab `/api/gallery-data` se dynamically load hote hain.
   - Admin Dashboard (`?page=admin`) se jab naya product aur photo upload hoti hai:
     - Base64 image validate hokar `backend/data/uploads/<product-slug>-<timestamp>.<ext>` par disk mein save hoti hai.
     - Product record + image path `/data/uploads/...` MongoDB (ya JSON fallback) mein store hota hai aur customer storefront ke saare sections turant sync ho jaate hain.
     - Product delete karne par associated collection/story showcase references clean hote hain aur unused upload files disk se delete ho jaati hain.
2. **Checkout Policy**:
   - Strictly **Razorpay Online-Only** checkout (UPI / Card / NetBanking). Cash on Delivery disabled hai.
   - Orders `POST /api/orders` ke through backend mein save hote hain aur Admin Panel se order status update kiya ja sakta hai (`PATCH /api/orders/:id/status`).
3. **Custom Commissions**:
   - Custom Order Studio (`POST /api/custom-orders`) se requests direct backend mein save hoti hain aur Admin Panel mein review/update (`PATCH /api/custom-orders/:id/status`) ki ja sakti hain.
4. **JWT Authentication, RBAC & Profile Isolation**:
   - `AccountView` aur `AdminLoginGate` mein **bcryptjs + JWT** authentication (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/auth/profile`) integrated hai.
   - Customer profile updates (`PUT /api/auth/profile`) hamesha verified JWT ke `req.user.id` par hi apply hote hain, aur `/api/orders/my` / `/api/custom-orders/my` sirf signed-in user ke apne records return karte hain.

---

## 8. REST API Endpoints Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server health aur active storage mode (`mongodb` ya `json-fallback`) check |
| `GET` | `/api/gallery-data` | Public | Complete catalog: products, collections, storyShowcase, reviews, brandValues |
| `POST` | `/api/products` | **Admin** | Create new product + upload photo to `backend/data/uploads/` |
| `PUT` | `/api/products/:id` | **Admin** | Update product details / replace uploaded photo |
| `DELETE` | `/api/products/:id` | **Admin** | Delete product + cleanup showcase refs & orphaned image file |
| `GET` | `/api/orders` | **Admin** | List all customer orders |
| `GET` | `/api/orders/my` | **Auth** | List orders belonging to the signed-in customer |
| `POST` | `/api/orders` | Public / Auth | Save Razorpay order (links `userId` when signed in) |
| `PATCH` | `/api/orders/:id/status` | **Admin** | Update order fulfillment status |
| `GET` | `/api/custom-orders` | **Admin** | List all custom resin commission requests |
| `GET` | `/api/custom-orders/my` | **Auth** | List custom commissions belonging to the signed-in customer |
| `POST` | `/api/custom-orders` | Public / Auth | Submit new custom commission (links `userId` when signed in) |
| `PATCH` | `/api/custom-orders/:id/status` | **Admin** | Update custom commission status |
| `POST` | `/api/auth/register` | Public | Register new `customer` account (ignores any `role` field; returns JWT) |
| `POST` | `/api/auth/login` | Public | Sign in customer or admin account (rate-limited; returns JWT) |
| `GET` | `/api/auth/me` | **Auth** | Validate active JWT and return sanitized user profile |
| `POST` | `/api/auth/logout` | **Auth** | Increment server-side `tokenVersion` to immediately revoke active JWT |
| `PUT` | `/api/auth/profile` | **Auth** | Update profile & shipping address strictly for authenticated `req.user.id` |
| `GET` | `/data/uploads/:file` | Public | Static serving for uploaded product images |

---

## 9. Testing & Verification

### Frontend + Backend + Security/RBAC Tests
```bash
node --test frontend/src/lib/ecommerceLogic.test.js backend/utils/productHelpers.test.js backend/routes/galleryRoutes.test.js
```

### Syntax & Type Check (Lint)
```bash
npm run lint
```

---

## 10. Production Build & Separated Deployment

### Option A: Separated Deployment (Recommended for MERN)
1. **Database**: MongoDB Atlas par free/dedicated cluster banayein aur connection string copy karein.
2. **Backend (Render / Railway / Fly.io / VPS)**:
   - Root directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` (aapka deployed frontend URL), `PORT`
   - Note: `backend/data/uploads/` persistent disk volume par mount karein agar server ephemeral hai.
3. **Frontend (Vercel / Netlify / Cloudflare Pages)**:
   - Root directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_URL=https://your-backend-api-url.com`

### Option B: Unified Single-Server Deployment
Root folder se build aur start run karein:
```bash
npm install
npm run build
npm start
```
(`NODE_ENV=production node server.js` built `dist/` aur `/api/*` + `/data/uploads/*` sab kuch port `3000` par serve karega.)
