/**
 * Token Validator Utility
 * 
 * Validates API tokens (Cesium, Mapbox, etc.) to ensure they are actually usable
 * and not placeholder values, unsubstituted environment variables, or invalid strings.
 */

/**
 * Checks if a token is valid and usable
 * @param {string} token - The token to validate
 * @returns {boolean} - True if token is valid, false otherwise
 */
export function isValidToken(token) {
  // Check for falsy values (null, undefined, false, 0, NaN, '')
  if (!token) return false;
  
  // Check for string representations of invalid values
  const lowerToken = String(token).toLowerCase().trim();
  if (lowerToken === 'undefined' || lowerToken === 'null' || lowerToken === 'none') {
    return false;
  }
  
  // Check for empty string after trimming
  if (token.trim() === '') return false;
  
  // Check if it's an unsubstituted environment variable
  // Matches patterns like: ${VAR_NAME}, %VAR_NAME%, $VAR_NAME
  if (token.match(/^\$\{[^}]+\}$/)) return false;  // ${VAR}
  if (token.match(/^%[^%]+%$/)) return false;      // %VAR%
  if (token.match(/^\$[A-Z_][A-Z0-9_]*$/)) return false;  // $VAR
  
  return true;
}

/**
 * Gets a validated token or returns null if invalid
 * @param {string} token - The token to validate
 * @returns {string|null} - The token if valid, null otherwise
 */
export function getValidToken(token) {
  return isValidToken(token) ? token : null;
}

/**
 * Validates and sanitizes Cesium Ion token
 * @param {string} token - The Cesium token to validate
 * @returns {string|null} - The token if valid, null otherwise
 */
export function getValidCesiumToken(token) {
  return getValidToken(token);
}

/**
 * Validates and sanitizes Mapbox token
 * @param {string} token - The Mapbox token to validate
 * @returns {string|null} - The token if valid, null otherwise
 */
export function getValidMapboxToken(token) {
  return getValidToken(token);
}

// Made with Bob
