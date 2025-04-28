/**
 * Utility functions for validating GIS operations against business rules
 */

/**
 * Check if a point is inside a polygon
 * @param {Point} point - ArcGIS Point geometry
 * @param {Polygon} polygon - ArcGIS Polygon geometry
 * @returns {Promise<boolean>} - True if the point is inside the polygon
 */
export async function isPointInPolygon(point, polygon) {
  try {
    // Import required ArcGIS modules
    const { default: geometryEngine } = await import('@arcgis/core/geometry/geometryEngine');
    return geometryEngine.contains(polygon, point);
  } catch (error) {
    console.error('Error checking if point is in polygon:', error);
    return false;
  }
}

/**
 * Check if two geometries overlap
 * @param {Geometry} geometry1 - ArcGIS geometry
 * @param {Geometry} geometry2 - ArcGIS geometry
 * @returns {Promise<boolean>} - True if geometries overlap
 */
export async function doGeometriesOverlap(geometry1, geometry2) {
  try {
    // Import required ArcGIS modules
    const { default: geometryEngine } = await import('@arcgis/core/geometry/geometryEngine');
    return geometryEngine.overlaps(geometry1, geometry2);
  } catch (error) {
    console.error('Error checking if geometries overlap:', error);
    return false;
  }
}

/**
 * Calculate the intersection of two geometries
 * @param {Geometry} geometry1 - ArcGIS geometry
 * @param {Geometry} geometry2 - ArcGIS geometry
 * @returns {Promise<Geometry>} - Intersection geometry
 */
export async function intersectGeometry(geometry1, geometry2) {
  try {
    // Import required ArcGIS modules
    const { default: geometryEngine } = await import('@arcgis/core/geometry/geometryEngine');
    return geometryEngine.intersect(geometry1, geometry2);
  } catch (error) {
    console.error('Error calculating intersection:', error);
    return null;
  }
}

/**
 * Calculate the difference between two geometries
 * @param {Geometry} geometry1 - Base ArcGIS geometry
 * @param {Geometry} geometry2 - ArcGIS geometry to subtract
 * @returns {Promise<Geometry>} - Difference geometry
 */
export async function differenceGeometry(geometry1, geometry2) {
  try {
    // Import required ArcGIS modules
    const { default: geometryEngine } = await import('@arcgis/core/geometry/geometryEngine');
    return geometryEngine.difference(geometry1, geometry2);
  } catch (error) {
    console.error('Error calculating difference:', error);
    return null;
  }
}

/**
 * Calculate the union of multiple geometries
 * @param {Array<Geometry>} geometries - Array of ArcGIS geometries
 * @returns {Promise<Geometry>} - Union geometry
 */
export async function unionGeometries(geometries) {
  try {
    // Import required ArcGIS modules
    const { default: geometryEngine } = await import('@arcgis/core/geometry/geometryEngine');
    return geometryEngine.union(geometries);
  } catch (error) {
    console.error('Error calculating union:', error);
    return null;
  }
}

/**
 * Calculate area in hectares
 * @param {Polygon} polygon - ArcGIS Polygon geometry
 * @returns {Promise<number>} - Area in hectares
 */
export async function calculateAreaInHectares(polygon) {
  try {
    // Import required ArcGIS modules
    const { default: geometryEngine } = await import('@arcgis/core/geometry/geometryEngine');
    const areaInSquareMeters = geometryEngine.geodesicArea(polygon, 'square-meters');
    // Convert to hectares (1 hectare = 10,000 m²)
    return areaInSquareMeters / 10000;
  } catch (error) {
    console.error('Error calculating area in hectares:', error);
    return 0;
  }
}

/**
 * Check if the property headquarters is inside the property area
 * @param {Point} headquartersPoint - ArcGIS Point geometry for headquarters
 * @param {Polygon} propertyArea - ArcGIS Polygon geometry for property area
 * @returns {Promise<{valid: boolean, message: string}>} - Validation result
 */
export async function validateHeadquartersLocation(headquartersPoint, propertyArea) {
  try {
    const isInside = await isPointInPolygon(headquartersPoint, propertyArea);
    
    if (!isInside) {
      return {
        valid: false,
        message: 'Property Headquarters must be located inside the Property Area.'
      };
    }
    
    return {
      valid: true,
      message: ''
    };
  } catch (error) {
    return {
      valid: false,
      message: `Error validating headquarters location: ${error.message}`
    };
  }
}

/**
 * Check if a consolidated area overlaps with forbidden areas
 * @param {Polygon} consolidatedArea - ArcGIS Polygon geometry for consolidated area
 * @param {Array<Polygon>} nativeVegetationAreas - Array of ArcGIS Polygon geometries for native vegetation
 * @param {Array<Polygon>} adminEasementAreas - Array of ArcGIS Polygon geometries for administrative easement
 * @param {Array<Polygon>} hydrologyAreas - Array of ArcGIS Polygon geometries for hydrology
 * @returns {Promise<{valid: boolean, message: string, clippedGeometry: Polygon}>} - Validation result
 */
export async function validateConsolidatedArea(consolidatedArea, nativeVegetationAreas, adminEasementAreas, hydrologyAreas) {
  try {
    let resultGeometry = consolidatedArea;
    let hasOverlap = false;
    let overlapMessages = [];
    
    // Check overlaps with Native Vegetation
    for (const nvArea of nativeVegetationAreas) {
      const overlaps = await doGeometriesOverlap(resultGeometry, nvArea);
      if (overlaps) {
        hasOverlap = true;
        overlapMessages.push('Native Vegetation');
        
        // Clip the consolidated area
        resultGeometry = await differenceGeometry(resultGeometry, nvArea);
        if (!resultGeometry) {
          return {
            valid: false,
            message: 'Consolidated Area would be completely contained by Native Vegetation areas.',
            clippedGeometry: null
          };
        }
      }
    }
    
    // Check overlaps with Administrative Easement
    for (const aeArea of adminEasementAreas) {
      const overlaps = await doGeometriesOverlap(resultGeometry, aeArea);
      if (overlaps) {
        hasOverlap = true;
        overlapMessages.push('Administrative Easement');
        
        // Clip the consolidated area
        resultGeometry = await differenceGeometry(resultGeometry, aeArea);
        if (!resultGeometry) {
          return {
            valid: false,
            message: 'Consolidated Area would be completely contained by Administrative Easement areas.',
            clippedGeometry: null
          };
        }
      }
    }
    
    // Check overlaps with Hydrology
    for (const hydroArea of hydrologyAreas) {
      const overlaps = await doGeometriesOverlap(resultGeometry, hydroArea);
      if (overlaps) {
        hasOverlap = true;
        overlapMessages.push('Hydrology');
        
        // Clip the consolidated area
        resultGeometry = await differenceGeometry(resultGeometry, hydroArea);
        if (!resultGeometry) {
          return {
            valid: false,
            message: 'Consolidated Area would be completely contained by Hydrology areas.',
            clippedGeometry: null
          };
        }
      }
    }
    
    if (hasOverlap) {
      return {
        valid: true,
        message: `Consolidated Area overlaps with ${overlapMessages.join(', ')}. It has been automatically clipped.`,
        clippedGeometry: resultGeometry
      };
    }
    
    return {
      valid: true,
      message: '',
      clippedGeometry: resultGeometry
    };
  } catch (error) {
    return {
      valid: false,
      message: `Error validating consolidated area: ${error.message}`,
      clippedGeometry: null
    };
  }
}

/**
 * Check if a native vegetation area overlaps with forbidden areas
 * @param {Polygon} nativeVegetationArea - ArcGIS Polygon geometry for native vegetation
 * @param {Array<Polygon>} adminEasementAreas - Array of ArcGIS Polygon geometries for administrative easement
 * @param {Array<Polygon>} hydrologyAreas - Array of ArcGIS Polygon geometries for hydrology
 * @returns {Promise<{valid: boolean, message: string, clippedGeometry: Polygon}>} - Validation result
 */
export async function validateNativeVegetationArea(nativeVegetationArea, adminEasementAreas, hydrologyAreas) {
  try {
    let resultGeometry = nativeVegetationArea;
    let hasOverlap = false;
    let overlapMessages = [];
    
    // Check overlaps with Administrative Easement
    for (const aeArea of adminEasementAreas) {
      const overlaps = await doGeometriesOverlap(resultGeometry, aeArea);
      if (overlaps) {
        hasOverlap = true;
        overlapMessages.push('Administrative Easement');
        
        // Clip the native vegetation area
        resultGeometry = await differenceGeometry(resultGeometry, aeArea);
        if (!resultGeometry) {
          return {
            valid: false,
            message: 'Native Vegetation would be completely contained by Administrative Easement areas.',
            clippedGeometry: null
          };
        }
      }
    }
    
    // Check overlaps with Hydrology
    for (const hydroArea of hydrologyAreas) {
      const overlaps = await doGeometriesOverlap(resultGeometry, hydroArea);
      if (overlaps) {
        hasOverlap = true;
        overlapMessages.push('Hydrology');
        
        // Clip the native vegetation area
        resultGeometry = await differenceGeometry(resultGeometry, hydroArea);
        if (!resultGeometry) {
          return {
            valid: false,
            message: 'Native Vegetation would be completely contained by Hydrology areas.',
            clippedGeometry: null
          };
        }
      }
    }
    
    if (hasOverlap) {
      return {
        valid: true,
        message: `Native Vegetation overlaps with ${overlapMessages.join(', ')}. It has been automatically clipped.`,
        clippedGeometry: resultGeometry
      };
    }
    
    return {
      valid: true,
      message: '',
      clippedGeometry: resultGeometry
    };
  } catch (error) {
    return {
      valid: false,
      message: `Error validating native vegetation area: ${error.message}`,
      clippedGeometry: null
    };
  }
}

/**
 * Check if a fallow area overlaps with forbidden areas
 * @param {Polygon} fallowArea - ArcGIS Polygon geometry for fallow area
 * @param {Array<Polygon>} nativeVegetationAreas - Array of ArcGIS Polygon geometries for native vegetation
 * @param {Array<Polygon>} adminEasementAreas - Array of ArcGIS Polygon geometries for administrative easement
 * @param {Array<Polygon>} hydrologyAreas - Array of ArcGIS Polygon geometries for hydrology
 * @returns {Promise<{valid: boolean, message: string, clippedGeometry: Polygon}>} - Validation result
 */
export async function validateFallowArea(fallowArea, nativeVegetationAreas, adminEasementAreas, hydrologyAreas) {
  try {
    let resultGeometry = fallowArea;
    let hasOverlap = false;
    let overlapMessages = [];
    
    // Check overlaps with Native Vegetation
    for (const nvArea of nativeVegetationAreas) {
      const overlaps = await doGeometriesOverlap(resultGeometry, nvArea);
      if (overlaps) {
        hasOverlap = true;
        overlapMessages.push('Native Vegetation');
        
        // Clip the fallow area
        resultGeometry = await differenceGeometry(resultGeometry, nvArea);
        if (!resultGeometry) {
          return {
            valid: false,
            message: 'Fallow Area would be completely contained by Native Vegetation areas.',
            clippedGeometry: null
          };
        }
      }
    }
    
    // Check overlaps with Administrative Easement
    for (const aeArea of adminEasementAreas) {
      const overlaps = await doGeometriesOverlap(resultGeometry, aeArea);
      if (overlaps) {
        hasOverlap = true;
        overlapMessages.push('Administrative Easement');
        
        // Clip the fallow area
        resultGeometry = await differenceGeometry(resultGeometry, aeArea);
        if (!resultGeometry) {
          return {
            valid: false,
            message: 'Fallow Area would be completely contained by Administrative Easement areas.',
            clippedGeometry: null
          };
        }
      }
    }
    
    // Check overlaps with Hydrology
    for (const hydroArea of hydrologyAreas) {
      const overlaps = await doGeometriesOverlap(resultGeometry, hydroArea);
      if (overlaps) {
        hasOverlap = true;
        overlapMessages.push('Hydrology');
        
        // Clip the fallow area
        resultGeometry = await differenceGeometry(resultGeometry, hydroArea);
        if (!resultGeometry) {
          return {
            valid: false,
            message: 'Fallow Area would be completely contained by Hydrology areas.',
            clippedGeometry: null
          };
        }
      }
    }
    
    if (hasOverlap) {
      return {
        valid: true,
        message: `Fallow Area overlaps with ${overlapMessages.join(', ')}. It has been automatically clipped.`,
        clippedGeometry: resultGeometry
      };
    }
    
    return {
      valid: true,
      message: '',
      clippedGeometry: resultGeometry
    };
  } catch (error) {
    return {
      valid: false,
      message: `Error validating fallow area: ${error.message}`,
      clippedGeometry: null
    };
  }
}

/**
 * Check if an anthropized area is within the property area
 * @param {Polygon} anthropizedArea - ArcGIS Polygon geometry for anthropized area
 * @param {Polygon} propertyArea - ArcGIS Polygon geometry for property area
 * @returns {Promise<{valid: boolean, message: string, clippedGeometry: Polygon}>} - Validation result
 */
export async function validateAnthropizedArea(anthropizedArea, propertyArea) {
  try {
    // Check if the anthropized area is completely outside the property area
    const intersection = await intersectGeometry(anthropizedArea, propertyArea);
    
    if (!intersection) {
      return {
        valid: false,
        message: 'Anthropized Area must be within the Property Area.',
        clippedGeometry: null
      };
    }
    
    // Check if the anthropized area extends beyond the property area
    const isFullyContained = intersection.equals(anthropizedArea);
    
    if (!isFullyContained) {
      return {
        valid: true,
        message: 'Anthropized Area has been clipped to the Property Area boundaries.',
        clippedGeometry: intersection
      };
    }
    
    return {
      valid: true,
      message: '',
      clippedGeometry: anthropizedArea
    };
  } catch (error) {
    return {
      valid: false,
      message: `Error validating anthropized area: ${error.message}`,
      clippedGeometry: null
    };
  }
}

/**
 * Validate that the entire property area is covered by land cover layers
 * @param {Polygon} propertyArea - ArcGIS Polygon geometry for property area
 * @param {Array<Polygon>} landCoverAreas - Array of ArcGIS Polygon geometries for all land cover types
 * @returns {Promise<{valid: boolean, message: string, uncoveredGeometry: Polygon}>} - Validation result
 */
export async function validatePropertyCoverage(propertyArea, landCoverAreas) {
  try {
    // Union all land cover areas
    const unionLandCover = await unionGeometries(landCoverAreas);
    
    if (!unionLandCover) {
      return {
        valid: false,
        message: 'No land cover areas found.',
        uncoveredGeometry: propertyArea
      };
    }
    
    // Find uncovered areas
    const uncoveredArea = await differenceGeometry(propertyArea, unionLandCover);
    
    if (uncoveredArea && uncoveredArea.rings && uncoveredArea.rings.length > 0) {
      // Calculate uncovered area in hectares
      const uncoveredAreaHa = await calculateAreaInHectares(uncoveredArea);
      
      return {
        valid: false,
        message: `Property Area is not completely covered. Approximately ${uncoveredAreaHa.toFixed(2)} hectares remain uncovered.`,
        uncoveredGeometry: uncoveredArea
      };
    }
    
    return {
      valid: true,
      message: 'Property Area is completely covered by land cover layers.',
      uncoveredGeometry: null
    };
  } catch (error) {
    return {
      valid: false,
      message: `Error validating property coverage: ${error.message}`,
      uncoveredGeometry: null
    };
  }
}

/**
 * Validate a geometry before adding it to a layer
 * @param {string} layerId - Layer ID
 * @param {Object} geometry - ArcGIS geometry
 * @param {Object} layers - All layers with their features
 * @returns {Promise<{valid: boolean, message: string, geometry: Object}>} - Validation result
 */
export async function validateGeometryForLayer(layerId, geometry, layers) {
  try {
    // Get property area
    const propertyAreaLayer = layers.find(l => l.id === 'property-area');
    const propertyAreaGeometry = propertyAreaLayer && propertyAreaLayer.features.length > 0 
      ? propertyAreaLayer.features[0].geometry 
      : null;
    
    // For all layers except property area, check if property area exists
    if (layerId !== 'property-area' && !propertyAreaGeometry) {
      return {
        valid: false,
        message: 'Property Area must be defined before adding other layers.',
        geometry: null
      };
    }
    
    // Check specific validation rules based on layer type
    switch (layerId) {
      case 'property-headquarters':
        return await validateHeadquartersLocation(geometry, propertyAreaGeometry);
        
      case 'consolidated-area':
        // Get native vegetation areas
        const nativeVegLayer = layers.find(l => l.id === 'native-vegetation');
        const nativeVegAreas = nativeVegLayer ? nativeVegLayer.features.map(f => f.geometry) : [];
        
        // Check if consolidated area is within property area
        const consolidatedAreaInProperty = await intersectGeometry(geometry, propertyAreaGeometry);
        if (!consolidatedAreaInProperty) {
          return {
            valid: false,
            message: 'Consolidated Area must be within Property Area.',
            geometry: null
          };
        }
        
        // Validate against overlaps
        return await validateConsolidatedArea(
          consolidatedAreaInProperty,
          nativeVegAreas,
          [], // Administrative easement (not included in this example)
          []  // Hydrology (not included in this example)
        );
        
      case 'native-vegetation':
        // Check if native vegetation is within property area
        const nativeVegInProperty = await intersectGeometry(geometry, propertyAreaGeometry);
        if (!nativeVegInProperty) {
          return {
            valid: false,
            message: 'Native Vegetation must be within Property Area.',
            geometry: null
          };
        }
        
        // Validate against overlaps
        return await validateNativeVegetationArea(
          nativeVegInProperty,
          [], // Administrative easement (not included in this example)
          []  // Hydrology (not included in this example)
        );
        
      case 'fallow-area':
        // Get native vegetation areas
        const nativeVegLayerForFallow = layers.find(l => l.id === 'native-vegetation');
        const nativeVegAreasForFallow = nativeVegLayerForFallow 
          ? nativeVegLayerForFallow.features.map(f => f.geometry) 
          : [];
        
        // Check if fallow area is within property area
        const fallowAreaInProperty = await intersectGeometry(geometry, propertyAreaGeometry);
        if (!fallowAreaInProperty) {
          return {
            valid: false,
            message: 'Fallow Area must be within Property Area.',
            geometry: null
          };
        }
        
        // Validate against overlaps
        return await validateFallowArea(
          fallowAreaInProperty,
          nativeVegAreasForFallow,
          [], // Administrative easement (not included in this example)
          []  // Hydrology (not included in this example)
        );
        
      case 'anthropized-area':
        // Check if anthropized area is within property area
        return await validateAnthropizedArea(geometry, propertyAreaGeometry);
        
      default:
        // For other layers, just return the geometry
        return {
          valid: true,
          message: '',
          geometry: geometry
        };
    }
  } catch (error) {
    console.error('Error validating geometry for layer:', error);
    return {
      valid: false,
      message: `Validation error: ${error.message}`,
      geometry: null
    };
  }
}

// Export all validation functions
export default {
  isPointInPolygon,
  doGeometriesOverlap,
  intersectGeometry,
  differenceGeometry,
  unionGeometries,
  calculateAreaInHectares,
  validateHeadquartersLocation,
  validateConsolidatedArea,
  validateNativeVegetationArea,
  validateFallowArea,
  validateAnthropizedArea,
  validatePropertyCoverage,
  validateGeometryForLayer
};