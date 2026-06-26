const { dist, MAX_BATTERY, round2, EPS } = require('./utils');
const { planPath } = require('./noFlyZone');
const DroneState = require('./drone');
const Delivery = require('./delivery');
const { ChargingStation, CircleNFZ, RectNFZ } = require('./noFlyZone');

// Direct port of Python Solver class
class Solver {
  constructor(wx, wy, drones, deliveries, stations, zones) {
    this.wx = wx;
    this.wy = wy;

    this.drones = drones;
    this.deliveries = deliveries;
    this.stations = stations;
    this.zones = zones;

    this.mfMap = {};

    for (const d of drones) {
      this.mfMap[d.id] = {
        drone_id: d.id,
        path: [],
      };
    }
  }

  solve() {
    this.deliveries.sort((a, b) => a.deadline - b.deadline);

    let progress = true;

    while (progress) {
      progress = false;

      for (const drone of this.drones) {
        const batch = this.buildBatch(drone);

        if (!batch || batch.length === 0) {
          continue;
        }

        for (const d of batch) {
          d.assigned = true;
        }

        progress = true;

        this.executeTrip(drone, batch);
      }
    }

    return Object.values(this.mfMap);
  }

  buildBatch(drone) {
    const batch = [];
    let usedWeight = 0.0;

    for (const d of this.deliveries) {
      if (d.assigned) {
        continue;
      }

      if (usedWeight + d.weight > drone.maxPayload + EPS) {
        continue;
      }

      const eta = drone.t + dist(this.wx, this.wy, d.x, d.y);

      if (eta > d.deadline) {
        continue;
      }

      const trial = [...batch, d];

      if (!this.energyFeasible(trial)) {
        continue;
      }

      batch.push(d);

      usedWeight += d.weight;
    }

    return batch;
  }

  energyFeasible(batch) {
    const sortedBatch = [...batch];

    sortedBatch.sort((a, b) => {
      if (a.deadline !== b.deadline) return a.deadline - b.deadline;
      return b.weight - a.weight; // -d.weight ascending == weight descending
    });

    let payload = sortedBatch.reduce((sum, d) => sum + d.weight, 0);

    let cx = this.wx;
    let cy = this.wy;

    let energy = 0.0;

    for (const d of sortedBatch) {
      const leg = dist(cx, cy, d.x, d.y);

      energy += leg * (1.0 + payload);

      payload -= d.weight;

      cx = d.x;
      cy = d.y;
    }

    energy += dist(cx, cy, this.wx, this.wy);

    return energy <= MAX_BATTERY * 0.95 + EPS;
  }

  executeTrip(drone, batch) {
    const mf = this.mfMap[drone.id].path;

    if (dist(drone.x, drone.y, this.wx, this.wy) > EPS) {
      this.travelTo(drone, mf, this.wx, this.wy, 0.0);
    }

    const pickup = {
      x: round2(this.wx),
      y: round2(this.wy),
      t: round2(drone.t),
      action: 'PICKUP',
      delivery_ids: batch.map((d) => d.id),
    };

    mf.push(pickup);

    batch.sort((a, b) => {
      if (a.deadline !== b.deadline) return a.deadline - b.deadline;
      return b.weight - a.weight;
    });

    let payload = batch.reduce((sum, d) => sum + d.weight, 0);

    for (const d of batch) {
      this.travelTo(drone, mf, d.x, d.y, payload);

      payload -= d.weight;

      mf.push({
        x: round2(d.x),
        y: round2(d.y),
        t: round2(drone.t),
        action: 'DELIVER',
        delivery_id: d.id,
      });
    }

    this.travelTo(drone, mf, this.wx, this.wy, 0.0);

    mf.push({
      x: round2(this.wx),
      y: round2(this.wy),
      t: round2(drone.t),
      action: 'RETURN',
    });

    drone.battery = MAX_BATTERY;
  }

  travelTo(drone, mf, toX, toY, payload) {
    const path = planPath(drone.x, drone.y, drone.t, toX, toY, this.zones);

    let curX = drone.x;
    let curY = drone.y;

    for (let i = 0; i < path.length; i++) {
      const pt = path[i];

      const px = pt[0];
      const py = pt[1];
      const newT = pt[2];

      let typeVal = 0;
      if (pt.length > 3) {
        typeVal = Number(pt[3]);
      }

      const last = i === path.length - 1;

      if (typeVal === 1) {
        mf.push({
          x: round2(curX),
          y: round2(curY),
          t: round2(drone.t),
          action: 'WAIT',
        });

        drone.t = newT;
      } else {
        const d = dist(curX, curY, px, py);

        drone.battery -= d * (1.0 + payload);

        drone.t = newT;

        curX = px;
        curY = py;

        if (!last) {
          mf.push({
            x: round2(curX),
            y: round2(curY),
            t: round2(drone.t),
            action: 'WAYPOINT',
          });
        }
      }
    }

    drone.x = toX;
    drone.y = toY;
  }
}

// Direct port of Python solve() entry point
function solve(warehouse, drones, deliveries, noFlyZones, chargingStations) {
  const wx = warehouse[0];
  const wy = warehouse[1];

  const droneObjs = [];

  for (const d of drones) {
    droneObjs.push(new DroneState(d.id, d.max_payload, wx, wy));
  }

  const deliveryObjs = [];

  for (const d of deliveries) {
    deliveryObjs.push(new Delivery(d.id, d.x, d.y, d.weight, d.deadline));
  }

  const stationObjs = [];

  for (const s of chargingStations || []) {
    stationObjs.push(new ChargingStation(s.x, s.y, s.slots !== undefined ? s.slots : 1));
  }

  const zoneObjs = [];

  for (const z of noFlyZones || []) {
    const ts = z.T_start;
    const te = z.T_end;

    if (z.shape === 'circle') {
      const c = z.center;
      zoneObjs.push(new CircleNFZ(c[0], c[1], z.radius, ts, te));
    } else {
      const c1 = z.corners[0];
      const c2 = z.corners[1];
      zoneObjs.push(new RectNFZ(c1[0], c1[1], c2[0], c2[1], ts, te));
    }
  }

  const solver = new Solver(wx, wy, droneObjs, deliveryObjs, stationObjs, zoneObjs);

  return solver.solve();
}

module.exports = { Solver, solve };
