# Hidden India — Backend (deploy to Render)

## Deploy
1. Push this folder to its own GitHub repo.
2. In Render: New -> Blueprint -> point at this repo. `render.yaml` sets it up automatically
   (or New -> Web Service if you'd rather configure manually: build command
   `npm install && npm run build`, start command `npm start`).
3. Set the environment variables listed in `.env.example` in Render's dashboard
   (Environment tab) — GROQ_API_KEY at minimum for AI features to work.
4. Once deployed, copy the `https://your-service.onrender.com` URL Render gives you.
   That's your `API_BASE_URL` / `VITE_API_BASE_URL` for the frontend and Android app.

## Endpoints of note added in this pass
- `GET /api/geo/nearest-emergency?lat=&lon=` — real nearest hospital/police via
  OpenStreetMap Overpass API (SOS screen's GPS mode).
- `GET /api/images/resolve?query=` — real, verified image lookup via Wikipedia's API,
  used wherever a destination's static data has no hardcoded image.
