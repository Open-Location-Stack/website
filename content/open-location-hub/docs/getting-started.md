---
title: "Getting Started"
description: "If you want to try Open RTLS Hub on your laptop, this repository includes two"
draft: false
generated: true
generated_from: "docs/getting-started.md"
github_url: "https://github.com/Open-Location-Stack/open-location-hub/blob/main/docs/getting-started.md"
---
_This page is generated from the Open Location Hub source documentation and should not be edited in the website repository._

If you want to try Open RTLS Hub on your laptop, this repository includes two
ready-made local runtime paths:

- a basic compose stack from [`docker-compose.yml`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/docker-compose.yml) with the hub, Postgres, Mosquitto, and Dex
- a local demo stack with observability in [`local-hub/`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/local-hub) with the hub, Postgres, Mosquitto, Dex, SigNoz, ClickHouse, and the OpenTelemetry collector

Use the basic stack if you want the shortest path to a working hub runtime.
Use the local demo stack if you also want observability while you
experiment.

## Fast Path

For the basic local stack:

```bash
cp .env.example .env
just compose-up
```

For the local demo stack with observability:

```bash
just local-hub-up
```

If you prefer the underlying scripts for the local demo stack:

```bash
local-hub/start_demo.sh
local-hub/fetch_demo_token.sh
```

## Which Stack To Use

- Basic compose stack:
  best when you want the hub plus its core dependencies only
- Local demo stack with observability:
  best when you want the hub plus a prewired observability setup for traces, metrics, and logs

The basic stack uses the repository root [`docker-compose.yml`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/docker-compose.yml).
The local demo stack is documented in [`local-hub/README.md`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/local-hub/README.md).

## What This Setup Is For

- local development and experimentation
- validating connector behavior against a real hub runtime
- inspecting OTLP telemetry during laptop demos and debugging

This starter stack is not positioned as a production deployment recipe.

## Notes

- the basic compose stack includes the hub, Postgres, Mosquitto, and Dex
- Dex is included because it is convenient for local OIDC and repeatable demo users, not because it is the recommended production IdP choice.
- the local demo stack adds SigNoz, ClickHouse, and the OpenTelemetry collector around that core runtime
- SigNoz is included because it is easy to bootstrap and script for modern local observability workflows, but the hub does not depend on SigNoz specifically.
- Alternative OpenTelemetry-compatible collectors and observability stacks should work as well.

## Good Next Steps

- [`connectors/gtfs/README.md`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/connectors/gtfs/README.md) for GTFS transit vehicle ingest over WebSocket or MQTT
- [`connectors/opensky/README.md`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/connectors/opensky/README.md) for OpenSky aircraft ingest over WebSocket
- [`connectors/replay/README.md`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/connectors/replay/README.md) for replaying captured `location_updates` traffic
- [`docs/index.md`](/open-location-hub/docs/) for the full software documentation set
- [`docs/connectors.md`](/open-location-hub/docs/connectors/) for connector structure and transport guidance
