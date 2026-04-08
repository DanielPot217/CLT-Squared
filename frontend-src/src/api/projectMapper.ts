import { ProjectFeatureCollection } from "../types/pointTypes";

const mapToGeoJSON = (apiResponse: any[]): ProjectFeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: apiResponse.map(item => ({
      type: 'Feature',
      id: item.id,
      geometry: item.geometry, 
      properties: item.properties 
    }))
  };
};
