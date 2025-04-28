<template lang="pug">
  .pan-tool
    el-tooltip(content="Pan Tool" placement="right")
      el-button(
        :class="{ active: isActive }"
        @click="activate"
        icon="el-icon-rank"
        size="medium"
        circle
      )
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  import { TOOL_TYPES } from '@/config/map-config';
  
  export default {
    name: 'PanTool',
    
    computed: {
      ...mapGetters('tools', ['activeTool']),
      
      isActive() {
        return this.activeTool && this.activeTool.id === TOOL_TYPES.PAN;
      }
    },
    
    methods: {
      ...mapActions('tools', ['setActiveTool']),
      
      activate() {
        this.setActiveTool(TOOL_TYPES.PAN);
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .pan-tool {
    margin-bottom: 8px;
  }
  </style>