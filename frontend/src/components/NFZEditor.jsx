import React from 'react';
import Panel from './Panel';
import { Field, SelectField, IconButton } from './Field';

function defaultZone(shape) {
  if (shape === 'circle') {
    return { shape: 'circle', center: [50, 50], radius: 10, T_start: 0, T_end: 100 };
  }
  return { shape: 'rectangle', corners: [[40, 40], [60, 60]], T_start: 0, T_end: 100 };
}

export default function NFZEditor({ zones, setZones }) {
  const update = (idx, patch) => {
    const next = [...zones];
    next[idx] = { ...next[idx], ...patch };
    setZones(next);
  };

  const changeShape = (idx, shape) => {
    const next = [...zones];
    next[idx] = defaultZone(shape);
    setZones(next);
  };

  const remove = (idx) => setZones(zones.filter((_, i) => i !== idx));

  const add = () => setZones([...zones, defaultZone('circle')]);

  return (
    <Panel
      title="No-Fly Zones"
      eyebrow="Airspace Restrictions"
      accent="#A78BFA"
      action={
        <IconButton variant="add" onClick={add}>
          + Zone
        </IconButton>
      }
    >
      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
        {zones.length === 0 && <p className="text-xs text-muted italic">No restricted airspace configured.</p>}
        {zones.map((z, idx) => (
          <div key={idx} className="flex flex-col gap-2 p-2.5 rounded-md bg-scope-bg/40 border border-scope-border/60">
            <div className="grid grid-cols-[1.3fr_1fr_1fr_auto] items-end gap-2">
              <SelectField label="Shape" value={z.shape} onChange={(e) => changeShape(idx, e.target.value)}>
                <option value="circle">Circle</option>
                <option value="rectangle">Rectangle</option>
              </SelectField>
              <Field
                label="T Start"
                type="number"
                value={z.T_start}
                onChange={(e) => update(idx, { T_start: parseFloat(e.target.value) || 0 })}
              />
              <Field
                label="T End"
                type="number"
                value={z.T_end}
                onChange={(e) => update(idx, { T_end: parseFloat(e.target.value) || 0 })}
              />
              <IconButton variant="danger" onClick={() => remove(idx)} aria-label="Remove zone">
                ✕
              </IconButton>
            </div>

            {z.shape === 'circle' ? (
              <div className="grid grid-cols-3 gap-2">
                <Field
                  label="Center X"
                  type="number"
                  value={z.center[0]}
                  onChange={(e) => update(idx, { center: [parseFloat(e.target.value) || 0, z.center[1]] })}
                />
                <Field
                  label="Center Y"
                  type="number"
                  value={z.center[1]}
                  onChange={(e) => update(idx, { center: [z.center[0], parseFloat(e.target.value) || 0] })}
                />
                <Field
                  label="Radius"
                  type="number"
                  value={z.radius}
                  onChange={(e) => update(idx, { radius: parseFloat(e.target.value) || 0 })}
                />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                <Field
                  label="X1"
                  type="number"
                  value={z.corners[0][0]}
                  onChange={(e) =>
                    update(idx, { corners: [[parseFloat(e.target.value) || 0, z.corners[0][1]], z.corners[1]] })
                  }
                />
                <Field
                  label="Y1"
                  type="number"
                  value={z.corners[0][1]}
                  onChange={(e) =>
                    update(idx, { corners: [[z.corners[0][0], parseFloat(e.target.value) || 0], z.corners[1]] })
                  }
                />
                <Field
                  label="X2"
                  type="number"
                  value={z.corners[1][0]}
                  onChange={(e) =>
                    update(idx, { corners: [z.corners[0], [parseFloat(e.target.value) || 0, z.corners[1][1]]] })
                  }
                />
                <Field
                  label="Y2"
                  type="number"
                  value={z.corners[1][1]}
                  onChange={(e) =>
                    update(idx, { corners: [z.corners[0], [z.corners[1][0], parseFloat(e.target.value) || 0]] })
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
