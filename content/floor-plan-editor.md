---
title: "Floor Plan Editor"
description: "Browser-based indoor mapping editor for creating and maintaining floor plans and IMDF-ready venue data."
draft: false
github_url: "https://github.com/Open-Location-Stack/floorplan-editor"
---

Floor Plan Editor is a browser-based map authoring tool for teams that need to create, adjust, and maintain indoor floor plans without building a custom editor from scratch.

It is part of Open Location Stack's mapping foundation and focuses on the practical work required to turn a venue into usable operational map data: place the building correctly, define floors, draw geometry, align floor plan images, and keep the project editable over time.

The current version is early access and still evolving quickly, but the direction is already clear: a product-ready editing workflow for integrators, operations teams, and developers working with indoor maps.

## Why it matters

Most RTLS and indoor-location projects still treat map authoring as a side problem, which usually leads to ad hoc tooling, brittle import flows, and inconsistent map quality.

Floor Plan Editor is intended to reduce that friction by providing a reusable foundation for indoor map creation and maintenance. Instead of rebuilding a one-off editor for every deployment, teams can start with a focused tool that already understands the shape of the problem.

## What it does today

- Interactive map editing on top of a live MapLibre-based map canvas.
- Building and floor hierarchy with editing panels that reflect the selected object.
- Drawing and editing for points, lines, and polygons.
- Floor plan image overlays with corner-based alignment.
- Local-first project storage in the browser with auto-save behavior.
- Import and export workflows for GeoJSON and IMDF-oriented datasets.
- Validation utilities to catch data issues earlier.
- Address lookup and map recentering for faster setup.

## Product pitch

Floor Plan Editor gives Open Location Stack a practical authoring front end for indoor spatial data. It is the place where floor plans become structured map assets that downstream renderers, validators, hubs, and applications can actually use, including the [Open Location Hub](/open-location-hub/).

For integrators, that means less time spent stitching together fragile map tooling. For product teams, it means a cleaner starting point for map-aware workflows such as navigation, zoning, asset visualization, and operational UX.

## Early access

The project is not yet feature complete, and compatibility-breaking changes may still happen while the data model and workflows are being refined.

That said, this is exactly the stage where outside feedback is useful. Try it, stress it, file issues, and send pull requests if you want to help shape the editor into a stronger shared foundation.

[Learn about Open Location Hub](/open-location-hub/)

[View the repository on GitHub](https://github.com/Open-Location-Stack/floorplan-editor)
