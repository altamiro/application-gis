const TOOLS = {
  PAN: 'pan',
  POINT: 'point',
  LINE: 'line',
  POLYGON: 'polygon',
  FILL: 'fill',
  ADD_FEATURE: 'add-feature',
  MEASURE: 'measure',
  CUT: 'cut',
  ERASE: 'erase',
  ZOOM_IN: 'zoom-in',
  ZOOM_OUT: 'zoom-out',
  ZOOM_TO_SELECTION: 'zoom-to-selection'
};

const state = {
  activeTool: TOOLS.PAN,
  tools: [
    { id: TOOLS.PAN, label: 'Pan Tool', icon: 'el-icon-rank', enabled: true },
    { id: TOOLS.POINT, label: 'Point Tool', icon: 'el-icon-location-outline', enabled: false },
    { id: TOOLS.LINE, label: 'Line Tool', icon: 'el-icon-minus', enabled: false },
    { id: TOOLS.POLYGON, label: 'Polygon Tool', icon: 'el-icon-crop', enabled: false },
    { id: TOOLS.FILL, label: 'Fill Tool', icon: 'el-icon-tickets', enabled: false },
    { id: TOOLS.ADD_FEATURE, label: 'Add Feature Tool', icon: 'el-icon-plus', enabled: false },
    { id: TOOLS.MEASURE, label: 'Measure Tool', icon: 'el-icon-discover', enabled: false },
    { id: TOOLS.CUT, label: 'Cut Tool', icon: 'el-icon-scissors', enabled: false },
    { id: TOOLS.ERASE, label: 'Erase Tool', icon: 'el-icon-delete', enabled: false },
    { id: TOOLS.ZOOM_IN, label: 'Zoom In', icon: 'el-icon-zoom-in', enabled: true },
    { id: TOOLS.ZOOM_OUT, label: 'Zoom Out', icon: 'el-icon-zoom-out', enabled: true },
    { id: TOOLS.ZOOM_TO_SELECTION, label: 'Zoom to Selection', icon: 'el-icon-search', enabled: false }
  ],
  measureResult: null,
  measureUnit: 'hectares'
};

const mutations = {
  SET_ACTIVE_TOOL(state, toolId) {
    state.activeTool = toolId;
  },
  ENABLE_TOOL(state, toolId) {
    const tool = state.tools.find(t => t.id === toolId);
    if (tool) {
      tool.enabled = true;
    }
  },
  DISABLE_TOOL(state, toolId) {
    const tool = state.tools.find(t => t.id === toolId);
    if (tool) {
      tool.enabled = false;
    }
  },
  ENABLE_ALL_TOOLS(state) {
    state.tools.forEach(tool => {
      tool.enabled = true;
    });
  },
  DISABLE_ALL_TOOLS(state) {
    state.tools.forEach(tool => {
      if (tool.id !== TOOLS.PAN && tool.id !== TOOLS.ZOOM_IN && tool.id !== TOOLS.ZOOM_OUT) {
        tool.enabled = false;
      }
    });
  },
  SET_MEASURE_RESULT(state, result) {
    state.measureResult = result;
  },
  SET_MEASURE_UNIT(state, unit) {
    state.measureUnit = unit;
  }
};

const actions = {
  setActiveTool({ commit, rootGetters }, toolId) {
    if (toolId === TOOLS.POINT || toolId === TOOLS.LINE || toolId === TOOLS.POLYGON || 
        toolId === TOOLS.FILL || toolId === TOOLS.ADD_FEATURE) {
      // Need to check if property area exists before enabling drawing tools
      const propertyAreaExists = rootGetters['layers/hasPropertyArea'];
      if (!propertyAreaExists && toolId !== TOOLS.POLYGON) {
        // Show notification that Property Area must be drawn first
        return false;
      }
    }
    
    commit('SET_ACTIVE_TOOL', toolId);
    return true;
  },
  
  updateToolsAvailability({ commit, rootGetters }) {
    const propertyAreaExists = rootGetters['layers/hasPropertyArea'];
    
    if (propertyAreaExists) {
      commit('ENABLE_ALL_TOOLS');
    } else {
      commit('DISABLE_ALL_TOOLS');
      // Enable polygon tool to allow drawing property area
      commit('ENABLE_TOOL', TOOLS.POLYGON); 
    }
  },
  
  performMeasurement({ commit, rootState }, geometry) {
    // Import ArcGIS geometryEngine to calculate area
    import('@arcgis/core/geometry/geometryEngine').then(({ default: geometryEngine }) => {
      let result;
      if (geometry.type === 'polygon') {
        // Calculate area in square meters and convert to hectares
        const areaInSquareMeters = geometryEngine.geodesicArea(geometry, 'square-meters');
        const areaInHectares = areaInSquareMeters / 10000; // 1 hectare = 10,000 m²
        result = areaInHectares.toFixed(2);
      } else if (geometry.type === 'polyline') {
        // Calculate length in meters
        const lengthInMeters = geometryEngine.geodesicLength(geometry, 'meters');
        result = lengthInMeters.toFixed(2);
      }
      
      commit('SET_MEASURE_RESULT', result);
    });
  }
};

const getters = {
  getToolById: state => toolId => state.tools.find(t => t.id === toolId),
  activeTool: state => state.tools.find(t => t.id === state.activeTool),
  enabledTools: state => state.tools.filter(t => t.enabled),
  TOOLS: () => TOOLS
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};