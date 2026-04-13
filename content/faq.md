---
title: "FAQ"
description: "Questions about Open Location Stack licensing, governance, roadmap, OMLOX interoperability, and participation."
draft: false
---

## What license will Open Location Stack use?

Everything is released under the MIT License.

That gives hardware vendors, software vendors, and integrators room to adopt, extend, and embed the software without negotiating around restrictive licensing terms.

## Why is FORMATION doing this?

After years of delivery work with RTLS partners, we kept seeing the same pattern: each company rebuilt its own hub adapters, middleware, map tooling, and integration glue.

FORMATION deals with that fragmentation directly in customer projects. Different vendor stacks, different APIs, and different map formats create avoidable integration cost. Open Location Stack is our response: build the shared parts in the open so teams can spend more time on the parts that actually differentiate their product.

The goal is practical reuse, not abstract ideology.

## Can I become a member or contributor?

Not yet. We are still collecting feedback by email while we shape the collaboration model.

The near-term priority is to get the core repositories, docs, and product direction into a state that external contributors can evaluate properly.

## Why create a new organization?

FORMATION is already active in several German industry groups, including the OMLOX consortium. OMLOX and the limits of current hub implementations were a major reason to start an open source implementation.

The goal is not to replace standards. The goal is to implement useful software around them. Real deployments need more than a hub API: vector maps, map authoring, connectors, federation, security, and application-facing integration points. Open Location Stack is meant to cover that broader reality.

## Isn't this a lot of work?

Yes. It is a large scope.

Modern AI-assisted tooling helps us move faster, but the main reason we are doing this is straightforward: FORMATION also benefits from having better location infrastructure. Our own products and customer work depend on it.

## I'm an RTLS integrator and we like OMLOX. What should we do?

Tell us what you need and where current solutions fall short. Try the published components. Share requirements, use cases, and integration pain points.

If you already use an OMLOX hub, or have your own implementation, you do not need to replace it. Federation, compatibility layers, and mapping/tooling reuse are all valid paths.

## I'm an RTLS integrator. How can I help?

Feedback is the most useful input right now.

[Email us](mailto:open-rtls@tryformation.com).

## When will the first repositories be published?

The first two repositories, Open Location Hub and Floor Plan Editor, were published in early April 2026.

The next releases in Spring 2026 are focused on making those projects easier to evaluate and use: better documentation, packaging, and follow-on mapping and interoperability components.

## Which components are likely to be released first?

Early candidates include mapping components, IMDF validation and tooling, and OMLOX-compatible integration building blocks that reduce integration work quickly.

## How should I share requirements or feature requests?

Email us with concrete deployment context: the use case, the current hub or mapping setup, the constraints, and the blockers you face today. Specific scenarios are much easier to act on than generic wish lists.

## What is the governance model for Open Location Stack?

Right now, the domain and GitHub organization are controlled by FORMATION GmbH. We initiated Open Location Stack and intend to guide it through its initial creation as a long-term investment.

That may evolve over time. We are open to discussing governance as the project grows and more stakeholders become involved.
