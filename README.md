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

- Ye command `vite --port=3000 --host=0.0.0.0` start karegi.
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

### 2. Deploy se pehle local production preview test karein

```bash
npm run preview
```

### 3. Deploy

- **Vercel / Netlify / Cloudflare Pages** par deploy karte waqt:
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
- Ya directly `dist/` folder ko kisi bhi static hosting par upload kar sakte hain. *(Kyunki abhi Razorpay aur storage client-side/demo state mein hain, kisi backend server ya secret `.env` key ki zaroorat nahi hai jab tak aap real Razorpay/backend API add nahi karte.)*
