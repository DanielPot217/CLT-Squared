import { useSortedProjects } from "@/src/hooks/useSortedProjects";
import * as Location from 'expo-location';
import { LocationObjectCoords } from 'expo-location';
import { useRouter } from "expo-router";
import { Feature, FeatureCollection } from "geojson";
import * as geolib from 'geolib';
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import geoJSONData from '../../src/assets/mockData.json';

const ListScreen = () => {
    const router = useRouter();
    const geoJ = geoJSONData as FeatureCollection;

    const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status === 'granted') {
                const result = await Location.getCurrentPositionAsync({});
                setUserLocation(result.coords);
            }
        })();
    }, []);

    const sortedData = useSortedProjects(geoJ.features, userLocation);



    const getDistanceText = (
        featureCoord: number[] | null,
        userLocation: LocationObjectCoords | null
    ): string => {
        if (!userLocation || !featureCoord || featureCoord.length < 2) {
            return "Distance unknown";
        }

        try {
            const distanceInMeters = geolib.getDistance(
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                { latitude: featureCoord[1], longitude: featureCoord[0] }
            );

            const miles = distanceInMeters * 0.000621371;

            return `${miles.toFixed(1)} miles away`;
        } catch (error) {
            return "Distance error";
        }
    };




    const renderListItem = ({ item }: { item: Feature }) => {
        const { Project_Name, Public_Project_Description, OBJECTID, Location_Description } = item.properties || {};

        const coords = (item.geometry as any).coordinates;
        const flatCoords = Array.isArray(coords[0]) ? coords[0][0] : coords;

        return (
            <TouchableOpacity
                style={styles.listItem}
                onPress={() => router.push({ pathname: '/details', params: { id: OBJECTID } })}
            >
                <Text style={styles.itemTitle}>{Project_Name || "Untitled Project"}</Text>

                <Text style={styles.distanceText}>
                    {getDistanceText(flatCoords, userLocation)}
                </Text>
                <Text numberOfLines={2} style={styles.itemDesc}>{Public_Project_Description}</Text>
            </TouchableOpacity>
        );
    }


    return (
        <View style={styles.page}>
            <FlatList
                style={styles.listContainer}
                data={sortedData}
                renderItem={renderListItem}
                keyExtractor={(item) => item.properties?.OBJECTID?.toString() || Math.random().toString()}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1 },
    listContainer: { flex: 1 },
    listItem: {
        padding: 15,
        backgroundColor: 'white',
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    itemDesc: {
        fontSize: 14,
        color: '#666',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
    },
    distanceText: {

    }
});

export default ListScreen;
