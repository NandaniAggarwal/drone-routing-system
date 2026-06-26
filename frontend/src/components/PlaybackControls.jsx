import React from 'react';

export default function PlaybackControls({ currentT, makespan, playing, onTogglePlay, onScrub, onSpeedChange, speed }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-scope-panel2 border-t border-scope-border">
      <button
        onClick={onTogglePlay}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-signal-cyan/10 border border-signal-cyan/40 text-signal-cyan hover:bg-signal-cyan/20 transition-colors shrink-0"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="4" height="12" /><rect x="8" y="1" width="4" height="12" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M2 1 L13 7 L2 13 Z" /></svg>
        )}
      </button>

      <span className="font-mono text-xs text-signal-cyan tnum shrink-0 w-16">
        T={currentT.toFixed(1)}
      </span>

      <input
        type="range"
        min={0}
        max={Math.max(makespan, 1)}
        step={0.1}
        value={Math.min(currentT, Math.max(makespan, 1))}
        onChange={(e) => onScrub(parseFloat(e.target.value))}
        className="flex-1 h-1.5 rounded-full bg-scope-grid accent-signal-cyan cursor-pointer"
        style={{ accentColor: '#5EEAD4' }}
      />

      <span className="font-mono text-xs text-muted tnum shrink-0">
        / {makespan.toFixed(1)}
      </span>

      <select
        value={speed}
        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        className="bg-scope-panel border border-scope-border rounded-md px-2 py-1 text-xs font-mono text-muted shrink-0"
      >
        <option value={1}>1×</option>
        <option value={2}>2×</option>
        <option value={5}>5×</option>
        <option value={10}>10×</option>
        <option value={25}>25×</option>
      </select>
    </div>
  );
}
