import React, { useState } from 'react';
import { ACTION_COLORS, DRONE_PALETTE } from '../utils/geometry';

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ManifestViewer({ flightManifest }) {
  const [view, setView] = useState('timeline');
  const [copied, setCopied] = useState(false);

  if (!flightManifest || flightManifest.length === 0) {
    return (
      <div className="text-sm text-muted italic font-mono px-1">
        No flight manifest yet — run a simulation first.
      </div>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify({ flight_manifest: flightManifest }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-scope-bg/60 rounded-md p-1 border border-scope-border/60">
          <button
            onClick={() => setView('timeline')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
              view === 'timeline' ? 'bg-signal-cyan/15 text-signal-cyan' : 'text-muted hover:text-gray-200'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setView('json')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
              view === 'json' ? 'bg-signal-cyan/15 text-signal-cyan' : 'text-muted hover:text-gray-200'
            }`}
          >
            Raw JSON
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="text-xs font-mono text-muted hover:text-gray-100 px-2 py-1 transition-colors">
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
          <button
            onClick={() => downloadJSON({ flight_manifest: flightManifest }, 'flight_manifest.json')}
            className="text-xs font-mono text-signal-cyan hover:text-signal-cyan/80 px-2 py-1 transition-colors"
          >
            Download ⤓
          </button>
        </div>
      </div>

      {view === 'json' ? (
        <pre className="bg-scope-bg/60 border border-scope-border/60 rounded-md p-3 text-[11px] font-mono text-gray-300 max-h-72 overflow-auto leading-relaxed">
          {JSON.stringify({ flight_manifest: flightManifest }, null, 2)}
        </pre>
      ) : (
        <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
          {flightManifest.map((drone, di) => (
            <div key={drone.drone_id} className="border border-scope-border/60 rounded-md overflow-hidden">
              <div
                className="px-3 py-1.5 text-xs font-mono font-semibold flex items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.02)', color: DRONE_PALETTE[di % DRONE_PALETTE.length] }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DRONE_PALETTE[di % DRONE_PALETTE.length] }} />
                {drone.drone_id}
              </div>
              <div className="divide-y divide-scope-border/40">
                {drone.path.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-1.5 text-[11px] font-mono">
                    <span className="tnum text-muted w-14">t={p.t}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold w-24 text-center"
                      style={{
                        color: ACTION_COLORS[p.action] || '#7C8B9C',
                        backgroundColor: `${ACTION_COLORS[p.action] || '#7C8B9C'}1A`,
                      }}
                    >
                      {p.action}
                    </span>
                    <span className="text-gray-400 tnum">
                      ({p.x}, {p.y})
                    </span>
                    {p.delivery_id && <span className="text-signal-coral">{p.delivery_id}</span>}
                    {p.delivery_ids && <span className="text-signal-green">{p.delivery_ids.join(', ')}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
