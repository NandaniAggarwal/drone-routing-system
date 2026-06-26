const express = require('express');
const router = express.Router();
const { solve } = require('../solver/solver');
const { dist } = require('../solver/utils');

function computeSummary(input, flightManifest) {
  const deliveriesById = {};
  for (const d of input.deliveries) {
    deliveriesById[d.id] = d;
  }

  const deliveredIds = new Set();
  let totalEnergy = 0.0;
  let totalDistance = 0.0;
  let makespan = 0.0;

  for (const drone of flightManifest) {
    let prev = null;
    let payload = 0.0;
    const payloadByDelivery = {};

    for (const pt of drone.path) {
      if (pt.t > makespan) makespan = pt.t;

      if (pt.action === 'PICKUP') {
        payload = 0.0;
        for (const id of pt.delivery_ids || []) {
          const del = deliveriesById[id];
          if (del) payload += del.weight;
        }
        prev = pt;
        continue;
      }

      if (prev) {
        const d = dist(prev.x, prev.y, pt.x, pt.y);
        totalDistance += d;
        if (pt.action !== 'WAIT') {
          totalEnergy += d * (1.0 + payload);
        }
      }

      if (pt.action === 'DELIVER') {
        deliveredIds.add(pt.delivery_id);
        const del = deliveriesById[pt.delivery_id];
        if (del) payload -= del.weight;
      }

      prev = pt;
    }
  }

  const successfulDeliveries = deliveredIds.size;
  const rawScore =
    successfulDeliveries * 100 - totalEnergy * 0.1 - makespan * 0.05;

  return {
    successful_deliveries: successfulDeliveries,
    total_deliveries: input.deliveries.length,
    total_distance: Math.round(totalDistance * 100) / 100,
    total_energy: Math.round(totalEnergy * 100) / 100,
    makespan: Math.round(makespan * 100) / 100,
    score: Math.round(rawScore * 100) / 100,
  };
}

router.post('/solve', (req, res) => {
  try {
    const input = req.body;

    if (!input || !input.map_size || !input.drones || !input.deliveries) {
      return res.status(400).json({
        error: 'Invalid input. map_size, drones, and deliveries are required.',
      });
    }

    const mapSize = input.map_size;
    const warehouse = [mapSize[0] / 2, mapSize[1] / 2];
    const drones = input.drones;
    const deliveries = input.deliveries;
    const noFlyZones = input.no_fly_zones || [];
    const chargingStations = input.charging_stations || [];

    const flightManifest = solve(
      warehouse,
      drones,
      deliveries,
      noFlyZones,
      chargingStations
    );

    const summary = computeSummary(input, flightManifest);

    res.json({
      flight_manifest: flightManifest,
      summary,
    });
  } catch (err) {
    console.error('Solver error:', err);
    res.status(500).json({ error: err.message || 'Internal solver error' });
  }
});

module.exports = router;
