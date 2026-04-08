import Mapbox, { Camera, CircleLayer, FillLayer, LineLayer, MapView, ShapeSource, StyleURL } from "@rnmapbox/maps";
import { useLocalSearchParams } from "expo-router";
import { Feature, FeatureCollection } from "geojson";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import geoJSONData from '../src/assets/mockData.json';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "This wont happen");


const DetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const geoJ = geoJSONData as FeatureCollection;

    const selectedFeature = geoJ.features.find(
        (f) => f.properties?.OBJECTID?.toString() === id
    ) as Feature;

    const getCoordinates = (f: Feature) => {
        if (!f) {
            return [-80.8431, 35.2271]; //CENTER OF CLT
        }
        const geoType = f.geometry.type;
        if (geoType == "Point") {
            return f.geometry.coordinates;
        } else if (geoType == "Polygon") {
            return f.geometry.coordinates[0][0];
        } else if (geoType == "LineString") {
            return f.geometry.coordinates[0];
        } else {
            return [-80.8431, 35.2271];
        }

    }

    const [center] = useState(getCoordinates(selectedFeature));


    if (!selectedFeature) {
        return (
            <View style={styles.container}>
                <Text>Project not found for ID: {id}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView styleURL={StyleURL.Street}
                style={styles.mapContainer}
                logoEnabled={false}>
                <Camera
                    zoomLevel={16}
                    centerCoordinate={center}
                    animationDuration={0}
                />
                <ShapeSource id="combinedSource" shape={selectedFeature}>
                    <FillLayer
                        id="combinedPolygons"
                        filter={['==', ['geometry-type'], 'Polygon']}
                        style={{ fillColor: 'green' }} 
                    />
                    <LineLayer
                        id="combinedLines"
                        filter={['==', ['geometry-type'], 'LineString']}
                        style={{ lineColor: 'blue' }}
                    />
                    <CircleLayer
                        id="combinedPoints"
                        filter={['==', ['geometry-type'], 'Point']}
                        style={{ circleColor: 'red' }}
                    />
                </ShapeSource>
            </MapView>
            <View style={styles.textContainer}>
                <Text style={styles.title}>Project Details</Text>
                <Text>Name: {selectedFeature.properties?.Project_Name}</Text>
                <Text>ID: {selectedFeature.properties?.OBJECTID}</Text>
                <Text>Location Description: {selectedFeature.properties?.Location_Description}</Text>
                <Text>Project Description: {selectedFeature.properties?.Public_Project_Description}</Text>
                <Text>Status: {selectedFeature.properties?.Status || "N/A"}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: 'white' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    mapContainer: {
        flex: 1
    },
    textContainer: {
        flex: 1
    },
    mapItself: {
        flex: 1
    }
});

export default DetailsScreen;
