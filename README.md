# ExploreTN — Geospatial Travel & Trail Discovery Platform for Tamil Nadu

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel)](https://explore-tn-ochre.vercel.app)
[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/Frontend-TanStack%20Start%20%2B%20React-blue?logo=typescript)](https://tanstack.com/router)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20PostGIS-336791?logo=postgresql)](https://postgis.net)

ExploreTN is an immersive, map-first travel discovery and trail intelligence platform built specifically for the diverse landscapes, cultural heritage, and scenic road networks of Tamil Nadu, India.

---

## 🌟 Key Highlights

- **🗺️ Geospatial Map & Route Explorer**: Fullscreen road network routing engine powered by OSRM and Mapbox with real road geometry, elevation changes, waypoint cascades, and multi-modal travel ETA (driving, bike, bus, train).
- **🧭 Regional Travel Hubs & Canonical Destinations**: Discover tourist spots, waterfalls, mountain viewpoints, coastal drives, and ancient temple corridors across all 38 districts of Tamil Nadu.
- **✨ Signature Travel Trails**: Handcrafted multi-day road trips and thematic trails (Pancha Bhoota Stalam, Arupadai Veedu Murugan circuit, Western Ghats hairpin passes, Chettinad culinary loops).
- **🤖 AI Trip Copilot**: Conversational, grounded itinerary planner generating day-by-day schedules, fuel estimates, and scenic stop recommendations with live weather context.
- **🛡️ Secure Multi-Tenant Architecture**: Granular RBAC, Supabase Auth verification, WGS84 spatial boundary validation, rate limiting, and observability.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework:** [TanStack Start](https://tanstack.com/start) / [TanStack Router](https://tanstack.com/router) with SSR & Nitro
- **UI & Styling:** Tailwind CSS, Framer Motion, Motion Primitives, GSAP with ScrollTrigger
- **Icons & Visuals:** Lucide React, Mapbox GL JS, Google Maps API

### Backend Core
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.14 / 3.11+) with Asyncpg & Pydantic v2
- **Spatial & Cache:** PostGIS / PostgreSQL, Redis
- **Security:** Strict Supabase JWT signature verification (`HS256`), role-based access control (RBAC), and self-approval prevention guards

---

## 🚀 Quick Start

### Frontend (Development)
```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
```

### Backend (Development)
```bash
# Setup environment
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run FastAPI core
uvicorn backend.app.main:app --reload --port 8000
```

### Environment Variables
Configure your environment variables in `.env` (never commit live secrets to git):

```env
# Backend Core
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
AI_API_KEY=your_ai_provider_key
OPENROUTER_API_KEY=your_openrouter_key
MAPBOX_API_KEY=your_mapbox_token
WEATHER_API_KEY=your_openweather_key
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/explorer_tn
REDIS_URL=redis://localhost:6379/0
```

---

## 📄 License
MIT License. Built with ❤️ for exploring Tamil Nadu.
