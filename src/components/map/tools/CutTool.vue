<template lang="pug">
  .cut-tool
    el-tooltip(content="Cut Tool / Transform Tool" placement="right")
      el-button(
        :class="{ active: isActive }"
        :disabled="!enabled"
        @click="activate"
        icon="el-icon-scissors"
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
    
    // Feature selection when layer is selected
    el-select(
      v-if="isActive && selectedLayer && layerFeatures.length > 0"
      v-model="selectedFeature"
      placeholder="Select Feature"
      size="small"
      class="feature-select"
    )
      el-option(
        v-for="feature in layerFeatures"
        :key="feature.id"
        :label="`Feature ${feature.id.substring(0, 8)}...`"
        :value="feature.id"
      )
  </template>
  
  <script>
  import { mapGetters, mapActions, mapState } from 'vuex';
  import { TOOL_TYPES } from '@/config/map-config';
  
  export default {
    name: 'CutTool',
    
    data() {
      return {
        selectedLayer: null,
        selectedFeature: null
      };
    },
    
    computed: {
      ...mapGetters('tools', ['activeTool', 'getToolById']),
      ...mapGetters('layers', ['hasPropertyArea', 'getLayerById']),
      ...mapState('layers', ['layers']),
      
      isActive() {
        return this.activeTool && this.activeTool.id === TOOL_TYPES.CUT;
      },
      
      enabled() {
        return this.getToolById(TOOL_TYPES.CUT).enabled;
      },
      
      availableLayers() {
        // Filter layers based on their type (only polygon layers)
        return this.layers.filter(layer => 
          layer.editable && 
          (layer.geometryType === 'polygon' || layer.geometryType === 'multipolygon')
        );
      },
      
      layerFeatures() {
        if (!this.selectedLayer) return [];
        
        const layer = this.getLayerById(this.selectedLayer);
        return layer ? layer.features : [];
      }
    },
    
    watch: {
      selectedLayer(newValue) {
        if (newValue) {
          this.$store.dispatch('layers/selectLayer', newValue);
          this.selectedFeature = null;
        }
      },
      
      selectedFeature(newValue) {
        if (newValue) {
          // Emit event to activate cut mode on the selected feature
          this.$root.$emit('activate-cut', {
            layerId: this.selectedLayer,
            featureId: newValue
          });
        }
      },
      
      isActive(newValue) {
        if (newValue && this.availableLayers.length > 0) {
          this.selectedLayer = this.availableLayers[0].id;
        } else {
          this.selectedLayer = null;
          this.selectedFeature = null;
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
        
        this.setActiveTool(TOOL_TYPES.CUT);
      }
    },
    
    beforeDestroy() {
      if (this.isActive) {
        // Deactivate cut mode
        this.$root.$emit('deactivate-cut');
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .cut-tool {
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .layer-select,
    .feature-select {
      margin-top: 8px;
      width: 150px;
    }
  }
  </style>