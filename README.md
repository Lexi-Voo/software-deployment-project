# Travel Planner — Backend Setup

## Stack
- **Backend**: Node.js + Express  
- **Attractions & City Info**: SerpAPI (Google Maps + Google Search engines)  
- **Weather**: Open-Meteo (free, no key needed, called directly from frontend)  
- **Map**: MapLibre GL + free OpenStreetMap tiles (no key needed)

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

### Remove unused env vars
You can now **delete** these from your frontend `.env`:
- `VITE_GEOAPIFY_API_KEY`
- `VITE_UNSPLASH_ACCESS_KEY`

And **uninstall** unused packages (if installed):
```bash
npm uninstall unsplash-js  # if present
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