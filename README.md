# GoFly Travel Planner

GoFly is a decoupled and cloud-native travel dashboard featuring third-party API integration (SerpAPI, Open-Meteo) designed to optimize city-based tourism searches and get an instant destination overview.

The application features a React(Vite) frontend hosted on Vercel and a containerized Node.js backend deployed on Azure Container Apps. It integrates Azure Cache for Redis for high-concurrency caching and relies on an automated multi-environment CI/CD pipeline for seamless deployment.

## Key Features & DevOps Highlights

- **Multi-Environment CI/CD Automation**: Built a linear promotion pipeline across `development`, `testing`, and `production` branches in GitHub Actions. Enforces branch protection rules, code synchronization verification, and automated testing gates (Unit tests ➔ API tests ➔ E2E tests ➔ Smoke test + Code sync verification).
- **Caching**: Integrated Azure Cache for Redis to store external SerpAPI search results, bypassing outbound HTTP calls on cache hits and maintaining sub-second responses under heavy user traffic (designed for up to 10,000 concurrent users).
- **Serverless Autoscaling**: Configured Azure Container Apps with HTTP traffic scaling triggers (`dev`/`test`: 0–2 replicas; `prod`: 1–10 replicas) to handle sudden demand spikes while preventing cold starts in production.
- **Full-Stack Observability**: Configured Grafana dashboards connected to Azure Monitor for backend CPU/Memory/replica activity and Vercel Observability for frontend performance and error tracking.


## Stack
- **Backend**: Node.js, Express
- **Frontend**: React, Vite
- **Attractions & City Info**: SerpAPI (Google Maps + Google Search engines)  
- **Weather**: Open-Meteo (free, no key needed, called directly from frontend)  
- **Map**: MapLibre GL + free OpenStreetMap tiles (no key needed)
- **Caching Layer**: Azure Cache for Redis
- **Cloud Infrastructure**: Microsoft Azure (Azure Container Apps)
- **Containerization & Deployment**: Docker, Vercel, GitHub Actions
- **Testing**: Vitest (Unit tests), Postman (API tests), Playwright (E2E & Smoke tests)
- **Observability & CI/CD**: Grafana, Vercel Observability, GitHub Actions

---

## 1. Backend Setup

```bash
cd backend
cp .env.example .env
# → Add your SERPAPI_API_KEY to .env

npm install
node server.js
# Server runs on http://localhost:8000
```

### `.env`
```
SERPAPI_API_KEY=your_key_here
PORT=8000
```

---

## 2. Frontend Setup

### Copy the new service files into your project

Replace these files in your frontend `src/` directory:

| File | Destination |
|------|-------------|
| `frontend-services/placeService.js`    | `src/services/placeService.js` |
| `frontend-services/attractionsService.js` | `src/services/attractionsService.js` |
| `frontend-services/weatherService.js` | `src/services/weatherService.js` |
| `frontend-services/useCityData.js`    | `src/hooks/useCityData.js` |
| `frontend-services/MapSection.jsx`    | `src/components/MapSection.jsx` |

### Frontend `.env` (in your Vite project root)
```
VITE_API_URL=http://localhost:8000
```
---

## 3. API Endpoints

### `GET /api/attractions?city=Paris`
Returns an array of attractions from SerpAPI Google Maps.

**Response shape:**
```json
[
  {
    "id": "ChIJ...",
    "name": "Eiffel Tower",
    "briefIntro": "Landmark",
    "description": "...",
    "address": "Champ de Mars, Paris",
    "lat": 48.8584,
    "lng": 2.2945,
    "rating": 4.7,
    "reviewCount": 212000,
    "image": "https://...",
    "photos": ["https://..."],
    "website": "https://...",
    "contactNumber": "+33 ...",
    "openingHours": "Mon: 9am–11pm | Tue: ...",
    "type": "Tourist attraction"
  }
]
```

### `GET /api/city?name=Paris`
Returns city info from SerpAPI Google Search knowledge graph + OpenStreetMap geocoding fallback.

**Response shape:**
```json
{
  "name": "Paris",
  "title": "Paris",
  "country": "Capital of France",
  "extract": "Paris is the capital and most populous city of France...",
  "description": "...",
  "image": "https://...",
  "lat": 48.8566,
  "lng": 2.3522
}
```

---
