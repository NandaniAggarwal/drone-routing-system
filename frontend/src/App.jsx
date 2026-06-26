import React, { useEffect, useRef, useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import RadarMap from './components/RadarMap';
import PlaybackControls from './components/PlaybackControls';
import MapSizeEditor from './components/MapSizeEditor';
import DroneListEditor from './components/DroneListEditor';
import DeliveryListEditor from './components/DeliveryListEditor';
import ChargingStationEditor from './components/ChargingStationEditor';
import NFZEditor from './components/NFZEditor';
import SummaryStats from './components/SummaryStats';
import ManifestViewer from './components/ManifestViewer';
import { runSimulation } from './utils/api';
import { SAMPLE_0, SAMPLE_1, SAMPLE_2 } from './utils/sampleData';
import { getManifestMakespan } from './utils/geometry';

const SAMPLES = { sample0: SAMPLE_0, sample1: SAMPLE_1, sample2: SAMPLE_2 };

export default function App() {
  const [mapSize, setMapSize] = useState(SAMPLE_1.map_size);
  const [drones, setDrones] = useState(SAMPLE_1.drones);
  const [deliveries, setDeliveries] = useState(SAMPLE_1.deliveries);
  const [chargingStations, setChargingStations] = useState(SAMPLE_1.charging_stations);
  const [noFlyZones, setNoFlyZones] = useState(SAMPLE_1.no_fly_zones);

  const [flightManifest, setFlightManifest] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentT, setCurrentT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [sweepAngle, setSweepAngle] = useState(0);

  const rafRef = useRef(null);
  const lastTsRef = useRef(null);

  const makespan = getManifestMakespan(flightManifest);

  const deliveredIds = new Set();
  if (flightManifest.length) {
    for (const drone of flightManifest) {
      for (const p of drone.path) {
        if (p.action === 'DELIVER' && p.t <= currentT) {
          deliveredIds.add(p.delivery_id);
        }
      }
    }
  }

  // Ambient radar sweep — runs regardless of simulation playback state
  useEffect(() => {
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = now - last;
      last = now;
      setSweepAngle((a) => (a + dt * 0.03) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Playback loop
  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
      return;
    }

    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      setCurrentT((t) => {
        const next = t + dt * speed * 10;
        if (next >= makespan) {
          setPlaying(false);
          return makespan;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, speed, makespan]);

  const handleRun = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        map_size: mapSize,
        drones,
        deliveries,
        charging_stations: chargingStations,
        no_fly_zones: noFlyZones,
      };
      const data = await runSimulation(payload);
      setFlightManifest(data.flight_manifest || []);
      setSummary(data.summary || null);
      setCurrentT(0);
      setPlaying(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }, [mapSize, drones, deliveries, chargingStations, noFlyZones]);

  const handleReset = () => {
    setFlightManifest([]);
    setSummary(null);
    setCurrentT(0);
    setPlaying(false);
    setError(null);
  };

  const handleLoadSample = (key) => {
    const s = SAMPLES[key];
    if (!s) return;
    setMapSize(s.map_size);
    setDrones(s.drones);
    setDeliveries(s.deliveries);
    setChargingStations(s.charging_stations);
    setNoFlyZones(s.no_fly_zones);
    handleReset();
  };

  return (
    <div className="h-screen flex flex-col bg-scope-bg text-gray-100">
      <Navbar onRun={handleRun} onReset={handleReset} onLoadSample={handleLoadSample} loading={loading} />

      {error && (
        <div className="bg-signal-coral/10 border-b border-signal-coral/30 text-signal-coral text-sm px-6 py-2 font-mono">
          ⚠ {error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Map visualization, ~70% width */}
        <div className="flex flex-col flex-[7] min-w-0 border-r border-scope-border">
          <div className="flex-1 min-h-0">
            <RadarMap
              mapSize={mapSize}
              deliveries={deliveries}
              chargingStations={chargingStations}
              noFlyZones={noFlyZones}
              flightManifest={flightManifest}
              currentT={currentT}
              deliveredIds={deliveredIds}
              sweepAngle={sweepAngle}
            />
          </div>
          <PlaybackControls
            currentT={currentT}
            makespan={makespan}
            playing={playing}
            onTogglePlay={() => setPlaying((p) => !p)}
            onScrub={(t) => {
              setCurrentT(t);
              setPlaying(false);
            }}
            onSpeedChange={setSpeed}
            speed={speed}
          />
        </div>

        {/* RIGHT: Input + Output panels, ~30% width */}
        <div className="flex-[3] min-w-[380px] max-w-[480px] flex flex-col overflow-y-auto">
          <div className="flex flex-col gap-4 p-4">
            <MapSizeEditor mapSize={mapSize} setMapSize={setMapSize} />
            <DroneListEditor drones={drones} setDrones={setDrones} />
            <DeliveryListEditor deliveries={deliveries} setDeliveries={setDeliveries} />
            <ChargingStationEditor stations={chargingStations} setStations={setChargingStations} />
            <NFZEditor zones={noFlyZones} setZones={setNoFlyZones} />

            <div className="bg-scope-panel border border-scope-border rounded-lg p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-signal-green mb-2">
                Mission Summary
              </div>
              <SummaryStats summary={summary} />
            </div>

            <div className="bg-scope-panel border border-scope-border rounded-lg p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-signal-cyan mb-2">
                Flight Manifest
              </div>
              <ManifestViewer flightManifest={flightManifest} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
