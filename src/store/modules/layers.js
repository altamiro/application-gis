const LAYER_TYPES = {
  PROPERTY_AREA: 'property-area',
  PROPERTY_HEADQUARTERS: 'property-headquarters',
  CONSOLIDATED_AREA: 'consolidated-area',
  NATIVE_VEGETATION: 'native-vegetation',
  FALLOW_AREA: 'fallow-area',
  ANTHROPIZED_AREA: 'anthropized-area'
};

const GEOMETRY_TYPES = {
  POINT: 'point',
  POLYGON: 'polygon',
  MULTIPOLYGON: 'multipolygon'
};

const state = {
  layers: [
    {
      id: LAYER_TYPES.PROPERTY_AREA,
      name: 'Property Area',
      visible: true,
      editable: true,
      geometryType: GEOMETRY_TYPES.POLYGON,
      features: [],
      style: {
        fillColor: [0, 0, 0, 0.1],
        outlineColor: [0, 0, 0, 0.7],
        outlineWidth: 2
      },
      order: 0
    },
    {
      id: LAYER_TYPES.PROPERTY_HEADQUARTERS,
      name: 'Property Headquarters',
      visible: true,
      editable: true,
      geometryType: GEOMETRY_TYPES.POINT,
      features: [],
      style: {
        color: [255, 0, 0, 1],
        size: 10,
        outlineColor: [255, 255, 255, 0.7],
        outlineWidth: 1
      },
      order: 1
    },
    {
      id: LAYER_TYPES.CONSOLIDATED_AREA,
      name: 'Consolidated Area',
      visible: true,
      editable: true,
      geometryType: GEOMETRY_TYPES.MULTIPOLYGON,
      features: [],
      style: {
        fillColor: [255, 165, 0, 0.5],
        outlineColor: [255, 165, 0, 0.8],
        outlineWidth: 1
      },
      order: 2
    },
    {
      id: LAYER_TYPES.NATIVE_VEGETATION,
      name: 'Native Vegetation',
      visible: true,
      editable: true,
      geometryType: GEOMETRY_TYPES.MULTIPOLYGON,
      features: [],
      style: {
        fillColor: [0, 128, 0, 0.5],
        outlineColor: [0, 128, 0, 0.8],
        outlineWidth: 1
      },
      order: 3
    },
    {
      id: LAYER_TYPES.FALLOW_AREA,
      name: 'Fallow Area',
      visible: true,
      editable: true,
      geometryType: GEOMETRY_TYPES.MULTIPOLYGON,
      features: [],
      style: {
        fillColor: [210, 180, 140, 0.5],
        outlineColor: [210, 180, 140, 0.8],
        outlineWidth: 1
      },
      order: 4
    },
    {
      id: LAYER_TYPES.ANTHROPIZED_AREA,
      name: 'Anthropized Area 2018',
      visible: true,
      editable: true,
      geometryType: GEOMETRY_TYPES.MULTIPOLYGON,
      features: [],
      style: {
        fillColor: [255, 0, 0, 0.5],
        outlineColor: [255, 0, 0, 0.8],
        outlineWidth: 1
      },
      order: 5
    }
  ],
  arcgisLayers: {}, // References to ArcGIS layer instances
  selectedLayer: null,
  areaTotals: {} // Store calculated areas for each layer
};

const mutations = {
  SET_LAYER_FEATURES(state, { layerId, features }) {
    const layer = state.layers.find(l => l.id === layerId);
    if (layer) {
      layer.features = features;
    }
  },
  ADD_FEATURE(state, { layerId, feature }) {
    const layer = state.layers.find(l => l.id === layerId);
    if (layer) {
      layer.features.push(feature);
    }
  },
  REMOVE_FEATURE(state, { layerId, featureId }) {
    const layer = state.layers.find(l => l.id === layerId);
    if (layer) {
      layer.features = layer.features.filter(f => f.id !== featureId);
    }
  },
  UPDATE_FEATURE(state, { layerId, featureId, geometry }) {
    const layer = state.layers.find(l => l.id === layerId);
    if (layer) {
      const featureIndex = layer.features.findIndex(f => f.id === featureId);
      if (featureIndex >= 0) {
        layer.features[featureIndex].geometry = geometry;
      }
    }
  },
  SET_LAYER_VISIBILITY(state, { layerId, visible }) {
    const layer = state.layers.find(l => l.id === layerId);
    if (layer) {
      layer.visible = visible;
    }
  },
  SET_SELECTED_LAYER(state, layerId) {
    state.selectedLayer = layerId;
  },
  SET_ARCGIS_LAYER(state, { layerId, arcgisLayer }) {
    state.arcgisLayers[layerId] = arcgisLayer;
  },
  CLEAR_LAYER(state, layerId) {
    const layer = state.layers.find(l => l.id === layerId);
    if (layer) {
      layer.features = [];
    }
  },
  CLEAR_ALL_LAYERS(state) {
    state.layers.forEach(layer => {
      layer.features = [];
    });
  },
  UPDATE_AREA_TOTAL(state, { layerId, area }) {
    state.areaTotals = { ...state.areaTotals, [layerId]: area };
  }
};

const actions = {
  initializeLayers({ commit, state, rootState, dispatch }) {
    // Import required ArcGIS modules
    Promise.all([
      import('@arcgis/core/layers/GraphicsLayer'),
      import('@arcgis/core/Graphic')
    ]).then(([{ default: GraphicsLayer }, { default: Graphic }]) => {
      // Create a GraphicsLayer for each layer in the store
      state.layers.forEach(layer => {
        const graphicsLayer = new GraphicsLayer({
          title: layer.name,
          listMode: 'show',
          visible: layer.visible
        });
        
        // Add layer to the map
        rootState.map.map.add(graphicsLayer);
        
        // Store reference to the ArcGIS layer
        commit('SET_ARCGIS_LAYER', { layerId: layer.id, arcgisLayer: graphicsLayer });
      });
      
      // Ensure the layers are rendered in the correct order
      dispatch('updateLayerOrder');
    });
  },
  
  updateLayerOrder({ state, rootState }) {
    // Sort layers by their order property
    const sortedLayers = [...state.layers].sort((a, b) => a.order - b.order);
    
    // Reorder layers in the map
    sortedLayers.forEach(layer => {
      const arcgisLayer = state.arcgisLayers[layer.id];
      if (arcgisLayer) {
        rootState.map.map.reorder(arcgisLayer, layer.order);
      }
    });
  },
  
  async addFeature({ commit, state, rootState, dispatch }, { layerId, geometry }) {
    // Import required ArcGIS modules
    const [
      { default: Graphic },
      { default: geometryEngine }
    ] = await Promise.all([
      import('@arcgis/core/Graphic'),
      import('@arcgis/core/geometry/geometryEngine')
    ]);
    
    const layer = state.layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const arcgisLayer = state.arcgisLayers[layerId];
    if (!arcgisLayer) return;
    
    // Check layer-specific rules
    if (layerId === LAYER_TYPES.PROPERTY_HEADQUARTERS) {
      // Check if the headquarters point is inside the property area
      const propertyAreaLayer = state.layers.find(l => l.id === LAYER_TYPES.PROPERTY_AREA);
      if (propertyAreaLayer && propertyAreaLayer.features.length > 0) {
        const propertyGeometry = propertyAreaLayer.features[0].geometry;
        const isInside = geometryEngine.contains(propertyGeometry, geometry);
        
        if (!isInside) {
          // Show error message that headquarters must be inside property
          return;
        }
      } else {
        // Property area not defined yet
        return;
      }
    } else if (layerId !== LAYER_TYPES.PROPERTY_AREA) {
      // For all other layers, property area must be defined first
      const propertyAreaLayer = state.layers.find(l => l.id === LAYER_TYPES.PROPERTY_AREA);
      if (!propertyAreaLayer || propertyAreaLayer.features.length === 0) {
        // Show error message that property area must be defined first
        return;
      }
      
      // Clip geometry to property area boundaries
      const propertyGeometry = propertyAreaLayer.features[0].geometry;
      if (geometry.type !== 'point') {
        // Only clip polygons and polylines
        const clippedGeometry = geometryEngine.clip(geometry, propertyGeometry);
        if (!clippedGeometry) {
          // Geometry is completely outside property area
          return;
        }
        geometry = clippedGeometry;
      }
      
      // Apply specific rules for each layer type
      if (layerId === LAYER_TYPES.CONSOLIDATED_AREA) {
        // Consolidated Area cannot overlap Native Vegetation
        const nativeVegLayer = state.layers.find(l => l.id === LAYER_TYPES.NATIVE_VEGETATION);
        if (nativeVegLayer && nativeVegLayer.features.length > 0) {
          // Intersect all native vegetation features
          for (const feature of nativeVegLayer.features) {
            if (geometryEngine.overlaps(geometry, feature.geometry)) {
              // Subtract native vegetation areas from consolidated area
              geometry = geometryEngine.difference(geometry, feature.geometry);
              if (!geometry) return; // No area left after subtraction
            }
          }
        }
      } else if (layerId === LAYER_TYPES.NATIVE_VEGETATION) {
        // Native Vegetation must prevail over other layers
        // Update other layers to avoid overlaps
        const overlappingLayers = [
          LAYER_TYPES.CONSOLIDATED_AREA,
          LAYER_TYPES.FALLOW_AREA,
          LAYER_TYPES.ANTHROPIZED_AREA
        ];
        
        for (const overlapLayerId of overlappingLayers) {
          const overlapLayer = state.layers.find(l => l.id === overlapLayerId);
          if (overlapLayer && overlapLayer.features.length > 0) {
            for (const feature of overlapLayer.features) {
              if (geometryEngine.overlaps(geometry, feature.geometry)) {
                // Update the overlapping feature by subtracting the native vegetation
                const updatedGeometry = geometryEngine.difference(feature.geometry, geometry);
                dispatch('updateFeature', {
                  layerId: overlapLayerId,
                  featureId: feature.id,
                  geometry: updatedGeometry || null
                });
              }
            }
          }
        }
      }
    }
    
    // Create the feature
    const featureId = Date.now().toString();
    const feature = {
      id: featureId,
      geometry: geometry,
      attributes: {
        id: featureId,
        layerId: layerId
      }
    };
    
    // Create graphic for the map
    const graphic = new Graphic({
      geometry: geometry,
      symbol: createSymbol(layer),
      attributes: {
        id: featureId,
        layerId: layerId
      }
    });
    
    // Add the graphic to the ArcGIS layer
    arcgisLayer.add(graphic);
    
    // Add the feature to the store
    commit('ADD_FEATURE', { layerId, feature });
    
    // Update area calculations
    dispatch('calculateAreas');
  },
  
  updateFeature({ commit, state, dispatch }, { layerId, featureId, geometry }) {
    const layer = state.layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const arcgisLayer = state.arcgisLayers[layerId];
    if (!arcgisLayer) return;
    
    // Find the graphic in the ArcGIS layer
    const graphic = arcgisLayer.graphics.find(g => g.attributes.id === featureId);
    
    if (graphic) {
      // Update the geometry
      graphic.geometry = geometry;
      
      // Update the feature in the store
      commit('UPDATE_FEATURE', { layerId, featureId, geometry });
      
      // Update area calculations
      dispatch('calculateAreas');
    }
  },
  
  removeFeature({ commit, state, dispatch }, { layerId, featureId }) {
    const layer = state.layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const arcgisLayer = state.arcgisLayers[layerId];
    if (!arcgisLayer) return;
    
    // Check specific rules before removing
    if (layerId === LAYER_TYPES.PROPERTY_AREA) {
      // Deleting property area should clear all other layers
      if (confirm('Deleting the Property Area will remove all other layers. Are you sure you want to proceed?')) {
        dispatch('clearAllLayers');
        return;
      } else {
        return;
      }
    }
    
    // Find the graphic in the ArcGIS layer
    const graphic = arcgisLayer.graphics.find(g => g.attributes.id === featureId);
    
    if (graphic) {
      // Remove the graphic from the ArcGIS layer
      arcgisLayer.remove(graphic);
      
      // Remove the feature from the store
      commit('REMOVE_FEATURE', { layerId, featureId });
      
      // Update area calculations
      dispatch('calculateAreas');
    }
  },
  
  clearLayer({ commit, state, dispatch }, layerId) {
    const layer = state.layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const arcgisLayer = state.arcgisLayers[layerId];
    if (!arcgisLayer) return;
    
    // Check specific rules before clearing
    if (layerId === LAYER_TYPES.PROPERTY_AREA) {
      // Clearing property area should clear all other layers
      if (confirm('Clearing the Property Area will remove all other layers. Are you sure you want to proceed?')) {
        dispatch('clearAllLayers');
        return;
      } else {
        return;
      }
    }
    
    // Clear all graphics from the ArcGIS layer
    arcgisLayer.removeAll();
    
    // Clear the features in the store
    commit('CLEAR_LAYER', layerId);
    
    // Update area calculations
    dispatch('calculateAreas');
  },
  
  clearAllLayers({ commit, state }) {
    // Clear all ArcGIS layers
    Object.values(state.arcgisLayers).forEach(arcgisLayer => {
      arcgisLayer.removeAll();
    });
    
    // Clear all features in the store
    commit('CLEAR_ALL_LAYERS');
    
    // Reset area totals
    state.layers.forEach(layer => {
      commit('UPDATE_AREA_TOTAL', { layerId: layer.id, area: 0 });
    });
  },
  
  calculateAreas({ commit, state, rootState }) {
    // Import geometryEngine
    import('@arcgis/core/geometry/geometryEngine').then(({ default: geometryEngine }) => {
      // Get property area
      const propertyAreaLayer = state.layers.find(l => l.id === LAYER_TYPES.PROPERTY_AREA);
      let propertyArea = null;
      
      if (propertyAreaLayer && propertyAreaLayer.features.length > 0) {
        propertyArea = propertyAreaLayer.features[0].geometry;
      }
      
      // Calculate area for each layer
      state.layers.forEach(layer => {
        if (layer.features.length === 0) {
          commit('UPDATE_AREA_TOTAL', { layerId: layer.id, area: 0 });
          return;
        }
        
        // Skip point geometries
        if (layer.geometryType === GEOMETRY_TYPES.POINT) {
          return;
        }
        
        let totalArea = 0;
        
        // Calculate area for each feature
        layer.features.forEach(feature => {
          // Calculate area in square meters
          let areaInSquareMeters = geometryEngine.geodesicArea(feature.geometry, 'square-meters');
          
          if (propertyArea && layer.id !== LAYER_TYPES.PROPERTY_AREA) {
            // For layers other than Property Area, only count area inside property boundaries
            const intersection = geometryEngine.intersect(feature.geometry, propertyArea);
            if (intersection) {
              areaInSquareMeters = geometryEngine.geodesicArea(intersection, 'square-meters');
            } else {
              areaInSquareMeters = 0;
            }
          }
          
          // Convert to hectares (1 hectare = 10,000 m²)
          const areaInHectares = areaInSquareMeters / 10000;
          totalArea += areaInHectares;
        });
        
        // Update the area total for the layer
        commit('UPDATE_AREA_TOTAL', { layerId: layer.id, area: totalArea.toFixed(2) });
      });
    });
  },
  
  toggleLayerVisibility({ commit, state }, { layerId, visible }) {
    const layer = state.layers.find(l => l.id === layerId);
    if (!layer) return;
    
    const arcgisLayer = state.arcgisLayers[layerId];
    if (!arcgisLayer) return;
    
    // Special case for Anthropized Area - must remain visible
    if (layerId === LAYER_TYPES.ANTHROPIZED_AREA && !visible) {
      return; // Prevent hiding this layer
    }
    
    // Update visibility in the ArcGIS layer
    arcgisLayer.visible = visible;
    
    // Update visibility in the store
    commit('SET_LAYER_VISIBILITY', { layerId, visible });
  },
  
  selectLayer({ commit }, layerId) {
    commit('SET_SELECTED_LAYER', layerId);
  }
};

const getters = {
  getLayerById: state => layerId => state.layers.find(l => l.id === layerId),
  visibleLayers: state => state.layers.filter(l => l.visible),
  layerOrder: state => [...state.layers].sort((a, b) => a.order - b.order),
  hasPropertyArea: state => {
    const propertyAreaLayer = state.layers.find(l => l.id === LAYER_TYPES.PROPERTY_AREA);
    return propertyAreaLayer && propertyAreaLayer.features.length > 0;
  },
  getLayerArea: state => layerId => state.areaTotals[layerId] || 0,
  getAllAreas: state => state.areaTotals,
  LAYER_TYPES: () => LAYER_TYPES
};

// Helper function to create symbol based on layer configuration
function createSymbol(layer) {
  // Import required ArcGIS modules
  return import('@arcgis/core/symbols/SimpleFillSymbol')
    .then(({ default: SimpleFillSymbol }) => {
      import('@arcgis/core/symbols/SimpleLineSymbol')
        .then(({ default: SimpleLineSymbol }) => {
          import('@arcgis/core/symbols/SimpleMarkerSymbol')
            .then(({ default: SimpleMarkerSymbol }) => {
              if (layer.geometryType === GEOMETRY_TYPES.POINT) {
                return new SimpleMarkerSymbol({
                  color: layer.style.color,
                  size: layer.style.size,
                  outline: new SimpleLineSymbol({
                    color: layer.style.outlineColor,
                    width: layer.style.outlineWidth
                  })
                });
              } else {
                return new SimpleFillSymbol({
                  color: layer.style.fillColor,
                  outline: new SimpleLineSymbol({
                    color: layer.style.outlineColor,
                    width: layer.style.outlineWidth
                  })
                });
              }
            });
        });
    });
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};