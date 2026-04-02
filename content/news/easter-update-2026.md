---
title: "Easter Update: soft launch, public repositories, and rapid hub progress"
description: "An Easter 2026 progress update covering the LogiMAT soft launch, newly public repositories, hub maturity, replay tooling, OTLP observability, and local demo tooling."
date: 2026-04-02T09:00:00+02:00
draft: false
---

Over the last few weeks, Open Location Stack has moved from a private build effort into something partners can now inspect, test, and challenge directly.

At [LogiMAT in Stuttgart](https://www.logimat-messe.de/en), we did a soft launch of the [Open Location Stack website](/). The goal was not a marketing splash. It was to start putting the initiative in front of knowledgeable RTLS partners early, while the architecture is already credible but still open to feedback.

At the same time, we made our first two GitHub repositories public:

- [Open Location Hub](/open-location-hub/) on [GitHub](https://github.com/Open-Location-Stack/open-location-hub), which is the integration backbone of the stack and the first component we expect many partners to evaluate seriously.
- [Floor Plan Editor](/floor-plan-editor/) on [GitHub](https://github.com/Open-Location-Stack/floorplan-editor), which gives the stack an open indoor mapping foundation for creating and maintaining structured venue data.

That order matters. For many decision makers, the hub is where the business case becomes tangible. It is the layer that can sit between existing RTLS deployments, normalize location flows, and open a path toward mixed-vendor interoperability without forcing a rip-and-replace project.

## Where the hub stands now

The [Open Location Hub](/open-location-hub/) has undergone substantial development over a short period of time. We are currently working toward a `0.1` release by mid-April 2026.

The important point is that this is no longer just a skeleton or a slideware concept. The current implementation is feature complete for the first release scope, and the repository already includes several public connector examples that partners can explore, adapt, or use as reference implementations for their own technology stack.

If you want to see that direction in more detail, the published [Hub documentation](/open-location-hub/docs/), the public [connector documentation](https://github.com/Open-Location-Stack/open-location-hub/blob/main/docs/connectors.md), and the connector examples in the [hub repository](https://github.com/Open-Location-Stack/open-location-hub/tree/main/connectors) make the current scope visible.

## Connectors you can inspect and reuse

One of the strongest signals for us is that connector development is becoming straightforward and repeatable. The repository now includes public example connectors for live feeds as well as a replay-oriented connector for diagnostics and testing.

The replay connector is especially useful because it lets you take location traffic that was previously recorded from the hub, shift it to the current time, and inject it again with fresh timestamps. It can also accelerate playback and generate interpolated points between samples. In practice, that gives us a realistic way to stress test the hub with repeatable traffic patterns instead of relying only on synthetic benchmarks.

You can inspect the details in the [Replay Connector README](https://github.com/Open-Location-Stack/open-location-hub/tree/main/connectors/replay), and the shared logging utilities it builds on are included in the repository [scripts directory](https://github.com/Open-Location-Stack/open-location-hub/tree/main/scripts).

That testing work has already paid off. We have removed several performance bottlenecks, and the hub is now processing tens of thousands of updates while also evaluating collisions and fence events. That matters because a technically elegant hub is not enough on its own. Partners need to see a credible path toward operational load, diagnostics, and sustained throughput.

## Enterprise readiness is already part of the build

Another important milestone this week was [OTLP](https://opentelemetry.io/docs/specs/otlp/) support. Open Location Stack is being built as enterprise-ready infrastructure, which means observability is not an afterthought.

The hub now exposes metrics, logs, and traces through OTLP so teams can inspect behavior with standard tooling and fit the hub into existing operational environments. For partners evaluating whether this can become part of a serious production landscape, that is a much stronger proposition than a black-box service with limited diagnostics.

To make that easier to try locally, the repository now includes a [local-hub directory](https://github.com/Open-Location-Stack/open-location-hub/tree/main/local-hub) with scripts that bring up the hub and a local observability stack. By default, that starter environment includes [SigNoz](https://signoz.io/) dashboards so you can watch ingest throughput, latency, and outcomes while running connector traffic against the hub.

## Documentation is live and improving

Documentation is still a work in progress, but it is already being published on this website and expanded continuously. The intent is practical documentation, not just a specification dump: enough to help partners understand the model, run the hub, inspect the APIs, and judge how quickly a connector or pilot integration could come together.

The most useful starting points today are the [Open Location Hub docs](/open-location-hub/docs/), the [API reference](/open-location-hub/docs/api-reference/), and the public [GitHub organization](https://github.com/Open-Location-Stack).

## Why this should matter to RTLS partners

The broader message behind this Easter update is simple: Open Location Stack is moving quickly, and the progress is visible in working software rather than broad promises.

For skeptical but interested RTLS partners, that should make evaluation easier. You can now inspect the architecture, review the code, test the connector model, explore the observability story, and see how the hub is evolving toward a usable `0.1` release. If your organization is thinking about interoperability, mixed-estate deployments, or a more open path to location-enabled applications, this is a good moment to take a closer look.

## What's next

The next few weeks are focused on turning the current momentum into something even easier to evaluate and adopt:

- A Docker Hub release for Open Location Hub is planned for after Easter, making it simpler to pull the runtime into local evaluation and partner demo environments.
- We are preparing a partner logo wall for the website. If your company wants to be visibly associated with Open Location Stack and the emerging ecosystem around it, please [contact us](mailto:open-rtls@tryformation.com).
- We will continue work on the [Floor Plan Editor](/floor-plan-editor/) and start building a map-rendering plugin for [MapLibre](https://maplibre.org/), so structured indoor maps become easier to operationalize in real products.
- The hub will gain additional APIs for storing [IMDF](https://www.ogc.org/publications/standard/indoor-mapping-data-format/) maps alongside the existing omlox-facing hub capabilities. That is not part of omlox itself, but it is an important practical step toward a more complete map-aware platform.
- We will start building out federation features for the hub so organizations can connect on-premise omlox-compatible hubs to a centrally managed Open Location Hub and provision shared zones, fences, and other metadata from one place.
- We are also preparing a presentation for [GeoMob Berlin](https://thegeomob.com/events). The GeoMob events page currently lists the next Berlin event on 22 April 2026, and our planned topic there is indoor mapping and IMDF.
