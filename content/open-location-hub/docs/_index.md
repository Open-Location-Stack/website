---
title: "Software Documentation"
description: "Reference documentation for local setup, hub architecture, configuration, authentication, RPC behavior, and connector development."
draft: false
generated: true
generated_from: "docs/index.md"
github_url: "https://github.com/Open-Location-Stack/open-location-hub/blob/main/docs/index.md"
---
_This page is generated from the Open Location Hub source documentation and should not be edited in the website repository._

Reference documentation for local setup, hub architecture, configuration,
authentication, RPC behavior, and connector development.

Start here if you want the laptop-friendly local runtime:

- [`docs/getting-started.md`](/open-location-hub/docs/getting-started/)

Core hub docs:

- [`docs/architecture.md`](/open-location-hub/docs/architecture/)
- [`docs/configuration.md`](/open-location-hub/docs/configuration/)
- [`docs/auth.md`](/open-location-hub/docs/auth/)
- [`docs/rpc.md`](/open-location-hub/docs/rpc/)

Connector docs:

- [`docs/connectors.md`](/open-location-hub/docs/connectors/)
- [`docs/connectors-websocket.md`](/open-location-hub/docs/connectors-websocket/)
- [`docs/connectors-mqtt.md`](/open-location-hub/docs/connectors-mqtt/)

Connector demonstrators live outside the hub runtime under
[`connectors/`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/connectors).
Shared connector-agnostic utility scripts live under
[`scripts/`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/scripts).
The shared local runtime is documented in
[`local-hub/README.md`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/local-hub/README.md).
Connector examples currently include
[`connectors/gtfs/README.md`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/connectors/gtfs/README.md)
and
[`connectors/opensky/README.md`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/connectors/opensky/README.md),
plus
[`connectors/replay/README.md`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/connectors/replay/README.md).
