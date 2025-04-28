import Vue from 'vue';
import Vuex from 'vuex';
import map from './modules/map';
import tools from './modules/tools';
import layers from './modules/layers';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    map,
    tools,
    layers
  }
});