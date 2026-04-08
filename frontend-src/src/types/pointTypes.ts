export interface ProjectGeometry {
  type: 'Point' | 'LineString' | 'Polygon';
  coordinates: any; 
}

interface ProjectData {
    id: number;
    name: string | null;
    location_description: string | null;
    project_type: string | null;
    project_phase: string | null;
    anticipated_start_date: string | null;
    anticipated_start_date_year: string | null;
    anticipated_compl_date: string | null;
    anticipated_compl_date_year: string | null;
    total_project_budget: string | null;
}

export interface ProjectFeature {
  id: number;
  type: 'Feature';
  geometry: ProjectGeometry;
  properties: ProjectData; 
}

export interface ProjectFeatureCollection {
  type: 'FeatureCollection';
  features: ProjectFeature[];
}
