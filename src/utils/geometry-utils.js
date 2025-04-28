/**
 * Utility functions for geometry operations
 */

/**
 * Clip a geometry to a boundary
 * @param {Geometry} geometry - ArcGIS geometry to clip
 * @param {Polygon} boundary - ArcGIS Polygon boundary
 * @returns {Promise<Geometry>} - Clipped geometry
 */
export function clipGeometry(geometry, boundary) {
  return import('@arcgis/core/geometry/geometryEngine').then(({ default: geometryEngine }) => {
    return geometryEngine.clip(geometry, boundary);
  });
}

/**
 * Calculate length in meters
 * @param {Polyline} polyline - ArcGIS Polyline geometry
 * @returns {Promise<number>} - Length in meters
 */
export function calculateLengthInMeters(polyline) {
  return import('@arcgis/core/geometry/geometryEngine').then(({ default: geometryEngine }) => {
    return geometryEngine.geodesicLength(polyline, 'meters');
  });
}

/**
 * Create a buffer around a geometry
 * @param {Geometry} geometry - ArcGIS geometry
 * @param {number} distance - Buffer distance in meters
 * @returns {Promise<Geometry>} - Buffered geometry
 */
export function bufferGeometry(geometry, distance) {
  return import('@arcgis/core/geometry/geometryEngine').then(({ default: geometryEngine }) => {
    return geometryEngine.buffer(geometry, distance, 'meters');
  });
}

/**
 * Convert a GeoJSON geometry to an ArcGIS geometry
 * @param {Object} geojson - GeoJSON geometry
 * @returns {Promise<Geometry>} - ArcGIS geometry
 */
export function geojsonToArcGIS(geojson) {
  return import('@arcgis/core/geometry/support/jsonUtils').then(({ default: jsonUtils }) => {
    return jsonUtils.fromGeoJSON(geojson);
  });
}

/**
 * Convert an ArcGIS geometry to GeoJSON
 * @param {Geometry} geometry - ArcGIS geometry
 * @returns {Object} - GeoJSON geometry
 */
export function arcgisToGeoJSON(geometry) {
  return {
    type: getGeoJSONType(geometry.type),
    coordinates: geometry.toJSON().rings || geometry.toJSON().paths || [geometry.toJSON().x, geometry.toJSON().y]
  };
}

/**
 * Get the GeoJSON type for an ArcGIS geometry type
 * @param {string} arcgisType - ArcGIS geometry type
 * @returns {string} - GeoJSON type
 */
function getGeoJSONType(arcgisType) {
  switch (arcgisType) {
    case 'point':
      return 'Point';
    case 'polyline':
      return 'LineString';
    case 'polygon':
      return 'Polygon';
    case 'multipoint':
      return 'MultiPoint';
    case 'multipolygon':
      return 'MultiPolygon';
    default:
      return arcgisType;
  }
}