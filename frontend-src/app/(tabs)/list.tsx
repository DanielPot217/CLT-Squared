import { useCharlotteData } from '@/src/hooks/useCharlotteData';
import { useSortedProjects } from '@/src/hooks/useSortedProjects';
import * as Location from 'expo-location';
import { LocationObjectCoords } from 'expo-location';
import { useRouter } from 'expo-router';
import { Feature, Geometry } from 'geojson';
import * as geolib from 'geolib';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ListScreen = () => {
  const router = useRouter();
  const { data: geoJSON, loading, error, refresh } = useCharlotteData();
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

  const sortedData = useSortedProjects(geoJSON?.features ?? [], userLocation);

  const getDistanceText = (featureCoord: number[] | null, userLocation: LocationObjectCoords | null): string => {
    if (!userLocation || !featureCoord || featureCoord.length < 2) return 'Distance unknown';
    try {
      const distanceInMeters = geolib.getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: featureCoord[1], longitude: featureCoord[0] }
      );
      const miles = distanceInMeters * 0.000621371;
      return `${miles.toFixed(1)} miles away`;
    } catch {
      return 'Distance error';
    }
  };

  const renderListItem = ({ item }: { item: Feature<Geometry> }) => {
    const { Project_Name, Public_Project_Description, OBJECTID, Location_Description } = item.properties || {};
    const coords = (item.geometry as any).coordinates;
    const flatCoords = Array.isArray(coords[0]) ? coords[0][0] : coords;

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => router.push({ pathname: '/details', params: { id: OBJECTID } })}
      >
        <Text style={styles.itemTitle}>{Project_Name || 'Untitled Project'}</Text>
        <Text style={styles.distanceText}>{getDistanceText(flatCoords, userLocation)}</Text>
        <Text numberOfLines={2} style={styles.itemDesc}>{Public_Project_Description}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load data</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
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
};

const styles = StyleSheet.create({
  page: { flex: 1 },
  listContainer: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#555' },
  errorText: { fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 8 },
  errorDetail: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: 'white', fontWeight: 'bold' },
  listItem: { padding: 15, backgroundColor: 'white' },
  itemTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  itemDesc: { fontSize: 14, color: '#666' },
  separator: { height: 1, backgroundColor: '#eee' },
  distanceText: {},
});

export default ListScreen;
