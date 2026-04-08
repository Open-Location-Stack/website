---
title: "Floor Plan Editor"
description: "Browser-based indoor mapping editor for creating and maintaining floor plans and IMDF-ready venue data."
draft: false
github_url: "https://github.com/Open-Location-Stack/floorplan-editor"
---

Floor Plan Editor is a browser-based map authoring tool for teams that need to create, adjust, and maintain indoor floor plans without building a custom editor from scratch.

It is part of Open Location Stack's mapping work and focuses on the practical steps required to turn a venue into usable map data: place the building correctly, define floors, draw geometry, align floor plan images, and keep the project editable over time.

## See it in action

![Animated demo of creating a room polygon in the Floor Plan Editor](/images/floor-plan-editor-add-room.gif)

*Draw rooms directly on the map canvas and build up floor geometry as structured vector data instead of painting on static bitmaps.*

![Animated demo of hiding a bitmap floor plan overlay while keeping vector geometry editable](/images/floor-plan-editor-show-hide-bitmap.gif)

*Use floor plan images as alignment aids, then hide them to inspect the actual editable map data underneath.*

## Why it matters

Most RTLS and indoor-location projects still treat map authoring as a side problem, which usually leads to ad hoc tooling, brittle import flows, and inconsistent map quality.

Floor Plan Editor reduces that friction by giving teams a reusable tool for indoor map creation and maintenance. Instead of rebuilding a one-off editor for every deployment, teams can start with a tool that already covers the core editing workflow.

Just as importantly, it shifts teams away from bitmap-first indoor mapping. Static image floor plans may be workable for small demos, but they do not scale well to industrial campuses, terminals, hospitals, and factories that span tens or hundreds of thousands of square meters. Vector map data stays crisp at every zoom level, is easier to validate and edit, and provides the structure needed for downstream applications instead of just a picture of a building.

## What it does today

- Interactive map editing on top of a live MapLibre-based map canvas.
- Building and floor hierarchy with selection-aware editing panels.
- Drawing and editing for points, lines, and polygons.
- Adding and maintaining routable navigation paths for wayfinding-ready indoor maps.
- Floor plan image overlays with corner-based alignment.
- Local-first project storage in the browser with auto-save behavior.
- Import and export workflows for GeoJSON and IMDF-oriented datasets.
- Validation utilities to catch data issues earlier.
- Address lookup and map recentering for faster setup.

## Under the hood

The current implementation is a React, Vite, and TypeScript application with a local-first browser architecture. Projects are stored in IndexedDB, map rendering is handled through MapLibre, and the editor includes IMDF-oriented import, export, and validation utilities so teams can move from raw floor plans toward cleaner interoperable venue data.

IMDF matters here because it is more than a drawing format. It is a GeoJSON-based information model with a venue hierarchy for sites, buildings, levels, units, openings, amenities, and related features. That structure gives indoor maps both geometry and meaning, which downstream systems need for search, display, zoning, routing, and operations.

The editor is also designed around navigable indoor space rather than static artwork. By supporting path creation as part of the authoring workflow, it helps teams build the navigation graph needed for wayfinding and point-to-point routing. Combined with vector geometry, that supports crisp rendering at any zoom level and applications that need to answer questions like how to get from one room, entrance, or work area to another.

## Built for indoor mapping standards and tools

If you are evaluating indoor mapping standards and downstream compatibility, these are useful starting points:

- [OGC Indoor Mapping Data Format (IMDF)](https://www.ogc.org/standards/imdf/) for the open standardization path.
- [Microsoft Places floorplans and IMDF guidance](https://learn.microsoft.com/en-us/microsoft-365/places/setting-up-maps-in-places) for one example of where structured indoor maps are already expected.
- [Apple IMDF specification resources](https://register.apple.com/resources/imdf/) because Apple introduced IMDF and still publishes the core format material.
- [Apple MapKit indoor map documentation](https://developer.apple.com/documentation/mapkit/displaying-an-indoor-map) for a concrete product-facing integration angle.

## Product fit

Floor Plan Editor gives Open Location Stack a practical authoring front end for indoor spatial data. It is where floor plans become structured map assets that downstream renderers, validators, hubs, and applications can use, including the [Open Location Hub](/open-location-hub/).

For integrators, that means less time spent stitching together fragile map tooling. For product teams, it provides usable map data for workflows such as wayfinding, zoning, asset visualization, and operations.

## Get involved

Try it, stress it, file issues, and send pull requests if you want to help improve the editor.

[Learn about Open Location Hub](/open-location-hub/)

[View the repository on GitHub](https://github.com/Open-Location-Stack/floorplan-editor)
