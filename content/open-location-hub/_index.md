---
title: "Open Location Hub"
description: "OpenAPI-first interoperability hub for RTLS position and event exchange, connector-driven integration, and federated mixed-estate deployments."
draft: false
github_url: "https://github.com/Open-Location-Stack/open-location-hub"
aliases:
  - /open-location-stack-hub/
---

Open Location Hub is an OpenAPI-first hub implementation for interoperable RTLS position and event exchange, built around the omlox hub specification.

It is the integration-layer counterpart to Open Location Stack's mapping work: once indoor spaces are modeled clearly, for example with the [Floor Plan Editor](/floor-plan-editor/), the hub becomes the place where live location data, events, security, connectors, and system-to-system interoperability come together.

The project is moving toward a production-grade, open source hub that teams can run, extend, adapt, and integrate without being locked into vendor-specific middleware.

The software documentation for the current implementation is published at [Open Location Hub Docs](/open-location-hub/docs/). That section is generated from the repository's `docs/` directory and is intended to stay aligned with the code as the project evolves.

## Business value

Open Location Hub gives vendors, integrators, and enterprise teams an open integration backbone they can actually use in commercial delivery models.

Because the project is part of Open Location Stack's MIT-licensed foundation, it is free to use, adapt, extend, embed, and white-label. That matters for companies that need a shared technical base without giving up their own service model, product packaging, deployment approach, or customer-specific integration layer.

The point is not to replace all commercial offerings with a single open product. The point is to reduce repeated work in the non-differentiating layers so more effort can go into customer value, operational UX, deployment quality, and reusable partner ecosystems.

## Why it matters

Many RTLS deployments end up depending on proprietary hub behavior, custom APIs, or narrow integration contracts. That makes federation, migration, and cross-vendor interoperability harder than it should be.

Open Location Hub exists to give the ecosystem a transparent, standards-oriented foundation. The goal is not just to expose an API, but to provide a credible base for secure, testable, deployable hub infrastructure that can participate in real deployments.

It is cloud-native, horizontally scalable, and lightweight enough to run in very different environments. Teams can run it on premises close to local devices, in a regional cloud deployment, or as part of a larger multi-region setup that aggregates multiple sites and multiple continents. The federation work in the repository supports that progression from small local setups to larger distributed deployments.

## Connectors for existing RTLS estates

Open Location Hub is not a rip-and-replace story. In many cases, the practical requirement is to work with the hubs and deployments that already exist across plants, warehouses, terminals, and production environments.

That is why connectors are an important part of the product direction. The hub supports integration with existing on-premise and cloud-based hubs such as Corriva Hub, Deephub, and other RTLS deployments already used for AGVs, fork lift trucks, and site-specific operational systems.

The business value is straightforward: instead of asking every customer to standardize on one vendor stack immediately, Open Location Hub can become the open layer that aggregates, normalizes, and routes location flows from multiple sources. That gives integrators and solution providers a practical path to interoperability while preserving existing investments.

For RTLS vendors and location solution providers, this also creates a partner opportunity. Contributed connectors can help companies demonstrate compatibility, reduce one-off project work, and participate visibly in a broader open ecosystem around the hub.

## What it includes today

- A normative OpenAPI contract for the hub API.
- A Go server with strict handler interfaces and a low operational footprint.
- Local runtime support for Postgres, Valkey, Mosquitto, and the application itself.
- Authentication modes for OIDC, static JWTs, and hybrid setups.
- RBAC and ownership-aware authorization building blocks.
- Shared ingest and fan-out paths across REST, WebSocket, and MQTT.
- An OMLOX RPC control plane for diagnostics and command routing.
- Unit tests and an integration-test harness.
- Engineering and architecture documentation for implementation planning.

## Technology overview

The hub is written in Go, which is a strong fit for the deployment model: low footprint, high performance, simple operations, and a clean path to containerized or cloud-hosted runtime environments. The current architecture separates durable storage, transient state, protocol surfaces, and shared hub logic so the same core behavior can support multiple transports and deployment shapes.

At the API layer, the repository already shows a broad protocol surface:

- REST for resource management, ingest, and standard hub APIs.
- WebSocket support for the OMLOX wrapper protocol, subscriptions, and event fan-out.
- MQTT integration for local device, adapter, and site-level integration patterns.
- OMLOX RPC support for command and diagnostics flows such as `com.omlox.ping`, `com.omlox.identify`, and `com.omlox.core.xcmd`.

That protocol mix matters because real RTLS deployments rarely have just one integration style. Some systems need CRUD APIs, some need streaming updates, some need local MQTT-based device integration, and some need controlled command execution without exposing devices directly to every consuming application.

## Security and control plane

The authentication model is standards-based JWT bearer auth with support for `oidc`, `static`, and `hybrid` verification modes. In OIDC mode, the hub discovers provider metadata and JWKS automatically, caches verifier state, and validates standard JWT claims. The repository includes a Dex setup for development, and the same model works with production OIDC providers such as Keycloak and other enterprise identity systems.

Authorization is more than simple bearer validation. The hub already includes role-based and ownership-aware authorization, route-level permissions, RPC-specific method permissions, and separate WebSocket topic permissions. That makes it possible to use the hub as the policy boundary between user-facing applications and lower-level RTLS infrastructure.

This is especially important for OMLOX RPC. Instead of letting applications talk directly to MQTT-connected devices or vendor adapters, the hub can act as the control-plane front door: authenticate the caller, authorize the method, log the request, route it to the right handler, and aggregate responses if needed.

## Federated hubs for multinational operations

The federation planning in the repository is not an afterthought. It is aimed at topologies such as on-premises plant hubs feeding regional cloud hubs, or regional hubs feeding aggregate hubs for global visibility. The goal is to preserve standard OMLOX-facing interoperability while allowing deployments to grow into federated architectures that remain auditable, replay-aware, and resilient to partial outages.

That means Open Location Hub is not just being positioned as a single-site integration box. It is being designed as a foundation that can federate, aggregate, and partition data across sites, tenants, regions, and jurisdictions while still remaining practical for smaller installations.

For multinational and internationally operating companies, that matters because real deployments are rarely uniform. Different countries, business units, and sites often use mixed RTLS technologies, mixed local integrators, and a combination of on-premise and cloud infrastructure. A federated hub model creates a cleaner path to aggregate those location flows into one map-aware operational layer without forcing every site into the same architecture on day one.

In practical terms, the open location hub can sit above local hubs, beside existing vendor systems, or between regional and global aggregation layers. The objective is to get everything onto one map and one interoperable flow of location data while still respecting local operational constraints.

## Product pitch

Open Location Hub is the open integration backbone of Open Location Stack: a hub that can sit between RTLS infrastructure, applications, enterprise systems, and federated site deployments while staying aligned with omlox-style interoperability.

For integrators and vendors, that means a shared place to build the non-differentiating but critical parts of the stack: API contracts, auth, event exchange, deployment scaffolding, connectors, federation patterns, and operational discipline. For customers, it creates a better path toward portability, mixed-technology aggregation, and less dependence on closed middleware.

## Get involved

If you care about interoperable RTLS infrastructure, now is the right time to get involved. Try the code, review the API direction, open issues, and contribute pull requests to help shape the implementation.

[Browse the generated docs](/open-location-hub/docs/)

[Learn about Floor Plan Editor](/floor-plan-editor/)

[View the repository on GitHub](https://github.com/Open-Location-Stack/open-location-hub)
