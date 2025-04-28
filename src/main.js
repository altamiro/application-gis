import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'core-js/stable';
import '@arcgis/core/assets/esri/themes/light/main.css';
import './assets/styles/main.scss';

// Configure the ArcGIS API
import esriConfig from '@arcgis/core/config';

// Set the correct path to find assets
// This path should match the "to" path in your CopyWebpackPlugin config
esriConfig.assetsPath = '/car-online/assets';

Vue.use(ElementUI);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');