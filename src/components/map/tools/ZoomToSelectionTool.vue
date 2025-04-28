<template lang="pug">
  .zoom-to-selection-tool
    el-tooltip(content="Zoom to Selection" placement="right")
      el-button(
        :class="{ active: isActive }"
        :disabled="!enabled"
        @click="activate"
        icon="el-icon-search"
        size="medium"
        circle
      )
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  import { TOOL_TYPES } from '@/config/map-config';
  
  export default {
    name: 'ZoomToSelectionTool',
    
    computed: {
      ...mapGetters('tools', ['activeTool', 'getToolById']),
      ...mapGetters('layers', ['hasPropertyArea']),
      
      isActive() {
        return this.activeTool && this.activeTool.id === TOOL_TYPES.ZOOM_TO_SELECTION;
      },
      
      enabled() {
        return this.getToolById(TOOL_TYPES.ZOOM_TO_SELECTION).enabled;
      }
    },
    
    methods: {
      ...mapActions('tools', ['setActiveTool']),
      
      activate() {
        if (!this.enabled) return;
        
        // If property area doesn't exist yet, show a message
        if (!this.hasPropertyArea) {
          this.$message({
            message: 'Property Area must be drawn first',
            type: 'warning'
          });
          return;
        }
        
        this.setActiveTool(TOOL_TYPES.ZOOM_TO_SELECTION);
        
        // Show instructions to user
        this.$message({
          message: 'Draw a rectangle to zoom to the selected area',
          type: 'info',
          duration: 3000
        });
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .zoom-to-selection-tool {
    margin-bottom: 8px;
  }
  </style>