---
title: "Open Location Hub 0.1.0 is out"
description: "Open Location Hub 0.1.0 is the first public release with full omlox API coverage for the current scope, plus MQTT, WebSocket, RPC, Docker images, and benchmark data."
date: 2026-04-14T08:06:00Z
draft: false
---

[Open Location Hub 0.1.0](https://github.com/Open-Location-Stack/open-location-hub/releases/tag/0.1.0) is now published.

This is the first public release of Open Location Hub. Our goal with this release is to offer a full implementation of the current API surface and solicit feedback that helps define what the eventual `1.0` release should look like.

## What is in 0.1.0

For the initial `0.1` scope, Open Location Hub now implements the full omlox API surface planned for this release.

That includes:

- the omlox REST APIs
- the WebSocket interface
- MQTT support
- omlox RCP support

This release also includes public documentation, local runtime setups, connector examples, and OTLP-ready telemetry for traces, metrics, and logs.

If you want to inspect the API model, run the hub locally, build a connector, or benchmark the runtime, you can now do that against a tagged public release instead of a moving branch.

This is also the first Docker Hub release for Open Location Hub. Teams can now pull a tagged `0.1.0` image and start testing integrations without building the runtime first.

## Early scale signals

The first benchmark runs show that the hub can already process thousands of location updates per second, and they also show where the current bottlenecks are.

If you want details, we recently published a separate benchmark write-up here on the site:

- [Benchmarking Open Location Hub with OpenSky and replayed traffic](/news/benchmarking-open-location-hub-with-opensky/)

So far, the main bottlenecks appear to be collision detection work in the decision path and JSON marshalling and unmarshalling overhead around the transport edges.

That is a useful place to be for an early release. The hub is already fast enough for serious evaluation, but we want to push it further. The target is not just "works on a demo laptop." We want headroom for wider-area UWB deployments with many objects updating at `20 Hz` or more.

Performance testing, stress testing, and profiling are ongoing engineering work. The benchmark inputs stay in the public repository, and we rerun them as the runtime changes to track scaling limits and regressions.

Some of the likely next steps are already clear:

- algorithmic optimization in the hot path
- memory optimizations to reduce allocations and garbage collection pressure
- Kalman filtering where it improves downstream processing efficiency
- more aggressive coalescing on overloaded internal paths
- more sharding and parallel drain capacity in the decision path

We would especially like feedback here. One advantage of a natively compiled codebase is that we can push hard on throughput and make better use of available hardware as the runtime matures.

## What this release is for

This release is mainly about feedback. We want teams working on omlox interoperability, mixed-vendor RTLS deployments, location integrations, and connector development to try the hub and tell us what is missing or hard to integrate.

If you are evaluating the project, the most useful things you can do are simple:

- run the hub locally
- inspect the APIs and docs
- try one of the demo connectors
- build against the MQTT, WebSocket, REST, or RPC interfaces
- file issues when behavior, documentation, or integration flow is unclear

The easiest way to get started with public tracking data is to use the published demo connectors in the repository:

- the [OpenSky connector](https://github.com/Open-Location-Stack/open-location-hub/blob/main/connectors/opensky/README.md) ingests live public aircraft tracking data over WebSocket
- the [Replay connector](https://github.com/Open-Location-Stack/open-location-hub/blob/main/connectors/replay/README.md) replays captured `location_updates` traffic, including the public OpenSky-based benchmark dataset discussed in the benchmarking article

That gives you two useful entry points: live public traffic and repeatable replay traffic.

## What comes next

The main follow-up areas are:

- robustness, security, and general hardening
- federation and horizontal scalability
- a better developer experience for integrators and connector developers
- working with partners to build and test connectors against the hub

If you are interested in supporting Open Location Hub with your own connector, please reach out.

## Current limitations

This is a pre-`1.0` release. It may still have bugs and rough edges.

The omlox API surface is standards-based and intended to be stable. Other APIs are earlier in their lifecycle, and internal data structures, storage schemas, and non-omlox interfaces may still evolve.

Open Location Hub is also not yet a certified omlox implementation. If you find compliance gaps, missing behavior, or feature gaps, please file an issue in the repository:

- [Open Location Hub issues](https://github.com/Open-Location-Stack/open-location-hub/issues)
