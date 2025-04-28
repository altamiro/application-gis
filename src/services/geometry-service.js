/**
 * Service for geometry operations using ArcGIS geometry engine
 */
import { 
  clipGeometry
} from '@/utils/geometry-utils';

import { 
  differenceGeometry,
  intersectGeometry,
  unionGeometries,
  calculateAreaInHectares
} from '@/utils/validation-utils';

/**
 * Create a polygon from an array of points
 * @param {Array<Array<number>>} points - Array of [x, y] coordinates
 * @param {Object} spatialReference - Spatial reference information
 * @returns {Promise<Object>} - ArcGIS Polygon geometry
 */
export async function createPolygon(points, spatialReference = { wkid: 4326 }) {
  try {
    // Import required ArcGIS modules
    const { default: Polygon } = await import('@arcgis/core/geometry/Polygon');
    
    // Create the polygon
    const polygon = new Polygon({
      rings: [points],
      spatialReference
    });
    
    return polygon;
  } catch (error) {
    console.error('Error creating polygon:', error);
    throw error;
  }
}

/**
 * Create a point geometry
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} spatialReference - Spatial reference information
 * @returns {Promise<Object>} - ArcGIS Point geometry
 */
export async function createPoint(x, y, spatialReference = { wkid: 4326 }) {
  try {
    // Import required ArcGIS modules
    const { default: Point } = await import('@arcgis/core/geometry/Point');
    
    // Create the point
    const point = new Point({
      x,
      y,
      spatialReference
    });
    
    return point;
  } catch (error) {
    console.error('Error creating point:', error);
    throw error;
  }
}

/**
 * Create a polyline geometry
 * @param {Array<Array<number>>} paths - Array of paths, each containing [x, y] coordinates
 * @param {Object} spatialReference - Spatial reference information
 * @returns {Promise<Object>} - ArcGIS Polyline geometry
 */
export async function createPolyline(paths, spatialReference = { wkid: 4326 }) {
  try {
    // Import required ArcGIS modules
    const { default: Polyline } = await import('@arcgis/core/geometry/Polyline');
    
    // Create the polyline
    const polyline = new Polyline({
      paths,
      spatialReference
    });
    
    return polyline;
  } catch (error) {
    console.error('Error creating polyline:', error);
    throw error;
  }
}

/**
 * Calculate area of a polygon in hectares
 * @param {Object} polygon - ArcGIS Polygon geometry
 * @returns {Promise<number>} - Area in hectares
 */
export async function calculateArea(polygon) {
  try {
    return await calculateAreaInHectares(polygon);
  } catch (error) {
    console.error('Error calculating area:', error);
    throw error;
  }
}

/**
 * Check if a polygon is valid
 * @param {Object} polygon - ArcGIS Polygon geometry
 * @returns {Promise<boolean>} - True if the polygon is valid
 */
export async function isValidPolygon(polygon) {
  try {
    // Import required ArcGIS modules
    const { default: geometryEngine } = await import('@arcgis/core/geometry/geometryEngine');
    
    // Check if the polygon is valid
    return geometryEngine.isSimple(polygon);
  } catch (error) {
    console.error('Error checking polygon validity:', error);
    return false;
  }
}

/**
 * Simplify a polygon geometry
 * @param {Object} polygon - ArcGIS Polygon geometry
 * @returns {Promise<Object>} - Simplified geometry
 */
export async function simplifyGeometry(polygon) {
  try {
    // Import required ArcGIS modules
    const { default: geometryEngine } = await import('@arcgis/core/geometry/geometryEngine');
    
    // Simplify the geometry
    return geometryEngine.simplify(polygon);
  } catch (error) {
    console.error('Error simplifying geometry:', error);
    throw error;
  }
}

/**
 * Convert a polygon to a multipolygon
 * @param {Object} polygon - ArcGIS Polygon geometry
 * @returns {Promise<Object>} - ArcGIS Polygon with multiple rings (multipolygon)
 */
export async function toMultiPolygon(polygon) {
  try {
    // Import required ArcGIS modules
    const { default: Polygon } = await import('@arcgis/core/geometry/Polygon');
    
    // Create a new polygon with the same properties
    const multiPolygon = new Polygon({
      rings: polygon.rings,
      spatialReference: polygon.spatialReference
    });
    
    // Set the type property
    multiPolygon.type = 'multipolygon';
    
    return multiPolygon;
  } catch (error) {
    console.error('Error converting to multipolygon:', error);
    throw error;
  }
}

/**
 * Clip a geometry to a boundary
 * @param {Object} geometry - ArcGIS geometry to clip
 * @param {Object} boundary - ArcGIS Polygon boundary
 * @returns {Promise<Object>} - Clipped geometry
 */
export async function clipToGeometry(geometry, boundary) {
  try {
    return await clipGeometry(geometry, boundary);
  } catch (error) {
    console.error('Error clipping geometry:', error);
    throw error;
  }
}

/**
 * Calculate the intersection between two geometries
 * @param {Object} geometry1 - First ArcGIS geometry
 * @param {Object} geometry2 - Second ArcGIS geometry
 * @returns {Promise<Object>} - Intersection geometry
 */
export async function intersect(geometry1, geometry2) {
  try {
    return await intersectGeometry(geometry1, geometry2);
  } catch (error) {
    console.error('Error calculating intersection:', error);
    throw error;
  }
}

/**
 * Calculate the difference between two geometries
 * @param {Object} geometry1 - Base ArcGIS geometry
 * @param {Object} geometry2 - ArcGIS geometry to subtract
 * @returns {Promise<Object>} - Difference geometry
 */
export async function difference(geometry1, geometry2) {
  try {
    return await differenceGeometry(geometry1, geometry2);
  } catch (error) {
    console.error('Error calculating difference:', error);
    throw error;
  }
}

/**
 * Calculate the union of multiple geometries
 * @param {Array<Object>} geometries - Array of ArcGIS geometries
 * @returns {Promise<Object>} - Union geometry
 */
export async function union(geometries) {
  try {
    return await unionGeometries(geometries);
  } catch (error) {
    console.error('Error calculating union:', error);
    throw error;
  }
}

export default {
  createPolygon,
  createPoint,
  createPolyline,
  calculateArea,
  isValidPolygon,
  simplifyGeometry,
  toMultiPolygon,
  clipToGeometry,
  intersect,
  difference,
  union
};