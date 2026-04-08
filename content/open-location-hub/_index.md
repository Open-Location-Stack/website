---
title: "Open Location Hub"
description: "OpenAPI-first hub for location position and event exchange, connector-driven integration, and federated multi-site deployments."
draft: false
github_url: "https://github.com/Open-Location-Stack/open-location-hub"
aliases:
  - /open-location-stack-hub/
---

Open Location Hub is an OpenAPI-first hub for interoperable location position and event exchange, built around the omlox hub specification.

It is the integration counterpart to Open Location Stack's mapping work. Once indoor spaces are modeled clearly, for example with the [Floor Plan Editor](/floor-plan-editor/), the hub handles live location data, events, auth, connectors, and system-to-system interoperability.

The project is moving toward a production-grade open source hub that teams can run, extend, adapt, and integrate without depending on vendor-specific middleware.

The software documentation for the current implementation is published at [Open Location Hub Docs](/open-location-hub/docs/). The REST contract is available as an interactive [API Reference](/open-location-hub/docs/api-reference/).

## Why teams use it

Open Location Hub gives vendors, integrators, and enterprise teams a hub they can run in customer projects, extend for partner integrations, and connect to existing systems.

Because the project is part of Open Location Stack's MIT-licensed codebase, it can be used, adapted, embedded, and white-labeled without licensing friction. That matters for teams that need a reusable hub without giving up their own service model, deployment approach, or customer-specific integration layer.

It cuts repeated work in hub APIs, auth, connectors, and deployment plumbing so teams can spend more time on delivery and product-specific behavior.

## Why it matters

Many RTLS deployments end up depending on proprietary hub behavior, custom APIs, or narrow integration contracts. That makes federation, migration, and cross-vendor interoperability harder than it should be.

Open Location Hub provides secure, testable, deployable hub infrastructure that can participate in real deployments.

It is cloud-native, horizontally scalable, and lightweight enough to run in very different environments. Teams can run it on premises close to local devices, in a regional cloud deployment, or as part of a larger multi-region setup that aggregates multiple sites and multiple continents. The federation work in the repository supports that progression from small local setups to larger distributed deployments.

## Connectors for existing deployments

Open Location Hub is not a rip-and-replace story. In many cases, the practical requirement is to work with the hubs and deployments that already exist across plants, warehouses, terminals, and production environments.

The hub supports integration with existing on-premise and cloud-based hubs such as Corriva Hub, Deephub, and other deployments already used for AGVs, fork lift trucks, and site-specific operational systems.

Instead of asking every customer to standardize on one vendor stack immediately, Open Location Hub can aggregate, normalize, and route location flows from multiple sources. That lets integrators and solution providers connect systems while preserving existing investments.

For location vendors and solution providers, contributed connectors can demonstrate compatibility and reduce one-off project work.

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

The hub is written in Go, which fits the deployment model well: low footprint, high performance, and simple operations. The current architecture separates durable storage, transient state, protocol surfaces, and shared hub logic so the same core behavior can support multiple transports and deployment shapes.

At the API layer, the repository already shows a broad protocol surface:

- REST for resource management, ingest, and standard hub APIs.
- WebSocket support for the OMLOX wrapper protocol, subscriptions, and event fan-out.
- MQTT integration for local device, adapter, and site-level integration patterns.
- OMLOX RPC support for command and diagnostics flows such as `com.omlox.ping`, `com.omlox.identify`, and `com.omlox.core.xcmd`.

That protocol mix matters because real deployments rarely have just one integration style. Some systems need CRUD APIs, some need streaming updates, some need local MQTT-based device integration, and some need controlled command execution without exposing devices directly to every consuming application.

## Security and control plane

The authentication model is standards-based JWT bearer auth with support for `oidc`, `static`, and `hybrid` verification modes. In OIDC mode, the hub discovers provider metadata and JWKS automatically, caches verifier state, and validates standard JWT claims. The repository includes a Dex setup for development, and the same model works with production OIDC providers such as Keycloak and other enterprise identity systems.

Authorization is more than simple bearer validation. The hub already includes role-based and ownership-aware authorization, route-level permissions, RPC-specific method permissions, and separate WebSocket topic permissions. That makes it possible to use the hub as the policy boundary between user-facing applications and lower-level RTLS infrastructure.

This is especially important for OMLOX RPC. Instead of letting applications talk directly to MQTT-connected devices or vendor adapters, the hub can act as the control-plane front door: authenticate the caller, authorize the method, log the request, route it to the right handler, and aggregate responses if needed.

## Federated hubs for multinational operations

The federation planning in the repository is not an afterthought. It is aimed at topologies such as on-premises plant hubs feeding regional cloud hubs, or regional hubs feeding aggregate hubs for global visibility. The goal is to preserve standard OMLOX-facing interoperability while allowing deployments to grow into federated architectures that remain auditable, replay-aware, and resilient to partial outages.

Open Location Hub is designed to federate, aggregate, and partition data across sites, tenants, regions, and jurisdictions while remaining practical for smaller installations.

For multinational and internationally operating companies, that matters because real deployments are rarely uniform. Different countries, business units, and sites often use different location technologies, local integrators, and a combination of on-premise and cloud infrastructure. A federated hub model makes it easier to aggregate those location flows without forcing every site into the same architecture on day one.

In practical terms, Open Location Hub can sit above local hubs, beside existing vendor systems, or between regional and global aggregation layers while still respecting local operational constraints.

## Product fit

Open Location Hub is the integration hub in Open Location Stack. It can sit between location infrastructure, applications, enterprise systems, and federated site deployments while staying aligned with omlox-style interoperability.

For integrators and vendors, it covers core pieces of the stack such as API contracts, auth, event exchange, deployment scaffolding, connectors, and federation patterns. For customers, it reduces dependence on closed middleware and makes multi-technology deployments easier to integrate.

## Get involved

If you care about interoperable location infrastructure, try the code, review the API direction, open issues, and contribute pull requests.

[Browse the generated docs](/open-location-hub/docs/)

[Open the API reference](/open-location-hub/docs/api-reference/)

[Learn about Floor Plan Editor](/floor-plan-editor/)

[View the repository on GitHub](https://github.com/Open-Location-Stack/open-location-hub)
