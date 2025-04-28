<template lang="pug">
  .layer-item
    .layer-item-content
      .layer-visibility
        el-switch(
          v-model="isVisible"
          :disabled="isAnthropizedArea && isVisible"
          @change="toggleVisibility"
        )
      
      .layer-info
        .layer-name {{ layer.name }}
        .layer-type {{ formatGeometryType(layer.geometryType) }}
        
      .layer-actions
        el-tooltip(effect="dark" content="Zoom to Layer" placement="top")
          el-button(
            type="text"
            icon="el-icon-search"
            size="mini"
            @click="zoomToLayer"
          )
        
        el-tooltip(effect="dark" content="Remove Layer" placement="top")
          el-button(
            type="text"
            icon="el-icon-delete"
            size="mini"
            @click="clearLayer"
            :disabled="!layer.features || layer.features.length === 0"
          )
  </template>
  
  <script>
  import { mapActions, mapGetters } from 'vuex';
  
  export default {
    name: 'LayerItem',
    
    props: {
      layer: {
        type: Object,
        required: true
      }
    },
    
    computed: {
      ...mapGetters('layers', ['LAYER_TYPES']),
      
      isVisible: {
        get() {
          return this.layer.visible;
        },
        set(value) {
          // Will be handled by toggleVisibility method
        }
      },
      
      isAnthropizedArea() {
        return this.layer.id === this.LAYER_TYPES.ANTHROPIZED_AREA;
      }
    },
    
    methods: {
      ...mapActions('layers', ['toggleLayerVisibility', 'clearLayer']),
      ...mapActions('map', ['zoomToExtent']),
      
      toggleVisibility(visible) {
        this.$emit('visibility-toggled', {
          layerId: this.layer.id,
          visible
        });
      },
      
      zoomToLayer() {
        // Get the extent of all features in the layer
        if (!this.layer.features || this.layer.features.length === 0) {
          return;
        }
        
        // Import the required ArcGIS modules
        import('@arcgis/core/geometry/Extent').then(({ default: Extent }) => {
          import('@arcgis/core/geometry/geometryEngine').then(({ default: geometryEngine }) => {
            // Get the extent of the first feature
            let extent = this.layer.features[0].geometry.extent;
            
            // Union the extents of all features
            for (let i = 1; i < this.layer.features.length; i++) {
              const featureExtent = this.layer.features[i].geometry.extent;
              extent = extent.union(featureExtent);
            }
            
            // Add padding to the extent
            extent = extent.expand(1.2);
            
            // Zoom to the extent
            this.zoomToExtent(extent);
          });
        });
      },
      
      clearLayer() {
        // Show confirmation dialog before clearing
        this.$confirm('Are you sure you want to remove all features from this layer?', 'Confirm', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          this.$store.dispatch('layers/clearLayer', this.layer.id);
        }).catch(() => {
          // Cancelled
        });
      },
      
      formatGeometryType(type) {
        switch (type) {
          case 'point':
            return 'Point';
          case 'polygon':
            return 'Polygon';
          case 'multipolygon':
            return 'Multi Polygon';
          default:
            return type;
        }
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .layer-item {
    padding: 10px;
    border-bottom: 1px solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .layer-item-content {
      display: flex;
      align-items: center;
      
      .layer-visibility {
        margin-right: 10px;
      }
      
      .layer-info {
        flex-grow: 1;
        
        .layer-name {
          font-weight: bold;
          font-size: 14px;
        }
        
        .layer-type {
          font-size: 12px;
          color: #999;
        }
      }
      
      .layer-actions {
        display: flex;
        
        .el-button {
          padding: 2px 5px;
        }
      }
    }
  }
  </style>