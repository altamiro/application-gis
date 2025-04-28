<template lang="pug">
  .line-tool
    el-tooltip(content="Line Tool" placement="right")
      el-button(
        :class="{ active: isActive }"
        :disabled="!enabled"
        @click="activate"
        icon="el-icon-minus"
        size="medium"
        circle
      )
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  import { TOOL_TYPES } from '@/config/map-config';
  
  export default {
    name: 'LineTool',
    
    computed: {
      ...mapGetters('tools', ['activeTool', 'getToolById']),
      ...mapGetters('layers', ['hasPropertyArea']),
      
      isActive() {
        return this.activeTool && this.activeTool.id === TOOL_TYPES.LINE;
      },
      
      enabled() {
        return this.getToolById(TOOL_TYPES.LINE).enabled;
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
        
        this.setActiveTool(TOOL_TYPES.LINE);
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .line-tool {
    margin-bottom: 8px;
  }
  </style>