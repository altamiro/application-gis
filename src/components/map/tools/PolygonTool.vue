<template lang="pug">
  .polygon-tool
    el-tooltip(content="Polygon Tool" placement="right")
      el-button(
        :class="{ active: isActive }"
        :disabled="!enabled"
        @click="activate"
        icon="el-icon-crop"
        size="medium"
        circle
      )
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  import { TOOL_TYPES } from '@/config/map-config';
  
  export default {
    name: 'PolygonTool',
    
    computed: {
      ...mapGetters('tools', ['activeTool', 'getToolById']),
      
      isActive() {
        return this.activeTool && this.activeTool.id === TOOL_TYPES.POLYGON;
      },
      
      enabled() {
        return this.getToolById(TOOL_TYPES.POLYGON).enabled;
      }
    },
    
    methods: {
      ...mapActions('tools', ['setActiveTool']),
      
      activate() {
        if (!this.enabled) return;
        
        this.setActiveTool(TOOL_TYPES.POLYGON);
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .polygon-tool {
    margin-bottom: 8px;
  }
  </style>