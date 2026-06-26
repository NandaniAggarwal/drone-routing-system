// Projects world (x,y) coordinates onto the SVG viewport, preserving aspect ratio
// and adding a margin so markers near the edges aren't clipped.

export function makeProjector(mapWidth, mapHeight, viewW, viewH, margin = 40) {
  const innerW = viewW - margin * 2;
  const innerH = viewH - margin * 2;
  const scale = Math.min(innerW / mapWidth, innerH / mapHeight);

  const offsetX = margin + (innerW - mapWidth * scale) / 2;
  const offsetY = margin + (innerH - mapHeight * scale) / 2;

  return {
    scale,
    project(x, y) {
      return {
        sx: offsetX + x * scale,
        // flip Y so (0,0) is bottom-left like a normal map, matching the
        // "city grid" framing in the spec
        sy: offsetY + (mapHeight - y) * scale,
      };
    },
  };
}

// Given a drone's flight path (array of manifest points with x,y,t,action)
// and a query time, returns the interpolated {x, y, heading, action} at that
// time. Handles WAIT segments (no movement) and gaps between trips.
export function interpolateDroneState(path, queryT) {
  if (!path || path.length === 0) return null;

  if (queryT <= path[0].t) {
    return { x: path[0].x, y: path[0].y, heading: 0, action: path[0].action, idx: 0 };
  }

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];

    if (queryT >= a.t && queryT <= b.t) {
      const span = b.t - a.t;
      const frac = span <= 1e-9 ? 1 : (queryT - a.t) / span;

      const x = a.x + (b.x - a.x) * frac;
      const y = a.y + (b.y - a.y) * frac;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const heading = Math.atan2(dy, dx) * (180 / Math.PI);

      return { x, y, heading, action: b.action, idx: i + 1 };
    }
  }

  const last = path[path.length - 1];
  return { x: last.x, y: last.y, heading: 0, action: last.action, idx: path.length - 1 };
}

export function getManifestMakespan(flightManifest) {
  let max = 0;
  for (const drone of flightManifest || []) {
    for (const pt of drone.path || []) {
      if (pt.t > max) max = pt.t;
    }
  }
  return max;
}

export const ACTION_COLORS = {
  PICKUP: '#34D399',
  DELIVER: '#FB7185',
  CHARGE: '#FBBF24',
  CHARGE_COMPLETE: '#FBBF24',
  WAIT: '#A78BFA',
  WAYPOINT: '#5EEAD4',
  RETURN: '#5EEAD4',
};

export const DRONE_PALETTE = ['#5EEAD4', '#FB7185', '#FBBF24', '#A78BFA', '#60A5FA', '#34D399'];
