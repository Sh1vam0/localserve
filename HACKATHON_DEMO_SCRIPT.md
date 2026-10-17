# 🏆 HackVibe Round 1 — LocalServ Demo Script & Presentation Guide

## ⏱️ 3-Minute Live Demo Walkthrough (For Judges)

### Minute 1: The Problem & Discovery (Customer Flow)
1. **Open [http://localhost:5173](http://localhost:5173)**.
2. **Hero & Search**: Show how a customer can search for "haircut", select "Mumbai", or click a category pill like **Hair & Salons** or **Fitness & Gyms**.
3. **Smart Hybrid Recommendations**:
   - Point out the **"Recommended for You"** section: Explain that it combines 7 signals (Distance, Bayesian rating, Trending momentum, Budget matching, and Category affinity).
   - Point out the **"Spots Near You"** with exact km distances calculated via Haversine geolocation.
4. **Business Profile & Ride Suggestion**:
   - Open **Glow Luxury Salon & Spa**.
   - Show transparent pricing, duration, and the **"🚗 Need a ride?"** button which opens pre-filled directions in Google Maps.

### Minute 2: Booking Wizard & Zero Double-Booking Guarantee
1. Click **"Book Now"** on "Classic Signature Haircut".
2. **Step 1 (Date)**: Pick an upcoming date.
3. **Step 2 (Time Slot)**: Show real-time dynamic 30-min slot generation.
4. **Step 3 (Confirm)**: Click **"Reserve Appointment"**.
5. **The Wow Factor #1 (Double Booking Prevention)**:
   - Explain how our MongoDB atomic conflict lock prevents any other customer from snatching that same slot.
6. **The Wow Factor #2 (Arrival Check-In Code)**:
   - Show the 4-digit **Check-in Code** generated on screen: *"Show this arrival code when you arrive at the salon."*

### Minute 3: Business Owner Operations & Two-Way Verification
1. Click **Log In** and tap the 1-click **🏢 Owner** demo button (`owner1@localserv.com`).
2. Show the **Owner Dashboard**:
   - Live revenue calculation, today's schedule, and the **OTP Arrival Desk**.
3. **Verify Customer Arrival**:
   - Enter the customer's 4-digit code $\rightarrow$ Status changes to **Checked-In**.
   - Owner gives customer the **Completion Code** once service is finished.
4. Switch back to **Customer** (`rahul@test.com`) $\rightarrow$ **My Bookings**:
   - Enter completion code $\rightarrow$ Status changes to **Completed (Verified)**.
   - Leave a **Verified Review** with tags $\rightarrow$ displays the green **"✓ Verified Visit"** badge.
5. **Wallet Refund Test**:
   - Click **Cancel** on a booking $\rightarrow$ 100% refund is instantly credited to the user's **LocalServ Wallet**.

---

## 🎯 Alignment with Problem Statement & Judging Rubrics

| Requirement | LocalServ Implementation | Status |
| :--- | :--- | :---: |
| **Customer Journey** | Search by name/location, category filters, 3-step booking wizard, live slot locking, booking history, rescheduling & cancellation | ✅ 100% Complete |
| **Business Owner** | Profile editor, weekly working hours scheduler, service catalog with prices/duration, live appointment management | ✅ 100% Complete |
| **Admin Controls** | Platform stats (GMV, total bookings, verified rate), user moderation (activate/deactivate), listing approvals/suspensions | ✅ 100% Complete |
| **Double Booking Prevention** | Atomic MongoDB query locks time slot across all customers | ✅ 100% Complete |
| **Two-Way Verification** | Customer arrival OTP + Business completion OTP prevents ghost bookings & fake reviews | ✅ 100% Complete |
| **Smart Recommendation** | 7-signal hybrid scoring (location, Bayesian rating, trending velocity, budget match) | ✅ 100% Complete |
| **Ride Integration** | One-click Google Maps GPS route navigation | ✅ 100% Complete |
| **Wallet & Refunds** | Automated tiered refund calculation credited to customer wallet | ✅ 100% Complete |
| **Clean Minimalist UI** | Card-based Tailwind CSS layout, high whitespace, no visual clutter | ✅ 100% Complete |

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `rahul@test.com` | `password123` |
| **Business Owner** | `owner1@localserv.com` | `password123` |
| **Admin** | `admin@localserv.com` | `password123` |
