# 🚀 LocalServ (NearNest) — Complete Production Deployment Guide

This guide details how to deploy **LocalServ** as a live, secure website accessible to anyone on the internet.

---

## 🏗️ Architecture Overview

| Component | Recommended Free Platform | Alternative |
| :--- | :--- | :--- |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free M0 512MB) | Self-hosted MongoDB |
| **Backend API** | [Render](https://render.com) (Free Web Service) | [Railway](https://railway.app) / [Fly.io](https://fly.io) |
| **Frontend Web** | [Vercel](https://vercel.com) (Global Edge CDN) | [Netlify](https://netlify.com) / Render |

---

## ⚡ Deployment Path 1: Split Architecture (Recommended)
> **Frontend on Vercel + Backend on Render + Database on MongoDB Atlas**

### Step 1: Set Up Cloud Database (MongoDB Atlas)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up/log in.
2. Click **Create a Deployment** and select the **M0 Free Tier** (AWS or Google Cloud, choose the region closest to your users, e.g., Mumbai `ap-south-1`).
3. Under **Security → Database Access**:
   - Add a new database user (e.g. username: `localserv_admin`, password: create a strong password).
   - Set privileges to **Read and write to any database**.
4. Under **Security → Network Access**:
   - Click **Add IP Address** → Choose **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Under **Database → Clusters**, click **Connect** → **Drivers (Node.js)**:
   - Copy your connection string:
     ```bash
     mongodb+srv://localserv_admin:<password>@cluster0.xxxxx.mongodb.net/localserv?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password.

---

### Step 2: Push Your Project to GitHub
1. Open terminal in the project directory (`C:\Users\hp\.gemini\antigravity\scratch\localserv`).
2. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of LocalServ fullstack app"
   ```
3. Create a new repository on [GitHub](https://github.com/new) (e.g., `localserv`).
4. Link and push:
   ```bash
   git remote add origin https://github.com/<your-username>/localserv.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 3: Deploy Backend on Render
1. Go to [render.com](https://render.com) and create a free account.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`localserv`).
4. Configure the Web Service:
   - **Name**: `localserv-api` (or your choice)
   - **Region**: Singapore or Frankfurt (choose nearest)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. Scroll down to **Environment Variables** and add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `5000` | Port listened by Express |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `a_very_long_secret_key_12345` | Random strong secret |
   | `JWT_EXPIRE` | `7d` | Token lifetime |
   | `CLIENT_URL` | `*` *(or update to your Vercel URL once deployed)* | Allows CORS requests |
6. Click **Deploy Web Service**.
7. Once deployed, Render gives you a URL (e.g., `https://localserv-api.onrender.com`).
8. Test your backend by visiting `https://localserv-api.onrender.com/api/health` in your browser. It should return `{"status":"healthy"}`.

---

### Step 4: Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository (`localserv`).
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and choose `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
5. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://localserv-api.onrender.com/api` *(replace with your real Render URL)* |
6. Click **Deploy**.
7. In ~60 seconds, your site will be live at `https://localserv.vercel.app` (or custom name)!

---

## ⚡ Deployment Path 2: All-in-One Monolith on Render
> **Single Service (Backend serves built Frontend) — Zero CORS, Single URL**

If you want everything under a single URL with zero configuration:

1. Push your repository to GitHub.
2. In [Render](https://render.com), click **New +** → **Web Service**.
3. Select your repository.
4. Set:
   - **Root Directory**: Leave empty (root `.`)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: Random secret key
   - `JWT_EXPIRE`: `7d`
6. Click **Deploy Web Service**.
   - Render will build the Vite frontend into `frontend/dist` and start the Express server.
   - Both your frontend and API are now accessible on the exact same Render URL!

---

## 🔐 Environment Variables Quick Reference

### Backend (`backend/.env` / Render Dashboard)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/localserv?retryWrites=true&w=majority
JWT_SECRET=super_secure_random_production_secret_key_2026
JWT_EXPIRE=7d
CLIENT_URL=https://localserv.vercel.app
```

### Frontend (`frontend/.env` / Vercel Dashboard)
```env
VITE_API_URL=https://localserv-api.onrender.com/api
```

---

## ✅ Post-Deployment Verification Checklist
- [ ] Visit `https://<backend-url>/api/health` → Returns `{"status":"healthy"}`
- [ ] Open frontend URL on desktop & mobile browser
- [ ] Register a new customer account
- [ ] Search for services (e.g. Haircut, Spa, Gym)
- [ ] Book a service and verify arrival OTP generation
- [ ] Test Store Owner portal and Admin Governance modal
