<template lang="pug">
  .point-tool
    el-tooltip(content="Point Tool" placement="right")
      el-button(
        :class="{ active: isActive }"
        :disabled="!enabled"
        @click="activate"
        icon="el-icon-location-outline"
        size="medium"
        circle
      )
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  import { TOOL_TYPES } from '@/config/map-config';
  
  export default {
    name: 'PointTool',
    
    computed: {
      ...mapGetters('tools', ['activeTool', 'getToolById']),
      ...mapGetters('layers', ['hasPropertyArea']),
      
      isActive() {
        return this.activeTool && this.activeTool.id === TOOL_TYPES.POINT;
      },
      
      enabled() {
        const tool = this.getToolById(TOOL_TYPES.POINT);
        return tool && tool.enabled;
      }
    },
    
    methods: {
      ...mapActions('tools', ['setActiveTool']),
      
      activate() {
        if (!this.enabled) return;
        
        this.setActiveTool(TOOL_TYPES.POINT);
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .point-tool {
    margin-bottom: 8px;
  }
  </style>