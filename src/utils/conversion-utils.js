/**
 * Utility functions for unit conversions and data formatting
 */

/**
 * Convert square meters to hectares
 * @param {number} squareMeters - Area in square meters
 * @returns {number} - Area in hectares
 */
export function squareMetersToHectares(squareMeters) {
  return squareMeters / 10000;
}

/**
 * Convert hectares to square meters
 * @param {number} hectares - Area in hectares
 * @returns {number} - Area in square meters
 */
export function hectaresToSquareMeters(hectares) {
  return hectares * 10000;
}

/**
 * Convert hectares to acres
 * @param {number} hectares - Area in hectares
 * @returns {number} - Area in acres
 */
export function hectaresToAcres(hectares) {
  return hectares * 2.47105;
}

/**
 * Convert acres to hectares
 * @param {number} acres - Area in acres
 * @returns {number} - Area in hectares
 */
export function acresToHectares(acres) {
  return acres / 2.47105;
}

/**
 * Convert meters to kilometers
 * @param {number} meters - Length in meters
 * @returns {number} - Length in kilometers
 */
export function metersToKilometers(meters) {
  return meters / 1000;
}

/**
 * Convert kilometers to meters
 * @param {number} kilometers - Length in kilometers
 * @returns {number} - Length in meters
 */
export function kilometersToMeters(kilometers) {
  return kilometers * 1000;
}

/**
 * Format area value with unit
 * @param {number} area - Area value
 * @param {string} unit - Unit of measurement ('hectares', 'acres', 'sq-m')
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted area with unit
 */
export function formatArea(area, unit = 'hectares', decimals = 2) {
  let value = area;
  let unitLabel = '';
  
  switch (unit) {
    case 'hectares':
      unitLabel = 'ha';
      break;
    case 'acres':
      value = hectaresToAcres(area);
      unitLabel = 'ac';
      break;
    case 'sq-m':
      value = hectaresToSquareMeters(area);
      unitLabel = 'm²';
      break;
    default:
      unitLabel = 'ha';
  }
  
  return `${value.toFixed(decimals)} ${unitLabel}`;
}

/**
 * Format length value with unit
 * @param {number} length - Length value
 * @param {string} unit - Unit of measurement ('meters', 'kilometers')
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted length with unit
 */
export function formatLength(length, unit = 'meters', decimals = 2) {
  let value = length;
  let unitLabel = '';
  
  switch (unit) {
    case 'meters':
      unitLabel = 'm';
      break;
    case 'kilometers':
      value = metersToKilometers(length);
      unitLabel = 'km';
      break;
    default:
      unitLabel = 'm';
  }
  
  return `${value.toFixed(decimals)} ${unitLabel}`;
}

/**
 * Format percentage value
 * @param {number} value - Value between 0 and 1
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage
 */
export function formatPercentage(value, decimals = 2) {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Calculate percentage of area relative to total
 * @param {number} area - Area value
 * @param {number} totalArea - Total area
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage
 */
export function calculatePercentage(area, totalArea, decimals = 2) {
  if (totalArea === 0) return '0%';
  
  const percentage = area / totalArea;
  return formatPercentage(percentage, decimals);
}

/**
 * Format coordinates to string
 * @param {Object} point - ArcGIS Point geometry
 * @param {string} format - Format type ('dms', 'dd')
 * @returns {string} - Formatted coordinates
 */
export function formatCoordinates(point, format = 'dd') {
  if (!point) return '';
  
  const { x, y } = point;
  
  if (format === 'dms') {
    return `${decimalToDMS(y, true)}, ${decimalToDMS(x, false)}`;
  } else {
    return `${y.toFixed(6)}°, ${x.toFixed(6)}°`;
  }
}

/**
 * Convert decimal degrees to degrees, minutes, seconds format
 * @param {number} decimal - Decimal degrees
 * @param {boolean} isLatitude - True if latitude, false if longitude
 * @returns {string} - Formatted DMS
 */
export function decimalToDMS(decimal, isLatitude) {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
  
  let direction = '';
  if (isLatitude) {
    direction = decimal >= 0 ? 'N' : 'S';
  } else {
    direction = decimal >= 0 ? 'E' : 'W';
  }
  
  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

export default {
  squareMetersToHectares,
  hectaresToSquareMeters,
  hectaresToAcres,
  acresToHectares,
  metersToKilometers,
  kilometersToMeters,
  formatArea,
  formatLength,
  formatPercentage,
  calculatePercentage,
  formatCoordinates,
  decimalToDMS
};