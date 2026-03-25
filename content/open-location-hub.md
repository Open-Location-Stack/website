---
title: "Open Location Hub"
description: "OpenAPI-first interoperability hub targeting the omlox hub specification for RTLS position and event exchange."
draft: false
github_url: "https://github.com/Open-Location-Stack/open-location-hub"
aliases:
  - /open-location-stack-hub/
---

Open Location Hub is an OpenAPI-first hub implementation for interoperable RTLS position and event exchange, built around the omlox hub specification.

It is the integration-layer counterpart to Open Location Stack's mapping work: once indoor spaces are modeled clearly, for example with the [Floor Plan Editor](/floor-plan-editor/), the hub becomes the place where live location data, events, security, and system-to-system interoperability come together.

The current repository is still an implementation scaffold, but it already shows the intended direction clearly: a production-grade, open source hub that teams can run, extend, and integrate without being locked into vendor-specific middleware.

## Why it matters

Many RTLS deployments end up depending on proprietary hub behavior, custom APIs, or narrow integration contracts. That makes federation, migration, and cross-vendor interoperability harder than it should be.

Open Location Hub exists to give the ecosystem a transparent, standards-oriented foundation. The goal is not just to expose an API, but to provide a credible base for secure, testable, deployable hub infrastructure that can participate in real deployments.

## What it includes today

- A normative OpenAPI contract for the hub API.
- A Go server scaffold with strict handler interfaces.
- Local runtime support for Postgres, Valkey, Mosquitto, and the application itself.
- Authentication modes for OIDC, static JWTs, and hybrid setups.
- RBAC and ownership-aware authorization building blocks.
- Unit tests and an integration-test harness.
- Engineering and architecture documentation for implementation planning.

## Product pitch

Open Location Hub is meant to be the open integration backbone of Open Location Stack: a hub that can sit between RTLS infrastructure, applications, and enterprise systems while staying aligned with omlox-style interoperability.

For integrators and vendors, that means a shared place to build the non-differentiating but critical parts of the stack: API contracts, auth, event exchange, deployment scaffolding, and operational discipline. For customers, it creates a better path toward portability and less dependence on closed middleware.

## Early access

This project is still early and not yet feature complete. It should be treated as an active implementation effort rather than a finished hub product.

If you care about interoperable RTLS infrastructure, now is the right time to get involved. Try the code, review the API direction, open issues, and contribute pull requests to help shape the implementation.

[Learn about Floor Plan Editor](/floor-plan-editor/)

[View the repository on GitHub](https://github.com/Open-Location-Stack/open-location-hub)
