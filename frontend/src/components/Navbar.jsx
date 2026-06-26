import React from 'react';

export default function Navbar({ onRun, onReset, onLoadSample, loading }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-scope-border bg-scope-panel">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-signal-cyan/10 border border-signal-cyan/30 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z" stroke="#5EEAD4" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="3" fill="#5EEAD4" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wide text-gray-100 leading-tight">FLEETSCOPE</h1>
          <p className="text-[10px] font-mono text-muted tracking-wide">AUTONOMOUS DRONE ROUTING CONTROL</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 mr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-blink-soft" />
          <span className="text-[10px] font-mono text-muted uppercase tracking-wide">Link Active</span>
        </div>

        <select
          onChange={(e) => {
            if (e.target.value) onLoadSample(e.target.value);
            e.target.value = '';
          }}
          defaultValue=""
          className="bg-scope-bg border border-scope-border rounded-md px-2.5 py-1.5 text-xs font-mono text-muted hover:text-gray-200 transition-colors"
        >
          <option value="" disabled>
            Load Sample Input
          </option>
          <option value="sample0">Sample 0 — Basic Route</option>
          <option value="sample1">Sample 1 — NFZ + Charging</option>
          <option value="sample2">Sample 2 — Multi-Drone</option>
        </select>

        <button
          onClick={onReset}
          className="text-xs font-medium text-muted hover:text-gray-100 px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
        >
          Reset
        </button>

        <button
          onClick={onRun}
          disabled={loading}
          className="text-xs font-semibold text-scope-bg bg-signal-cyan hover:bg-signal-cyan/90 px-4 py-1.5 rounded-md transition-colors shadow-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-3 h-3 border-2 border-scope-bg/30 border-t-scope-bg rounded-full animate-spin" />
              Computing…
            </>
          ) : (
            'Run Simulation'
          )}
        </button>
      </div>
    </header>
  );
}
