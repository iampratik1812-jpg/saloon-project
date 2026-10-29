# SalonBook — Indian Salon & Beauty Parlour Booking Platform

**SalonBook** is a production-grade appointment-booking platform tailored for the Indian salon and beauty parlour ecosystem. It bridges clients looking for hair, beard, skin, spa, and bridal treatments with verified local barbershops, unisex salons, and luxury beauty parlours across Indian metros (Bengaluru, Mumbai, New Delhi, Hyderabad).

---

## 1. System Architecture & Features

### A. Customer Booking Experience
- **Discover & Filter Salons**: Search by name, service type, city (Bengaluru, Mumbai, Delhi, Hyderabad), locality, minimum star rating, and price. Sort by highest rated, starting price, or review count.
- **Detailed Salon Showcase**: View salon interior photography, opening hours, verified badge, full service menus with duration in minutes and prices in Indian Rupees (₹), verified master stylists, customer reviews, and cancellation policy.
- **8-Step Conflict-Free Booking Flow**:
  1. Salon selection
  2. Multi-service selection with cumulative duration & price tally
  3. Stylist assignment ("Any Available Stylist" or specific specialist)
  4. Date selection
  5. Dynamic slot computation calculating salon business hours, staff shifts, lunch/tea breaks, and existing bookings
  6. Transparent summary with itemized services, total price, and cancellation rules
  7. Payment selection (**Pay at the Salon** active; online payment disabled if payment gateway is unconfigured)
  8. Instant confirmation with reference booking voucher (e.g. `SB-8021`)
- **Customer Dashboard**:
  - Upcoming appointments with slot details and cancellation option
  - Past booking history
  - Verified review submission with 1-5 star ratings for completed visits
  - Profile & contact information

### B. Salon Owner Portal
- **Listing Registration**: Submit salon name, address, category, business hours, and description (enters pending verification status).
- **Appointment Management**: View bookings by status (`pending`, `confirmed`, `completed`, `cancelled`), confirm manual requests, mark completed, or cancel with an auditable reason.
- **Walk-in Entry**: Record offline walk-ins directly on the calendar to instantly block the slot and prevent double-booking.
- **Service Menu Management**: Add, update, price (₹), set durations (mins), and delete services.
- **Staff & Shift Management**: Manage team members, roles, assignable services, and weekly working shifts.
- **Booking Rules**: Configure auto-confirmation and customize client cancellation policies.

### C. Administrator Console
- **Verification Queue**: Review newly submitted salon registrations. Approve to make them publicly visible in search, or reject/suspend non-compliant listings.
- **Platform Analytics**: Total customers, salon owners, pending approvals, completed appointments, and gross platform transactional value (₹).
- **Directory Audit**: Inspect all registered users, salons, and booking records.
- **One-Click Demo Reset**: Reset the database to initial clean seed state at any time.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Google Fonts (Plus Jakarta Sans).
- **Backend**: Node.js, Express, `server.ts` with Vite middlewares.
- **Security & Data**: File-backed atomic persistent database (`./data/salonbook-db.json`) with zero external failure risk, scrypt cryptographic password hashing (`crypto.scryptSync`), and token authentication.
- **PostgreSQL / Supabase Schema**: Complete SQL migration file provided in `schema.sql`.

---

## 3. Seed Accounts for Testing & Evaluation

Use the **Quick Demo Switcher** bar at the very top of the app or log in with these credentials:

| Persona | Name | Email | Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | Rohit Verma | `rohit.verma@example.com` | `password123` | `customer` |
| **Customer** | Ananya Sen | `ananya.sen@example.com` | `password123` | `customer` |
| **Salon Owner** | Arjun Sharma (Urban Edge) | `arjun@urbanedge.in` | `password123` | `salon_owner` |
| **Salon Owner** | Sunil Rao (Gentleman's Club) | `sunil@barberclub.in` | `password123` | `salon_owner` |
| **Admin** | Vikramaditya Roy | `admin@salonbook.in` | `admin123` | `admin` |

---

## 4. Local Development & Deployment

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (Runs Express server on port 3000 with Vite middleware)
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm run start
```

### Environment Configuration (`.env.example`)
```env
# Server Port
PORT=3000

# (Optional) External Supabase integration
# SUPABASE_URL="https://your-project.supabase.co"
# SUPABASE_ANON_KEY="your-anon-key"

# (Optional) Payment Gateway (e.g. Razorpay / Cashfree)
# When empty, "Pay at Salon" is used exclusively to guarantee no fake simulation.
# PAYMENT_GATEWAY_KEY=""
```

---

## 5. Test Scenarios Verified

- [x] **Customer Registration & Login**: Validated email, password hashing, and token session management.
- [x] **Salon Discovery & Filters**: Filtered by city, category, service, rating, and starting price.
- [x] **Unapproved Salon Protection**: Salons with `verificationStatus: 'pending'` (e.g. *Koramangala Style Lab*) do not appear in public client search until approved by an admin.
- [x] **Slot Calculation & Double-Booking Prevention**: Available slots dynamically check opening hours, staff working hours, lunch breaks, and existing active bookings. The server atomically rejects overlapping reservations.
- [x] **Role-Based Access Control**:
  - Customers can only view and manage their own bookings.
  - Salon owners can only modify their own salon's services, staff, and appointments.
  - Administrators can review the verification queue, approve salons, and inspect platform statistics.
- [x] **Walk-in Conflict Prevention**: Salon owners can block off walk-in slots on the spot.
- [x] **Verified Reviews**: Only customers with completed appointments can submit ratings and reviews; duplicate reviews for the same booking are blocked.
- [x] **Clean Indian Startup UI**: Warm cream canvas, deep purple accent, zero pill clutter, tabular Indian Rupee formatting (`₹`), and responsive layout.
