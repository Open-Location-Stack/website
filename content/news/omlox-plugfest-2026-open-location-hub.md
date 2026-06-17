---
title: "Open Location Hub at the omlox Plugfest 2026"
description: "Open Location Hub was tested as a hub of hubs at the omlox Plugfest 2026 in Lemgo, aggregating live updates from multiple omlox-compatible systems into FORMATION."
date: 2026-06-12T10:30:00Z
draft: false
---

Last week, we were at the [omlox Plugfest & Conference 2026](https://s.fhg.de/omlox-plugfest-conference-2026) in Lemgo. We tested the Open Location Hub against other omlox-compatible systems.

The plugfest took place at [SmartFactoryOWL](https://www.smartfactory-owl.de/en/about-us/) from June 9 to 11, 2026. This setting is perfect for testing omlox hardware and software, and we had representatives across the spectrum testing their tags, anchors, and hubs for interoperability.

For us, the main goal was simple: verifying that the Open Location Hub works as a hub of hubs.

## Hub of hubs

During the plugfest, we configured the Hub to aggregate live location updates from the onsite omlox hubs from several vendors with real tags from several vendors moving around. FORMATION consumed the combined stream of updates and showed updates from multiple tags in the FORMATION app.

At the peak, we processed just under `100` location updates per second from tags supplied by multiple vendors participating in the plugfest.

<video autoplay loop muted controls preload="metadata" class="my-8 w-full rounded-lg border border-line bg-black">
  <source src="https://assets.openlocationstack.com/videos/openlocationstack/news/omlox-plugfest-2026/plugfest.mp4" type="video/mp4">
  Your browser does not support the video tag. You can download the screen recording from https://assets.openlocationstack.com/videos/openlocationstack/news/omlox-plugfest-2026/plugfest.mp4.
</video>

Some of these tags were broadcasting locations at high frequency. While interesting for on premise use cases related to safety and collision avoidance, this is not desirable for cloud based applications that sit several network hops away from the action and that need to integrate information that spans the entire operations of a company. To make this more manageable, we activated the Kalman filtering in the hub. Our cloud based hub ingests locations at full flow but only emits trackable locations if they are signicant enough and at a much lower frequency.

That lower output frequency keeps the mobile application responsive as updates move through several network layers: from the onsite hubs, into Open Location Hub running in public cloud infrastructure, onward to the FORMATION spatial intelligence platform, and finally to users over a mobile network.

This is of course configurable in the hub. Open Location Hub can run onsite, in the cloud, or across both when a deployment needs local ingestion with cloud-side aggregation and application delivery.

The screen recording shows FORMATION receiving updates through Open Location Hub while the hub is connected into the onsite plugfest environment. The routing path is the important part: multiple tag sources, multiple hubs, one Open Location Hub instance, and one application consuming the normalized stream.

## What we tested

The plugfest test plan covered plug-and-play behavior, hub API connectivity, application integration, positioning checks, mixed environments, and handover between zones. Before the event, we deployed the Open Location Hub to our data center in Hetzner and made sure it was available via HTTPS/WSS for others to integrate with. We also hooked the OTEL ready hub into our Elastic based monitoring stack with custom dashboards for logs, tracing, and metrics.

Our own work focused on the paths that matter most for integrators:

- Connecting Open Location Hub to other omlox hub implementations
- Aggregating location updates from several vendors
- Validatin live update flow into FORMATION.

## Live fixing

During the event, we addressed several issues, and we released and deployed several versions of the Hub:

- We missed a few APIs when implementing the hub that broke one of the compatibility tests. This was easily rectified.
- Our trackables feed included both raw location updates and Kalman-enhanced updates for trackables; it now filters out the raw updates.
- We had added parameters for configuring geofence tolerance, but they were not doing anything. They are now respected, and this helps prevent tags jumping in and out of zones.
- The trackable association via providers was only partially implemented and did not support associating providers with trackables, only trackables with providers. This prevented trackable detection for incoming location updates for tags that had been associated with the trackables.

We also wrote a lot of scripts to consume and push location updates from one hub to another. To facilitate this, we added a new component to the Open Location Stack: the [Open Location Hub CLI](https://github.com/Open-Location-Stack/open-location-hub-cli). The CLI enables scripting of common CRUD operations on the hub as well as subscribing to location, trackable, fence, and collision events. Like the hub, the CLI is written in Go and should work on all major platforms. As it uses the omlox APIs, it should of course work with any compatible hub. And of course CLIs are very suitable for agentic usage via e.g. Claude Code or OpenAI's Codex. Which is exactly how we used it during the event.

Finally, we also did a bit of work on the FORMATION App and API to be able to receive updates from the hub and bypass its internal geofence detection. This is a work in progress and part of our roadmap to deliver a **seamless, turnkey solution with an omlox-ready application and spatial intelligence platform that instantly delivers real value to end users** without the need for additional development work, deep integrations, or any of the other expensive integration work that is typically required to create value for RTLS setups.

## Learnings and next steps

After a few days of tinkering, the Open Location Hub and the new CLI held up well in the plugfest environment. We achieved our main goal of showing live updates from real trackers on the map and successfully demoed this during the omlox Conference on the last day. Our hub of hubs setup clearly adds value to the ecosystem. Many of the other solutions on display demonstrated hardware interoperability and there were several hub implementations deployed in the local network of Fraunhofer's SmartFactoryOWL. However, FORMATION was the only cloud based application being demoed. The Hub of Hubs concept that we demoed clearly adds value and this is the main role we see for the Open Location Hub.

While it can also work as an on premise hub, where it shines is as a horizontally scalable middleware that aggregates and federated location updates. This is a vision that also goes a bit beyond the omlox specification but we see a clear need for it. There's a clear need to connect the high volume on premise location information to the cloud based, global information that many business applications operate at. To realize our **Cradle to Grave** tracking vision, we need to think beyond a single factory hall or ware house covered by RTLS infrastructure and think hybrid tracking that spans the complex ecosystem of suppliers, manufacturing, logistics, and even customers. Full life cycle tracking needs to cover every move of an asset.

The next steps are about doubling down on making it easier to federate and aggregate information across hubs. At the plugfest we demonstrated this capability using a few scripts and our new CLI. But of course this needs to become easier should be less adhoc. Our short term plan is to continue working on the end to end integration with FORMATION, to add more features related to supporting federation and aggregation use cases in the hub directly, and build out features related to that. We also hope to engage with more companies on taking the Open Location Hub to the next level.


