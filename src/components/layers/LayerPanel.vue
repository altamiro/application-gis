<template lang="pug">
  .layer-panel
    el-card.layer-panel-container
      .panel-header
        h3 Layers
      .panel-body
        LayerList(:layers="orderedLayers" @layer-toggled="toggleLayerVisibility")
  </template>
  
  <script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import LayerList from './LayerList.vue';
  
  export default {
    name: 'LayerPanel',
    
    components: {
      LayerList
    },
    
    computed: {
      ...mapState('layers', ['layers']),
      ...mapGetters('layers', ['layerOrder']),
      
      orderedLayers() {
        return this.layerOrder;
      }
    },
    
    methods: {
      ...mapActions('layers', ['toggleLayerVisibility'])
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .layer-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 5;
    
    .layer-panel-container {
      width: 250px;
      
      .panel-header {
        padding-bottom: 10px;
        border-bottom: 1px solid #e6e6e6;
        
        h3 {
          margin: 0;
          font-size: 16px;
        }
      }
      
      .panel-body {
        max-height: 400px;
        overflow-y: auto;
      }
    }
  }
  </style>