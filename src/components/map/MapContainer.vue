<template lang="pug">
  .map-container
    .loading-overlay(v-if="isLoading")
      el-spinner(type="primary")
      span Loading map...
    .error-message(v-if="error")
      el-alert(type="error" :title="error" :closable="false")
    #mapView(ref="mapViewDiv")
  </template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'MapContainer',

  data() {
    return {
      sketchViewModel: null,
      activeSketch: null,
      sketchLayer: null,
      pointGraphic: null,
      lineGraphic: null,
      polygonGraphic: null,
      clickHandler: null,
      pointerMoveHandler: null
    };
  },

  computed: {
    ...mapState('map', ['isLoaded', 'isLoading', 'error', 'view', 'map']),
    ...mapGetters('map', ['isMapReady']),
    ...mapState('tools', ['activeTool']),
    ...mapGetters('tools', ['TOOLS']),
    ...mapState('layers', ['selectedLayer']),
    ...mapGetters('layers', ['getLayerById', 'LAYER_TYPES', 'hasPropertyArea'])
  },

  watch: {
    isMapReady(ready) {
      if (ready) {
        this.setupMapInteractions();
      }
    },

    activeTool(newTool, oldTool) {
      this.handleToolChange(newTool, oldTool);
    }
  },

  // In your MapContainer component
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.mapViewDiv) {
        this.initializeMap({ mapContainer: this.$refs.mapViewDiv });
      } else {
        console.error('Map container element not found');
      }
    });
  },

  methods: {
    ...mapActions('map', ['initializeMap']),
    ...mapActions('layers', ['addFeature']),

    async setupMapInteractions() {
      // Import required ArcGIS modules
      const [
        { default: SketchViewModel },
        { default: GraphicsLayer },
        { default: Point },
        { default: Polyline },
        { default: Polygon }
      ] = await Promise.all([
        import('@arcgis/core/widgets/Sketch/SketchViewModel'),
        import('@arcgis/core/layers/GraphicsLayer'),
        import('@arcgis/core/geometry/Point'),
        import('@arcgis/core/geometry/Polyline'),
        import('@arcgis/core/geometry/Polygon')
      ]);

      // Create a temporary graphics layer for sketch operations
      this.sketchLayer = new GraphicsLayer({
        title: 'Sketch Layer',
        listMode: 'hide'
      });

      this.map.add(this.sketchLayer);

      // Initialize the SketchViewModel
      this.sketchViewModel = new SketchViewModel({
        view: this.view,
        layer: this.sketchLayer,
        defaultCreateOptions: {
          mode: 'hybrid'
        }
      });

      // Setup event listeners for sketch operations
      this.sketchViewModel.on('create-complete', (event) => {
        const { geometry } = event.graphic;

        // Add the feature to the selected layer
        if (this.selectedLayer) {
          this.addFeature({
            layerId: this.selectedLayer,
            geometry: geometry
          });
        }

        // Clear the sketch
        this.sketchLayer.removeAll();
      });

      // Setup event listeners for map interactions
      this.view.on('click', (event) => {
        this.handleMapClick(event);
      });
    },

    handleToolChange(newTool, oldTool) {
      // Clean up previous tool operations
      if (this.sketchViewModel) {
        this.sketchViewModel.cancel();
        this.sketchLayer.removeAll();
      }

      // Set up new tool operations
      if (this.isMapReady) {
        switch (newTool.id) {
          case this.TOOLS.POINT:
            this.setupPointTool();
            break;
          case this.TOOLS.LINE:
            this.setupLineTool();
            break;
          case this.TOOLS.POLYGON:
            this.setupPolygonTool();
            break;
          case this.TOOLS.FILL:
            this.setupFillTool();
            break;
          case this.TOOLS.ADD_FEATURE:
            this.setupAddFeatureTool();
            break;
          case this.TOOLS.MEASURE:
            this.setupMeasureTool();
            break;
          case this.TOOLS.CUT:
            this.setupCutTool();
            break;
          case this.TOOLS.ERASE:
            this.setupEraseTool();
            break;
          case this.TOOLS.ZOOM_TO_SELECTION:
            this.setupZoomToSelectionTool();
            break;
          default:
            // Default to navigation (pan) tool
            this.setupPanTool();
        }
      }
    },

    handleMapClick(event) {
      if (!this.isMapReady || !this.activeTool) return;

      // Get the map point from the click event
      const mapPoint = event.mapPoint;

      switch (this.activeTool.id) {
        case this.TOOLS.POINT:
          if (this.selectedLayer) {
            this.addFeature({
              layerId: this.selectedLayer,
              geometry: mapPoint
            });
          }
          break;

        case this.TOOLS.ERASE:
          this.eraseFeatureAtPoint(mapPoint);
          break;

        case this.TOOLS.ZOOM_TO_SELECTION:
          // Handled by the SketchViewModel
          break;

        default:
          // Other tools are handled by the SketchViewModel
          break;
      }
    },

    setupPointTool() {
      // Property area must be drawn first for all layers except property area itself
      if (this.selectedLayer !== this.LAYER_TYPES.PROPERTY_AREA && !this.hasPropertyArea) {
        this.$message.warning('Property Area must be drawn first');
        this.$store.dispatch('tools/setActiveTool', this.TOOLS.PAN);
        return;
      }

      // Get the current cursor
      const originalCursor = this.view.container.style.cursor;

      // Set the cursor to crosshair
      this.view.container.style.cursor = 'crosshair';

      // When switching to another tool, restore the original cursor
      this.$once('hook:beforeDestroy', () => {
        this.view.container.style.cursor = originalCursor;
      });
    },

    setupLineTool() {
      // Property area must be drawn first
      if (!this.hasPropertyArea) {
        this.$message.warning('Property Area must be drawn first');
        this.$store.dispatch('tools/setActiveTool', this.TOOLS.PAN);
        return;
      }

      // Start the polyline sketch
      this.sketchViewModel.create('polyline');
    },

    setupPolygonTool() {
      // Start the polygon sketch
      this.sketchViewModel.create('polygon');
    },

    setupFillTool() {
      // Property area must be drawn first
      if (!this.hasPropertyArea) {
        this.$message.warning('Property Area must be drawn first');
        this.$store.dispatch('tools/setActiveTool', this.TOOLS.PAN);
        return;
      }

      // Start the polygon sketch with freehand mode
      this.sketchViewModel.create('polygon', { mode: 'freehand' });
    },

    setupAddFeatureTool() {
      // Property area must be drawn first
      if (!this.hasPropertyArea) {
        this.$message.warning('Property Area must be drawn first');
        this.$store.dispatch('tools/setActiveTool', this.TOOLS.PAN);
        return;
      }

      const layer = this.getLayerById(this.selectedLayer);
      if (!layer) return;

      // Start the sketch based on the layer geometry type
      switch (layer.geometryType) {
        case 'point':
          this.sketchViewModel.create('point');
          break;
        case 'polyline':
          this.sketchViewModel.create('polyline');
          break;
        case 'polygon':
        case 'multipolygon':
          this.sketchViewModel.create('polygon');
          break;
      }
    },

    setupMeasureTool() {
      // Import required ArcGIS modules
      Promise.all([
        import('@arcgis/core/widgets/DistanceMeasurement2D'),
        import('@arcgis/core/widgets/AreaMeasurement2D')
      ]).then(([{ default: DistanceMeasurement2D }, { default: AreaMeasurement2D }]) => {
        // Create and add the measurement widget to the map
        const measurementWidget = new AreaMeasurement2D({
          view: this.view,
          unit: 'hectares'
        });

        this.view.ui.add(measurementWidget, 'bottom-left');

        // When switching to another tool, remove the widget
        this.$once('hook:beforeDestroy', () => {
          this.view.ui.remove(measurementWidget);
          measurementWidget.destroy();
        });

        // Start the measurement
        measurementWidget.viewModel.start();
      });
    },

    setupCutTool() {
      // Property area must be drawn first
      if (!this.hasPropertyArea) {
        this.$message.warning('Property Area must be drawn first');
        this.$store.dispatch('tools/setActiveTool', this.TOOLS.PAN);
        return;
      }

      // Import required ArcGIS modules
      import('@arcgis/core/widgets/Sketch').then(({ default: Sketch }) => {
        // Create and add the sketch widget to the map
        const sketchWidget = new Sketch({
          view: this.view,
          layer: this.sketchLayer,
          creationMode: 'update',
          updateOnGraphicClick: true,
          defaultUpdateOptions: {
            tool: 'reshape',
            enableRotation: false,
            enableScaling: false,
            enableZ: false
          }
        });

        this.view.ui.add(sketchWidget, 'top-right');

        // When switching to another tool, remove the widget
        this.$once('hook:beforeDestroy', () => {
          this.view.ui.remove(sketchWidget);
          sketchWidget.destroy();
        });
      });
    },

    setupEraseTool() {
      // Set the cursor to a delete icon
      this.view.container.style.cursor = 'not-allowed';

      // When switching to another tool, restore the cursor
      this.$once('hook:beforeDestroy', () => {
        this.view.container.style.cursor = 'default';
      });
    },

    setupZoomToSelectionTool() {
      // Start the rectangle sketch for selection
      this.sketchViewModel.create('rectangle');

      // When the sketch is complete, zoom to the selected area
      this.sketchViewModel.on('create-complete', (event) => {
        const { geometry } = event.graphic;

        // Zoom to the selected area
        this.view.extent = geometry.extent;

        // Clear the sketch
        this.sketchLayer.removeAll();

        // Return to the pan tool
        this.$store.dispatch('tools/setActiveTool', this.TOOLS.PAN);
      });
    },

    setupPanTool() {
      // Enable map navigation
      this.view.navigation.mouseWheelZoomEnabled = true;
      this.view.navigation.browserTouchPanEnabled = true;

      // Set the cursor to the default
      this.view.container.style.cursor = 'default';
    },

    eraseFeatureAtPoint(point) {
      // Get all graphics at the clicked point
      this.view.hitTest(this.view.toScreen(point)).then(response => {
        const graphics = response.results.filter(result => result.graphic && result.graphic.layer);

        if (graphics.length > 0) {
          // Get the top-most graphic
          const graphic = graphics[0].graphic;
          const layer = graphic.layer;

          // Get the layer ID and feature ID
          const layerId = graphic.attributes.layerId;
          const featureId = graphic.attributes.id;

          // If this is the property area and it's the only one
          if (layerId === this.LAYER_TYPES.PROPERTY_AREA) {
            const propertyAreaLayer = this.getLayerById(this.LAYER_TYPES.PROPERTY_AREA);
            if (propertyAreaLayer && propertyAreaLayer.features.length === 1) {
              // Confirm deletion of property area
              this.$confirm('Deleting the Property Area will remove all other layers. Are you sure you want to proceed?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
              }).then(() => {
                // Remove the feature
                this.$store.dispatch('layers/removeFeature', {
                  layerId,
                  featureId
                });
              }).catch(() => {
                // Cancelled
              });
            } else {
              // Remove the feature
              this.$store.dispatch('layers/removeFeature', {
                layerId,
                featureId
              });
            }
          } else {
            // Remove the feature
            this.$store.dispatch('layers/removeFeature', {
              layerId,
              featureId
            });
          }
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.map-container {
  height: 100%;
  width: 100%;
  position: relative;
}

#mapView {
  height: 100%;
  width: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  width: 80%;
  max-width: 400px;
}
</style>