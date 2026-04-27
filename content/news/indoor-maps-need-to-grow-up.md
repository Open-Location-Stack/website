---
title: "Indoor maps need to grow up"
description: "Why bitmap floor plans are technical debt for asset tracking, and why georeferenced vector maps and IMDF are a better path."
date: 2026-04-27T15:00:00Z
draft: false
---

Most companies that use indoor maps are still treating them as an afterthought. They'll buy an expensive location system, for example based on ultra-wideband, and then they will spend a lot of money installing the necessary infrastructure and dialing that in. But then the maps that go with this system are not something that gets a lot of attention from a practical or aesthetic point of view. Mostly people base their maps on architectural drawings. The dominant aesthetic is that of a technical drawing. Quite often these come in bitmap form. You can see this clearly when zooming in, when the edges get all pixelated and the text labels become a bit blurry.

At FORMATION, we build asset tracking solutions. Maps show up everywhere in our product. Users look for equipment, materials, vehicles, pallets, and people. They need context. They need to know where something is, what floor it is on, what is nearby, and so on. We use the map as a means to help the user orient themselves. People have something called spatial memory: we remember where things are around us. By tapping into that, we can make it easy to find things back and make sense of their environment. A map supports spatial memory.

With outdoor maps, we've gotten used to high quality maps provided by Apple, Google, and OpenStreetMap. Modern maps are vector based and you can effortlessly pan, zoom, and tilt them for a 3D perspective. As you zoom in, more detail becomes visible. A modern map has a very high amount of detail and keeping maps rendering smoothly is only possible because of hardware acceleration that is now common on phones and laptops.

We believe indoor maps should be the same. But right now they just aren't. The maps are bitmap based and often these bitmaps aren't even tiled. Instead they are simple bitmap images that are scaled and rotated onto the outdoor map until they more or less fit the satellite imagery or building outline. This is a process called georeferencing.

Projecting a georeferenced image on the outdoor map is technically easy, but it results in a jarring experience where the outdoor map is nice to look at while the indoor map is more like stepping back in time to when all maps were still bitmap based, lacking in detail, and generally not very nice to look at. And unlike the bitmap-based maps of the early days of the internet, not a lot of thought seems to go into making sure indoor maps are well designed or visually match the outdoor map.

Hybrid indoor/outdoor maps allow indoor and outdoor workflows to co-exist on one map. Many of our customers operate across many buildings, campuses, yards, etc. Some of these companies are multinationals. The logistics workflow does not stop or end at the front door; it spans the globe. Additionally, many companies do work outside their premises. They go on site to customers, construction sites, or even into fields.

Most of these use cases do not need a perfect digital twin. They need a readable map that covers the indoor and outdoor areas where they work. They need enough detail to give context to assets, tasks, and movement through a building.

Several map providers now provide maps for some public buildings. Here is an example of Berlin Brandenburg Airport from Apple Maps.

Here you can see some details of the airport terminal. All the gates are clearly marked and you can see where the shops and other facilities are. As you zoom in, more details become visible. The indoor map seamlessly fits the outdoor map.

Apple invented a new format for this called the Indoor Mapping Data Format (IMDF). The format was standardized in 2021 by the Open Geospatial Consortium (OGC). It represents indoor maps using a simple GeoJSON format and uses simple geometry to represent walls, rooms, areas, walkable paths for implementing routing, and common fixtures like toilets, kiosks, and more. Adoption is slowly growing. Apple, of course, uses IMDF for Apple Maps. Microsoft has a product called Places that is part of Office 365 that companies can use to provide maps for their buildings to enable use cases like meeting room booking, flex desk assignment, and more. Several companies exist that can create IMDF maps from scratch or by converting architectural drawings.

We found that there is still a lack of good OSS tooling for this file format, and we decided to address this. With our IMDF map editor, you can easily create IMDF maps. You start with a simple georeferenced bitmap and then draw the walls, rooms, and navigation paths on top.

We took great care to keep this tool simple so non-GIS experts can use it to map their buildings. We hope that by providing basic map creation tooling, we can start an indoor mapping revolution. Apple, Google, and other commercial map providers will never go inside private buildings to create a map. That responsibility ultimately lies with the building owners. Over time, we hope to make this process easier. For example, we see a lot of potential for AI models to do a lot of the manual drawing work. But for now, even a manually drawn map is already better than a quick and dirty job based on a bitmap generated from a CAD drawing.

Start mapping today with our [Floor Plan Editor](/floor-plan-editor/).
