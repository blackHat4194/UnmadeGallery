# UNMADE GALLERY — Local Setup, Run, Test & Deploy Guide

Apne local system par is project ko install, run, test aur deploy karne ke liye project ke root folder (jahan `package.json` file hai) mein terminal open karein aur ye steps follow karein:

## 1. Prerequisites

System mein **Node.js (v20+ LTS recommended)** aur **npm** installed hona chahiye. Check karne ke liye:

```bash
node -v
npm -v
```

## 2. Dependencies Install Karein

```bash
npm install
```

*(Agar install ke dauran peer-dependency warning/error aaye to `npm install --legacy-peer-deps` use kar sakte hain.)*

## 3. Development Mode (`dev`) Mein Run Karein

```bash
npm run dev
```

- Ye command `node server.js` start karegi (Express API + Vite middleware on port `3000`).
- Admin panel se add kiye gaye product photos `data/uploads/` mein save hote hain aur catalog `data/gallery-data.json` + `src/data/products.js` mein sync hota hai.
- Browser mein open karein: `http://localhost:3000`

## 4. Project Test & Verify Karein

Unit Tests run karne ke liye:

```bash
node --test src/lib/ecommerceLogic.test.js
```

Code/Syntax check (lint) ke liye:

```bash
npm run lint
```

## 5. Production Build & Deploy Karein

### 1. Production build banayein

```bash
npm run build
```

Isse aapka production-ready static bundle `dist/` folder mein generate ho jayega.

### 2. Deploy se pehle local production server test karein

```bash
npm start
```

(`NODE_ENV=production node server.js` built `dist/` aur `/data/uploads` + `/api/*` dono ko port `3000` par serve karega.)

### 3. Deploy

- **Node Server Hosting (Render / Railway / VPS / Cloud Run)** par deploy karte waqt:
  - **Build Command:** `npm run build`
  - **Start Command:** `npm start`
  - **Data Persistence:** `data/` folder mein `gallery-data.json` aur `uploads/` store hote hain.
