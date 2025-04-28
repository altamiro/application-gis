<template lang="pug">
  .map-view
    MapContainer
    MapToolbar
    LayerPanel
    AreaCalculationBoard
  </template>
  
  <script>
  import MapContainer from '@/components/map/MapContainer.vue';
  import MapToolbar from '@/components/map/MapToolbar.vue';
  import LayerPanel from '@/components/layers/LayerPanel.vue';
  import AreaCalculationBoard from '@/components/statistics/AreaCalculationBoard.vue';
  
  export default {
    name: 'MapView',
    components: {
      MapContainer,
      MapToolbar,
      LayerPanel,
      AreaCalculationBoard
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .map-view {
    height: 100%;
    width: 100%;
    position: relative;
  }
  </style>