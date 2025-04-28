<template lang="pug">
  .zoom-in-tool
    el-tooltip(content="Zoom In" placement="right")
      el-button(
        :class="{ active: isActive }"
        @click="zoomIn"
        icon="el-icon-zoom-in"
        size="medium"
        circle
      )
  </template>
  
  <script>
  import { mapGetters, mapActions, mapState } from 'vuex';
  import { TOOL_TYPES } from '@/config/map-config';
  
  export default {
    name: 'ZoomInTool',
    
    computed: {
      ...mapGetters('tools', ['activeTool']),
      ...mapState('map', ['zoom']),
      
      isActive() {
        return this.activeTool && this.activeTool.id === TOOL_TYPES.ZOOM_IN;
      }
    },
    
    methods: {
      ...mapActions('map', ['updateMapProperties']),
      
      zoomIn() {
        // Increase the zoom level by 1
        this.updateMapProperties({
          zoom: this.zoom + 1
        });
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .zoom-in-tool {
    margin-bottom: 8px;
  }
  </style>