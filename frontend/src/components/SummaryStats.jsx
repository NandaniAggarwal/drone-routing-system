import React from 'react';

function Stat({ label, value, accent, suffix }) {
  return (
    <div className="flex-1 min-w-[110px] bg-scope-bg/50 border border-scope-border/70 rounded-md px-3 py-2.5">
      <div className="text-[10px] font-mono uppercase tracking-wide text-muted">{label}</div>
      <div className="text-xl font-mono font-semibold tnum mt-0.5" style={{ color: accent }}>
        {value}
        {suffix && <span className="text-xs text-muted ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

export default function SummaryStats({ summary }) {
  if (!summary) {
    return (
      <div className="text-sm text-muted italic font-mono px-1">
        Run a simulation to see fleet performance metrics.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Stat
        label="Deliveries"
        value={`${summary.successful_deliveries}/${summary.total_deliveries}`}
        accent="#34D399"
      />
      <Stat label="Total Distance" value={summary.total_distance} suffix="units" accent="#5EEAD4" />
      <Stat label="Total Energy" value={summary.total_energy} suffix="EU" accent="#FBBF24" />
      <Stat label="Makespan" value={summary.makespan} suffix="t" accent="#A78BFA" />
      <Stat label="Score" value={summary.score} accent="#FB7185" />
    </div>
  );
}
