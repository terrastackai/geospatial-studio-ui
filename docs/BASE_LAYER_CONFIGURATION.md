# Base Layer Configuration for Celestial Bodies

## Overview

The Geospatial Studio UI now supports multiple celestial body base layers including Earth, Moon, and Mars. The system can automatically switch base layers based on dataset configuration.

## Supported Celestial Bodies

- **Earth** (default) - Various Earth imagery providers (Cesium Ion, Mapbox, OpenStreetMap, etc.)
- **Moon** - Lunar Reconnaissance Orbiter Wide Angle Camera Global Mosaic
- **Mars** - Mars Viking Mission MDIM 2.1 Global Mosaic
- **Solar** - Reserved for future implementation

## Base Layer Selector

All celestial body base layers are always available in the Cesium base layer selector UI, regardless of which dataset is currently loaded. Users can manually switch between any base layer at any time.

## Automatic Base Layer Switching

When datasets include a `baseLayer` property, the system will automatically switch to the appropriate celestial body imagery.

## Backend API Configuration

### Dataset Response Structure

When returning dataset information from the backend API, include the `baseLayer` property to specify which celestial body the dataset is associated with:

```json
{
  "dataset_id": "lunar_surface_001",
  "name": "Lunar Surface Analysis",
  "description": "High-resolution lunar surface data",
  "baseLayer": "moon",
  "layers": [
    {
      "uri": "lunar_surface_layer",
      "display_name": "Surface Analysis",
      "z_index": 1,
      "visible_by_default": "True",
      "baseLayer": "moon"
    }
  ],
  "created_at": "2026-03-11T00:00:00Z"
}
```

### Layer Configuration Structure

When constructing layer data in the UI (e.g., in `utils.js`), the `baseLayer` property should be preserved:

```javascript
let thisLayer = {
  datasource: "geoserver",
  rootUrl: "/geoserver/wms/" + item["uri"],
  layer: item["uri"],
  name: item["display_name"],
  baseLayer: item["baseLayer"] || "earth",  // ← Include this property
  z_index: item["z_index"],
  wmsParams: {
    sld_body: item["sld_body"]
  },
  params: {
    crs: "EPSG:3857"
  },
  ui: {
    visible: true,
    opacity: item["visible_by_default"] === "True" ? 1 : 0
  }
};
```

## Example Configurations

### Earth Dataset (Default)

```json
{
  "dataset_id": "earth_weather_001",
  "name": "Global Weather Data",
  "baseLayer": "earth",
  "layers": [
    {
      "uri": "weather_temperature",
      "display_name": "Temperature",
      "baseLayer": "earth"
    }
  ]
}
```

**Note:** If `baseLayer` is omitted, the system defaults to Earth imagery.

### Moon Dataset

```json
{
  "dataset_id": "lunar_crater_001",
  "name": "Lunar Crater Analysis",
  "baseLayer": "moon",
  "layers": [
    {
      "uri": "lunar_craters",
      "display_name": "Crater Distribution",
      "baseLayer": "moon"
    }
  ]
}
```

### Mars Dataset

```json
{
  "dataset_id": "mars_terrain_001",
  "name": "Mars Terrain Elevation",
  "baseLayer": "mars",
  "layers": [
    {
      "uri": "mars_elevation",
      "display_name": "Elevation Data",
      "baseLayer": "mars"
    }
  ]
}
```

## WMS Server Configuration

### Moon WMS
- **URL**: `https://wms.im-ldi.com/`
- **Layer**: `luna_wac_global`
- **CRS**: `EPSG:3857`
- **Format**: `image/png`
- **dpiMode**: `7`

### Mars WMS
- **URL**: `https://wms.im-ldi.com/`
- **Layer**: `mars_viking_mdim2.1`
- **CRS**: `EPSG:3857`
- **Format**: `image/png`
- **dpiMode**: `7`

## User Experience

### Automatic Switching
1. User loads a dataset with `baseLayer: "moon"`
2. System automatically switches the base layer to Moon imagery
3. User's data layers are displayed on top of the Moon base layer

### Manual Override
1. User can manually select any base layer from the base layer picker at any time
2. Manual selection takes precedence over automatic switching
3. All celestial body options are always visible in the selector

### Base Layer Persistence
- The current base layer persists until:
  - A new dataset with a different `baseLayer` is loaded
  - User manually selects a different base layer
  - Page is refreshed (resets to default)

## Implementation Details

### Frontend (app-map.js)

The `switchBaseLayer(celestialBody)` method handles automatic switching:

```javascript
// Automatically called when loading layers with baseLayer property
switchBaseLayer('moon');  // Switches to Moon imagery
switchBaseLayer('mars');  // Switches to Mars imagery
switchBaseLayer('earth'); // Returns to Earth imagery
```

### Layer Loading Integration

The `addWMSLayer()` method checks for the `baseLayer` property:

```javascript
addWMSLayer(layerData) {
  // Check if layer specifies a base layer and switch if needed
  if (layerData.baseLayer) {
    this.switchBaseLayer(layerData.baseLayer);
  }
  
  // Continue with normal layer loading...
}
```

## Testing

To test the base layer functionality:

1. **Manual Selection Test**
   - Open the inference page
   - Click the base layer selector (globe icon in Cesium viewer)
   - Verify Moon and Mars appear in the list under "Celestial Bodies"
   - Select Moon - verify Moon imagery loads
   - Select Mars - verify Mars imagery loads

2. **Automatic Switching Test**
   - Load a dataset with `baseLayer: "moon"`
   - Verify the base layer automatically switches to Moon
   - Load a dataset with `baseLayer: "mars"`
   - Verify the base layer automatically switches to Mars
   - Load a dataset without `baseLayer` or with `baseLayer: "earth"`
   - Verify Earth imagery is used

3. **User Override Test**
   - Load a Moon dataset (auto-switches to Moon base layer)
   - Manually select an Earth base layer from the picker
   - Verify the manual selection persists
   - Load another Moon dataset
   - Verify it switches back to Moon

## Troubleshooting

### Base Layer Not Switching
- Check that the `baseLayer` property is included in the layer data
- Verify the value is one of: `"earth"`, `"moon"`, `"mars"` (case-insensitive)
- Check browser console for switching messages

### Moon/Mars Not Appearing in Selector
- Verify the WMS servers are accessible
- Check for JavaScript errors in browser console
- Ensure Cesium library is loaded correctly

### WMS Server Errors
- Verify WMS server URLs are correct and accessible
- Check network tab for failed requests
- Ensure CORS is properly configured on WMS servers

## Future Enhancements

- Add Solar base layer when imagery becomes available
- Support for additional celestial bodies (Venus, Jupiter moons, etc.)
- User preference for default base layer
- Base layer preview thumbnails
- Caching of base layer providers for performance