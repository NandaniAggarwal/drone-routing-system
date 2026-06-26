# FleetScope — Autonomous Drone Fleet Routing Simulator

A full-stack web app for the autonomous drone fleet routing problem: configure
a city grid, a fleet of drones, deliveries, charging stations, and dynamic
no-fly zones, run the routing solver, and watch the resulting flight plan
animate on a radar-style map.

The routing **algorithm itself is an unmodified line-for-line port** of the
provided Python reference solution into JavaScript — see
[`ALGORITHM_PORT_NOTES.md`](./ALGORITHM_PORT_NOTES.md) for the verification
methodology (the JS port was diffed against the original Python script
running side-by-side on identical inputs).

```
/frontend          React + Vite + Tailwind UI
  src/
    components/    Map, forms, playback controls, output panels
    pages/         (App.jsx is the single page; reserved for future routes)
    utils/         API client, sample data, geometry/interpolation helpers
/backend            Node.js + Express API
  server.js
  routes/solve.js   POST /api/solve
  solver/           DroneState, Delivery, ChargingStation, CircleNFZ, RectNFZ, Solver
```

## Quick start

You need Node.js 18+ installed.

```bash
# 1. Backend
cd backend
npm install
npm start
# → http://localhost:4000

# 2. Frontend (in a second terminal)
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Open `http://localhost:5173`. The Vite dev server proxies `/api/*` requests
to the backend on port 4000 (see `frontend/vite.config.js`), so no extra
CORS configuration is needed in dev. The backend also sets `cors()` directly
in case you run the built frontend from a different origin.

To build the frontend for production:

```bash
cd frontend
npm run build      # outputs to frontend/dist
npm run preview    # serve the production build locally
```

## Using the app

1. **City Grid** — set map width/height. The warehouse always sits at the
   center, `(width/2, height/2)`.
2. **Drone Fleet** — add/remove drones, each with an ID and max payload.
3. **Deliveries** — add/remove delivery requests (coordinates, package
   weight, deadline timestep).
4. **Charging Stations** — optional; each has a location and a slot count.
5. **No-Fly Zones** — circle or rectangle, each with an active time window
   `[T_start, T_end]`.
6. Click **Run Simulation**. The backend solves the routing problem and
   returns a flight manifest, which streams onto the map:
   - drones animate along their computed paths, oriented to their heading
   - dashed trails show the full route, animated with a flowing dash pattern
   - no-fly zones switch from "expired" (dashed, dim) to "active" (solid red
     fill) based on the current playback time
   - delivery markers fill in green once delivered
7. Use the transport bar under the map to play/pause, scrub the timeline, or
   change playback speed.
8. The right-hand **Mission Summary** shows successful deliveries, total
   distance, total energy, makespan, and the score formula from the spec.
   **Flight Manifest** shows the same data as a readable action timeline or
   raw JSON (copy/download available).
9. Use **Load Sample Input** in the top bar to load any of the three sample
   scenarios from the problem statement (basic routing, NFZ + charging,
   multi-drone with a rectangular NFZ).

## API

`POST /api/solve`

Request body — same JSON shape as the spec's input format:

```json
{
  "map_size": [200, 200],
  "drones": [{ "id": "drone_1", "max_payload": 1.0 }],
  "deliveries": [{ "id": "d1", "x": 10, "y": 100, "weight": 0.3, "deadline": 200 }],
  "charging_stations": [{ "x": 100, "y": 10, "slots": 1 }],
  "no_fly_zones": [
    { "shape": "circle", "center": [100, 55], "radius": 15, "T_start": 0, "T_end": 150 }
  ]
}
```

Response:

```json
{
  "flight_manifest": [ { "drone_id": "drone_1", "path": [ ... ] } ],
  "summary": {
    "successful_deliveries": 3,
    "total_deliveries": 3,
    "total_distance": 487.28,
    "total_energy": 595.28,
    "makespan": 487.28,
    "score": 216.11
  }
}
```

`GET /api/health` returns `{ "status": "ok" }`.

## Design notes

The map is built as a radar/control-tower scope rather than a generic flat
dashboard: range rings centered on the warehouse, a soft rotating sweep, a
monospace telemetry typeface (IBM Plex Mono) for all coordinates and
timestamps, and drones rendered as small chevrons that rotate to face their
direction of travel with a glowing trailing path. Colors are functional: cyan
for drones/paths/waypoints, coral for deliveries and active no-fly zones,
amber for charging infrastructure, violet for waiting states, green for
completed pickups/deliveries.
