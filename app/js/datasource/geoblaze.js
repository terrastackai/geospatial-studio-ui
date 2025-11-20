/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import "../libs/geoblaze/geoblaze.web.min.js"

export class GeoBlaze {
  constructor() {
  }

  // Implementation of DataSource.getPointValues() for a geoblaze layer
  async getPointValues(layer, bbox) {
    const mapLayers = app.main.map.getMapLayers()
    const rasterLayer = mapLayers.find(l => l.options.id === layer.id)
		let markerCenter = [ 
        (bbox[0] + bbox[2]) / 2.0,
        (bbox[1] + bbox[3]) / 2.0,
    ]

    if (!rasterLayer) return undefined;

		// Map lat/lng from layer min/max to geotiff min/max
    function map(x, in_min, in_max, out_min, out_max) {
			return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
		}

    let x1 = map(markerCenter[0], 
			rasterLayer.xMinOfLayer, rasterLayer.xMaxOfLayer,
      rasterLayer.xmin, rasterLayer.xmax)

    let y1 = map(markerCenter[1], 
			rasterLayer.yMinOfLayer, rasterLayer.yMaxOfLayer,
      rasterLayer.ymin, rasterLayer.ymax)

    const values = await geoblaze.identify(rasterLayer.georasters[0], [ x1, y1 ])
    if (!values) return undefined;

    let ret = {
        features: [{
          properties: {
          }
        }]
    }

    if (values.length) {
      for (let i=0; i < values.length; i++) {
        ret.features[0].properties['Band ' + (i+1)] = values[i];
      }
    } else {
      ret.features[0].properties['value'] = values
    }

    return ret;
  }

  async getGeoraster(layer, {southWestCoordinate, northEastCoordinate}, dateTime = null, resolution=256, params) {
    //let georaster = await parseGeoraster(layer.url);
    //return georaster;
    const mapLayers = app.main.map.getMapLayers()
    const rasterLayer = mapLayers.find(l => l.options.id === layer.id)
    if (!rasterLayer) throw new Error("Unsupported layer type");
    return rasterLayer?.georasters[0];
  }
}

