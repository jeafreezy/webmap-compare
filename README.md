# Webmap Compare

This is a demo project to compare the performance of `Mapibre GL JS` and `Leaflet JS` when rendering large GeoJSON features on the map in draw mode.

Draw functionality is powered by [TerraDraw](https://github.com/JamesLMilner/terra-draw/tree/main).



## Features
- Draw Mode: Use TerraDraw to add or select, point, line and polygons features on the map.
- Random GeoJSON generator - Generate random GeoJSON features.
- GeoJSON Rendering: Test the rendering capabilities of different mapping libraries with large datasets.


## Usage

1. Select the mapping library.
2. Generate random geeometries.
3. Draw or select features on the map.
4. Pan and zoom to observe how each mapping library handles the rendering of large GeoJSON datasets. Take note of any performance issues or crashes.

## Setup

Clone:

```bash
git clone https://github.com/jeafreezy/webmap-compare.git
cd webmap-compare
```

Install dependencies:


```bash
pnpm install
```


Start development server:


```bash
pnpm  dev
```

## Technologies Used

- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [Leaflet JS](https://leafletjs.com/)
- [TerraDraw](https://github.com/JamesLMilner/terra-draw/tree/main).





