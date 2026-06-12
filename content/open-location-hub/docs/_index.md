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

Start here if you want the local runtime:

- [`docs/getting-started.md`](/open-location-hub/docs/getting-started/)

If you want the published container instead of a local build, the current Docker
Hub repository is
[`tryformation/openlocationhub`](https://hub.docker.com/r/tryformation/openlocationhub).
As of 2026-06-11, the published release tag is `0.1.8`, and `latest` points to
the current release image.

The companion command line client is
[`Open-Location-Stack/open-location-hub-cli`](https://github.com/Open-Location-Stack/open-location-hub-cli).
It installs as `olh` and covers local login, resource CRUD, ingest helpers,
WebSocket streams, and RPC calls.

Homebrew install:

```bash
brew tap jillesvangurp/tap
brew install jillesvangurp/tap/open-location-hub-cli
```

Core hub docs:

- [`docs/architecture.md`](/open-location-hub/docs/architecture/)
- [`docs/configuration.md`](/open-location-hub/docs/configuration/)
- [`docs/auth.md`](/open-location-hub/docs/auth/)
- [`docs/rpc.md`](/open-location-hub/docs/rpc/)
- [`deploy/hetzner/README.md`](https://github.com/Open-Location-Stack/open-location-hub/blob/main/deploy/hetzner/README.md)

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
