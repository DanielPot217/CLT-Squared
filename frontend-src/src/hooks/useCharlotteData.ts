/**
 * Hook that returns the GeoJSON FeatureCollection.
 * Serves from the 24-hour cache when available, otherwise
 * fetches fresh data from the API.
 */

import { getProjectGeoJSON } from '@/src/api/apiClient';
import { FeatureCollection } from 'geojson';
import { useEffect, useState } from 'react';

interface UseCharlotteDataResult {
  data: FeatureCollection | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCharlotteData(forceRefresh = false): UseCharlotteDataResult {
  const [data, setData] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const geoJSON = await getProjectGeoJSON(force);
      setData(geoJSON);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(forceRefresh);
  }, []);

  const refresh = () => load(true);

  return { data, loading, error, refresh };
}
