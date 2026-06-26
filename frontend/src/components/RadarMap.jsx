import React, { useMemo } from 'react';
import { makeProjector, interpolateDroneState, DRONE_PALETTE } from '../utils/geometry';

const VIEW_W = 900;
const VIEW_H = 700;

function GridLines({ project, mapWidth, mapHeight, step }) {
  const lines = [];
  for (let x = 0; x <= mapWidth; x += step) {
    const a = project(x, 0);
    const b = project(x, mapHeight);
    lines.push(
      <line key={`v${x}`} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy} stroke="#1B2836" strokeWidth="1" />
    );
  }
  for (let y = 0; y <= mapHeight; y += step) {
    const a = project(0, y);
    const b = project(mapWidth, y);
    lines.push(
      <line key={`h${y}`} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy} stroke="#1B2836" strokeWidth="1" />
    );
  }
  return <g>{lines}</g>;
}

function Warehouse({ project, x, y }) {
  const { sx, sy } = project(x, y);
  return (
    <g>
      <circle cx={sx} cy={sy} r="22" fill="none" stroke="#5EEAD4" strokeWidth="1" opacity="0.25" />
      <circle cx={sx} cy={sy} r="14" fill="#0F1620" stroke="#5EEAD4" strokeWidth="1.5" />
      <path
        d={`M ${sx - 7} ${sy + 4} L ${sx - 7} ${sy - 2} L ${sx} ${sy - 8} L ${sx + 7} ${sy - 2} L ${sx + 7} ${sy + 4} Z`}
        fill="#5EEAD4"
        opacity="0.85"
      />
      <text x={sx} y={sy + 32} textAnchor="middle" fill="#5EEAD4" fontSize="11" fontFamily="IBM Plex Mono" fontWeight="600">
        WAREHOUSE
      </text>
    </g>
  );
}

function ChargingStationMarker({ project, station }) {
  const { sx, sy } = project(station.x, station.y);
  return (
    <g>
      <rect x={sx - 11} y={sy - 11} width="22" height="22" rx="4" fill="#1A1610" stroke="#FBBF24" strokeWidth="1.5" />
      <path
        d={`M ${sx + 2} ${sy - 6} L ${sx - 4} ${sy + 1} L ${sx - 0.5} ${sy + 1} L ${sx - 2} ${sy + 6} L ${sx + 4} ${sy - 1} L ${sx + 0.5} ${sy - 1} Z`}
        fill="#FBBF24"
      />
      <text x={sx} y={sy + 22} textAnchor="middle" fill="#FBBF24" fontSize="9.5" fontFamily="IBM Plex Mono">
        {station.slots}× SLOT
      </text>
    </g>
  );
}

function DeliveryMarker({ project, delivery, delivered }) {
  const { sx, sy } = project(delivery.x, delivery.y);
  const color = delivered ? '#34D399' : '#FB7185';
  return (
    <g opacity={delivered ? 0.55 : 1}>
      <circle cx={sx} cy={sy} r="9" fill="#0F1620" stroke={color} strokeWidth="1.5" />
      <circle cx={sx} cy={sy} r="3" fill={color} />
      <text x={sx} y={sy - 14} textAnchor="middle" fill={color} fontSize="10.5" fontFamily="IBM Plex Mono" fontWeight="600">
        {delivery.id}
      </text>
    </g>
  );
}

function NFZShape({ project, zone, currentT, scale }) {
  const active = currentT >= zone.T_start && currentT <= zone.T_end;
  const color = active ? '#FB7185' : '#3A4A5A';
  const fillOpacity = active ? 0.12 : 0.04;

  if (zone.shape === 'circle') {
    const { sx, sy } = project(zone.center[0], zone.center[1]);
    const r = zone.radius * scale;
    return (
      <g>
        <circle cx={sx} cy={sy} r={r} fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5" strokeDasharray={active ? '0' : '5 4'} />
        <text x={sx} y={sy + r + 14} textAnchor="middle" fill={color} fontSize="9.5" fontFamily="IBM Plex Mono">
          T {zone.T_start}–{zone.T_end}
        </text>
      </g>
    );
  }

  const [c1, c2] = zone.corners;
  const x1 = Math.min(c1[0], c2[0]);
  const y1 = Math.min(c1[1], c2[1]);
  const x2 = Math.max(c1[0], c2[0]);
  const y2 = Math.max(c1[1], c2[1]);
  const topLeft = project(x1, y2);
  const w = (x2 - x1) * scale;
  const h = (y2 - y1) * scale;

  return (
    <g>
      <rect x={topLeft.sx} y={topLeft.sy} width={w} height={h} fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5" strokeDasharray={active ? '0' : '5 4'} />
      <text x={topLeft.sx + w / 2} y={topLeft.sy + h + 14} textAnchor="middle" fill={color} fontSize="9.5" fontFamily="IBM Plex Mono">
        T {zone.T_start}–{zone.T_end}
      </text>
    </g>
  );
}

function DronePathTrace({ project, path, color }) {
  if (!path || path.length < 2) return null;
  const pts = path.map((p) => project(p.x, p.y));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.sx} ${p.sy}`).join(' ');
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeOpacity="0.45"
      strokeDasharray="4 5"
      style={{ animation: 'dash-flow 2.5s linear infinite' }}
    />
  );
}

function DroneIcon({ project, x, y, heading, color, label, action }) {
  const { sx, sy } = project(x, y);
  return (
    <g transform={`translate(${sx}, ${sy})`}>
      <circle r="16" fill={color} opacity="0.12" />
      <g transform={`rotate(${heading})`}>
        <path d="M 10 0 L -6 6 L -2 0 L -6 -6 Z" fill={color} stroke="#0A0E14" strokeWidth="0.5" />
      </g>
      <text x="0" y="-20" textAnchor="middle" fill={color} fontSize="10.5" fontFamily="IBM Plex Mono" fontWeight="700">
        {label}
      </text>
      {action && (
        <text x="0" y="22" textAnchor="middle" fill={color} fontSize="8.5" fontFamily="IBM Plex Mono" opacity="0.85">
          {action}
        </text>
      )}
    </g>
  );
}

export default function RadarMap({ mapSize, deliveries, chargingStations, noFlyZones, flightManifest, currentT, deliveredIds, sweepAngle }) {
  const [mapWidth, mapHeight] = mapSize;

  const { project, scale } = useMemo(
    () => makeProjector(mapWidth, mapHeight, VIEW_W, VIEW_H, 50),
    [mapWidth, mapHeight]
  );

  const step = useMemo(() => {
    const target = mapWidth / 10;
    return Math.max(5, Math.round(target / 5) * 5);
  }, [mapWidth]);

  const warehouse = [mapWidth / 2, mapHeight / 2];
  const wh = project(warehouse[0], warehouse[1]);

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-full" style={{ background: 'radial-gradient(circle at 50% 50%, #0D1420 0%, #080B10 100%)' }}>
      <defs>
        <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0" />
        </radialGradient>
      </defs>

      <GridLines project={project} mapWidth={mapWidth} mapHeight={mapHeight} step={step} />

      {/* Outer scope boundary */}
      <rect x={project(0, mapHeight).sx} y={project(0, mapHeight).sy} width={mapWidth * scale} height={mapHeight * scale} fill="none" stroke="#22303F" strokeWidth="1.5" />

      {/* Range rings centered on warehouse, radar-scope signature element */}
      {[1, 2, 3].map((i) => (
        <circle key={i} cx={wh.sx} cy={wh.sy} r={(Math.min(mapWidth, mapHeight) / 2) * (i / 3) * scale} fill="none" stroke="#16202C" strokeWidth="1" />
      ))}

      {/* Rotating sweep, purely atmospheric */}
      <g style={{ transformOrigin: `${wh.sx}px ${wh.sy}px` }}>
        <path
          d={`M ${wh.sx} ${wh.sy} L ${wh.sx + 400} ${wh.sy} A 400 400 0 0 1 ${wh.sx + 400 * Math.cos(0.5)} ${wh.sy + 400 * Math.sin(0.5)} Z`}
          fill="url(#sweepGrad)"
          transform={`rotate(${sweepAngle} ${wh.sx} ${wh.sy})`}
          opacity="0.5"
        />
      </g>

      {noFlyZones.map((zone, i) => (
        <NFZShape key={i} project={project} zone={zone} currentT={currentT} scale={scale} />
      ))}

      {chargingStations.map((s, i) => (
        <ChargingStationMarker key={i} project={project} station={s} />
      ))}

      {deliveries.map((d) => (
        <DeliveryMarker key={d.id} project={project} delivery={d} delivered={deliveredIds.has(d.id)} />
      ))}

      <Warehouse project={project} x={warehouse[0]} y={warehouse[1]} />

      {flightManifest.map((drone, i) => {
        const color = DRONE_PALETTE[i % DRONE_PALETTE.length];
        return <DronePathTrace key={drone.drone_id} project={project} path={drone.path} color={color} />;
      })}

      {flightManifest.map((drone, i) => {
        const color = DRONE_PALETTE[i % DRONE_PALETTE.length];
        const state = interpolateDroneState(drone.path, currentT);
        if (!state) return null;
        return (
          <DroneIcon
            key={drone.drone_id}
            project={project}
            x={state.x}
            y={state.y}
            heading={state.heading}
            color={color}
            label={drone.drone_id}
            action={state.action}
          />
        );
      })}
    </svg>
  );
}
