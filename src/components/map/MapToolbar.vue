<template lang="pug">
  .map-toolbar
    el-card.tool-panel
      .tool-panel-header
        h3 Tools
      .tool-panel-body
        .tool-group
          h4 Navigation
          .tools
            PanTool
            ZoomInTool
            ZoomOutTool
            ZoomToSelectionTool
        
        .tool-group
          h4 Drawing
          .tools
            PointTool
            LineTool
            PolygonTool
            FillTool
        
        .tool-group
          h4 Editing
          .tools
            AddFeatureTool
            MeasureTool
            CutTool
            EraseTool
        
        .layer-selection(v-if="isDrawingTool && availableLayers.length > 0")
          h4 Current Layer
          el-select(v-model="selectedLayer" placeholder="Select Layer" size="small")
            el-option(
              v-for="layer in availableLayers"
              :key="layer.id"
              :label="layer.name"
              :value="layer.id"
            )
  </template>
  
  <script>
  // Import tool components
  import PanTool from './tools/PanTool.vue';
  import PointTool from './tools/PointTool.vue';
  import LineTool from './tools/LineTool.vue';
  import PolygonTool from './tools/PolygonTool.vue';
  import FillTool from './tools/FillTool.vue';
  import AddFeatureTool from './tools/AddFeatureTool.vue';
  import MeasureTool from './tools/MeasureTool.vue';
  import CutTool from './tools/CutTool.vue';
  import EraseTool from './tools/EraseTool.vue';
  import ZoomInTool from './tools/ZoomInTool.vue';
  import ZoomOutTool from './tools/ZoomOutTool.vue';
  import ZoomToSelectionTool from './tools/ZoomToSelectionTool.vue';
  
  import { mapState, mapGetters, mapActions } from 'vuex';
  import { TOOL_TYPES } from '@/config/map-config';
  
  export default {
    name: 'MapToolbar',
    
    components: {
      PanTool,
      PointTool,
      LineTool,
      PolygonTool,
      FillTool,
      AddFeatureTool,
      MeasureTool,
      CutTool,
      EraseTool,
      ZoomInTool,
      ZoomOutTool,
      ZoomToSelectionTool
    },
    
    data() {
      return {
        selectedLayer: null
      };
    },
    
    computed: {
      ...mapState('tools', ['activeTool']),
      ...mapGetters('tools', ['TOOLS']),
      ...mapState('layers', ['layers']),
      
      isDrawingTool() {
        const drawingToolIds = [
          TOOL_TYPES.POINT,
          TOOL_TYPES.LINE,
          TOOL_TYPES.POLYGON,
          TOOL_TYPES.FILL,
          TOOL_TYPES.ADD_FEATURE
        ];
        return this.activeTool && drawingToolIds.includes(this.activeTool);
      },
      
      availableLayers() {
        // Filter layers based on active tool
        if (!this.activeTool) return [];
        
        switch(this.activeTool) {
          case TOOL_TYPES.POINT:
            return this.layers.filter(layer => layer.geometryType === 'point');
          case TOOL_TYPES.LINE:
            return this.layers.filter(layer => layer.geometryType === 'polyline');
          case TOOL_TYPES.POLYGON:
          case TOOL_TYPES.FILL:
            return this.layers.filter(layer => 
              layer.geometryType === 'polygon' || layer.geometryType === 'multipolygon'
            );
          case TOOL_TYPES.ADD_FEATURE:
            return this.layers.filter(layer => layer.editable);
          default:
            return [];
        }
      }
    },
    
    watch: {
      isDrawingTool(newValue) {
        if (newValue && this.availableLayers.length > 0) {
          this.selectedLayer = this.availableLayers[0].id;
        } else {
          this.selectedLayer = null;
        }
      },
      
      selectedLayer(newValue) {
        if (newValue) {
          this.$store.dispatch('layers/selectLayer', newValue);
        }
      }
    },
    
    created() {
      // Make the $message available globally for tool components
      window.$message = this.$message;
    },
    
    mounted() {
      // Set default active tool
      this.$store.dispatch('tools/setActiveTool', TOOL_TYPES.PAN);
      
      // Initialize tool availability based on layers
      this.$store.dispatch('tools/updateToolsAvailability');
    },
    
    methods: {
      ...mapActions('tools', ['setActiveTool'])
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .map-toolbar {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 5;
  }
  
  .tool-panel {
    width: 200px;
    
    .tool-panel-header {
      padding-bottom: 10px;
      border-bottom: 1px solid #e6e6e6;
      
      h3 {
        margin: 0;
        font-size: 16px;
      }
    }
    
    .tool-panel-body {
      .tool-group {
        margin-bottom: 15px;
        
        h4 {
          margin: 10px 0 5px;
          font-size: 14px;
          color: #666;
        }
        
        .tools {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
      }
      
      .layer-selection {
        margin-top: 15px;
        
        .el-select {
          width: 100%;
        }
      }
    }
  }
  </style>