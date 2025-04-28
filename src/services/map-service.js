/**
 * Service for managing map operations
 */

/**
 * Initialize a new ArcGIS map and view
 * @param {HTMLElement} container - DOM element to contain the map
 * @param {Object} options - Map initialization options
 * @returns {Promise<{map: Object, view: Object}>} - ArcGIS Map and MapView instances
 */
// In your map-service.js or similar file
export async function initializeMap(container, options = {}) {
  try {
    // Import required ArcGIS modules
    const Map = (await import('@arcgis/core/Map')).default;
    const MapView = (await import('@arcgis/core/views/MapView')).default;
    
    // Default options
    const defaultOptions = {
      basemap: 'satellite',
      zoom: 4,
      center: [-51.9253, -14.2350] // Brazil center
    };
    
    // Merge options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Create the map
    const map = new Map({
      basemap: mergedOptions.basemap
    });
    
    // Create the map view
    const view = new MapView({
      container,
      map,
      zoom: mergedOptions.zoom,
      center: mergedOptions.center,
      constraints: {
        snapToZoom: false
      }
    });
    
    // Wait for the view to be ready with a timeout
    const viewReady = await Promise.race([
      view.when(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Map view initialization timeout')), 10000)
      )
    ]);
    
    return { map, view };
  } catch (error) {
    console.error('Error initializing map:', error);
    throw error;
  }
}

/**
 * Create a GraphicsLayer for a specific layer
 * @param {Object} layerConfig - Layer configuration
 * @returns {Promise<Object>} - ArcGIS GraphicsLayer instance
 */
export async function createGraphicsLayer(layerConfig) {
  try {
    // Import required ArcGIS modules
    const { default: GraphicsLayer } = await import('@arcgis/core/layers/GraphicsLayer');
    
    // Create the graphics layer
    const graphicsLayer = new GraphicsLayer({
      id: layerConfig.id,
      title: layerConfig.name,
      visible: layerConfig.visible,
      listMode: 'show'
    });
    
    return graphicsLayer;
  } catch (error) {
    console.error('Error creating graphics layer:', error);
    throw error;
  }
}

/**
 * Create a SketchViewModel for drawing operations
 * @param {Object} view - ArcGIS MapView instance
 * @param {Object} layer - ArcGIS GraphicsLayer for sketching
 * @returns {Promise<Object>} - ArcGIS SketchViewModel instance
 */
export async function createSketchViewModel(view, layer) {
  try {
    // Import required ArcGIS modules
    const { default: SketchViewModel } = await import('@arcgis/core/widgets/Sketch/SketchViewModel');
    
    // Create the sketch view model
    const sketchViewModel = new SketchViewModel({
      view,
      layer,
      defaultCreateOptions: {
        mode: 'hybrid'
      },
      defaultUpdateOptions: {
        enableRotation: false,
        enableScaling: false,
        toggleToolOnClick: false
      }
    });
    
    return sketchViewModel;
  } catch (error) {
    console.error('Error creating sketch view model:', error);
    throw error;
  }
}

/**
 * Add a measurement widget to the map
 * @param {Object} view - ArcGIS MapView instance
 * @param {string} measurementType - Type of measurement ('area' or 'distance')
 * @returns {Promise<Object>} - ArcGIS measurement widget instance
 */
export async function addMeasurementWidget(view, measurementType = 'area') {
  try {
    // Import required ArcGIS modules
    const modules = measurementType === 'area' 
      ? [import('@arcgis/core/widgets/AreaMeasurement2D')]
      : [import('@arcgis/core/widgets/DistanceMeasurement2D')];
    
    const [{ default: MeasurementWidget }] = await Promise.all(modules);
    
    // Create the measurement widget
    const measurementWidget = new MeasurementWidget({
      view,
      unit: measurementType === 'area' ? 'hectares' : 'kilometers'
    });
    
    // Add the widget to the map
    view.ui.add(measurementWidget, 'bottom-left');
    
    // Activate the widget
    measurementWidget.viewModel.start();
    
    return measurementWidget;
  } catch (error) {
    console.error('Error adding measurement widget:', error);
    throw error;
  }
}

/**
 * Zoom to a specific extent or feature
 * @param {Object} view - ArcGIS MapView instance
 * @param {Object} target - Extent or Geometry to zoom to
 * @param {Object} options - Zoom options
 * @returns {Promise<void>}
 */
export async function zoomToTarget(view, target, options = {}) {
  try {
    // Default options
    const defaultOptions = {
      padding: 50,
      animate: true,
      duration: 500
    };
    
    // Merge options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Determine if target is an extent or geometry
    if (target.type === 'extent') {
      // Zoom to the extent
      await view.goTo(target, mergedOptions);
    } else {
      // Get the extent of the geometry
      const extent = target.extent.clone();
      
      // Add padding to the extent
      extent.expand(1.2);
      
      // Zoom to the extent
      await view.goTo(extent, mergedOptions);
    }
  } catch (error) {
    console.error('Error zooming to target:', error);
    throw error;
  }
}

/**
 * Get graphics at a specific point on the map
 * @param {Object} view - ArcGIS MapView instance
 * @param {Object} point - ArcGIS Point geometry or screen point
 * @param {Object} options - Hit test options
 * @returns {Promise<Array<Object>>} - Array of hit test results
 */
export async function hitTestGraphics(view, point, options = {}) {
  try {
    // Default options
    const defaultOptions = {
      include: view.map.allLayers
    };
    
    // Merge options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Determine if point is a map point or screen point
    const screenPoint = point.type === 'point' 
      ? view.toScreen(point) 
      : point;
    
    // Perform the hit test
    const hitTestResult = await view.hitTest(screenPoint, mergedOptions);
    
    // Filter the results to only include graphics
    return hitTestResult.results.filter(result => result.graphic);
  } catch (error) {
    console.error('Error performing hit test:', error);
    throw error;
  }
}

export default {
  initializeMap,
  createGraphicsLayer,
  createSketchViewModel,
  addMeasurementWidget,
  zoomToTarget,
  hitTestGraphics
};