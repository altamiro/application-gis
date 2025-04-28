/**
 * Service for managing GIS layers
 */
import { 
  ValidationUtils,
  differenceGeometry,
  intersectGeometry,
  doGeometriesOverlap
} from '@/utils/validation-utils';

/**
 * Create a new layer graphic
 * @param {Object} layer - Layer configuration
 * @param {Object} geometry - ArcGIS geometry
 * @returns {Promise<Object>} - Graphic configuration
 */
export async function createLayerGraphic(layer, geometry) {
  try {
    // Import required ArcGIS modules
    const [
      { default: Graphic },
      { default: SimpleFillSymbol },
      { default: SimpleLineSymbol },
      { default: SimpleMarkerSymbol }
    ] = await Promise.all([
      import('@arcgis/core/Graphic'),
      import('@arcgis/core/symbols/SimpleFillSymbol'),
      import('@arcgis/core/symbols/SimpleLineSymbol'),
      import('@arcgis/core/symbols/SimpleMarkerSymbol')
    ]);
    
    // Create symbol based on layer type
    let symbol;
    
    if (layer.geometryType === 'point') {
      symbol = new SimpleMarkerSymbol({
        color: layer.style.color,
        size: layer.style.size,
        outline: new SimpleLineSymbol({
          color: layer.style.outlineColor,
          width: layer.style.outlineWidth
        })
      });
    } else {
      symbol = new SimpleFillSymbol({
        color: layer.style.fillColor,
        outline: new SimpleLineSymbol({
          color: layer.style.outlineColor,
          width: layer.style.outlineWidth
        })
      });
    }
    
    // Create the graphic
    const graphic = new Graphic({
      geometry,
      symbol,
      attributes: {
        id: Date.now().toString(),
        layerId: layer.id
      }
    });
    
    return graphic;
  } catch (error) {
    console.error('Error creating layer graphic:', error);
    throw error;
  }
}

/**
 * Validate geometry against layer rules
 * @param {string} layerId - Layer ID
 * @param {Object} geometry - ArcGIS geometry
 * @param {Array<Object>} layers - All layers with their features
 * @returns {Promise<{valid: boolean, message: string, geometry: Object}>} - Validation result
 */
export async function validateLayerGeometry(layerId, geometry, layers) {
  try {
    // Get property area
    const propertyAreaLayer = layers.find(l => l.id === 'property-area');
    const propertyAreaFeature = propertyAreaLayer && propertyAreaLayer.features.length > 0 
      ? propertyAreaLayer.features[0] 
      : null;
    
    // For all layers except property area, check if property area exists
    if (layerId !== 'property-area' && !propertyAreaFeature) {
      return {
        valid: false,
        message: 'Property Area must be drawn first.',
        geometry: null
      };
    }
    
    // Validate based on layer type
    switch (layerId) {
      case 'property-headquarters':
        // Property headquarters must be inside property area
        if (propertyAreaFeature) {
          const result = await ValidationUtils.validateHeadquartersLocation(
            geometry, 
            propertyAreaFeature.geometry
          );
          
          return {
            valid: result.valid,
            message: result.message,
            geometry: result.valid ? geometry : null
          };
        }
        break;
        
      case 'consolidated-area':
        // Consolidated area cannot overlap with native vegetation, admin easement, or hydrology
        if (propertyAreaFeature) {
          // First clip to property area
          const clippedToProperty = await intersectGeometry(geometry, propertyAreaFeature.geometry);
          
          if (!clippedToProperty) {
            return {
              valid: false,
              message: 'Consolidated Area must be within Property Area.',
              geometry: null
            };
          }
          
          // Get native vegetation areas
          const nativeVegLayer = layers.find(l => l.id === 'native-vegetation');
          const nativeVegAreas = nativeVegLayer ? nativeVegLayer.features.map(f => f.geometry) : [];
          
          // Get administrative easement areas (not in requirements but prepared for future)
          const adminEasementAreas = [];
          
          // Get hydrology areas (not in requirements but prepared for future)
          const hydrologyAreas = [];
          
          // Validate against the rules
          const result = await ValidationUtils.validateConsolidatedArea(
            clippedToProperty,
            nativeVegAreas,
            adminEasementAreas,
            hydrologyAreas
          );
          
          return {
            valid: result.valid,
            message: result.message,
            geometry: result.clippedGeometry
          };
        }
        break;
        
      case 'native-vegetation':
        // Native vegetation must prevail over other areas
        if (propertyAreaFeature) {
          // First clip to property area
          const clippedToProperty = await intersectGeometry(geometry, propertyAreaFeature.geometry);
          
          if (!clippedToProperty) {
            return {
              valid: false,
              message: 'Native Vegetation must be within Property Area.',
              geometry: null
            };
          }
          
          // Get administrative easement areas (not in requirements but prepared for future)
          const adminEasementAreas = [];
          
          // Get hydrology areas (not in requirements but prepared for future)
          const hydrologyAreas = [];
          
          // Validate against the rules
          const result = await ValidationUtils.validateNativeVegetationArea(
            clippedToProperty,
            adminEasementAreas,
            hydrologyAreas
          );
          
          // If valid, update other overlapping layers
          if (result.valid && result.clippedGeometry) {
            await updateOverlappingLayers(result.clippedGeometry, layers);
          }
          
          return {
            valid: result.valid,
            message: result.message,
            geometry: result.clippedGeometry
          };
        }
        break;
        
      case 'fallow-area':
        // Fallow area must be clipped when overlapping with native vegetation, admin easement, or hydrology
        if (propertyAreaFeature) {
          // First clip to property area
          const clippedToProperty = await intersectGeometry(geometry, propertyAreaFeature.geometry);
          
          if (!clippedToProperty) {
            return {
              valid: false,
              message: 'Fallow Area must be within Property Area.',
              geometry: null
            };
          }
          
          // Get native vegetation areas
          const nativeVegLayer = layers.find(l => l.id === 'native-vegetation');
          const nativeVegAreas = nativeVegLayer ? nativeVegLayer.features.map(f => f.geometry) : [];
          
          // Get administrative easement areas (not in requirements but prepared for future)
          const adminEasementAreas = [];
          
          // Get hydrology areas (not in requirements but prepared for future)
          const hydrologyAreas = [];
          
          // Validate against the rules
          const result = await ValidationUtils.validateFallowArea(
            clippedToProperty,
            nativeVegAreas,
            adminEasementAreas,
            hydrologyAreas
          );
          
          return {
            valid: result.valid,
            message: result.message,
            geometry: result.clippedGeometry
          };
        }
        break;
        
      case 'anthropized-area':
        // Anthropized area must be within property area
        if (propertyAreaFeature) {
          const result = await ValidationUtils.validateAnthropizedArea(
            geometry,
            propertyAreaFeature.geometry
          );
          
          return {
            valid: result.valid,
            message: result.message,
            geometry: result.clippedGeometry
          };
        }
        break;
        
      default:
        // For any other layer, just return the geometry as valid
        return {
          valid: true,
          message: '',
          geometry: geometry
        };
    }
    
    // Default return
    return {
      valid: true,
      message: '',
      geometry: geometry
    };
  } catch (error) {
    console.error('Error validating layer geometry:', error);
    return {
      valid: false,
      message: `Error validating geometry: ${error.message}`,
      geometry: null
    };
  }
}

/**
 * Update overlapping layers when a new native vegetation area is added
 * @param {Object} nativeVegGeometry - New native vegetation geometry
 * @param {Array<Object>} layers - All layers with their features
 * @returns {Promise<void>}
 */
async function updateOverlappingLayers(nativeVegGeometry, layers) {
  try {
    const overlappingLayerIds = [
      'consolidated-area',
      'fallow-area',
      'anthropized-area'
    ];
    
    for (const layerId of overlappingLayerIds) {
      const layer = layers.find(l => l.id === layerId);
      if (!layer || !layer.features || layer.features.length === 0) continue;
      
      // Update each feature in the layer
      for (const feature of layer.features) {
        // Check if the feature overlaps with the native vegetation
        const overlaps = await doGeometriesOverlap(feature.geometry, nativeVegGeometry);
        
        if (overlaps) {
          // Update the feature by subtracting the native vegetation
          const updatedGeometry = await differenceGeometry(feature.geometry, nativeVegGeometry);
          
          // If there's geometry left, update the feature
          if (updatedGeometry) {
            feature.geometry = updatedGeometry;
          } else {
            // If no geometry left, mark for removal
            feature.toRemove = true;
          }
        }
      }
      
      // Remove features marked for removal
      layer.features = layer.features.filter(f => !f.toRemove);
    }
  } catch (error) {
    console.error('Error updating overlapping layers:', error);
  }
}

/**
 * Check if property area is fully covered by land cover layers
 * @param {Array<Object>} layers - All layers with their features
 * @returns {Promise<{valid: boolean, message: string, uncoveredGeometry: Object}>} - Validation result
 */
export async function validatePropertyCoverage(layers) {
  try {
    // Get property area
    const propertyAreaLayer = layers.find(l => l.id === 'property-area');
    const propertyAreaFeature = propertyAreaLayer && propertyAreaLayer.features.length > 0 
      ? propertyAreaLayer.features[0] 
      : null;
    
    if (!propertyAreaFeature) {
      return {
        valid: false,
        message: 'Property Area not defined.',
        uncoveredGeometry: null
      };
    }
    
    // Get all land cover layers
    const landCoverLayerIds = [
      'consolidated-area',
      'native-vegetation',
      'fallow-area',
      'anthropized-area'
    ];
    
    // Collect all land cover geometries
    const landCoverGeometries = [];
    
    for (const layerId of landCoverLayerIds) {
      const layer = layers.find(l => l.id === layerId);
      if (layer && layer.features && layer.features.length > 0) {
        layer.features.forEach(feature => {
          landCoverGeometries.push(feature.geometry);
        });
      }
    }
    
    // Validate property coverage
    return await ValidationUtils.validatePropertyCoverage(
      propertyAreaFeature.geometry,
      landCoverGeometries
    );
  } catch (error) {
    console.error('Error validating property coverage:', error);
    return {
      valid: false,
      message: `Error validating property coverage: ${error.message}`,
      uncoveredGeometry: null
    };
  }
}

export default {
  createLayerGraphic,
  validateLayerGeometry,
  validatePropertyCoverage
};