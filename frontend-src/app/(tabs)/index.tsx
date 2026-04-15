import Ionicons from '@expo/vector-icons/Ionicons';
import Mapbox, { Camera, CircleLayer, FillLayer, LineLayer, MapView, ShapeSource, StyleURL, UserLocation, UserTrackingMode } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCharlotteData } from '../../src/hooks/useCharlotteData';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "This wont happen");

const CharlotteMapTest = () => {
  const CLT_CENTER = [-80.8431, 35.2271];
  const router = useRouter();
  const [followUser, setFollowUser] = useState(true);
  const [showPolygons, setShowPolygons] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);

  const { data: geoJSON, loading, error } = useCharlotteData();

  useState(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const result = await Location.getCurrentPositionAsync({});
        setUserLocation(result.coords);
      }
    })();
  });

  const activeGeoJSON = useMemo(() => {
    if (!geoJSON) return { type: 'FeatureCollection' as const, features: [] };
    return {
      ...geoJSON,
      features: geoJSON.features.filter(f => f.properties?.Status !== 'archive'),
    };
  }, [geoJSON]);

  const cameraRef = useRef<Camera>(null);

  const handlePress = (e: any) => {
    const feature = e.features[0];
    if (feature && feature.properties) {
      const id = feature.properties.OBJECTID;
      router.push({ pathname: '/details', params: { id } });
    }
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
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <MapView style={styles.map} styleURL={StyleURL.Street} logoEnabled={false}>
        <Camera
          zoomLevel={13}
          defaultSettings={{ centerCoordinate: CLT_CENTER }}
          animationDuration={0}
          followUserLocation={followUser}
          followUserMode={UserTrackingMode.Follow}
          ref={cameraRef}
          followZoomLevel={13}
          onUserTrackingModeChange={(event) => {
            if (!event.nativeEvent.payload.followUserLocation) {
              setFollowUser(false);
            }
          }}
        />
        <ShapeSource id="combinedSource" shape={activeGeoJSON} onPress={handlePress}>
          <FillLayer
            id="combinedPolygons"
            filter={['==', ['geometry-type'], 'Polygon']}
            style={{ fillColor: 'green', fillOpacity: 0.4, lineBorderColor: 'black', lineBorderWidth: 2, visibility: showPolygons ? 'visible' : 'none' }}
          />
          <LineLayer
            id="polygonOutline"
            filter={['==', ['geometry-type'], 'Polygon']}
            style={{ lineColor: 'green', lineWidth: 3, lineJoin: 'round', visibility: showPolygons ? 'visible' : 'none' }}
          />
          <LineLayer
            id="combinedLines"
            filter={['==', ['geometry-type'], 'LineString']}
            style={{ lineColor: 'blue', visibility: showLines ? 'visible' : 'none' }}
          />
          <CircleLayer
            id="combinedPoints"
            filter={['==', ['geometry-type'], 'Point']}
            style={{ circleColor: 'red', visibility: showPoints ? 'visible' : 'none' }}
          />
        </ShapeSource>
        <UserLocation visible={true} />
      </MapView>

      <View style={styles.layerControlContainer}>
        <TouchableOpacity style={[styles.floatingButton, !showPoints && styles.buttonDisabled]} onPress={() => setShowPoints(!showPoints)}>
          <Text style={styles.buttonText}>Points</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.floatingButton, !showLines && styles.buttonDisabled]} onPress={() => setShowLines(!showLines)}>
          <Text style={styles.buttonText}>Lines</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.floatingButton, !showPolygons && styles.buttonDisabled]} onPress={() => setShowPolygons(!showPolygons)}>
          <Text style={styles.buttonText}>Polygons</Text>
        </TouchableOpacity>
      </View>

      {!followUser && (
        <TouchableOpacity style={styles.recenterButton} onPress={() => setFollowUser(true)}>
          <Text style={styles.buttonText}><Ionicons name="location" color={"grey"} size={32} /></Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CharlotteMapTest;

const styles = StyleSheet.create({
  page: { flex: 1 },
  map: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#555' },
  errorText: { fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 8 },
  errorDetail: { fontSize: 14, color: '#666', textAlign: 'center' },
  layerControlContainer: { position: 'absolute', top: 50, right: 15, gap: 10 },
  floatingButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  recenterButton: {
    position: 'absolute',
    bottom: 30,
    right: 15,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
