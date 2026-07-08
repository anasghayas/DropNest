# DropNest 🦅

DropNest is a modern, full-stack E-commerce Price Tracker. It allows users to paste product links from platforms like Amazon, track their price history over time, and set custom target price alerts to save money.

---

## 🏗 Architecture & Tech Stack

DropNest is built with a separated frontend and backend architecture, connected to a highly scalable PostgreSQL database.

### Frontend (Client)
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS & Shadcn UI (for beautiful, accessible, dark-mode components)
- **State Management**: Zustand (for lightweight, global state)
- **Routing**: React Router
- **Graphics**: WebGL-based custom `Lightfall` background animation using `ogl`.
- **Hosting**: Deployed automatically on **Vercel**

### Backend (Server)
- **Framework**: Node.js & Express.js
- **Scraping Engine**: Puppeteer (Headless Chrome) & Cheerio (for extracting product data directly from raw HTML)
- **Database ORM**: Prisma (for type-safe database queries and migrations)
- **Automation**: CRON jobs triggered externally to scrape and update all tracked products every 6 hours.
- **Hosting**: Deployed automatically on **Render** (using custom `postinstall` build steps for Prisma).

### Database & Authentication
- **Provider**: Supabase
- **Authentication**: Supabase Auth (Google OAuth & Email/Password)
- **Database**: PostgreSQL (connected via Supabase's high-performance IPv4 connection pooler `?pgbouncer=true`).

---

## 🗄 Database Schema (Prisma)

The database consists of three core relational models:

1. **`Product`**: Represents the physical e-commerce item.
   - Stores `url` (unique), `title`, `imageUrl`, `currentPrice`, `highestPrice`, and `lowestPrice`.
   - This table ensures we only scrape a product link once, even if 100 users are tracking the same URL.

2. **`PriceHistory`**: Represents a historical snapshot of a product's price.
   - Every time the CRON job runs and scrapes a new price, a record is added here.
   - Linked to `Product` via a one-to-many relationship. This is what powers the beautiful Area Charts on the frontend.

3. **`TrackedItem`**: Represents a user's personal tracking preferences.
   - The "join table" connecting a `Product` to a Supabase `userId`.
   - Stores user-specific settings like `targetPrice` and `alertOnAnyDrop`.
   - Ensures a user can't track the exact same product twice.

---

## 🚀 How to Run Locally

If you want to spin up DropNest on your local machine, follow these steps:

### 1. Prerequisites
- Node.js installed
- A Supabase account (for database & auth credentials)

### 2. Environment Variables
Create a `.env` file in the root directory and add the following keys:

```env
# Supabase Authentication
VITE_SUPABASE_URL="your-supabase-project-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Prisma Database Connections
# (Use the session-mode port 5432 for DIRECT_URL, and transaction pooler port 6543 for DATABASE_URL)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-region.pooler.supabase.com:5432/postgres"

# Backend & Scraping
PORT=3000
VITE_API_URL="http://localhost:3000/api"
CRON_SECRET="your-secure-cron-secret-key"
```

### 3. Install & Initialize
Open your terminal and run:

```bash
# Install all dependencies
npm install

# Push the database schema to your Supabase PostgreSQL instance
npx prisma db push

# Generate the Prisma client locally
npx prisma generate
```

### 4. Run the App
We created a custom script to run both the frontend (Vite) and backend (Express) concurrently:

```bash
npm run dev:all
```
Your app will now be running at `http://localhost:5173`!

---

## ⚙️ Deployments & CI/CD

DropNest is fully automated. The moment code is pushed to the `main` branch on GitHub:
1. **Vercel** intercepts the push, builds the React frontend, and deploys it globally.
2. **Render** intercepts the push, runs `npm install` (and `prisma generate` via our custom `postinstall` script), and spins up the Node backend.

The automated scraper is triggered by **cron-job.org**, which pings the `/api/cron/scrape` endpoint every 6 hours, utilizing the secure `CRON_SECRET` to authorize the run.
