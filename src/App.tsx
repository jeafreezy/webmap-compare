
import { useCallback, useEffect, useState, } from 'react'
import maplibregl, { AttributionControl, Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'leaflet/dist/leaflet.css'
import { generateRandomLines, generateRandomPoints, generateRandomPolygons, TFeatureCollection } from './utils/generateRandomFeatures';
import {
  TerraDraw,
  TerraDrawMapLibreGLAdapter,
  TerraDrawLeafletAdapter,
  TerraDrawPointMode, TerraDrawPolygonMode,
  TerraDrawLineStringMode,
  TerraDrawSelectMode,
} from "terra-draw";
import * as L from 'leaflet'

type TCommon = {
  name: string
  id: string
}
const mappingLibraries: TCommon[] = [
  {
    name: 'Maplibre GL JS (v 4.6.0)',
    id: 'maplibre'
  },
  // { add later
  //   name: 'OpenLayers (v 4.6.0)',
  //   id: 'openlayers'
  // },
  {
    name: 'Leaflet JS (v 1.9.4)',
    id: 'leaflet'
  }
]


const geometryTypes: TCommon[] = [
  {
    name: 'Point',
    id: 'point'
  },
  {
    name: 'Line',
    id: 'linestring'
  },
  {
    name: 'Polygon',
    id: 'polygon'
  }
]

const attribution = `<a href='https://emmanueljolaiya.com'>Emmanuel Jolaiya </a>`;

const DEFAULTS = {
  library: mappingLibraries[0].id,
  geometry: geometryTypes[0].id,
  features: 100,
  longitude: 0,
  latitude: 0,
  zoom: 2
};


// OpenStreetMap raster tiles
const style = {
  "version": 8,
  "sources": {
    "osm": {
      "type": "raster",
      "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      "tileSize": 256,
      "attribution": "&copy; OpenStreetMap Contributors",
      "maxzoom": 19
    }
  },
  "layers": [
    {
      "id": "osm",
      "type": "raster",
      "source": "osm" // This must match the source key above
    }
  ]
};

// empty feature collection
const EMPTY_FEATURE_COLLECTION = {
  type: 'FeatureCollection',
  features: []
}

function App() {
  const [selectedLibrary, setSelectedLibrary] = useState(DEFAULTS.library);
  const [selectedGeom, setSelectedGeom] = useState(DEFAULTS.geometry);
  const [featureCount, setFeatureCount] = useState(DEFAULTS.features);
  const [featureCollection, setFeatureCollection] = useState<TFeatureCollection>(EMPTY_FEATURE_COLLECTION);
  const [maplibreMap, setMapLibreMap] = useState<Map | null>(null);
  const [leafletMap, setLeafletMap] = useState<L.Map | null>(null);
  const [drawInstance, setDrawInstance] = useState<TerraDraw | null>(null)

  const handleLibrarySelection = (e: any) => {
    setSelectedLibrary(e.target.value)
  }

  const handleGeometrySelection = (e: any) => {
    setSelectedGeom(e.target.value)
  }

  const handleMapUpdate = useCallback(() => {
    if (!maplibreMap) return
    const fc = selectedGeom === 'point' ? generateRandomPoints(featureCount) : selectedGeom === 'linestring' ? generateRandomLines(featureCount) : generateRandomPolygons(featureCount);
    const newFeatures = [...featureCollection.features, ...fc.features]

    const newGeoJson = {
      'type': 'FeatureCollection',
      features: newFeatures
    }
    //update state and draw instance
    setFeatureCollection(newGeoJson);

    if (drawInstance) {
      //clear the features before adding them back to prevent 'feature already exist error'
      drawInstance.clear();
      drawInstance.addFeatures(newFeatures)
    }
  }, [featureCount, selectedGeom, maplibreMap, drawInstance, featureCollection])

  //shared draw modes
  const drawModes = [
    new TerraDrawPolygonMode(),
    new TerraDrawLineStringMode(),
    new TerraDrawPointMode(),
    new TerraDrawSelectMode({
      flags: {
        arbitary: {
          feature: {},
        },
        polygon: {
          feature: {
            scaleable: true,
            rotateable: true,
            draggable: true,
            coordinates: {
              midpoints: true,
              draggable: true,
              deletable: true,
            },
          },
        },
        linestring: {
          feature: {
            draggable: true,
            coordinates: {
              midpoints: true,
              draggable: true,
              deletable: true,
            },
          },
        },
        point: {
          feature: {
            draggable: true,
          },
        },
      },
    }),]

  const handleReset = useCallback(() => {
    setSelectedLibrary(DEFAULTS.library)
    setSelectedGeom(DEFAULTS.geometry)
    setFeatureCount(DEFAULTS.features)
    setFeatureCollection(EMPTY_FEATURE_COLLECTION)
    if (!drawInstance) return
    drawInstance.clear()
  }, [maplibreMap, drawInstance])


  // render maps
  useEffect(() => {
    if (selectedLibrary === 'maplibre') {
      // Create Map
      const map = new maplibregl.Map({
        container: "map",
        style: style,
        center: [DEFAULTS.longitude, DEFAULTS.latitude],
        zoom: DEFAULTS.zoom,
        attributionControl: true
      });
      map.on('load', () => {
        map.addControl(new AttributionControl({
          customAttribution: attribution
        }))
        setMapLibreMap(map)
      })
      return (() => {
        map.off('load', () => setMapLibreMap(null))
      })
    } else {
      const map = L.map('leaflet-map', {
        center: [DEFAULTS.latitude, DEFAULTS.longitude,],
        zoom: DEFAULTS.zoom,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: `&copy; <a style="color:black;" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | ${attribution}`
      }).addTo(map);
      setLeafletMap(map)
      return (() => {
        map.off('load', () => setLeafletMap(null))
      })
    }

  }, [selectedLibrary])

  const getTotalFeatures = useCallback(() => {
    if (!maplibreMap) return
    return featureCollection.features.length
  }, [maplibreMap, featureCollection])


  //add draw instance to maplibre
  useEffect(() => {
    if (!maplibreMap) return
    const draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map: maplibreMap, coordinatePrecision: 4, }),
      modes: drawModes
    });
    setDrawInstance(draw)
    draw.start()
    setFeatureCollection(EMPTY_FEATURE_COLLECTION)
  }, [maplibreMap,]);

  // add draw instance to leaflet
  useEffect(() => {
    if (!leafletMap) return
    const draw = new TerraDraw({
      adapter: new TerraDrawLeafletAdapter({ lib: L, map: leafletMap, coordinatePrecision: 4, }),
      modes: drawModes
    });
    setDrawInstance(draw)
    draw.start()
    //reset
    setFeatureCollection(EMPTY_FEATURE_COLLECTION)
  }, [leafletMap,]);

  //track the draw events
  useEffect(() => {
    if (!drawInstance) return
    drawInstance.on('change', () => {
      const snapshot = drawInstance.getSnapshot();
      setFeatureCollection({
        type: 'FeatureCollection',
        features: snapshot
      });
    })
  }, [drawInstance])

  //change draw mode when the user change the selected geometry
  useEffect(() => {
    if (!drawInstance) return
    drawInstance.setMode(selectedGeom)
  }, [drawInstance, selectedGeom])

  return (
    <div className='w-screen h-screen gap-2  text-[hsl(0,0%,98%)] bg-background px-10 space-y-10 text-sm'>
      <header className='border-muted border-b py-4 h-[5vh] flex items-center gap-x-4'>
        <h1 className='font-semibold text-lg'>WebMap Performance Playground (learn more --)</h1>
        <small>How many GeoJSON features can {selectedLibrary} render before it becomes slow?</small>
        {/* Add external link icon and link to github repo. */}
      </header>
      <div className='grid grid-rows-1 grid-cols-6 gap-10 h-[90vh]'>

        {/* Maplibre*/}
        {
          selectedLibrary === 'maplibre' && <div id="map" className='col-span-5 w-full h-full rounded-lg relative'>
            <InfoPanel drawInstance={drawInstance} selectedGeom={selectedGeom} />
          </div>
        }
        {/* Leaflet */}
        {
          selectedLibrary === 'leaflet' && <div id="leaflet-map" className='col-span-5 w-full h-full rounded-lg relative'>
            <InfoPanel drawInstance={drawInstance} selectedGeom={selectedGeom} />
          </div>
        }

        {/* Sidebar */}
        <div className='col-span-1 flex flex-col gap-y-6'>
          <p>Map Interactions</p>
          {/* Library */}
          <div className='flex flex-col gap-y-2'>
            <h1 className='font-medium'>Web Map Library</h1>
            <div className='inline-flex items-center w-full justify-between gap-x-4 px-4 h-10 rounded-md bg-muted'>
              <select className='w-full py-2 bg-muted focus-visible:outline-none' onChange={handleLibrarySelection}>
                {
                  mappingLibraries.map(lib => <option key={lib.id} value={lib.id} selected={selectedLibrary === lib.id}>{lib.name}</option>)
                }
              </select>
            </div>
          </div>

          <hr className='border-muted' />

          <p>Generate Random Geometries</p>

          {/* Geometry */}

          <div className='flex flex-col gap-y-2'>
            <h1 className='font-medium'>Geometry Type</h1>
            <div className='inline-flex items-center w-full justify-between gap-x-4 px-4 h-10 rounded-md bg-muted'>
              <select className='w-full py-2 bg-muted focus-visible:outline-none' onChange={handleGeometrySelection}>
                {
                  geometryTypes.map(geom => <option key={geom.id} value={geom.id} selected={selectedGeom === geom.id}>{geom.name}</option>)
                }
              </select>
            </div>
          </div>

          {/* Features */}
          <div className='flex flex-col gap-y-2'>
            <h1 className='font-medium'>Number of Features</h1>
            <input type='number' onChange={(e: any) => {
              setFeatureCount(e.target.value)
            }} value={featureCount} className='w-full px-3 rounded-md py-2 bg-muted focus-visible:outline-none'></input>
          </div>

          {/* Buttons */}
          <button className='rounded-md transition-all bg-muted py-3 hover:bg-opacity-80' onClick={handleMapUpdate}>Generate</button>
          <button className='rounded-md transition-all bg-red-950 py-3 hover:bg-opacity-80' onClick={handleReset}>Reset Map</button>
          <h1 className='font-medium'>Total Features: {getTotalFeatures()}</h1>
        </div>
      </div>
    </div>
  )
}

export default App


const InfoPanel = ({ drawInstance, selectedGeom }: {
  drawInstance: any,
  selectedGeom: string
}) => {
  return (
    <div className='absolute top-4 right-6 h-14 bg-muted z-[10000000000]  p-2 rounded-md'>
      <p className='hover:opacity-80 cursor-default' >Click on the map to draw {selectedGeom}s</p>
      <p className='hover:opacity-80 cursor-pointer' onClick={() => {
        drawInstance.setMode('select')
      }}>Click me to trigger select mode</p>
    </div>
  )
}