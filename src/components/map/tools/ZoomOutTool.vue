<template lang="pug">
  .zoom-out-tool
    el-tooltip(content="Zoom Out" placement="right")
      el-button(
        :class="{ active: isActive }"
        @click="zoomOut"
        icon="el-icon-zoom-out"
        size="medium"
        circle
      )
  </template>
  
  <script>
  import { mapGetters, mapActions, mapState } from 'vuex';
  import { TOOL_TYPES } from '@/config/map-config';
  
  export default {
    name: 'ZoomOutTool',
    
    computed: {
      ...mapGetters('tools', ['activeTool']),
      ...mapState('map', ['zoom']),
      
      isActive() {
        return this.activeTool && this.activeTool.id === TOOL_TYPES.ZOOM_OUT;
      }
    },
    
    methods: {
      ...mapActions('map', ['updateMapProperties']),
      
      zoomOut() {
        // Decrease the zoom level by 1
        this.updateMapProperties({
          zoom: Math.max(0, this.zoom - 1)
        });
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .zoom-out-tool {
    margin-bottom: 8px;
  }
  </style>