# Algorithm Port Notes

The task required converting the supplied Python solver into Node.js
**without changing the core algorithm logic**. This document records what
was ported and how it was verified.

## What was ported, file by file

| Python (single script) | JavaScript                  | Contents |
|---|---|---|
| `utils` (dist, constants) | `backend/solver/utils.js` | `dist()`, `MAX_BATTERY`, `CHARGE_RATE`, `EPS` |
| `DroneState` | `backend/solver/drone.js` | drone runtime state |
| `Delivery` | `backend/solver/delivery.js` | delivery request state |
| `ChargingStation`, `CircleNFZ`, `RectNFZ`, `segment_safe`, `planPath`, `planPathRec` | `backend/solver/noFlyZone.js` | NFZ geometry, segment/time intersection, detour + wait path planning |
| `Solver`, `solve()` | `backend/solver/solver.js` | batching, energy feasibility, trip execution, manifest assembly |

Every function/method keeps the **same name, same control flow, and same
order of operations** as the Python original. Where Python and JS have
different idioms (e.g. `sorted(key=lambda d: (d.deadline, -d.weight))`),
the JS comparator was written to produce an identical ordering rather than
an approximation — both `Array.prototype.sort` (V8) and Python's `sorted`
are stable sorts, so tie-breaking behavior matches.

The two "MINOR FIX ONLY" comments already present in the original Python
(NFZ clearance buffer, validating both detour segments) were preserved
exactly as-is — not altered, not removed, not "improved."

## Verification method

Rather than just inspecting the diff visually, the port was checked by
**running the actual unmodified Python script and the new JS module on the
same inputs and diffing the output JSON**:

```bash
python3 original.py   < sample1_input.json   # unmodified Python reference
node test_sample1.js                          # JS port, same input
```

For Sample Input 1 (the NFZ + charging scenario from the spec), both
produced byte-identical flight manifests — including the same trip split
into two PICKUPs, the same waiting/charging behavior, and the same
timestamps to two decimal places.

Note: this output does **not** match the prose walkthrough given in the
problem statement's "Explanation 1" section (which describes a single
3-delivery trip with mid-trip charging). That mismatch exists in the
**original Python code's actual behavior**, not in the JS port — the
provided `buildBatch`/`energyFeasible` methods evaluate the full round-trip
energy cost for every candidate delivery before adding it to a batch, which
causes d3 to be excluded from the first batch and picked up in a second
trip instead. Since the instructions were explicit about not changing the
algorithm, this behavior was carried over faithfully rather than "corrected"
to match the prose example.

Additional spot checks run during development:
- Sample Input 0 (no NFZs/stations) — matches expected distances and
  makespan from the spec's worked example.
- A permanently-active circular NFZ between warehouse and a delivery point
  — confirms the detour-via-waypoint logic engages (rather than waiting
  forever) and produces two `WAYPOINT` legs that route around the circle.
- Multi-drone fleet with a rectangular NFZ — confirms both drones are
  assigned independently and the manifest correctly separates `drone_1`
  and `drone_2` paths.
- Malformed/missing-field input — returns HTTP 400 with a descriptive
  error rather than throwing an unhandled exception.
