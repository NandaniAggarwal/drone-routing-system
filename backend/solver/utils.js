// Direct port of Python helper functions (dist, EPS, constants)

const MAX_BATTERY = 500.0;
const CHARGE_RATE = 2.0;
const EPS = 1e-9;

function dist(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = {
  MAX_BATTERY,
  CHARGE_RATE,
  EPS,
  dist,
  round2,
};
