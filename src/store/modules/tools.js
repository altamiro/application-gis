import { TOOL_TYPES, TOOLS as TOOL_CONFIG } from "@/config/map-config";

const state = {
  activeTool: null,
  tools: TOOL_CONFIG.map((tool) => ({
    id: tool.id,
    label: tool.name,
    icon: tool.icon,
    enabled: tool.alwaysEnabled || false,
    order: tool.order,
  })),
  measureResult: null,
  measureUnit: "hectares",
};

const mutations = {
  SET_ACTIVE_TOOL(state, toolId) {
    state.activeTool = toolId;
  },
  ENABLE_TOOL(state, toolId) {
    const tool = state.tools.find((t) => t.id === toolId);
    if (tool) {
      tool.enabled = true;
    }
  },
  DISABLE_TOOL(state, toolId) {
    const tool = state.tools.find((t) => t.id === toolId);
    if (tool) {
      tool.enabled = false;
    }
  },
  ENABLE_ALL_TOOLS(state) {
    state.tools.forEach((tool) => {
      tool.enabled = true;
    });
  },
  DISABLE_ALL_TOOLS(state) {
    state.tools.forEach((tool) => {
      if (!TOOL_CONFIG.find((t) => t.id === tool.id)?.alwaysEnabled) {
        tool.enabled = false;
      }
    });
  },
  SET_MEASURE_RESULT(state, result) {
    state.measureResult = result;
  },
  SET_MEASURE_UNIT(state, unit) {
    state.measureUnit = unit;
  },
};

const actions = {
  setActiveTool({ commit, rootGetters, dispatch }, toolId) {
    console.log("Ativando ferramenta:", toolId);

    // Obtenha a configuração da ferramenta
    const toolConfig = TOOL_CONFIG.find((t) => t.id === toolId);
    if (!toolConfig) {
      console.error("Configuração de ferramenta não encontrada para:", toolId);
      return false;
    }

    // Verifique se a ferramenta requer área de propriedade
    const propertyAreaExists = rootGetters["layers/hasPropertyArea"];
    console.log("Área de propriedade existe?", propertyAreaExists);

    // Ferramentas que não precisam de área de propriedade
    const noPropertyAreaNeeded =
      toolConfig.alwaysEnabled ||
      toolId === TOOL_TYPES.POLYGON ||
      toolId === TOOL_TYPES.PAN;

    if (!propertyAreaExists && !noPropertyAreaNeeded) {
      console.warn("Área de propriedade necessária, mas não encontrada");
      if (window.$message) {
        window.$message({
          message: "Property Area must be drawn first",
          type: "warning",
          duration: 3000,
        });
      }

      // Volte para a ferramenta PAN
      commit("SET_ACTIVE_TOOL", TOOL_TYPES.PAN);
      return false;
    }

    // Defina a ferramenta ativa
    console.log("Definindo ferramenta ativa para:", toolId);
    commit("SET_ACTIVE_TOOL", toolId);
    return true;
  },

  updateToolsAvailability({ commit, rootGetters }) {
    const propertyAreaExists = rootGetters["layers/hasPropertyArea"];

    if (propertyAreaExists) {
      commit("ENABLE_ALL_TOOLS");
    } else {
      commit("DISABLE_ALL_TOOLS");
      // Always enable these specific tools
      commit("ENABLE_TOOL", TOOL_TYPES.PAN);
      commit("ENABLE_TOOL", TOOL_TYPES.ZOOM_IN);
      commit("ENABLE_TOOL", TOOL_TYPES.ZOOM_OUT);
      commit("ENABLE_TOOL", TOOL_TYPES.POLYGON); // Allow property area to be drawn
    }
  },

  performMeasurement({ commit }, geometry) {
    // Import ArcGIS geometryEngine to calculate area or length
    import("@arcgis/core/geometry/geometryEngine").then(
      ({ default: geometryEngine }) => {
        let result;
        if (geometry.type === "polygon") {
          // Calculate area in square meters and convert to hectares
          const areaInSquareMeters = geometryEngine.geodesicArea(
            geometry,
            "square-meters"
          );
          const areaInHectares = areaInSquareMeters / 10000; // 1 hectare = 10,000 m²
          result = areaInHectares.toFixed(2);
        } else if (geometry.type === "polyline") {
          // Calculate length in meters
          const lengthInMeters = geometryEngine.geodesicLength(
            geometry,
            "meters"
          );
          result = lengthInMeters.toFixed(2);
        }

        commit("SET_MEASURE_RESULT", result);
      }
    );
  },
};

const getters = {
  getToolById: (state) => (toolId) => state.tools.find((t) => t.id === toolId),
  activeTool: (state) =>
    state.tools.find((t) => t.id === state.activeTool) || null,
  enabledTools: (state) => state.tools.filter((t) => t.enabled),
  TOOLS: () => TOOL_TYPES,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
