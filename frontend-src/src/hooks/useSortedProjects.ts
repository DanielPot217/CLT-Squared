import { LocationObjectCoords } from "expo-location";
import { Feature, Geometry } from "geojson";
import * as geolib from 'geolib';
import { useMemo } from "react";

export const useSortedProjects = (
    features: Feature<Geometry>[],
    userLocation: LocationObjectCoords | null
) => {
    return useMemo(() => {
        if (!userLocation || !features) return features;

        const getPoint = (f: Feature<Geometry>) => {
            try {
                const geom = f.geometry;
                if (geom.type === "Point") return geom.coordinates;
                if (geom.type === "Polygon") return geom.coordinates[0][0];
                if (geom.type === "LineString") return geom.coordinates[0];
                if (geom.type === "MultiPolygon") return geom.coordinates[0][0][0];
                return null;
            } catch (e) {
                return null;
            }
        };

        return [...features].filter((item)=>item.properties?.Status != "Archive").sort((a, b) => {
            const coordA = getPoint(a);
            const coordB = getPoint(b);

            if (!coordA) return 1;
            if (!coordB) return -1;

            const distA = geolib.getDistance(
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                { latitude: coordA[1], longitude: coordA[0] }
            );

            const distB = geolib.getDistance(
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                { latitude: coordB[1], longitude: coordB[0] }
            );

            return distA - distB;
        });
    }, [features, userLocation]);
};
