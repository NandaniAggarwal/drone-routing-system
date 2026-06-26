import React from 'react';
import Panel from './Panel';
import { Field, IconButton } from './Field';

export default function ChargingStationEditor({ stations, setStations }) {
  const update = (idx, key, value) => {
    const next = [...stations];
    next[idx] = { ...next[idx], [key]: value };
    setStations(next);
  };

  const remove = (idx) => setStations(stations.filter((_, i) => i !== idx));

  const add = () => setStations([...stations, { x: 50, y: 50, slots: 1 }]);

  return (
    <Panel
      title="Charging Stations"
      eyebrow="Power Grid"
      accent="#FBBF24"
      action={
        <IconButton variant="add" onClick={add}>
          + Station
        </IconButton>
      }
    >
      <div className="flex flex-col gap-3">
        {stations.length === 0 && (
          <p className="text-xs text-muted italic">No charging stations configured.</p>
        )}
        {stations.map((s, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-2 items-end p-2.5 rounded-md bg-scope-bg/40 border border-scope-border/60">
            <Field
              label="X"
              type="number"
              value={s.x}
              onChange={(e) => update(idx, 'x', parseFloat(e.target.value) || 0)}
            />
            <Field
              label="Y"
              type="number"
              value={s.y}
              onChange={(e) => update(idx, 'y', parseFloat(e.target.value) || 0)}
            />
            <Field
              label="Slots"
              type="number"
              min="1"
              step="1"
              value={s.slots}
              onChange={(e) => update(idx, 'slots', parseInt(e.target.value) || 1)}
            />
            <IconButton variant="danger" onClick={() => remove(idx)} aria-label="Remove station">
              ✕
            </IconButton>
          </div>
        ))}
      </div>
    </Panel>
  );
}
