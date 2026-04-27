---
title: "Kalman-normalized locations and a UWB simulator for Open Location Hub"
description: "Open Location Hub now supports optional Kalman Filtering to derive speed and direction, emit locations at configurable rate. Also adds a Pacman UWB simulator to play with this."
date: 2026-04-30T08:00:00Z
draft: false
---

The Open Location Hub now supports optional location processing with a configurable Kalman filter.

The Kalman filter addresses a common RTLS problem: location systems often produce more points than downstream consumers can use directly. That is especially true for UWB deployments that publish frequent updates for moving objects indoors. Raw points can jitter, heading can flip around when the object slows down, and high update rates can create unnecessary work for geofence checks, collision detection, and client applications.

To test the implementation, we also added a new UWB simulator that simulates realistic high-rate indoor traffic.

## What Kalman filtering does

Kalman filtering is a standard technique for combining noisy measurements into a smoother estimate of where something probably is. In practice, you can think of it as a way to stop reacting to every small measurement wobble while still following the real movement.

For Open Location Hub, this means:

- Raw `location_updates` can still arrive at a high rate
- The hub keeps a short per-trackable history with a configurable retention
- Older points are discarded based on age and retained-point limits
- The hub derives emits normalized positions from the recent measurements at a configurable frequency
- Horizontal and vertical speed and course are computed as well.

The filtering is optional and configuration-driven. If you do not enable it, the hub keeps the previous behavior. Many RTLS vendors might implement their own filtering already.

Many location systems are fast at producing points but less careful about what those points do to the rest of the system. A few centimeters of jitter can create a lot of downstream noise when you run logic on every update. That shows up as unstable fence entry and exit behavior, poor-looking tracks on a map, noisy motion state, and wasted compute in collision detection.

The hub can ingest the raw traffic, preserve that high-rate signal for the filter itself, and then emits a lower-rate normalized stream for consumers that do not need every single measurement. At the same time, geofence and collision logic can use the normalized positions even when those normalized positions are not emitted to downstream subscribers because of the configured publication cap. This provides an extra level of control over how these events are calculated without delaying these events.

Kalman filtering is useful for several reasons:

- You can keep ingest fidelity high for systems like UWB
- You can reduce the event rate exposed to downstream applications
- You can make derived horizontal and vertical motion data more stable
- You can run decision logic on a cleaner track than the raw source data

## UWB Pacman Simulator

To make this easy to evaluate, we added a new connector demo under `connectors/uwb_sim`.

It simulates ten objects moving through a three-floor Pac-Man-style building in local coordinates. Floors are spaced five meters apart. Objects follow corridor segments, reverse at dead ends, and can switch floors at connector points. Their horizontal motion includes a sinusoidal sway, altitude also varies sinusoidally, and their speeds change smoothly over time.

The simulator publishes raw updates at `25 Hz` and runs against a hub configured to emit Kalman-normalized derived output at `2 Hz`.

The demo also bootstraps useful metadata:

- One local UWB zone per floor
- One local fence per floor
- Floorplan IDs
- Generated floorplan SVG assets
- Floorplan corner coordinates and outline geometry in `Zone.properties`

We also set each simulated trackable to a radius of `0.5 m`, which means the hub should emit collision events when two objects come within one meter of each other.

We ran the simulator for one minute against the local demo stack with:

- Collisions enabled
- Kalman filtering enabled
- Kalman derived publication capped at `2 Hz`
- Ten objects
- Raw ingest at `25 Hz`

The setup produced `1,500` simulator batches over the minute it ran, or about `15,000` raw position updates.

We captured the hub's WebSocket output for `location_updates`, `trackable_motions`, and `collision_events` and inspected the resulting NDJSON logs.

All three floors showed up in the captured data. The local normalized dataset contained floor `1`, floor `2`, and floor `3` updates, and two of the ten simulated objects traversed all three floors during the one-minute run.

The Kalman-normalized motion output was close to the intended `2 Hz` rate. Across all ten objects, the aggregate normalized output rate was about `19.4 Hz`, which works out to about `1.94 Hz` per trackable.

The derived motion fields looked sensible:

- Median emitted speed was about `1.07 m/s`
- The `95th` percentile was about `1.62 m/s`
- The maximum emitted speed stayed below `1.8 m/s`
- Emitted course values covered the full `0-360` degree range where expected

The normalized output also included vertical speed in `properties.kalman_vertical_speed`, which is useful for floor transitions, lifts, ramps, and any other indoor movement where `z` matters.

We also compared emitted `course` against the actual direction implied by successive normalized points. The median error was under one degree, and the `95th` percentile stayed around `4.4` degrees. There was one larger outlier during a very low-speed reversal, where direction becomes numerically unstable.

Finally, the collision side did exactly what this setup was intended to test.

During the run, the raw local stream contained `324` samples where a pair of objects was within one meter of each other. After fixing a local-only collision fallback in the hub, the rerun emitted `31` collision events:

- `17` `collision_start`
- `12` `collision_end`
- `2` `colliding`

That gives us a useful end-to-end check:

- High-rate indoor ingest works
- The hub keeps the raw rate for filtering
- Normalized publication is reduced to a saner consumer-facing rate
- Derived speed and course are stable enough to be useful
- Floor-aware indoor movement is represented correctly
- Collisions still fire when objects come within the configured threshold

The hub can now act as a decision layer between raw location systems and the applications that consume them. It can absorb a noisy, high-frequency indoor stream, normalize it, derive useful motion fields, run geofence and collision logic on the normalized state, and expose a cleaner downstream event stream without hiding the original data rate from the ingest side.

For RTLS vendors and solution builders, that means less custom glue code in every project. Instead of solving this separately inside every connector or downstream application, you can solve it once in the hub.

If you want to try it yourself, start with the local hub stack and the new UWB simulator in the repository. It exercises a large part of the runtime: ingest, local zones, floor-aware movement, Kalman normalization, motion derivation, throttled publication, fences, and collisions.

This is of course a new and largely unvalidated feature at this point. Please give us feedback and help us test the hub. Tell us if this is useful to your use case and suggest improvements.
