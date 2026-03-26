# Celestial Body Base Layers - Implementation Summary

## Overview

This document summarizes the implementation of Moon and Mars WMS base layers for the Geospatial Studio inference map visualization.

## What Was Implemented

### 1. Moon and Mars WMS Base Layers

Added two new celestial body base layers to the Cesium map viewer:

- **Moon**: Lunar Reconnaissance Orbiter Wide Angle Camera Global Mosaic
  - WMS URL: `https://wms.im-ldi.com/`
  - Layer: `luna_wac_global`
  
- **Mars**: Mars Viking Mission MDIM 2.1 Global Mosaic
  - WMS URL: `https://wms.im-ldi.com/`
  - Layer: `mars_viking_mdim2.1`

### 2. Base Layer Selector Integration

Both Moon and Mars base layers are now **always visible** in the Cesium base layer picker UI, appearing under the "Celestial Bodies" category alongside existing Earth-based layers (Cesium Ion, Mapbox, OpenStreetMap, etc.).

### 3. Automatic Base Layer Switching

The system automatically switches to the appropriate base layer when loading datasets that include a `baseLayer` property:

```javascript
// Dataset with baseLayer property
{
  name: "Lunar Surface Analysis",
  baseLayer: "moon",  // ← Triggers automatic switch to Moon imagery
  layers: [...]
}
```

### 4. Manual Override Support

Users can manually select any base layer at any time through the base layer picker, regardless of the current dataset type. Manual selection takes precedence over automatic switching.

## Files Modified

### 1. `app/js/components/inference/app-map.js`

**Changes:**
- Added Moon WMS provider configuration (lines ~1093-1107)
- Added Mars WMS provider configuration (lines ~1109-1123)
- Created `ProviderViewModel` instances for both celestial bodies
- Added them to `imageryProviderViewModels` array (lines ~1163-1164)
- Stored providers in `this.celestialBodyProviders` for programmatic access
- Added `this.currentBaseLayer` tracking variable
- Implemented `switchBaseLayer(celestialBody)` method (lines ~227-283)
- Integrated base layer switching into `addWMSLayer()` method (lines ~285-291)

**Key Code Additions:**

```javascript
// Moon WMS Provider
const moonWmsProvider = new Cesium.WebMapServiceImageryProvider({
  url: 'https://wms.im-ldi.com/',
  layers: 'luna_wac_global',
  parameters: {
    service: 'WMS',
    format: 'image/png',
    transparent: false,
    crs: 'EPSG:3857',
    dpiMode: 7
  },
  tilingScheme: new Cesium.WebMercatorTilingScheme()
});

const moonViewModel = new Cesium.ProviderViewModel({
  name: 'Moon (Lunar WAC)',
  iconUrl: Cesium.buildModuleUrl('Assets/Textures/moonSmall.jpg'),
  tooltip: 'Lunar Reconnaissance Orbiter Wide Angle Camera Global Mosaic',
  category: 'Celestial Bodies',
  creationFunction: () => moonWmsProvider
});

// Add to imagery sources
imagerySources.push(moonViewModel);
imagerySources.push(marsViewModel);

// Store for programmatic switching
this.celestialBodyProviders = {
  moon: moonWmsProvider,
  mars: marsWmsProvider
};
```

## Files Created

### 1. `PLAN.md`
Detailed implementation plan with technical specifications, code examples, and testing checklist.

### 2. `docs/BASE_LAYER_CONFIGURATION.md`
Comprehensive documentation covering:
- Supported celestial bodies
- Backend API configuration requirements
- Dataset response structure examples
- WMS server configuration details
- User experience flows
- Implementation details
- Testing procedures
- Troubleshooting guide

### 3. `docs/API_EXAMPLES.md`
Concrete API examples including:
- Dataset API response examples for Moon, Mars, and Earth
- Layer list API response examples
- GeoServer WMS layer configuration
- Database schema recommendations
- Migration guide for existing datasets
- Testing procedures
- Common issues and solutions

### 4. `docs/CELESTIAL_BODY_BASE_LAYERS_SUMMARY.md`
This summary document.

## Backend API Requirements

To support automatic base layer switching, the backend API must include the `baseLayer` property in dataset and layer responses:

### Required Property

```json
{
  "dataset_id": "lunar_surface_001",
  "name": "Lunar Surface Analysis",
  "baseLayer": "moon",  // ← Required for automatic switching
  "layers": [
    {
      "uri": "lunar_surface_layer",
      "display_name": "Surface Analysis",
      "baseLayer": "moon"  // ← Also include in layer objects
    }
  ]
}
```

### Valid Values

- `"earth"` - Use Earth imagery (default if omitted)
- `"moon"` - Use Moon imagery
- `"mars"` - Use Mars imagery
- `"solar"` - Reserved for future use

### Where to Add

1. **Dataset metadata** - When returning dataset information
2. **Layer configuration** - When returning layer details
3. **Layer construction** - When building layer objects in `utils.js`

**Example in utils.js:**

```javascript
let thisLayer = {
  datasource: "geoserver",
  rootUrl: "/geoserver/wms/" + item["uri"],
  layer: item["uri"],
  name: item["display_name"],
  baseLayer: item["baseLayer"] || "earth",  // ← Add this line
  // ... other properties
};
```

## User Experience

### Scenario 1: Manual Base Layer Selection

1. User opens inference page
2. Clicks base layer selector (globe icon in Cesium viewer)
3. Sees all available base layers including:
   - Earth layers (Cesium Ion, Mapbox, OSM, etc.)
   - **Moon (Lunar WAC)** ← New
   - **Mars (Viking MDIM 2.1)** ← New
4. Selects Moon → Moon imagery loads
5. Selects Mars → Mars imagery loads

### Scenario 2: Automatic Switching with Lunar Dataset

1. User loads a lunar dataset with `baseLayer: "moon"`
2. System automatically switches to Moon base layer
3. Console logs: `"Switching to Moon base layer"`
4. User's lunar data layers display on top of Moon imagery
5. User can still manually switch to any other base layer if desired

### Scenario 3: Mixed Celestial Body Datasets

1. User loads Earth weather dataset → Earth imagery (default)
2. User loads lunar crater dataset → Automatically switches to Moon
3. User loads Mars terrain dataset → Automatically switches to Mars
4. User loads another Earth dataset → Can manually switch back to Earth

## Testing Checklist

- [x] Moon WMS provider created and configured
- [x] Mars WMS provider created and configured
- [x] Moon appears in base layer selector under "Celestial Bodies"
- [x] Mars appears in base layer selector under "Celestial Bodies"
- [x] `switchBaseLayer()` method implemented
- [x] Automatic switching integrated into `addWMSLayer()`
- [x] Documentation created for backend API requirements
- [x] Examples provided for dataset configuration
- [ ] Manual testing: Select Moon from base layer picker
- [ ] Manual testing: Select Mars from base layer picker
- [ ] Manual testing: Load dataset with `baseLayer: "moon"`
- [ ] Manual testing: Load dataset with `baseLayer: "mars"`
- [ ] Manual testing: Verify automatic switching works
- [ ] Manual testing: Verify manual override works
- [ ] Backend API: Add `baseLayer` property to dataset responses
- [ ] Backend API: Add `baseLayer` property to layer responses
- [ ] Backend API: Update database schema if needed

## Next Steps for Backend Team

1. **Update Database Schema** (if needed)
   ```sql
   ALTER TABLE datasets ADD COLUMN base_layer VARCHAR(50) DEFAULT 'earth';
   ALTER TABLE layers ADD COLUMN base_layer VARCHAR(50) DEFAULT 'earth';
   ```

2. **Update API Responses**
   - Include `baseLayer` in dataset GET responses
   - Include `baseLayer` in layer GET responses
   - See `docs/API_EXAMPLES.md` for detailed examples

3. **Identify Existing Lunar/Mars Datasets**
   - Review existing datasets
   - Update `baseLayer` property for lunar datasets to `"moon"`
   - Update `baseLayer` property for Mars datasets to `"mars"`

4. **Test Integration**
   - Load a lunar dataset in the UI
   - Verify automatic switch to Moon base layer
   - Check browser console for switching messages

## Technical Details

### Base Layer Switching Logic

The `switchBaseLayer()` method:
1. Checks if already on the target base layer (avoids unnecessary switches)
2. Gets the current base layer (always at index 0 in Cesium's imagery layers)
3. Removes the current base layer
4. Adds the new base layer at index 0
5. Updates `this.currentBaseLayer` tracking variable
6. Logs the switch to console

### Provider Storage

Celestial body providers are stored in `this.celestialBodyProviders`:
```javascript
this.celestialBodyProviders = {
  moon: moonWmsProvider,
  mars: marsWmsProvider
};
```

This allows programmatic access for automatic switching while keeping them available in the base layer picker for manual selection.

### Integration Point

The automatic switching is triggered in `addWMSLayer()`:
```javascript
addWMSLayer(layerData) {
  // Check if layer specifies a base layer and switch if needed
  if (layerData.baseLayer) {
    this.switchBaseLayer(layerData.baseLayer);
  }
  // ... continue with normal layer loading
}
```

## Known Limitations

1. **Solar Base Layer**: Not yet implemented (no imagery available)
2. **Icon Assets**: Using Cesium's built-in moon texture as placeholder for both Moon and Mars icons
3. **Earth Switching**: Switching to "earth" doesn't select a specific Earth provider, user must manually select from picker
4. **Base Layer Persistence**: Current base layer doesn't persist across page refreshes

## Future Enhancements

1. Add Solar base layer when imagery becomes available
2. Create custom icon assets for Moon and Mars base layers
3. Support for additional celestial bodies (Venus, Jupiter moons, etc.)
4. User preference for default base layer
5. Base layer persistence in local storage
6. Base layer preview thumbnails in selector
7. Smooth transitions between base layers
8. Caching of base layer providers for performance

## Support and Troubleshooting

### Issue: Base Layers Not Appearing in Selector

**Cause**: JavaScript error during initialization

**Solution**: 
- Check browser console for errors
- Verify Cesium library is loaded
- Ensure WMS URLs are accessible

### Issue: Automatic Switching Not Working

**Cause**: `baseLayer` property not being passed through

**Solution**:
- Verify API returns `baseLayer` property
- Check that `utils.js` preserves `baseLayer` when constructing layers
- Look for console messages indicating switching attempts

### Issue: WMS Server Errors

**Cause**: WMS server unavailable or CORS issues

**Solution**:
- Verify WMS URLs are correct: `https://wms.im-ldi.com/`
- Check network tab for failed requests
- Ensure CORS is properly configured on WMS servers
- Test WMS URLs directly in browser

## References

- **Implementation Plan**: `PLAN.md`
- **Configuration Guide**: `docs/BASE_LAYER_CONFIGURATION.md`
- **API Examples**: `docs/API_EXAMPLES.md`
- **Modified Code**: `app/js/components/inference/app-map.js`

## Contact

For questions or issues related to this implementation, please refer to the documentation files or check the browser console for debugging information.