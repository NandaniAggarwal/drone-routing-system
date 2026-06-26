import React from 'react';
import Panel from './Panel';
import { Field, IconButton } from './Field';
import { uid } from '../utils/sampleData';
import { DRONE_PALETTE } from '../utils/geometry';

export default function DroneListEditor({ drones, setDrones }) {
  const update = (idx, key, value) => {
    const next = [...drones];
    next[idx] = { ...next[idx], [key]: value };
    setDrones(next);
  };

  const remove = (idx) => setDrones(drones.filter((_, i) => i !== idx));

  const add = () =>
    setDrones([...drones, { id: uid('drone'), max_payload: 1.0 }]);

  return (
    <Panel
      title="Drone Fleet"
      eyebrow="Fleet Roster"
      accent="#5EEAD4"
      action={
        <IconButton variant="add" onClick={add}>
          + Drone
        </IconButton>
      }
    >
      <div className="flex flex-col gap-3">
        {drones.length === 0 && (
          <p className="text-xs text-muted italic">No drones configured. Add at least one.</p>
        )}
        {drones.map((d, idx) => (
          <div key={idx} className="flex items-end gap-2 p-2 rounded-md bg-scope-bg/40 border border-scope-border/60">
            <span
              className="w-2 h-2 rounded-full mt-3 shrink-0"
              style={{ backgroundColor: DRONE_PALETTE[idx % DRONE_PALETTE.length] }}
            />
            <Field
              label="Drone ID"
              value={d.id}
              onChange={(e) => update(idx, 'id', e.target.value)}
            />
            <Field
              label="Max Payload"
              type="number"
              step="0.1"
              min="0"
              value={d.max_payload}
              onChange={(e) => update(idx, 'max_payload', parseFloat(e.target.value) || 0)}
            />
            <IconButton variant="danger" onClick={() => remove(idx)} aria-label="Remove drone">
              ✕
            </IconButton>
          </div>
        ))}
      </div>
    </Panel>
  );
}
