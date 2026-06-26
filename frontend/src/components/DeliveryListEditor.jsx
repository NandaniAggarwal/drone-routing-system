import React from 'react';
import Panel from './Panel';
import { Field, IconButton } from './Field';
import { uid } from '../utils/sampleData';

export default function DeliveryListEditor({ deliveries, setDeliveries }) {
  const update = (idx, key, value) => {
    const next = [...deliveries];
    next[idx] = { ...next[idx], [key]: value };
    setDeliveries(next);
  };

  const remove = (idx) => setDeliveries(deliveries.filter((_, i) => i !== idx));

  const add = () =>
    setDeliveries([
      ...deliveries,
      { id: uid('d'), x: 10, y: 10, weight: 0.2, deadline: 300 },
    ]);

  return (
    <Panel
      title="Deliveries"
      eyebrow="Delivery Manifest"
      accent="#FB7185"
      action={
        <IconButton variant="add" onClick={add}>
          + Delivery
        </IconButton>
      }
    >
      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
        {deliveries.length === 0 && (
          <p className="text-xs text-muted italic">No deliveries configured.</p>
        )}
        {deliveries.map((d, idx) => (
          <div key={idx} className="flex flex-col gap-2 p-2.5 rounded-md bg-scope-bg/40 border border-scope-border/60">
            <div className="grid grid-cols-3 gap-2">
              <Field label="ID" value={d.id} onChange={(e) => update(idx, 'id', e.target.value)} />
              <Field
                label="X"
                type="number"
                value={d.x}
                onChange={(e) => update(idx, 'x', parseFloat(e.target.value) || 0)}
              />
              <Field
                label="Y"
                type="number"
                value={d.y}
                onChange={(e) => update(idx, 'y', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 items-end">
              <Field
                label="Weight"
                type="number"
                step="0.1"
                min="0"
                value={d.weight}
                onChange={(e) => update(idx, 'weight', parseFloat(e.target.value) || 0)}
              />
              <Field
                label="Deadline"
                type="number"
                value={d.deadline}
                onChange={(e) => update(idx, 'deadline', parseFloat(e.target.value) || 0)}
              />
              <IconButton variant="danger" onClick={() => remove(idx)} aria-label="Remove delivery">
                ✕ Remove
              </IconButton>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
