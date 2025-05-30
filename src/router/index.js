import Vue from 'vue';
import VueRouter from 'vue-router';
import MapView from '../views/MapView.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'MapView',
    component: MapView
  },
  {
    path: '*',
    redirect: '/'
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;