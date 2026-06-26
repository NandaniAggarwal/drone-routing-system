import React from 'react';
import Panel from './Panel';
import { Field } from './Field';

export default function MapSizeEditor({ mapSize, setMapSize }) {
  return (
    <Panel title="City Grid" eyebrow="Map Bounds" accent="#5EEAD4">
      <div className="grid grid-cols-2 gap-2">
        <Field
          label="Width"
          type="number"
          min="10"
          value={mapSize[0]}
          onChange={(e) => setMapSize([parseFloat(e.target.value) || 0, mapSize[1]])}
        />
        <Field
          label="Height"
          type="number"
          min="10"
          value={mapSize[1]}
          onChange={(e) => setMapSize([mapSize[0], parseFloat(e.target.value) || 0])}
        />
      </div>
      <p className="text-[11px] text-muted mt-2 font-mono">
        Warehouse auto-locates to ({(mapSize[0] / 2).toFixed(0)}, {(mapSize[1] / 2).toFixed(0)})
      </p>
    </Panel>
  );
}
