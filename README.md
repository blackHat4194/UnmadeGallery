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
│   ├── models/                  # Mongoose Schemas (Product, GalleryConfig, Order, CustomOrder, User)
│   ├── routes/galleryRoutes.js  # REST API routes (/api/products, /api/orders, /api/auth, etc.)
│   ├── services/galleryStore.js # Unified MongoDB + JSON store, image save/cleanup, JWT auth
│   ├── utils/productHelpers.js  # Validation, filename sanitization, showcase cleanup helpers
│   ├── app.js                   # Express app factory (CORS, JSON limit 15mb, static /data)
│   ├── server.js                # Standalone backend entrypoint
│   ├── seed.js                  # Database / JSON seed script
│   └── package.json
│
├── frontend/                    # Standalone React + Vite + Tailwind CSS App (Port 5173)
│   ├── src/
│   │   ├── components/          # Hero, FeaturedCollections, ProductGrid, AdminDashboard, Checkout, AccountView, etc.
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
- `JWT_SECRET=your_super_secret_jwt_key`
- `FRONTEND_URL=http://localhost:5173`

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

## 6. Key Features & Data Flow (IMP for Developers)

1. **Dynamic Gallery Sync (`backend/services/galleryStore.js`)**:
   - **Featured Collections**, **Best Sellers**, **Every Piece Has Its Own Story**, aur **Gallery Collection** sab `/api/gallery-data` se dynamically load hote hain.
   - Admin Dashboard (`/admin` view) se jab naya product aur photo upload hoti hai:
     - Base64 image validate hokar `backend/data/uploads/<product-slug>-<timestamp>.<ext>` par disk mein save hoti hai.
     - Product record + image path `/data/uploads/...` MongoDB (ya JSON fallback) mein store hota hai aur customer storefront ke saare sections turant sync ho jaate hain.
     - Product delete karne par associated collection/story showcase references clean hote hain aur unused upload files disk se delete ho jaati hain.
2. **Checkout Policy**:
   - Strictly **Razorpay Online-Only** checkout (UPI / Card / NetBanking). Cash on Delivery disabled hai.
   - Orders `POST /api/orders` ke through backend mein save hote hain aur Admin Panel se order status update kiya ja sakta hai (`PATCH /api/orders/:id/status`).
3. **Custom Commissions**:
   - Custom Order Studio (`POST /api/custom-orders`) se requests direct backend mein save hoti hain aur Admin Panel mein review/update (`PATCH /api/custom-orders/:id/status`) ki ja sakti hain.
4. **Customer Auth & Profile**:
   - `AccountView` mein **bcryptjs + JWT** authentication (`/api/auth/register`, `/api/auth/login`, `/api/auth/profile`) integrated hai. Token browser `localStorage` mein save hota hai.

---

## 7. REST API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server health aur active storage mode (`mongodb` ya `json-fallback`) check |
| `GET` | `/api/gallery-data` | Complete catalog: products, collections, storyShowcase, reviews, brandValues |
| `POST` | `/api/products` | Create new product + upload photo to `backend/data/uploads/` |
| `PUT` | `/api/products/:id` | Update product details / replace uploaded photo |
| `DELETE` | `/api/products/:id` | Delete product + cleanup showcase refs & orphaned image file |
| `GET` | `/api/orders` | List customer orders |
| `POST` | `/api/orders` | Save Razorpay paid order |
| `PATCH` | `/api/orders/:id/status` | Update order fulfillment status (Admin) |
| `GET` | `/api/custom-orders` | List custom resin commission requests |
| `POST` | `/api/custom-orders` | Submit new custom commission |
| `PATCH` | `/api/custom-orders/:id/status` | Update custom commission status (Admin) |
| `POST` | `/api/auth/register` | Register new customer account (returns JWT + profile) |
| `POST` | `/api/auth/login` | Sign in customer account (returns JWT + profile) |
| `PUT` | `/api/auth/profile` | Update authenticated customer profile & shipping address |
| `GET` | `/data/uploads/:file` | Static serving for uploaded product images |

---

## 8. Testing & Verification

### Frontend Unit Tests
```bash
node --test frontend/src/lib/ecommerceLogic.test.js
```

### Backend Unit Tests
```bash
node --test backend/utils/productHelpers.test.js
```

### Syntax & Type Check (Lint)
```bash
npm run lint
```

---

## 9. Production Build & Separated Deployment

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
