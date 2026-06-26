const { dist, EPS } = require('./utils');

// Direct port of Python ChargingStation class
class ChargingStation {
  constructor(x, y, slots) {
    this.x = x;
    this.y = y;
    this.slots = slots;
    this.slotOcc = [];
    for (let i = 0; i < slots; i++) this.slotOcc.push([]);
  }

  // Direct port of Python scheduleCharge
  // NOTE: preserves the original Python behavior exactly, including its
  // early-return-on-first-slot quirk inside the for/return loop pattern.
  scheduleCharge(arrive, energy) {
    const dur = energy / 2.0; // CHARGE_RATE = 2.0

    for (const slot of this.slotOcc) {
      let start = arrive;

      let changed = true;
      while (changed) {
        changed = false;

        for (const iv of slot) {
          if (start < iv[1] && start + dur > iv[0]) {
            start = iv[1];
            changed = true;
          }
        }
      }

      const end = start + dur;
      slot.push([start, end]);

      return [start, end];
    }

    // Only reached if there are zero slots (slots === 0)
    let earliest = Infinity;
    let bestSlot = 0;

    for (let i = 0; i < this.slotOcc.length; i++) {
      let last = 0;
      if (this.slotOcc[i].length > 0) {
        last = Math.max(...this.slotOcc[i].map((iv) => iv[1]));
      }
      if (last < earliest) {
        earliest = last;
        bestSlot = i;
      }
    }

    const start = Math.max(arrive, earliest);
    const end = start + dur;

    this.slotOcc[bestSlot].push([start, end]);

    return [start, end];
  }
}

// Direct port of Python CircleNFZ class
class CircleNFZ {
  constructor(cx, cy, r, ts, te) {
    this.cx = cx;
    this.cy = cy;
    this.r = r;
    this.ts = ts;
    this.te = te;
  }

  tStart() {
    return this.ts;
  }

  tEnd() {
    return this.te;
  }

  segIntersect(ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;

    const fx = ax - this.cx;
    const fy = ay - this.cy;

    const a = dx * dx + dy * dy;

    if (a < 1e-12) {
      if (fx * fx + fy * fy <= this.r * this.r) {
        return [0, 0];
      }
      return null;
    }

    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - this.r * this.r;

    const disc = b * b - 4 * a * c;

    if (disc < 0) {
      return null;
    }

    const sq = Math.sqrt(disc);

    const s1 = (-b - sq) / (2 * a);
    const s2 = (-b + sq) / (2 * a);

    if (s2 < 0 || s1 > 1) {
      return null;
    }

    return [Math.max(0, s1), Math.min(1, s2)];
  }

  detour(fx, fy, tx, ty) {
    const ang = Math.atan2(ty - fy, tx - fx);

    // MINOR FIX ONLY:
    // increased clearance slightly to avoid edge-touch NFZ violations
    const cl = this.r + 6.0;

    const w1 = [
      this.cx + cl * Math.cos(ang + Math.PI / 2),
      this.cy + cl * Math.sin(ang + Math.PI / 2),
    ];

    const w2 = [
      this.cx + cl * Math.cos(ang - Math.PI / 2),
      this.cy + cl * Math.sin(ang - Math.PI / 2),
    ];

    const d1 = dist(fx, fy, w1[0], w1[1]) + dist(w1[0], w1[1], tx, ty);
    const d2 = dist(fx, fy, w2[0], w2[1]) + dist(w2[0], w2[1], tx, ty);

    if (d1 <= d2) {
      return [w1];
    }

    return [w2];
  }
}

// Direct port of Python RectNFZ class
class RectNFZ {
  constructor(rx1, ry1, rx2, ry2, ts, te) {
    this.x1 = Math.min(rx1, rx2);
    this.y1 = Math.min(ry1, ry2);
    this.x2 = Math.max(rx1, rx2);
    this.y2 = Math.max(ry1, ry2);

    this.ts = ts;
    this.te = te;
  }

  tStart() {
    return this.ts;
  }

  tEnd() {
    return this.te;
  }

  segIntersect(ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;

    let tMin = 0.0;
    let tMax = 1.0;

    if (Math.abs(dx) < 1e-12) {
      if (ax < this.x1 || ax > this.x2) {
        return null;
      }
    } else {
      let a = (this.x1 - ax) / dx;
      let b = (this.x2 - ax) / dx;

      if (a > b) {
        const tmp = a;
        a = b;
        b = tmp;
      }

      tMin = Math.max(tMin, a);
      tMax = Math.min(tMax, b);

      if (tMin > tMax) {
        return null;
      }
    }

    if (Math.abs(dy) < 1e-12) {
      if (ay < this.y1 || ay > this.y2) {
        return null;
      }
    } else {
      let a = (this.y1 - ay) / dy;
      let b = (this.y2 - ay) / dy;

      if (a > b) {
        const tmp = a;
        a = b;
        b = tmp;
      }

      tMin = Math.max(tMin, a);
      tMax = Math.min(tMax, b);

      if (tMin > tMax) {
        return null;
      }
    }

    return [tMin, tMax];
  }

  detour(fx, fy, tx, ty) {
    // MINOR FIX ONLY:
    // increased rectangle buffer
    const buf = 5.0;

    const corners = [
      [this.x1 - buf, this.y1 - buf],
      [this.x2 + buf, this.y1 - buf],
      [this.x1 - buf, this.y2 + buf],
      [this.x2 + buf, this.y2 + buf],
    ];

    let best = Infinity;
    let bc = corners[0];

    for (const c of corners) {
      const d = dist(fx, fy, c[0], c[1]) + dist(c[0], c[1], tx, ty);

      if (d < best) {
        best = d;
        bc = c;
      }
    }

    return [bc];
  }
}

// Direct port of Python segment_safe
function segmentSafe(ax, ay, bx, by, t0, zones) {
  const segLen = dist(ax, ay, bx, by);

  if (segLen < EPS) {
    return true;
  }

  for (const z of zones) {
    const p = z.segIntersect(ax, ay, bx, by);

    if (p === null) {
      continue;
    }

    const ea = t0 + p[0] * segLen;
    const xa = t0 + p[1] * segLen;

    if (xa > z.tStart() && ea < z.tEnd()) {
      return false;
    }
  }

  return true;
}

// Direct port of Python planPath
function planPath(ax, ay, t0, bx, by, zones) {
  const res = [];

  planPathRec(ax, ay, t0, bx, by, zones, res, 14);

  return res;
}

// Direct port of Python planPathRec
function planPathRec(ax, ay, t0, bx, by, zones, res, depth) {
  const segLen = dist(ax, ay, bx, by);

  let blocker = null;
  let blkEntry = Infinity;

  for (const z of zones) {
    const p = z.segIntersect(ax, ay, bx, by);

    if (p === null) {
      continue;
    }

    const ea = t0 + p[0] * segLen;
    const xa = t0 + p[1] * segLen;

    if (xa <= z.tStart() || ea >= z.tEnd()) {
      continue;
    }

    if (ea < blkEntry) {
      blkEntry = ea;
      blocker = z;
    }
  }

  if (blocker === null || depth <= 0) {
    res.push([bx, by, t0 + segLen, 0]);
    return;
  }

  const waitUntil = blocker.tEnd() + 0.01;
  const waitCost = waitUntil - t0;

  let detourOk = false;
  let detourCost = Infinity;
  let bestWP = null;

  const dWPs = blocker.detour(ax, ay, bx, by);

  if (dWPs && dWPs.length > 0) {
    const wp = dWPs[0];

    const l1 = dist(ax, ay, wp[0], wp[1]);
    const l2 = dist(wp[0], wp[1], bx, by);

    const wpTime = t0 + l1;

    // MINOR FIX ONLY:
    // validate BOTH segments fully
    const firstSafe = segmentSafe(ax, ay, wp[0], wp[1], t0, zones);
    const secondSafe = segmentSafe(wp[0], wp[1], bx, by, wpTime, zones);

    if (firstSafe && secondSafe) {
      detourCost = l1 + l2 - segLen;
      detourOk = true;
      bestWP = wp;
    }
  }

  if (detourOk && detourCost < waitCost) {
    const wpT = t0 + dist(ax, ay, bestWP[0], bestWP[1]);

    res.push([bestWP[0], bestWP[1], wpT, 0]);

    planPathRec(bestWP[0], bestWP[1], wpT, bx, by, zones, res, depth - 1);
  } else {
    res.push([ax, ay, waitUntil, 1]);

    planPathRec(ax, ay, waitUntil, bx, by, zones, res, depth - 1);
  }
}

module.exports = {
  ChargingStation,
  CircleNFZ,
  RectNFZ,
  segmentSafe,
  planPath,
  planPathRec,
};
