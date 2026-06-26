export const SAMPLE_0 = {
  map_size: [100, 100],
  drones: [{ id: 'drone_1', max_payload: 1.0 }],
  deliveries: [
    { id: 'd1', x: 70, y: 60, weight: 0.3, deadline: 200 },
    { id: 'd2', x: 30, y: 80, weight: 0.4, deadline: 200 },
  ],
  charging_stations: [],
  no_fly_zones: [],
};

export const SAMPLE_1 = {
  map_size: [200, 200],
  drones: [{ id: 'drone_1', max_payload: 1.0 }],
  deliveries: [
    { id: 'd1', x: 10, y: 100, weight: 0.3, deadline: 200.0 },
    { id: 'd2', x: 10, y: 10, weight: 0.3, deadline: 350.0 },
    { id: 'd3', x: 100, y: 10, weight: 0.3, deadline: 500.0 },
  ],
  charging_stations: [{ x: 100, y: 10, slots: 1 }],
  no_fly_zones: [
    {
      shape: 'circle',
      center: [100, 55],
      radius: 15,
      T_start: 0.0,
      T_end: 150.0,
    },
  ],
};

export const SAMPLE_2 = {
  map_size: [200, 200],
  drones: [
    { id: 'drone_1', max_payload: 1.0 },
    { id: 'drone_2', max_payload: 0.8 },
  ],
  deliveries: [
    { id: 'd1', x: 20, y: 150, weight: 0.3, deadline: 250 },
    { id: 'd2', x: 170, y: 160, weight: 0.4, deadline: 300 },
    { id: 'd3', x: 150, y: 30, weight: 0.2, deadline: 220 },
    { id: 'd4', x: 40, y: 40, weight: 0.5, deadline: 400 },
  ],
  charging_stations: [{ x: 170, y: 160, slots: 1 }],
  no_fly_zones: [
    {
      shape: 'rectangle',
      corners: [
        [90, 90],
        [130, 130],
      ],
      T_start: 0,
      T_end: 200,
    },
  ],
};

let counter = 1000;
export function uid(prefix) {
  counter += 1;
  return `${prefix}_${counter}`;
}
