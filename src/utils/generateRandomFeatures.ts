
import { v4 as uuidv4 } from 'uuid';


export type TFeatureCollection = {
    type: string
    features: {
        id: string
        type: string
        geometry: {
            type: string
            coordinates: any
        }
        properties: {
            mode: string
        }
    }[]
}
export const generateRandomPoints = (maxFeatures: number) => {

    const featureCollection = {
        type: 'FeatureCollection',
        features: []
    }

    for (let i = 0; i < maxFeatures; i++) {

        // Generate lat between -90 and 90
        const lat = Number(((Math.random() * 180) - 90).toFixed(4));
        // Generate long between -180 and 180
        const long = Number(((Math.random() * 360) - 180).toFixed(4));

        const feature = {
            id: uuidv4(),
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [long, lat]
            },
            properties: {
                mode: "point",
            }
        };
        featureCollection.features.push(feature)
    }
    return featureCollection
}



export const generateRandomLines = (maxFeatures: number) => {

    const featureCollection = {
        type: 'FeatureCollection',
        features: []
    }

    for (let i = 0; i < maxFeatures; i++) {

        // generate it four times for the origin long and lat
        // and destination long and lat
        // origin point
        // origin point
        const lat1 = Number(((Math.random() * 180) - 90).toFixed(4));
        const long1 = Number(((Math.random() * 360) - 180).toFixed(4));

        // destination point
        const lat2 = Number(((Math.random() * 180) - 90).toFixed(4));
        const long2 = Number(((Math.random() * 360) - 180).toFixed(4));

        const feature = {
            id: uuidv4(),
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                    [long1, lat1],
                    [long2, lat2]
                ]
            },
            properties: {
                mode: "linestring",
            }
        };
        featureCollection.features.push(feature)
    }
    return featureCollection
}



export const generateRandomPolygons = (maxFeatures: number, width: number = 5, height: number = 5) => {

    const featureCollection = {
        type: 'FeatureCollection',
        features: []
    }

    for (let i = 0; i < maxFeatures; i++) {

        // Generate the center point for the building (as numbers with 4 decimal places)
        const centerLat = Math.round(((Math.random() * 180) - 90) * 10000) / 10000;
        const centerLong = Math.round(((Math.random() * 360) - 180) * 10000) / 10000;

        // Ensure the width and height are in a reasonable range
        const halfWidth = Math.min(width / 2, 180 - Math.abs(centerLong));
        const halfHeight = Math.min(height / 2, 90 - Math.abs(centerLat));

        // Calculate the four corners of the rectangle based on width and height offsets
        const coordinates = [
            [
                Math.round((centerLong - halfWidth) * 10000) / 10000,
                Math.round((centerLat - halfHeight) * 10000) / 10000
            ],  // Bottom-left corner
            [
                Math.round((centerLong + halfWidth) * 10000) / 10000,
                Math.round((centerLat - halfHeight) * 10000) / 10000
            ],  // Bottom-right corner
            [
                Math.round((centerLong + halfWidth) * 10000) / 10000,
                Math.round((centerLat + halfHeight) * 10000) / 10000
            ],  // Top-right corner
            [
                Math.round((centerLong - halfWidth) * 10000) / 10000,
                Math.round((centerLat + halfHeight) * 10000) / 10000
            ],  // Top-left corner
            [
                Math.round((centerLong - halfWidth) * 10000) / 10000,
                Math.round((centerLat - halfHeight) * 10000) / 10000
            ]   // Closing the loop back to bottom-left corner
        ];


        const feature = {
            id: uuidv4(),
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [coordinates]
            },
            properties: {
                mode: "polygon",
            }
        };
        featureCollection.features.push(feature)
    }
    return featureCollection
}
