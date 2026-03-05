---
title: "FAQ"
description: "Frequently asked questions about Open RTLS licensing, governance, roadmap, OMLOX interoperability, and contributor participation."
draft: false
---

## What license will Open RTLS use?

Everything will be released under the MIT License.  
Our goal is an open ecosystem, and permissive licensing is a key enabler for hardware vendors, software vendors, and integrators to adopt and extend the technology without unnecessary friction.

## Why is FORMATION doing this?

After years of working with RTLS partners, we have repeatedly seen each company rebuild very similar in-house components. In many cases, these components are treated as necessary infrastructure rather than core product, which leads to limited UX, brittle tooling, and duplicated effort across the ecosystem.

As an integrator, FORMATION deals with that fragmentation directly: different stacks, different quirks, and avoidable integration overhead. Open RTLS is our response. We are rebuilding these common building blocks as open source so the entire ecosystem can share a better foundation.

The intent is to create neutral, reusable commodity components and middleware that everyone needs, so companies can focus on differentiated value instead of repeatedly reinventing the same base layer.

## Can I become a member or contributor?

Not yet. We are currently collecting feedback and suggestions via email while we shape the right collaboration model.  
We want to build a broad community and are taking the time to design this carefully.

## Why create a new organization?

FORMATION is already active in several German industry groups, including the OMLOX consortium. OMLOX and existing OMLOX hub implementations were a strong motivation for starting an open source implementation.

Our goal is not to replace or hijack standards. We defer to standards and aim for interoperability. At the same time, real-world RTLS solutions need more than a hub: vector maps, map rendering, map authoring tools, SDKs for publishing location data, federation across multiple hubs and sites, and a robust security model. Open RTLS is intended to cover that broader integrator reality.

## Isn't this a lot of work?

Yes. Historically, this would have required substantial manual effort. Early prototyping suggests we can move much faster with modern AI-assisted tooling, and we aim to deliver a solid enough foundation for external contributors to use and improve.

This is not charity work for FORMATION. Our own products depend on a strong RTLS foundation, and broad compatibility across providers directly benefits both us and our customers.

## I'm an RTLS integrator and we like OMLOX. What should we do?

Tell us what you need and where current solutions fall short. Try components as they become available. Share requirements, use cases, and integration pain points.

If you already use an OMLOX hub (or have your own implementation), you do not need to replace it. Federation and compatibility are valid paths, and you can still benefit from other Open RTLS components such as mapping and tooling.

## I'm an RTLS integrator. How can I help?

Feedback is the most valuable input right now.  
[Email us](mailto:open-rtls@tryformation.com).

## When will the first repositories be published?

The first releases are planned during Spring 2026, following current prototyping and requirements work in March 2026.

## Which components are likely to be released first?

Early candidates include mapping-related components, validation and tooling around IMDF workflows, and OMLOX-compatible integration building blocks that reduce integrator friction quickly.

## How should I share requirements or feature requests?

Email us with concrete deployment context: use case, constraints, current hub/mapping setup, and the integration blockers you face today. Specific real-world scenarios are the fastest way to shape a useful roadmap.

## What is the governance model for Open RTLS?

Right now, the domain and GitHub organization are controlled by FORMATION GmbH. We initiated Open RTLS and intend to guide it through its initial creation as a long-term investment.

That said, we recognize there are good arguments for evolving governance over time. There are several viable models, and we welcome discussion and feedback from stakeholders as the project grows.
