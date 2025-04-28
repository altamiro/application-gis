<template lang="pug">
  .map-container
    .loading-overlay(v-if="isLoading")
      .loading-content
        i.el-icon-loading
        span.loading-text Loading map...
    .error-message(v-if="error")
      el-alert(type="error" :title="error" :closable="false")
    #mapView(ref="mapViewDiv")
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { TOOL_TYPES } from '@/config/map-config';

export default {
  name: 'MapContainer',

  data() {
    return {
      sketchViewModel: null,
      activeSketch: null,
      sketchLayer: null,
      measurementWidget: null,
      sketchWidget: null,
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
    },

    selectedLayer(newLayer) {
      if (this.activeTool &&
        [TOOL_TYPES.POINT, TOOL_TYPES.LINE, TOOL_TYPES.POLYGON, TOOL_TYPES.FILL, TOOL_TYPES.ADD_FEATURE].includes(this.activeTool.id)) {
        // Restart the tool with the new layer
        this.handleToolChange(this.activeTool);
      }
    }
  },

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
      console.log('Configurando interações do mapa...');

      try {
        // Import required ArcGIS modules
        const [
          { default: SketchViewModel },
          { default: GraphicsLayer }
        ] = await Promise.all([
          import('@arcgis/core/widgets/Sketch/SketchViewModel'),
          import('@arcgis/core/layers/GraphicsLayer')
        ]);

        console.log('Módulos ArcGIS carregados com sucesso');

        // Create a temporary graphics layer for sketch operations
        this.sketchLayer = new GraphicsLayer({
          title: 'Sketch Layer',
          listMode: 'hide'
        });

        console.log('Adicionando layer de sketch ao mapa');
        this.map.add(this.sketchLayer);

        // Initialize the SketchViewModel with clear options
        console.log('Inicializando SketchViewModel');
        this.sketchViewModel = new SketchViewModel({
          view: this.view,
          layer: this.sketchLayer,
          defaultCreateOptions: {
            mode: 'hybrid'
          },
          defaultUpdateOptions: {
            enableRotation: false,
            enableScaling: false
          },
          // Importante: Não crie manipuladores de eventos aqui para evitar duplicação
        });

        console.log('SketchViewModel criado:', this.sketchViewModel);

        // Setup event listeners for map interactions
        this.clickHandler = this.view.on('click', (event) => {
          this.handleMapClick(event);
        });

        // Listen for custom events from tool components
        this.$root.$on('activate-measurement', this.activateMeasurement);
        this.$root.$off('activate-measurement', this.activateMeasurement); // Remova listener duplicado
        this.$root.$on('activate-measurement', this.activateMeasurement);

        this.$root.$on('deactivate-measurement', this.deactivateMeasurement);
        this.$root.$off('deactivate-measurement', this.deactivateMeasurement); // Remova listener duplicado
        this.$root.$on('deactivate-measurement', this.deactivateMeasurement);

        this.$root.$on('activate-cut', this.activateCutTool);
        this.$root.$off('activate-cut', this.activateCutTool); // Remova listener duplicado
        this.$root.$on('activate-cut', this.activateCutTool);

        this.$root.$on('deactivate-cut', this.deactivateCutTool);
        this.$root.$off('deactivate-cut', this.deactivateCutTool); // Remova listener duplicado
        this.$root.$on('deactivate-cut', this.deactivateCutTool);

        // Update tool availability when map is ready
        this.$store.dispatch('tools/updateToolsAvailability');

        this.debugClickEvents();

        console.log('Interações do mapa configuradas com sucesso');
      } catch (error) {
        console.error('Erro ao configurar interações do mapa:', error);
      }
    },

    handleToolChange(newTool, oldTool) {
      // Clean up previous tool operations
      this.cleanupCurrentTool();

      // Set up new tool operations
      if (this.isMapReady && newTool) {
        switch (newTool.id) {
          case TOOL_TYPES.POINT:
            this.setupPointTool();
            break;
          case TOOL_TYPES.LINE:
            this.setupLineTool();
            break;
          case TOOL_TYPES.POLYGON:
            this.checkForEventConflicts();
            this.setupPolygonTool();
            break;
          case TOOL_TYPES.FILL:
            this.setupFillTool();
            break;
          case TOOL_TYPES.ADD_FEATURE:
            this.setupAddFeatureTool();
            break;
          case TOOL_TYPES.MEASURE:
            this.setupMeasureTool();
            break;
          case TOOL_TYPES.CUT:
            this.setupCutTool();
            break;
          case TOOL_TYPES.ERASE:
            this.setupEraseTool();
            break;
          case TOOL_TYPES.ZOOM_TO_SELECTION:
            this.setupZoomToSelectionTool();
            break;
          case TOOL_TYPES.ZOOM_IN:
            this.zoomIn();
            break;
          case TOOL_TYPES.ZOOM_OUT:
            this.zoomOut();
            break;
          default:
            // Default to navigation (pan) tool
            this.restoreMapNavigation();
            this.setupPanTool();
        }
      }
    },

    cleanupCurrentTool() {

      this.enableMapInteractions();

      // Cancel any active sketch operation
      if (this.sketchViewModel) {
        this.sketchViewModel.cancel();
        this.sketchLayer.removeAll();
      }

      // Remove any active measurement widgets
      this.cleanupMeasurementWidgets();

      // Remove any active sketch widgets
      if (this.sketchWidget) {
        this.view.ui.remove(this.sketchWidget);
        this.sketchWidget.destroy();
        this.sketchWidget = null;
      }

      // Reset cursor
      if (this.view && this.view.container) {
        this.view.container.style.cursor = 'default';
      }
    },

    handleMapClick(event) {
      if (!this.isMapReady || !this.activeTool) return;

      // Get the map point from the click event
      const mapPoint = event.mapPoint;

      switch (this.activeTool.id) {
        case TOOL_TYPES.POINT:
          if (this.selectedLayer) {
            this.addFeature({
              layerId: this.selectedLayer,
              geometry: mapPoint
            });
          }
          break;

        case TOOL_TYPES.ERASE:
          this.eraseFeatureAtPoint(mapPoint);
          break;

        default:
          // Other tools are handled by the SketchViewModel
          break;
      }
    },

    setupPointTool() {
      // Set the cursor to crosshair
      if (this.view && this.view.container) {
        this.view.container.style.cursor = 'crosshair';
      }
    },

    setupLineTool() {
      if (this.sketchViewModel) {
        this.sketchViewModel.create('polyline');
      }
    },

    async setupPolygonTool() {

      this.disableMapInteractions();

      console.log('Configurando ferramenta de polígono (implementação direta)...');

      // Limpar qualquer desenho existente
      if (this.sketchLayer) {
        this.sketchLayer.removeAll();
      }

      // Garantir que o layer está visível e na ordem correta
      this.ensureSketchLayerOrder();

      this.checkSketchViewModelStatus();

      try {
        // Destruir o SketchViewModel existente para evitar conflitos
        if (this.sketchViewModel) {
          this.sketchViewModel.destroy();
          this.sketchViewModel = null;
        }

        // Criar um novo SketchViewModel com configurações otimizadas
        const { default: SketchViewModel } = await import('@arcgis/core/widgets/Sketch/SketchViewModel');

        this.sketchViewModel = new SketchViewModel({
          view: this.view,
          layer: this.sketchLayer,
          creationMode: 'single',  // Modo de criação única
          updateOnGraphicClick: false, // Evita conflitos com cliques
          defaultCreateOptions: {
            mode: 'click'  // Modo de clique para desenho
          }
        });

        console.log('Novo SketchViewModel criado');

        // Aguarde para garantir que o SketchViewModel foi inicializado
        await new Promise(resolve => setTimeout(resolve, 100));

        // Iniciar modo de criação de polígono
        console.log('Iniciando modo de criação de polígono');
        this.sketchViewModel.create('polygon');

        // Definir manipulador de evento para capturar a conclusão do desenho
        this.sketchViewModel.on('create-complete', (event) => {
          console.log('Polígono concluído:', event);

          if (event.graphic && event.graphic.geometry) {
            // Definir para qual layer enviar (PROPERTY_AREA como padrão)
            const targetLayer = this.selectedLayer || 'property-area';

            console.log('Adicionando polígono ao layer:', targetLayer);
            this.addFeature({
              layerId: targetLayer,
              geometry: event.graphic.geometry
            });

            // Limpar o sketch e reiniciar o modo de desenho
            this.sketchLayer.removeAll();

            // Apenas reinicie o modo de desenho se ainda estiver na ferramenta de polígono
            if (this.activeTool && this.activeTool.id === 'polygon') {
              setTimeout(() => {
                this.sketchViewModel.create('polygon');
              }, 200);
            }
          }
        });

        // Definir cursor apropriado
        if (this.view && this.view.container) {
          this.view.container.style.cursor = 'crosshair';
        }

        console.log('Ferramenta de polígono configurada com sucesso');
      } catch (error) {
        console.error('Erro ao configurar ferramenta de polígono:', error);
      }
    },

    setupFillTool() {
      if (this.sketchViewModel) {
        this.sketchViewModel.create('polygon', { mode: 'freehand' });
      }
    },

    setupAddFeatureTool() {
      const layer = this.selectedLayer ? this.getLayerById(this.selectedLayer) : null;
      if (!layer || !this.sketchViewModel) return;

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

    async setupMeasureTool() {
      await this.cleanupMeasurementWidgets();

      // Default to area measurement
      this.activateMeasurement({ type: 'area' });
    },

    async activateMeasurement({ type }) {
      // Import required ArcGIS modules
      const modules = type === 'area'
        ? [import('@arcgis/core/widgets/AreaMeasurement2D')]
        : [import('@arcgis/core/widgets/DistanceMeasurement2D')];

      const [{ default: MeasurementWidget }] = await Promise.all(modules);

      // Clean up any existing measurement widgets
      await this.cleanupMeasurementWidgets();

      // Create and add the measurement widget to the map
      this.measurementWidget = new MeasurementWidget({
        view: this.view,
        unit: type === 'area' ? 'hectares' : 'meters'
      });

      this.view.ui.add(this.measurementWidget, 'bottom-left');

      // Start the measurement
      this.measurementWidget.viewModel.start();

      // Listen for measurement updates
      this.measurementWidget.watch('viewModel.measurement', (measurement) => {
        if (measurement && this.$store) {
          this.$store.commit('tools/SET_MEASURE_RESULT',
            type === 'area'
              ? measurement.area.value.toFixed(2)
              : measurement.length.value.toFixed(2)
          );
        }
      });
    },

    async cleanupMeasurementWidgets() {
      if (this.measurementWidget) {
        this.view.ui.remove(this.measurementWidget);
        this.measurementWidget.destroy();
        this.measurementWidget = null;

        // Clear measurement result
        this.$store.commit('tools/SET_MEASURE_RESULT', null);
      }
    },

    async deactivateMeasurement() {
      await this.cleanupMeasurementWidgets();
    },

    async setupCutTool() {
      // Import required ArcGIS modules
      const { default: Sketch } = await import('@arcgis/core/widgets/Sketch');

      // Create and add the sketch widget to the map
      this.sketchWidget = new Sketch({
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

      this.view.ui.add(this.sketchWidget, 'top-right');

      // Setup completion event
      this.sketchWidget.on('update', (event) => {
        if (event.state === 'complete' && event.graphics.length > 0) {
          const graphic = event.graphics[0];
          const { layerId, id } = graphic.attributes;

          if (layerId && id) {
            // Update the feature in the store
            this.$store.dispatch('layers/updateFeature', {
              layerId,
              featureId: id,
              geometry: graphic.geometry
            });

            // Clear the sketch
            this.sketchLayer.removeAll();
          }
        }
      });
    },

    async activateCutTool({ layerId, featureId }) {
      const layer = this.getLayerById(layerId);
      if (!layer) return;

      const feature = layer.features.find(f => f.id === featureId);
      if (!feature) return;

      // Add the feature to the sketch layer for editing
      const [
        { default: Graphic },
        { default: SimpleFillSymbol },
        { default: SimpleLineSymbol }
      ] = await Promise.all([
        import('@arcgis/core/Graphic'),
        import('@arcgis/core/symbols/SimpleFillSymbol'),
        import('@arcgis/core/symbols/SimpleLineSymbol')
      ]);

      const graphic = new Graphic({
        geometry: feature.geometry,
        symbol: new SimpleFillSymbol({
          color: [255, 255, 0, 0.3],
          outline: new SimpleLineSymbol({
            color: [255, 255, 0, 0.8],
            width: 2
          })
        }),
        attributes: {
          id: feature.id,
          layerId: layerId
        }
      });

      this.sketchLayer.add(graphic);

      // Select the graphic for editing
      if (this.sketchWidget) {
        this.sketchWidget.update([graphic]);
      }
    },

    async deactivateCutTool() {
      if (this.sketchWidget) {
        this.view.ui.remove(this.sketchWidget);
        this.sketchWidget.destroy();
        this.sketchWidget = null;
      }

      this.sketchLayer.removeAll();
    },

    setupEraseTool() {
      // Set the cursor to a delete icon
      if (this.view && this.view.container) {
        this.view.container.style.cursor = 'not-allowed';
      }
    },

    setupZoomToSelectionTool() {
      if (this.sketchViewModel) {
        this.sketchViewModel.create('rectangle');

        // Use one-time listener for complete event
        const completeListener = this.sketchViewModel.on('create-complete', (event) => {
          const { geometry } = event.graphic;

          // Zoom to the selected area
          this.view.extent = geometry.extent;

          // Clear the sketch
          this.sketchLayer.removeAll();

          // Return to the pan tool
          this.$store.dispatch('tools/setActiveTool', TOOL_TYPES.PAN);

          // Remove the listener to avoid memory leaks
          completeListener.remove();
        });
      }
    },

    setupPanTool() {
      // Enable map navigation
      if (this.view) {
        this.view.navigation.mouseWheelZoomEnabled = true;
        this.view.navigation.browserTouchPanEnabled = true;

        // Set the cursor to the default
        if (this.view.container) {
          this.view.container.style.cursor = 'default';
        }
      }
    },

    zoomIn() {
      if (this.view) {
        this.view.zoom += 1;

        // Return to pan tool afterward
        this.$store.dispatch('tools/setActiveTool', TOOL_TYPES.PAN);
      }
    },

    zoomOut() {
      if (this.view) {
        this.view.zoom = Math.max(0, this.view.zoom - 1);

        // Return to pan tool afterward
        this.$store.dispatch('tools/setActiveTool', TOOL_TYPES.PAN);
      }
    },

    async eraseFeatureAtPoint(point) {
      if (!this.view) return;

      // Get all graphics at the clicked point
      const response = await this.view.hitTest(this.view.toScreen(point));
      const graphics = response.results.filter(result => result.graphic && result.graphic.layer);

      if (graphics.length > 0) {
        // Get the top-most graphic
        const graphic = graphics[0].graphic;

        // Get the layer ID and feature ID
        const layerId = graphic.attributes.layerId;
        const featureId = graphic.attributes.id;

        if (!layerId || !featureId) return;

        // If this is the property area and it's the only one
        if (layerId === this.LAYER_TYPES.PROPERTY_AREA) {
          const propertyAreaLayer = this.getLayerById(this.LAYER_TYPES.PROPERTY_AREA);
          if (propertyAreaLayer && propertyAreaLayer.features.length === 1) {
            // Show confirmation dialog
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
    },

    checkForEventConflicts() {
      console.log('Verificando conflitos de eventos...');

      // Desative temporariamente o pan do mapa para garantir que o sketch funcione
      if (this.view) {
        console.log('Estado atual de navegação:', {
          mouseWheelZoomEnabled: this.view.navigation.mouseWheelZoomEnabled,
          browserTouchPanEnabled: this.view.navigation.browserTouchPanEnabled
        });

        // Armazene as configurações atuais
        this._savedNavigationState = {
          mouseWheelZoomEnabled: this.view.navigation.mouseWheelZoomEnabled,
          browserTouchPanEnabled: this.view.navigation.browserTouchPanEnabled
        };

        // Desative temporariamente para o modo de desenho
        this.view.navigation.mouseWheelZoomEnabled = false;
        this.view.navigation.browserTouchPanEnabled = false;

        console.log('Navegação do mapa temporariamente desativada para desenho');
      }
    },

    // E adicione este método para restaurar
    restoreMapNavigation() {
      if (this.view && this._savedNavigationState) {
        // Restaure as configurações anteriores
        this.view.navigation.mouseWheelZoomEnabled = this._savedNavigationState.mouseWheelZoomEnabled;
        this.view.navigation.browserTouchPanEnabled = this._savedNavigationState.browserTouchPanEnabled;

        console.log('Navegação do mapa restaurada');
      }
    },

    ensureSketchLayerOrder() {
      if (this.map && this.sketchLayer) {
        // Coloque o layer de desenho no topo
        const layerIndex = this.map.layers.indexOf(this.sketchLayer);
        if (layerIndex >= 0) {
          this.map.reorder(this.sketchLayer, this.map.layers.length - 1);
          console.log('SketchLayer movido para o topo da pilha de layers');
        }
      }
    },

    // Adicione este método para depurar eventos de clique
    debugClickEvents() {
      console.log('Configurando depuração de eventos de clique');

      // Remova handler anterior se existir
      if (this._debugClickHandler) {
        this._debugClickHandler.remove();
        this._debugClickHandler = null;
      }

      // Adicione um novo handler de clique para depuração
      this._debugClickHandler = this.view.on('click', (event) => {
        console.log('Evento de clique detectado:', {
          mapPoint: event.mapPoint,
          screenPoint: event.screenPoint,
          timestamp: new Date().toISOString()
        });
      });
    },

    checkSketchViewModelStatus() {
      console.log('Verificando status do SketchViewModel:');

      if (!this.sketchViewModel) {
        console.error('SketchViewModel não está inicializado');
        return false;
      }

      console.log({
        ready: this.sketchViewModel.ready,
        state: this.sketchViewModel.state,
        updateOnGraphicClick: this.sketchViewModel.updateOnGraphicClick,
        view: !!this.sketchViewModel.view,
        layer: !!this.sketchViewModel.layer,
        activeAction: this.sketchViewModel.activeAction
      });

      return true;
    },

    disableMapInteractions() {
      if (this.view) {
        console.log('Desativando interações do mapa para permitir desenho');

        // Desativar navegação padrão
        this.view.navigation.mouseWheelZoomEnabled = false;
        this.view.navigation.browserTouchPanEnabled = false;

        // Armazenar manipuladores de eventos atuais para restaurá-los depois
        this._savedHandlers = {
          click: this.view.on('click'),
          drag: this.view.on('drag'),
          pointer: this.view.on('pointer-move')
        };

        // Focar na view para garantir que os eventos vão para o lugar certo
        if (this.view.container) {
          this.view.container.focus();
        }
      }
    },

    enableMapInteractions() {
      if (this.view) {
        console.log('Reativando interações do mapa');

        // Restaurar navegação
        this.view.navigation.mouseWheelZoomEnabled = true;
        this.view.navigation.browserTouchPanEnabled = true;
      }
    }

  },

  beforeDestroy() {
    // Clean up event listeners
    if (this.$root) {
      this.$root.$off('activate-measurement', this.activateMeasurement);
      this.$root.$off('deactivate-measurement', this.deactivateMeasurement);
      this.$root.$off('activate-cut', this.activateCutTool);
      this.$root.$off('deactivate-cut', this.deactivateCutTool);
    }

    // Remove click handler
    if (this.clickHandler) {
      this.clickHandler.remove();
      this.clickHandler = null;
    }

    // Remove pointer move handler
    if (this.pointerMoveHandler) {
      this.pointerMoveHandler.remove();
      this.pointerMoveHandler = null;
    }

    // Clean up widgets
    this.cleanupMeasurementWidgets();

    if (this.sketchWidget) {
      this.view.ui.remove(this.sketchWidget);
      this.sketchWidget.destroy();
      this.sketchWidget = null;
    }

    // Reset the cursor
    if (this.view && this.view.container) {
      this.view.container.style.cursor = 'default';
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

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    i {
      font-size: 32px;
      color: #409EFF;
      margin-bottom: 10px;
    }

    .loading-text {
      font-size: 16px;
      color: #606266;
    }
  }
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