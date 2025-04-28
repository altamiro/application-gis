<template lang="pug">
  .add-feature-tool
    el-tooltip(content="Add Feature Tool" placement="right")
      el-button(
        :class="{ active: isActive }"
        :disabled="!enabled"
        @click="activate"
        icon="el-icon-plus"
        size="medium"
        circle
      )
    
    // Layer selection when tool is active
    el-select(
      v-if="isActive && hasPropertyArea"
      v-model="selectedLayer"
      placeholder="Select Layer"
      size="small"
      class="layer-select"
    )
      el-option(
        v-for="layer in availableLayers"
        :key="layer.id"
        :label="layer.name"
        :value="layer.id"
      )
  </template>
  
  <script>
  import { mapGetters, mapActions, mapState } from 'vuex';
  import { TOOL_TYPES } from '@/config/map-config';
  
  export default {
    name: 'AddFeatureTool',
    
    data() {
      return {
        selectedLayer: null
      };
    },
    
    computed: {
      ...mapGetters('tools', ['activeTool', 'getToolById']),
      ...mapGetters('layers', ['hasPropertyArea', 'getLayerById']),
      ...mapState('layers', ['layers']),
      
      isActive() {
        return this.activeTool && this.activeTool.id === TOOL_TYPES.ADD_FEATURE;
      },
      
      enabled() {
        return this.getToolById(TOOL_TYPES.ADD_FEATURE).enabled;
      },
      
      availableLayers() {
        // Filter layers based on their type
        return this.layers.filter(layer => layer.editable);
      }
    },
    
    watch: {
      selectedLayer(newValue) {
        if (newValue) {
          this.$store.dispatch('layers/selectLayer', newValue);
        }
      },
      
      isActive(newValue) {
        if (newValue && this.availableLayers.length > 0) {
          this.selectedLayer = this.availableLayers[0].id;
        } else {
          this.selectedLayer = null;
        }
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
        
        this.setActiveTool(TOOL_TYPES.ADD_FEATURE);
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .add-feature-tool {
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .layer-select {
      margin-top: 8px;
      width: 150px;
    }
  }
  </style>