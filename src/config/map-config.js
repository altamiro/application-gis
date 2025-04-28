/**
 * Configuration for the GIS application
 */

// Layer types
export const LAYER_TYPES = {
  PROPERTY_AREA: 'property-area',
  PROPERTY_HEADQUARTERS: 'property-headquarters',
  CONSOLIDATED_AREA: 'consolidated-area',
  NATIVE_VEGETATION: 'native-vegetation',
  FALLOW_AREA: 'fallow-area',
  ANTHROPIZED_AREA: 'anthropized-area'
};

// Geometry types
export const GEOMETRY_TYPES = {
  POINT: 'point',
  POLYLINE: 'polyline',
  POLYGON: 'polygon',
  MULTIPOLYGON: 'multipolygon'
};

// Tool types
export const TOOL_TYPES = {
  PAN: 'pan',
  POINT: 'point',
  LINE: 'line',
  POLYGON: 'polygon',
  FILL: 'fill',
  ADD_FEATURE: 'add-feature',
  MEASURE: 'measure',
  CUT: 'cut',
  ERASE: 'erase',
  ZOOM_IN: 'zoom-in',
  ZOOM_OUT: 'zoom-out',
  ZOOM_TO_SELECTION: 'zoom-to-selection'
};

// Layer configurations
export const LAYERS = [
  {
    id: LAYER_TYPES.PROPERTY_AREA,
    name: 'Property Area',
    description: 'The boundary of the property',
    geometryType: GEOMETRY_TYPES.POLYGON,
    allowMultiple: false,
    required: true,
    order: 0,
    editable: true,
    visible: true,
    style: {
      fillColor: [0, 0, 0, 0.1],
      outlineColor: [0, 0, 0, 0.7],
      outlineWidth: 2
    },
    rules: [
      'Other layers cannot be drawn until the Property Area is defined.',
      'If deleted, all other layers will also be deleted.'
    ]
  },
  {
    id: LAYER_TYPES.PROPERTY_HEADQUARTERS,
    name: 'Property Headquarters',
    description: 'The main building or administrative center of the property',
    geometryType: GEOMETRY_TYPES.POINT,
    allowMultiple: false,
    required: false,
    order: 1,
    editable: true,
    visible: true,
    style: {
      color: [255, 0, 0, 1],
      size: 10,
      outlineColor: [255, 255, 255, 0.7],
      outlineWidth: 1
    },
    rules: [
      'Must be located inside the Property Area.',
      'May overlap any feature except hydrology features.'
    ]
  },
  {
    id: LAYER_TYPES.CONSOLIDATED_AREA,
    name: 'Consolidated Area',
    description: 'Areas used for agricultural or other productive activities',
    geometryType: GEOMETRY_TYPES.MULTIPOLYGON,
    allowMultiple: true,
    required: false,
    order: 2,
    editable: true,
    visible: true,
    style: {
      fillColor: [255, 165, 0, 0.5],
      outlineColor: [255, 165, 0, 0.8],
      outlineWidth: 1
    },
    rules: [
      'Only counted within the Property Area.',
      'Cannot overlap Native Vegetation, Administrative Easement, or Hydrology.',
      'When overlapping with these layers, the Consolidated Area must be clipped.'
    ]
  },
  {
    id: LAYER_TYPES.NATIVE_VEGETATION,
    name: 'Native Vegetation',
    description: 'Areas with original or regenerated native vegetation',
    geometryType: GEOMETRY_TYPES.MULTIPOLYGON,
    allowMultiple: true,
    required: false,
    order: 3,
    editable: true,
    visible: true,
    style: {
      fillColor: [0, 128, 0, 0.5],
      outlineColor: [0, 128, 0, 0.8],
      outlineWidth: 1
    },
    rules: [
      'Only counted within the Property Area.',
      'Cannot overlap Consolidated Area, Administrative Easement, or Hydrology.',
      'Must prevail when overlapping with Consolidated Area, Anthropized Area after 2008, or Fallow Area.'
    ]
  },
  {
    id: LAYER_TYPES.FALLOW_AREA,
    name: 'Fallow Area',
    description: 'Previously cultivated land left to recover',
    geometryType: GEOMETRY_TYPES.MULTIPOLYGON,
    allowMultiple: true,
    required: false,
    order: 4,
    editable: true,
    visible: true,
    style: {
      fillColor: [210, 180, 140, 0.5],
      outlineColor: [210, 180, 140, 0.8],
      outlineWidth: 1
    },
    rules: [
      'Only counted within the Property Area.',
      'When overlapping with Native Vegetation, Administrative Easement, or Hydrology, the Fallow Area must be clipped.'
    ]
  },
  {
    id: LAYER_TYPES.ANTHROPIZED_AREA,
    name: 'Anthropized Area 2018',
    description: 'Areas altered by human activity after 2018',
    geometryType: GEOMETRY_TYPES.MULTIPOLYGON,
    allowMultiple: true,
    required: false,
    order: 5,
    editable: true,
    visible: true,
    style: {
      fillColor: [255, 0, 0, 0.5],
      outlineColor: [255, 0, 0, 0.8],
      outlineWidth: 1
    },
    rules: [
      'Only counted within the Property Area.',
      'Must remain visible to the user at all times on the map.'
    ]
  }
];

// Tool configurations
export const TOOLS = [
  {
    id: TOOL_TYPES.PAN,
    name: 'Pan Tool',
    description: 'Move the map',
    icon: 'el-icon-rank',
    cursor: 'grab',
    order: 0,
    alwaysEnabled: true
  },
  {
    id: TOOL_TYPES.POINT,
    name: 'Point Tool',
    description: 'Draw points',
    icon: 'el-icon-location-outline',
    cursor: 'crosshair',
    order: 1,
    alwaysEnabled: false
  },
  {
    id: TOOL_TYPES.LINE,
    name: 'Line Tool',
    description: 'Draw lines',
    icon: 'el-icon-minus',
    cursor: 'crosshair',
    order: 2,
    alwaysEnabled: false
  },
  {
    id: TOOL_TYPES.POLYGON,
    name: 'Polygon Tool',
    description: 'Draw polygons',
    icon: 'el-icon-crop',
    cursor: 'crosshair',
    order: 3,
    alwaysEnabled: false
  },
  {
    id: TOOL_TYPES.FILL,
    name: 'Fill Tool',
    description: 'Draw areas or freehand shapes',
    icon: 'el-icon-tickets',
    cursor: 'crosshair',
    order: 4,
    alwaysEnabled: false
  },
  {
    id: TOOL_TYPES.ADD_FEATURE,
    name: 'Add Feature Tool',
    description: 'Add new geometries',
    icon: 'el-icon-plus',
    cursor: 'crosshair',
    order: 5,
    alwaysEnabled: false
  },
  {
    id: TOOL_TYPES.MEASURE,
    name: 'Measure Tool',
    description: 'Measure distances or areas',
    icon: 'el-icon-discover',
    cursor: 'crosshair',
    order: 6,
    alwaysEnabled: false
  },
  {
    id: TOOL_TYPES.CUT,
    name: 'Cut Tool',
    description: 'Cut or transform geometries',
    icon: 'el-icon-scissors',
    cursor: 'crosshair',
    order: 7,
    alwaysEnabled: false
  },
  {
    id: TOOL_TYPES.ERASE,
    name: 'Erase Tool',
    description: 'Delete vector elements',
    icon: 'el-icon-delete',
    cursor: 'not-allowed',
    order: 8,
    alwaysEnabled: false
  },
  {
    id: TOOL_TYPES.ZOOM_IN,
    name: 'Zoom In',
    description: 'Zoom in on the map',
    icon: 'el-icon-zoom-in',
    cursor: 'zoom-in',
    order: 9,
    alwaysEnabled: true
  },
  {
    id: TOOL_TYPES.ZOOM_OUT,
    name: 'Zoom Out',
    description: 'Zoom out on the map',
    icon: 'el-icon-zoom-out',
    cursor: 'zoom-out',
    order: 10,
    alwaysEnabled: true
  },
  {
    id: TOOL_TYPES.ZOOM_TO_SELECTION,
    name: 'Zoom to Selection',
    description: 'Zoom to a selected area',
    icon: 'el-icon-search',
    cursor: 'crosshair',
    order: 11,
    alwaysEnabled: false
  }
];

// Default map settings
export const MAP_SETTINGS = {
  basemap: 'satellite',
  center: [-51.9253, -14.2350], // Brazil center
  zoom: 4,
  minZoom: 2,
  maxZoom: 20,
  snapToZoom: false
};

// Area unit settings
export const AREA_UNITS = [
  {
    id: 'hectares',
    name: 'Hectares',
    abbreviation: 'ha',
    conversion: 1 // Base unit
  },
  {
    id: 'acres',
    name: 'Acres',
    abbreviation: 'ac',
    conversion: 2.47105 // 1 hectare = 2.47105 acres
  },
  {
    id: 'square-meters',
    name: 'Square Meters',
    abbreviation: 'm²',
    conversion: 10000 // 1 hectare = 10,000 square meters
  }
];

// Length unit settings
export const LENGTH_UNITS = [
  {
    id: 'meters',
    name: 'Meters',
    abbreviation: 'm',
    conversion: 1 // Base unit
  },
  {
    id: 'kilometers',
    name: 'Kilometers',
    abbreviation: 'km',
    conversion: 0.001 // 1 meter = 0.001 kilometers
  }
];

// Business rules for layer operations
export const BUSINESS_RULES = {
  // Rule 1: Property Area must be drawn first
  PROPERTY_AREA_FIRST: 'PROPERTY_AREA_FIRST',
  
  // Rule 2: Property Headquarters must be drawn inside Property Area
  HEADQUARTERS_INSIDE_PROPERTY: 'HEADQUARTERS_INSIDE_PROPERTY',
  
  // Rule 3: Land cover layers must completely cover the Property Area
  COMPLETE_COVERAGE: 'COMPLETE_COVERAGE',
  
  // Rule 4: Geometries exceeding Property Area should be clipped
  AUTO_CLIP_TO_PROPERTY: 'AUTO_CLIP_TO_PROPERTY',
  
  // Rule 5: Native Vegetation cannot overlap with certain layers
  NATIVE_VEGETATION_PRECEDENCE: 'NATIVE_VEGETATION_PRECEDENCE',
  
  // Rule 6: Anthropized Area must always be visible
  ANTHROPIZED_AREA_ALWAYS_VISIBLE: 'ANTHROPIZED_AREA_ALWAYS_VISIBLE'
};

export default {
  LAYER_TYPES,
  GEOMETRY_TYPES,
  TOOL_TYPES,
  LAYERS,
  TOOLS,
  MAP_SETTINGS,
  AREA_UNITS,
  LENGTH_UNITS,
  BUSINESS_RULES
};