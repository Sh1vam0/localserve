# 🧭 NearNest / LocalServ — Local Services Discovery & Booking Platform

> **HACKVIBE Hackathon · Round 1 Submission**  
> A full-stack web application connecting customers with verified local services (hair salons, gyms, ayurvedic spas, and beauty parlours). Features zero double-booking, two-way OTP visit verification, hybrid multi-signal recommendations, and instant wallet refunds.

---

## 🌟 Key Features

- **🎨 Modern Earthy Aesthetic**: Powered by NearNest GUI design system (DM Sans & Manrope fonts, forest green `#2f6b4f`, and vibrant lime `#d9f36a`).
- **🔒 Zero Double-Booking Guarantee**: Real-time database conflict checks lock appointment time slots across all customers.
- **🔑 Two-Way OTP Verification**:
  - *Customer Arrival*: Customer shows 4-digit code $\rightarrow$ business marks them checked in.
  - *Service Completion*: Business provides 4-digit completion code $\rightarrow$ customer confirms delivery.
  - *Verified Reviews*: Only appointments that completed both OTP steps get the **"✓ Verified Visit"** badge.
- **🧠 7-Signal Hybrid Recommendations**: Combines Haversine distance, Bayesian average rating, trending momentum, budget matching, and category affinity.
- **🚗 GPS Route & Ride Navigation**: One-click Google Maps directions with pre-filled coordinates.
- **💰 Cancellation Wallet**: Tiered cancellation refunds (>4h: 100%, 1–4h: 50%) credited directly to user wallets.

---

## 🏗️ Architecture & Tech Stack

```
Frontend (React 18 + Vite + Tailwind CSS)
    │  Port 5173
    ▼
Backend (Node.js + Express REST API)
    │  Port 5000
    ▼
Database (MongoDB / MongoDB Atlas + In-Memory Fallback)
```

- **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide Icons, React Router v6, Axios, React Hot Toast.
- **Backend**: Node.js, Express.js, Mongoose ODM, JWT Auth, Bcrypt.js.
- **Database**: MongoDB (supports MongoDB Atlas & automatic zero-setup in-memory database).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### 2. Setup & Installation
Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/localserv-nearnest.git
cd localserv-nearnest

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Run the Application
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
node server.js
```
*API runs on `http://localhost:5000/api`*

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔑 1-Click Demo Accounts

| Role | Email | Password | What You Can Test |
| :--- | :--- | :--- | :--- |
| 👤 **Customer** | `rahul@test.com` | `password123` | Search, budget filter, 3-step booking wizard, live slot locking, arrival OTP, wallet refunds, verified reviews |
| 🏢 **Owner** | `owner1@localserv.com` | `password123` | Provider dashboard, today's schedule, arrival OTP check-in desk, add/edit services & prices, operating hours |
| 👑 **Admin** | `admin@localserv.com` | `password123` | Platform analytics & GMV, moderate users (activate/deactivate), approve/suspend business listings |

---

## 🍃 MongoDB Atlas Configuration (Optional)

The application includes an in-memory database fallback so it works immediately out of the box with zero setup. To connect your cloud MongoDB Atlas cluster:

1. Open `backend/.env`
2. Update the connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/localserv?retryWrites=true&w=majority
   ```
3. Ensure IP `0.0.0.0/0` is whitelisted in Atlas Network Access.

---

## 🧪 Automated Testing

Run the 12-step end-to-end integration test suite:

```bash
cd backend
node test-e2e.js
```

---

## 🌐 Production Deployment Guide

Ready to publish LocalServ as a live website? Read the detailed [DEPLOYMENT.md](./DEPLOYMENT.md) guide covering:
- **Free Frontend Deployment**: [Vercel](https://vercel.com) (configured with SPA rewrites in `frontend/vercel.json`)
- **Free Backend Deployment**: [Render](https://render.com) (configured via `render.yaml`)
- **Cloud Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) M0 Free Tier
- **All-in-One Monolith Option**: Single-click deployment on Render where the Express backend serves the React frontend build.

