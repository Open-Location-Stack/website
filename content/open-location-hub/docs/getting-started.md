---
title: "Getting Started"
description: "If you want to try Open RTLS Hub on your laptop, start with the shared local runtime in [`local-hub/`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/local-hub). That setup brings up the hub, Postgres, Mosquitto, Dex, and a ready-to-use observability stack so you can inspect what the hub is doing while you experiment."
draft: false
generated: true
generated_from: "docs/getting-started.md"
github_url: "https://github.com/Open-Location-Stack/open-location-hub/blob/main/docs/getting-started.md"
---
_This page is generated from the Open Location Hub source documentation and should not be edited in the website repository._

If you want to try Open RTLS Hub on your laptop, start with the shared local
runtime in [`local-hub/`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/local-hub).
That setup brings up the hub, Postgres, Mosquitto, Dex, and a ready-to-use
observability stack so you can inspect what the hub is doing while you
experiment.

## Fast Path

1. Review [`local-hub/README.md`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/local-hub/README.md).
2. Start the stack:

```bash
local-hub/start_demo.sh
```

3. If you need an auth token for manual calls or connector demos:

```bash
local-hub/fetch_demo_token.sh
```

4. Pick an example connector or continue with the docs below.

## What This Setup Is For

- local development and experimentation
- validating connector behavior against a real hub runtime
- inspecting OTLP telemetry during laptop demos and debugging

This starter stack is not positioned as a production deployment recipe.

## Notes

- Dex is included because it is convenient for local OIDC and repeatable demo users, not because it is the recommended production IdP choice.
- SigNoz is included because it is easy to bootstrap and script for modern local observability workflows, but the hub does not depend on SigNoz specifically.
- Alternative OpenTelemetry-compatible collectors and observability stacks should work as well.

## Good Next Steps

- [`connectors/gtfs/README.md`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/connectors/gtfs/README.md) for GTFS transit vehicle ingest over WebSocket or MQTT
- [`connectors/opensky/README.md`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/connectors/opensky/README.md) for OpenSky aircraft ingest over WebSocket
- [`connectors/replay/README.md`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/connectors/replay/README.md) for replaying captured `location_updates` traffic
- [`docs/index.md`](/open-location-hub/docs/) for the full software documentation set
- [`docs/connectors.md`](/open-location-hub/docs/connectors/) for connector structure and transport guidance
