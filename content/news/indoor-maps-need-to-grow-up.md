---
title: "Indoor maps need to grow up"
description: "Why bitmap floor plans are technical debt for asset tracking, and why georeferenced vector maps and IMDF are a better path."
date: 2026-04-27T11:00:00Z
draft: false
---

Most companies that use indoor maps are still treating them as an afterthought. They'll buy an expensive location system, for example based on ultra wide band, and then they will spend a lot of money installing the necessary infrastructure and dialing that in. But then the maps that go with this system are not something that gets a lot of attention from a practical or estethical point of view. Mostly people base their maps off architectural drawings. The dominant esthecic is that of a technical drawing. Quite often these come in bitmap form. You can see this clearly when zooming in when the edges get all pixelated and the text labels become a bit blurry.

At FORMATION, we build asset tracking solutions. Maps show up everywhere in our product. Users look for equipment, materials, vehicles, pallets, and people. They need context. They need to know where something is, what floor it is on, what is nearby, and so on. We use the map as a means to help the user orient themselves. People have something called spatial memory - we remember where things are around us. By tapping into that, we can make it easy to find things back and make of their environment. A map supports spatial memory.

With outdoor maps, we've gotten used to high quality maps provided by Apple, Google, and Openstreetmap. Modern maps are vector based and you can effortlessly pan, zoom, and tilt them for a 3D perspective. As you zoom in, more detail becomes visible. A modern map has a very high amount of detail and keeping maps rendering smoothly is onlly possible because of hardware acceleration that is now common on phones and laptops.

We believe indoor maps should be the same. But right now they just aren't. The maps are bitmap based and often these bitmaps aren't even tiled. Instead they are simple bitmap images that are scaled and rotated onto the outdoor map until they more or less fit the satellite imagery our building outline of the building. This is a process called geo referencing.

Projecting a georeferenced image on the outdoor map is technically easy but it results in a jarring experience where the outdoor map is nice to look at but the indoor map is more like stepping back in time to when all maps were still bitmap based, lacking in detail, and generally not very nice to look at. And unlike the bitmap based maps of the early days of the internet, not a lot of thought seems to go into making sure indoor maps are well designed or visually match the outdoor map.

Indoor maps are needed so indoor and outdoor workflows can work together on one map. Many of our customers operate across multiple buildings, campuses, yards, and countries. Some of these companies are multi nationals. The logistics workflow does not stop or end at the front door, it can span the globe. Additionally many companies do work outside their premises. They go on site to customers, construction sites, or even in fields.

Most of these use cases do not need a perfect digital twin. They need a readable map that covers the indoors and the outdoors areas where they work. They need enough detail to give context to assets, tasks, and movement through a building.

Several map providers now provide maps for some public buildings. Here is an example of the airport of Berlin from Apple Maps.

Here you can see some details of the airport terminal. All the gates are clearly marked and you can see where the shops and other facilities are. As you zoom in, more details are revealed. The indoor map seamlessly fits the outdoor map.

Apple invented a new format for this called IMDF. This format was standardized in 2021 by the Open Geospatial Consortium (OGC). It represents indoor maps using a simple GeoJson format and uses simple polygons and meta data to represent walls, rooms, areas, walkable paths (for implementing routing), and common fixtures like toilets, kiosks, and more. Adoption is slowly growing. Apple of course uses IMDF for Apple Maps. Microsoft has a product called Places that is part of Office 365 that companies can use to provide maps for their buildings to enable use cases like meeting room booking, flex desk assignement, and more. Several companies exist that can create IMDF maps from scratch or by converting architecture drawings.

We found that there still is a lack of good OSS tooling for this file format. And we decided to address this. Without IMDF map editor, you can easily create IMDF maps. You start with a simple georeferenced bitmap and then you draw walls, rooms, navigation paths on top. The project also includes a validator tool that allows you to validate your maps.

We took great care to keep this tool simple so non GIS experts can use it to map their buildings. We hope that by providing basic map creation tooling, we can start an indoor mapping revolution. Apple, Google, and other commercial map providers will never go inside private buildings to create a map. That responsibility ultimately lies with the building owners. Over time, we hope to make this process easier. For example, we see a lot of potential for AI models to start doing a lot of the manual drawing work. But for now, evenr a manually drawn map is already better than a quick and dirty job based on bitmap generated from a CAD drawing.

Start mapping today with our [Floor Plan Editor](/floor-plan-editor/).
