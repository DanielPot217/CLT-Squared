/**
 * Fetches project + geometry data from the CLT-Squared backend,
 * merges them into a GeoJSON FeatureCollection, and caches the result
 * to AsyncStorage. The cache is refreshed at most once per day.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeatureCollection, Geometry } from 'geojson';

// ─── Config ────────────────────────────────────────────────────────────────

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://ec2-13-59-74-87.us-east-2.compute.amazonaws.com:3100';

const CACHE_KEY = 'clt_geojson_cache';
const CACHE_TIMESTAMP_KEY = 'clt_geojson_cache_timestamp';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Types ──────────────────────────────────────────────────────────────────

interface Project {
  project_id: number;
  name: string;
  description: string;
  location_description: string;
  start_date: string;
  end_date: string;
  status: string;
  budget: string;
  created_at: string;
}

interface Geometric {
  id: number;
  project_id: number;
  features: Geometry;
  created_at: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchJSON<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`API error ${response.status} on ${path}`);
  }
  return response.json();
}

/**
 * Merges projects and geometrics into a GeoJSON FeatureCollection.
 * Each feature's properties mirror the old mockData field names so
 * the existing map/list/details screens work without changes.
 */
function buildFeatureCollection(
  projects: Project[],
  geometrics: Geometric[]
): FeatureCollection {
  const projectMap = new Map(projects.map((p) => [p.project_id, p]));

  const features = geometrics
    .filter((g) => g.features && projectMap.has(g.project_id))
    .map((g) => {
      const p = projectMap.get(g.project_id)!;
      return {
        type: 'Feature' as const,
        id: g.id,
        geometry: g.features,
        properties: {
          // New field names (for future use)
          project_id: p.project_id,
          name: p.name,
          description: p.description,
          location_description: p.location_description,
          start_date: p.start_date,
          end_date: p.end_date,
          status: p.status,
          budget: p.budget,

          // Legacy field names — keeps existing screens working unchanged
          OBJECTID: p.project_id,
          Project_Name: p.name,
          Public_Project_Description: p.description,
          Location_Description: p.location_description,
          Anticipated_Start_Date: p.start_date,
          Anticipated_Compl_Date: p.end_date,
          Status: p.status,
          Total_Project_Budget: p.budget,
        },
      };
    });

  return { type: 'FeatureCollection', features };
}

// ─── Cache ──────────────────────────────────────────────────────────────────

async function readCache(): Promise<FeatureCollection | null> {
  try {
    const [cached, ts] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEY),
      AsyncStorage.getItem(CACHE_TIMESTAMP_KEY),
    ]);

    if (!cached || !ts) return null;

    const age = Date.now() - parseInt(ts, 10);
    if (age > CACHE_TTL_MS) return null;

    return JSON.parse(cached) as FeatureCollection;
  } catch {
    return null;
  }
}

async function writeCache(data: FeatureCollection): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data)),
      AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString()),
    ]);
  } catch (e) {
    console.warn('Failed to write cache:', e);
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Returns a GeoJSON FeatureCollection from cache if fresh (<24 h),
 * otherwise fetches from the API, writes to cache, and returns it.
 *
 * Pass `forceRefresh = true` to bypass the TTL check.
 */
export async function getProjectGeoJSON(
  forceRefresh = false
): Promise<FeatureCollection> {
  if (!forceRefresh) {
    const cached = await readCache();
    if (cached) {
      console.log('[apiClient] Serving from cache');
      return cached;
    }
  }

  console.log('[apiClient] Fetching from API...');

  const [projectsRes, geometricsRes] = await Promise.all([
    fetchJSON<{ success: boolean; projects: Project[] }>('/api/projects'),
    fetchJSON<{ success: boolean; geometrics: Geometric[] }>('/api/geometrics'),
  ]);

  const featureCollection = buildFeatureCollection(
    projectsRes.projects,
    geometricsRes.geometrics
  );

  await writeCache(featureCollection);
  return featureCollection;
}

/**
 * Returns the timestamp of the last successful API fetch,
 * or null if the cache has never been populated.
 */
export async function getCacheTimestamp(): Promise<Date | null> {
  try {
    const ts = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    return ts ? new Date(parseInt(ts, 10)) : null;
  } catch {
    return null;
  }
}

/**
 * Clears the cache, forcing a fresh API fetch on next call.
 */
export async function clearCache(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(CACHE_KEY),
    AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY),
  ]);
}
