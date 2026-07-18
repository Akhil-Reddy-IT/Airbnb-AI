# AirbnbAI 🏠✨ — AI-Powered Vacation Rental Platform

AirbnbAI is a full-stack, production-ready vacation rental and booking platform inspired by Airbnb, built on the **MERN Stack** (MongoDB, Express, React, Node.js) and supercharged with **Google Gemini AI** integrations. 

The platform supports robust property searching, booking, checkout payments, dynamic host dashboards with analytics, and a multi-theme design system (supporting **5 visual color presets**).

---

## 📸 Platform Previews

### 1. Home Page & AI Assistant
A premium glassmorphic interface with soft gradient backgrounds and card-slider components.
![AirbnbAI Home Page](https://raw.githubusercontent.com/Akhil-Reddy-IT/Airbnb-AI/main/frontend/src/assets/hero.png)

### 2. Five Dynamic Visual Themes
Users can switch dynamically between:
1. **Light Preset** (Classic coral accents)
2. **Dark Glass** (Sleek carbon dark mode)
3. **Sunset Glow** (Warm golden gradients)
4. **Ocean Abyss** (Deep teal and navy)
5. **Cyber Purple** (Modern violet neon glassmorphism)

---

## 🧠 Google Gemini AI Features

AirbnbAI integrates the **Google Generative AI SDK** to power intelligent features across the traveler and host workflows:

1. **AI Smart Search**: Converts natural text queries (e.g. *"Villa in Goa with a pool under 8000"*) directly into structured MongoDB database filters.
2. **AI Travel Planner**: Generates day-by-day travel schedules, tourist attractions, and expense calculations based on user budget and days.
3. **AI Description Generator**: Drafts catchy titles, SEO-optimized descriptions, and selling points for host listings.
4. **AI Review Summarizer**: Analyzes customer feedback to extract Pros, Cons, and overall sentiment metrics.
5. **AI Property Chatbot**: A custom chatbot loaded with listing rules, wi-fi speeds, and cancellation policies to answer guest questions.
6. **Personalized Recommendations**: Analyzes guest search patterns and saved wishlists to recommend similar rentals.

> [!TIP]
> **Resilient Offline Mode**: If a `GEMINI_API_KEY` is not provided, the backend falls back to a regex-based simulated AI engine, preventing app crashes and allowing developers to run and test it immediately.

---

## 🛠️ Technology Stack

### Frontend
- **React.js & React Router DOM** (Single Page App routing)
- **Tailwind CSS v4** (Modern utility styles)
- **Framer Motion** (Micro-animations and fluid transitions)
- **Context API** (Lightweight state management for Auth, Alert banners, and Themes)
- **Chart.js & React-Chartjs-2** (Host analytics and earnings graphs)
- **Axios** (API requests with automatic token headers)

### Backend
- **Node.js & Express.js** (REST API)
- **Mongoose ODM** (MongoDB models)
- **JWT (JsonWebToken) & Bcrypt** (Secure authorization and password hashing)
- **Multer & Cloudinary** (Local file uploads with Cloudinary CDN fallback)
- **Nodemailer** (Transactional email alerts with terminal logging fallback)

---

## 📁 Directory Structure

```text
airbnb-ai/
├── backend/
│   ├── config/          # Database (auto-seeder) & Cloudinary settings
│   ├── controllers/     # REST Controllers (Auth, Properties, Bookings, AI, etc.)
│   ├── middleware/      # JWT guards, rate-limiting, uploads
│   ├── models/          # Mongoose DB schemas (User, Property, Booking, Review, etc.)
│   ├── routes/          # REST API endpoints mapping
│   ├── utils/           # Nodemailer & Gemini SDK helper modules
│   ├── server.js        # Node API entry point
│   └── .env.example     # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, common sliders, and dashboard widgets
│   │   ├── context/     # Auth, Alert, and Theme providers
│   │   ├── pages/       # Home, TravelPlanner, Profile, Trips, Dashboards
│   │   └── utils/       # Axios API client wrapper
│   ├── index.html       # Entry template
│   ├── vite.config.js   # Vite server with API proxy settings
│   └── vercel.json      # Vercel routes & API rewrite mappings
│
└── package.json         # Root coordinator scripts
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
Ensure you have Node.js (v18+) and MongoDB installed and running locally on your machine.

### 2. Clone the Repository
```bash
git clone https://github.com/Akhil-Reddy-IT/Airbnb-AI.git
cd Airbnb-AI
```

### 3. Setup Backend Environment Variables
Create a `.env` file in the `backend/` directory matching `.env.example`:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/airbnbai
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

### 4. Install Dependencies & Launch
From the root project directory, run:
```bash
# 1. Install all backend and frontend dependencies
npm run install-all

# 2. Start the backend API server (Runs on port 5001)
npm run dev-backend

# 3. Start the frontend React client (Runs on port 5173)
npm run dev-frontend
```

> [!NOTE]
> **Auto-Seeder**: On the very first launch, the backend will automatically seed your database with **45 unique property listings across 15 travel cities in India** and set up default host/guest accounts (`host@airbnbai.com` & `guest@airbnbai.com` with password `password123`).

---

## 🌐 Production Deployment

### 1. Backend (Render)
- Deploy the `/backend` subdirectory to Render as a Web Service.
- Set Runtime to `Node`, Build Command to `npm install`, and Start Command to `node server.js`.
- Add environment variables (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`).

### 2. Frontend (Vercel)
- Deploy the `/frontend` subdirectory to Vercel as a Vite Project.
- The `vercel.json` file in the frontend root handles proxying all `/api` traffic directly to your Render backend web service. Ensure you update the destination URL in `vercel.json` to map your live Render address:
  ```json
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://your-backend-api.onrender.com/api/:path*" }
  ]
  ```
