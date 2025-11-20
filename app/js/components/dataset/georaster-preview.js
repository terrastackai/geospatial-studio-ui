/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/skeleton-text.min.js";
import "../../libs/geoblaze/geoblaze.web.min.js";

const template = (obj) => /*html*/ `
  <link rel="stylesheet" href="./js/libs/leaflet/leaflet.css"/>
  <div id="map"></div>

const defaultGeoJsonStyle =  {
  color: '#555555',
  weight: 2,
  opacity: 1,
  fillColor: '#ffffff',
  fillOpacity: 0.3
};

const defaultGeoJsonStyleHidden =  {
  opacity: 0,
  fillOpacity: 0
};
`;

window.customElements.define(
  "georaster-preview",
  class extends asWebComponent(HTMLElement) {
    render = () => {
      this.setDOM(template(this));
      this.loadMap();
      this.map.whenReady(() => {
        this.loadBaseMap();
      });
    };

    loadMap = () => {
      this.mapContainer = this.shadow.querySelector("#map");
      this.mapContainer.style.width = this.getWidth();
      this.mapContainer.style.height = this.getHeight();

      this.map = L.map(this.mapContainer, {
        attributionControl: false,
        zoomControl: true,
        zoomSnap: true,
      });

      const center = {
        lat: 29.749907,
        lng: -95.358421,
      };
      const zoom = 10;

      this.map.setView([center.lat, center.lng], zoom);
      this.map.options.maxZoom = 26;
      this.map.options.zoomDelta = 0.25;
      this.map.options.zoomSnap = 0;
      this.map.invalidateSize();
    };

    loadBaseMap = () => {
      let basemap;
      let attribution;
      if (app.env.geostudio.mapboxToken) {
        basemap =
          "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=" +
          app.env.geostudio.mapboxToken;
        attribution =
          '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>';
      } else {
        basemap = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        attribution =
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
      }

      L.tileLayer(basemap, {
        attribution: attribution,
        name: "basemap",
        basemap: true,
      }).addTo(this.map);
    };

    loadGeorasterForImageAndLabel = (image, label) => {
      // Remove loaded layers
      this.removeAllLayers();

      const arrayOfPromises = [];

      if (image.url) {
        const dataGeorasterPromise = parseGeoraster(image.url)
          .then(async (georaster) => {
            const rasterSymbolizer = await this.pixelValuesToColorFn(georaster);
            this.addGeorasterLayer(georaster, rasterSymbolizer, image);
          })
          .catch((error) => {
            throw error;
          });
        arrayOfPromises.push(dataGeorasterPromise);
      }

      if (label.url) {
        const labelGeorasterPromise = parseGeoraster(label.url)
          .then((georaster) => {
            this.addGeorasterLayer(georaster, null, label);
          })
          .catch((error) => {
            throw error;
          });

        arrayOfPromises.push(labelGeorasterPromise);
      }

      Promise.all(arrayOfPromises)
        .catch((err) => {
          console.log("A promise failed to resolve", err);
          return arrayOfPromises;
        })
        .then((arrayOfPromises) => {
          console.log("Promises completed");
          const labelLayer = this.getLayer(label.id);
          labelLayer?.bringToFront();
        });
    };

    pixelValuesToColorFn = async (georaster) => {
      const mins = await geoblaze.min(georaster);
      const maxs = await geoblaze.max(georaster);

      function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }

      function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
      }

      function convertRange(value, r1, r2) {
        return ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0];
      }

      // Treat first 3 bands as RGB, but rescale them in case they are not images
      let rasterSymbolizer = (values) => {
        let r = 0;
        let g = 0;
        let b = 0;
        r = Math.floor(convertRange(values[0], [mins[0], maxs[0]], [0, 255]));
        if (values.length > 1)
          g = Math.floor(convertRange(values[1], [mins[1], maxs[1]], [0, 255]));
        if (values.length > 2)
          b = Math.floor(convertRange(values[2], [mins[2], maxs[2]], [0, 255]));
        const ret = rgbToHex(r, g, b);
        return ret;
      };
      return rasterSymbolizer;
    };

    addGeorasterLayer = (georaster, rasterSymbolizer, layer) => {
      let visibleMapLayer = new GeoRasterLayer({
        georaster: georaster,
        id: "tif-preview",
        pixelValuesToColorFn: rasterSymbolizer,
        resolution: 256,
        opacity: 1,
        id: layer.id,
      });

      let l = visibleMapLayer.addTo(this.map);
      this.map.flyToBounds(l.getBounds(), {
        padding: L.Point(0, 0),
      });
    };

    getWidth = () => {
      let ret = this.attributes["width"]?.value;
      if (!ret) {
        ret = "100%";
      }
      return ret;
    };

    getHeight = () => {
      let ret = this.attributes["height"]?.value;
      if (!ret) {
        ret = "100%";
      }
      return ret;
    };

    getLayerType = (layer) => {
      if (layer instanceof L.TileLayer.WMS) {
        return "WMS";
      } else if (layer instanceof L.TileLayer) {
        return "TileLayer";
      } else if (layer instanceof L.Marker) {
        return "Marker";
      }
      // todo: add other type here
    };

    getMapLayers = () => {
      const layers = [];
      this.map.eachLayer((layer) => {
        layer.type = this.getLayerType(layer);
        if (!layer.options.basemap) {
          layers.push(layer);
        }
      });

      return layers;
    };

    getBaseMap = () => {
      let basemap;
      this.map.eachLayer((layer) => {
        if (layer.options.basemap) {
          basemap = layer;
        }
      });

      return basemap;
    };

    hideBaseMap = () => {
      this.getBaseMap().setOpacity(0);
    };

    showBaseMap = () => {
      this.getBaseMap().setOpacity(1);
    };

    getLayer = (id) => {
      let result;
      this.map.eachLayer((layer) => {
        if (layer.options.id === id) {
          result = layer;
        }
      });

      return result;
    };

    hideLayer = (id) => {
      const layer = this.getLayer(id);

      if (!layer) {
        console.error("Layer not found in map with name: " + id);
        return;
      }

      if (layer.setOpacity) {
        layer.setOpacity(0);
      } else if (layer.setStyle) {
        layer.setStyle(defaultGeoJsonStyleHidden);
      }
    };

    showLayer = (id) => {
      const layer = this.getLayer(id);

      if (!layer) {
        console.error("Layer not found in map with name: " + id);
        return;
      }

      if (layer.setOpacity) {
        layer.setOpacity(1);
      } else if (layer.setStyle) {
        layer.setStyle(defaultGeoJsonStyle);
      }
    };

    removeAllLayers = () => {
      this.map.eachLayer((layer) => {
        if (!layer.options.basemap) {
          this.map.removeLayer(layer);
        }
      });
    };
  }
);
