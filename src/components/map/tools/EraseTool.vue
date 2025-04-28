<template lang="pug">
  .erase-tool
    el-tooltip(content="Erase Tool" placement="right")
      el-button(
        :class="{ active: isActive }"
        :disabled="!enabled"
        @click="activate"
        icon="el-icon-delete"
        size="medium"
        circle
      )
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  import { TOOL_TYPES } from '@/config/map-config';
  
  export default {
    name: 'EraseTool',
    
    computed: {
      ...mapGetters('tools', ['activeTool', 'getToolById']),
      ...mapGetters('layers', ['hasPropertyArea']),
      
      isActive() {
        return this.activeTool && this.activeTool.id === TOOL_TYPES.ERASE;
      },
      
      enabled() {
        return this.getToolById(TOOL_TYPES.ERASE).enabled;
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
        
        this.setActiveTool(TOOL_TYPES.ERASE);
        
        // Inform user about the tool usage
        this.$message({
          message: 'Click on features to erase them',
          type: 'info',
          duration: 3000
        });
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .erase-tool {
    margin-bottom: 8px;
  }
  </style>