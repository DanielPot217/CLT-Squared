import Mapbox, { Camera, CircleLayer, FillLayer, LineLayer, MapView, ShapeSource, StyleURL } from '@rnmapbox/maps';
import { useLocalSearchParams } from 'expo-router';
import { Feature } from 'geojson';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useCharlotteData } from '../src/hooks/useCharlotteData';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "This wont happen");

const DetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { data: geoJSON, loading, error } = useCharlotteData();

  const selectedFeature = geoJSON?.features.find(
    (f) => f.properties?.OBJECTID?.toString() === id
  ) as Feature | undefined;

  const getCoordinates = (f: Feature | undefined): number[] => {
    if (!f) return [-80.8431, 35.2271];
    const geom = f.geometry as any;
    if (geom.type === 'Point') return geom.coordinates;
    if (geom.type === 'Polygon') return geom.coordinates[0][0];
    if (geom.type === 'LineString') return geom.coordinates[0];
    return [-80.8431, 35.2271];
  };

  const [center] = useState(getCoordinates(selectedFeature));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading project...</Text>
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

  if (!selectedFeature) {
    return (
      <View style={styles.container}>
        <Text>Project not found for ID: {id}</Text>
      </View>
    );
  }

  const p = selectedFeature.properties || {};

  return (
    <View style={styles.container}>
      <MapView styleURL={StyleURL.Street} style={styles.mapContainer} logoEnabled={false}>
        <Camera zoomLevel={16} centerCoordinate={center} animationDuration={0} />
        <ShapeSource id="combinedSource" shape={selectedFeature}>
          <FillLayer id="combinedPolygons" filter={['==', ['geometry-type'], 'Polygon']} style={{ fillColor: 'green' }} />
          <LineLayer id="combinedLines" filter={['==', ['geometry-type'], 'LineString']} style={{ lineColor: 'blue' }} />
          <CircleLayer id="combinedPoints" filter={['==', ['geometry-type'], 'Point']} style={{ circleColor: 'red' }} />
        </ShapeSource>
      </MapView>
      <View>
        <Text style={styles.title}>{p.Project_Name || 'Untitled Project'}</Text>
        <Text style={styles.field}><Text style={styles.label}>ID: </Text>{p.OBJECTID}</Text>
        <Text style={styles.field}><Text style={styles.label}>Status: </Text>{p.Status || 'N/A'}</Text>
        <Text style={styles.field}><Text style={styles.label}>Location: </Text>{p.Location_Description || 'N/A'}</Text>
        <Text style={styles.field}><Text style={styles.label}>Budget: </Text>{p.Total_Project_Budget || 'N/A'}</Text>
        <Text style={styles.field}><Text style={styles.label}>Start: </Text>{p.Anticipated_Start_Date || 'N/A'}</Text>
        <Text style={styles.field}><Text style={styles.label}>End: </Text>{p.Anticipated_Compl_Date || 'N/A'}</Text>
        <Text style={[styles.field, { marginTop: 8 }]}>{p.Public_Project_Description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#555' },
  errorText: { fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 8 },
  errorDetail: { fontSize: 14, color: '#666', textAlign: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  field: { fontSize: 14, color: '#333', marginBottom: 4 },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white'
  },

  mapContainer: {
    width: '100%',
    height: 180,
    marginVertical: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },

  detailsSection: {
    marginTop: 10
  },

  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6
  },

  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 10
  },

  label: {
    fontWeight: 'bold'
  },

  detailText: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22
  }
});

export default DetailsScreen;
