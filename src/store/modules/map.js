const state = {
  map: null,
  view: null,
  basemap: 'satellite',
  center: [0, 0],
  zoom: 4,
  isLoaded: false,
  isLoading: false,
  error: null
};

const mutations = {
  SET_MAP(state, map) {
    state.map = map;
  },
  SET_VIEW(state, view) {
    state.view = view;
  },
  SET_BASEMAP(state, basemap) {
    state.basemap = basemap;
    if (state.map) {
      state.map.basemap = basemap;
    }
  },
  SET_CENTER(state, center) {
    state.center = center;
    if (state.view) {
      state.view.center = center;
    }
  },
  SET_ZOOM(state, zoom) {
    state.zoom = zoom;
    if (state.view) {
      state.view.zoom = zoom;
    }
  },
  SET_IS_LOADED(state, isLoaded) {
    state.isLoaded = isLoaded;
  },
  SET_IS_LOADING(state, isLoading) {
    state.isLoading = isLoading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  }
};

const actions = {
  initializeMap({ commit, dispatch }, { mapContainer }) {
    commit('SET_IS_LOADING', true);
    commit('SET_ERROR', null);

    import('@arcgis/core/Map').then(({ default: Map }) => {
      import('@arcgis/core/views/MapView').then(({ default: MapView }) => {
        try {
          const map = new Map({
            basemap: state.basemap
          });

          const view = new MapView({
            container: mapContainer,
            map: map,
            center: state.center,
            zoom: state.zoom
          });

          view.when(() => {
            commit('SET_MAP', map);
            commit('SET_VIEW', view);
            commit('SET_IS_LOADED', true);
            commit('SET_IS_LOADING', false);
            dispatch('layers/initializeLayers', null, { root: true });
          });
        } catch (error) {
          commit('SET_ERROR', error.message || 'Failed to initialize map');
          commit('SET_IS_LOADING', false);
        }
      });
    });
  },
  
  updateMapProperties({ commit }, { center, zoom, basemap }) {
    if (center) commit('SET_CENTER', center);
    if (zoom) commit('SET_ZOOM', zoom);
    if (basemap) commit('SET_BASEMAP', basemap);
  },
  
  zoomToExtent({ state }, extent) {
    if (state.view) {
      state.view.extent = extent;
    }
  }
};

const getters = {
  isMapReady: state => state.isLoaded && !state.isLoading && state.map && state.view
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};