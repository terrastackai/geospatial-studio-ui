/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import {
  formatLayerNameWithDate,
  updateCsTimeline,
  getTimestampsfromLayers,
  hideCsTimeline,
} from "../../utils.js";
import DataSource from "../../datasource/datasource.js";
import "../inference/timeline-control.js";
import "../inference/scale-bar.js";
import "../../components/inference/zoom-controls.js";
import "./info-box.js";
import "../../libs/carbon-web-components/button.min.js";

const template = (obj) => /* HTML */ `
  <style>
    #map {
      position: relative;
      height: 100%;
    }

    .cesium-viewer-toolbar {
      position: absolute;
      bottom: 12.5rem;
      left: 25px;
      display: flex !important;
      flex-direction: column;
      align-items: flex-end;
      margin-top: 75px;
      margin-right: 32px;
      z-index: 2;
    }

    #slider {
      position: absolute;
      left: 50%;
      top: 0px;
      background-color: #d3d3d3;
      width: 5px;
      height: 100%;
      z-index: 998;
    }

    #slider:hover {
      cursor: ew-resize;
    }

    #slider img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid black;
      border-radius: 50%;
      padding: 0.25rem;
    }

    #left-layer-label,
    #right-layer-label {
      position: absolute;
      top: 80px;
      max-width: 300px;
      padding: 0.5rem;
      background: black;
      border: 1px solid white;
      border-radius: 100px;
      color: white;
      user-select: none;
      cursor: unset;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      font-weight: 400;
      line-height: 16px;
      letter-spacing: 0.32px;
    }

    #left-layer-label {
      right: 20px;
    }

    #right-layer-label {
      left: 20px;
    }

    timeline-control {
      position: absolute;
      bottom: 2.5rem;
      left: calc(20% - 1.875rem + 1.75rem);
      transform: translateX(-100%);
      z-index: 2;
    }

    zoom-controls {
      position: absolute;
      bottom: 2.5rem;
      left: 25px;
      z-index: 2;
    }

    scale-bar {
      position: absolute;
      bottom: 2.5rem;
      right: 25px;
      z-index: 2;
    }

    info-box {
      position: relative;
      z-index: 2;
    }

    .cesium-infoBox {
      display: none !important;
    }

    .cesium-infoBox-iframe {
      display: none !important;
    }

    .cesium-infoBox-title {
      display: none !important;
    }

    .cesium-infoBox-camera {
      display: none !important;
    }
  </style>
  <link rel="stylesheet" href="../../../styles/carbon-table.css" />
  <link href="/js/libs/cesium/Widgets/widgets.css" rel="stylesheet" />

  <div id="map">
    <info-box></info-box>
    <zoom-controls></zoom-controls>
    <timeline-control></timeline-control>
    <scale-bar></scale-bar>
    <div id="slider" style="display: none;">
      <img
        src="../../../images/split-screen-slider-icon.png"
        alt="Left and right arrows icon"
        width="25"
        height="25"
      />
      <div id="left-layer-label"></div>
      <div id="right-layer-label"></div>
    </div>
  </div>
`;

window.customElements.define(
  "app-map",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.compareLayer = null;
      this.layersTimestamps = {};
      this.selectedLayersTimestamps = {};
      this.location = null;
      this.osmLayer;
      this.defaultGeoJsonStyle = {
        color: "#555555",
        weight: 2,
        opacity: 1,
        fillColor: "#ffffff",
        fillOpacity: 0.3,
      };
      this.defaultGeoJsonStyleHidden = {
        opacity: 0,
        fillOpacity: 0,
      };
    }

    render() {
      this.setDOM(template(this));

      this.zoomControls = this.shadow.querySelector("zoom-controls");
      this.timelineControl = this.shadow.querySelector("timeline-control");
      this.scaleBar = this.shadow.querySelector("scale-bar");
      this.infoBox = this.shadow.querySelector("info-box");
      this.slider = this.shadow.querySelector("#slider");
      this.leftLayerLabel = this.shadow.querySelector("#left-layer-label");
      this.rightLayerLabel = this.shadow.querySelector("#right-layer-label");
    }

    getLeafletLayer(layer) {
      let ret = undefined;
      this.map.eachLayer((l) => {
        if (
          l.options?.id == layer.id &&
          l.options?.datasource == layer.datasource
        ) {
          ret = l;
        }
      });

      return ret;
    }

    setMapOptions(options) {
      const defaultOptions = {
        center: {
          lat: 29.749907,
          lng: -95.358421,
        },
        zoom: 10,
        basemap: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      };

      const mapConfig = { ...defaultOptions, ...options };

      this.center = mapConfig.center;
      this.zoom = mapConfig.zoom;
      this.basemap = mapConfig.basemap;
      this.attribution = mapConfig.attribution;
    }

    addWMSLayer(layerData) {
      if (!this.map) throw new Error("Please call loadMap() first");

      // lookup CRS
      if (layerData.params.crs !== undefined) {
        switch (layerData.params.crs) {
          case "EPSG:3395":
            layerData.params.crs = L.CRS.EPSG3395;
            break;
          case "EPSG:3857":
            layerData.params.crs = L.CRS.EPSG3857;
            break;
          case "EPSG:4326":
            layerData.params.crs = L.CRS.EPSG4326;
            break;
          case "Earth":
            layerData.params.crs = L.CRS.Earth;
            break;
          case "Simple":
            layerData.params.crs = L.CRS.Simple;
            break;
          case "Base":
            layerData.params.crs = L.CRS.Base;
            break;
          default:
            break;
        }
      }

      let layerName = layerData.layer;

      if (layerData.dateFormat && layerData.ui.datetime) {
        layerName = formatLayerNameWithDate(
          layerName,
          new Date(layerData.ui.datetime),
          layerData.dateFormat
        );
      }

      const extraWmsParams = layerData.wmsParams || {};

      // add WMS layer
      // let wmsLayer = L.tileLayer.wms(layerData.rootUrl, {
      //   id: layerData.id,
      //   name: layerData.name,
      //   layers: layerName,
      //   transparent: true,
      //   format: "image/png",
      //   opacity: layerData?.ui?.opacity,
      //   ...layerData.params,
      //   ...extraWmsParams,
      // });

      // reset timeline if it is a different location/example
      if (this.location !== layerData.location) {
        this.selectedLayersTimestamps = {};
      }
      this.location = layerData.location;

      // add all layers csTimeline to global variable
      this.layersTimestamps[layerName] = layerData?.csTimeline;

      // add selected default layer's csTimeline to global variable
      if (layerData.ui.opacity === 1) {
        if (layerName.indexOf("pred") > -1) {
          this.selectedLayersTimestamps["model prediction"] =
            layerData?.csTimeline;
        } else {
          const n = layerName.lastIndexOf("_");
          const layerLabel = layerName.substring(n + 1);
          this.selectedLayersTimestamps[layerLabel] = layerData?.csTimeline;
        }
      }

      function dataCallback(interval, index) {
        let time;
        if (index === 0) {
          time = Cesium.JulianDate.toIso8601(interval.stop);
        } else {
          time = Cesium.JulianDate.toIso8601(interval.start);
        }
        return {
          Time: time,
        };
      }

      const layersTimestamps = getTimestampsfromLayers(this.layersTimestamps);
      const times = Cesium.TimeIntervalCollection.fromIso8601DateArray({
        iso8601Dates: layersTimestamps,
        leadingInterval: true,
        trailingInterval: true,
        isStopIncluded: false,
        dataCallback: dataCallback,
      });
      let layerOptions = {
        url: layerData.rootUrl,
        layers: layerName,
        parameters: {
          service: "WMS",
          format: "image/png",
          transparent: true,
          ...layerData.params,
          ...extraWmsParams,
        },
        clock: this.map.clock,
        times,
      };

      const wmsLayer = new Cesium.ImageryLayer(
        new Cesium.WebMapServiceImageryProvider(layerOptions)
      );
      const selectedLayersTimestamps = getTimestampsfromLayers(
        this.selectedLayersTimestamps
      );
      updateCsTimeline(
        selectedLayersTimestamps,
        this.map,
        this.timelineControl
      );

      if (layerData.ui) {
        wmsLayer.alpha = layerData.ui.opacity;
        if (layerData.ui.opacity === 0) {
          wmsLayer.show = false;
        }
      }

      wmsLayer.layerData = layerData;
      if (!wmsLayer.options) {
        wmsLayer.options = {};
      }
      wmsLayer.options.datasource = layerData.datasource;
      wmsLayer.options.transient = layerData.transient;
      wmsLayer.options.name = layerData.name;

      const { scene } = this.map || {};
      const { imageryLayers } = scene || {};
      const indexFound = imageryLayers._layers.findIndex(
        (el) => el?.layerData?.layer === wmsLayer?.layerData?.layer
      );
      if (indexFound > -1) {
        imageryLayers.remove(this.map.scene.imageryLayers.get(indexFound));
      }
      imageryLayers.add(wmsLayer);

      return wmsLayer;
    }

    async addWFSPointLayer(layer) {
      this.renderDataPointsUsingGeojson(layer, layer.geojson);
    }

    async addURLLayer(layer) {
      let visibleMapLayer = undefined;

      if (layer.band == "rgb") {
        let georaster = await parseGeoraster(layer.url);
        visibleMapLayer = new GeoRasterLayer({
          georaster: georaster,
          id: layer.id,
          datasource: layer.datasource,
          resolution: 256,
          opacity: layer.ui.opacity,
        });
      } else {
        const bandIndex = layer.band * 1;
        let raster = await this.fetchGeorasterForLayer({
          layer: layer,
        });

        let min = layer.ui.colorScaleMinValue;
        let max = layer.ui.colorScaleMaxValue;

        if (layer.ui.autoMinMax) {
          if (!raster.mins || !raster.maxs) {
            throw new Error(
              "Auto min/max not supported for layer " + layer.name
            );
          }
          min = raster.mins[bandIndex];
          max = raster.maxs[bandIndex];
        }

        const colorScale = chroma.scale(layer.ui.colorScale).domain([min, max]);

        visibleMapLayer = new GeoRasterLayer({
          georaster: raster,
          id: layer.id,
          datasource: layer.datasource,
          pixelValuesToColorFn: (values) =>
            values[bandIndex] === raster.noDataValue
              ? "rgba(0,0,0,0)"
              : colorScale(values[bandIndex]).hex(),
          resolution: 256, // optional parameter for adjusting display resolution
          opacity: layer.ui.opacity,
        });
      }

      visibleMapLayer.options.transient = layer.transient;
      visibleMapLayer.addTo(this.map);
      return visibleMapLayer;
    }

    async addLocalFileLayer(fileLayerData) {
      const filedata = atob(fileLayerData.filedata);
      let newLayer;

      switch (fileLayerData.filetype) {
        case "application/geo+json":
          newLayer = this.addGeoJsonLayer(
            fileLayerData.name,
            JSON.parse(filedata)
          );
          break;
        case "text/csv":
          newLayer = this.addCsvLayer(
            fileLayerData.name,
            filedata,
            fileLayerData.latCol,
            fileLayerData.lngCol
          );
          break;
        case "image/tiff":
          newLayer = await this.addTifLayer(fileLayerData.name, filedata);
          break;
        default:
          throw new Error(
            "Unable to handle file type " + fileLayerData.filetype
          );
      }

      newLayer.options.transient = fileLayerData.transient;
      newLayer.options.id = fileLayerData.id;
      newLayer.options.name = fileLayerData.name;
      newLayer.options.datasource = fileLayerData.datasource;
    }

    async addTifLayer(layerName, tiffFile) {
      const bytes = new Uint8Array(tiffFile.length);
      for (let i = 0; i < tiffFile.length; i++) {
        bytes[i] = tiffFile.charCodeAt(i);
      }

      const georaster = await parseGeoraster(bytes.buffer);
      console.log(georaster);

      const visibleMapLayer = new GeoRasterLayer({
        georaster: georaster,
      });

      visibleMapLayer.addTo(this.map);
      return visibleMapLayer;
    }

    addGeoJsonLayer(layerName, geoJSON) {
      let geoJSONLayer = L.geoJSON(geoJSON, {
        onEachFeature: (feature, layer) => {
          layer.bindPopup("loading...", {
            className: "popup",
            properties: feature.properties,
            layerName: layerName,
          });
        },
        pointToLayer: (geoJsonPoint, latlng) => {
          const marker = L.marker([latlng.lat, latlng.lng], {
            icon: L.icon(defaultIcon),
          });
          marker.isRegion = true;
          return marker;
        },
      });
      geoJSONLayer.options.isRegion = true;
      if (geoJSON?.name) {
        geoJSONLayer.options.name = geoJSON.name;
      }
      if (geoJSON?.id) {
        geoJSONLayer.options.id = geoJSON.id;
      }

      geoJSONLayer.setStyle(this.defaultGeoJsonStyle);

      geoJSONLayer.addTo(this.map);
      return geoJSONLayer;
    }

    addCsvLayer(layerName, fileData, latCol, lngCol) {
      const lines = fileData.split(/\r?\n/);
      const headers = lines[0].split(",");

      const latColIndex = headers.indexOf(latCol);
      const lngColIndex = headers.indexOf(lngCol);

      const csvLayer = L.layerGroup();

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",");
        const lat = Number(row[latColIndex]);
        const lng = Number(row[lngColIndex]);

        let properties = {};
        headers.forEach((header, i) => {
          properties[header] = row[i];
        });

        const marker = L.marker([lat, lng], {
          icon: L.icon(defaultIcon),
        });
        marker.bindPopup("loading...", {
          className: "popup",
          layerName: layerName,
          properties: properties,
        });
        marker.addTo(csvLayer);
      }

      csvLayer.addTo(this.map);
      return csvLayer;
    }

    async fetchGeorasterForLayer({ layer, dateTime, resolution = 256 }) {
      const southWest = this.getBounds().getSouthWest();
      const northEast = this.getBounds().getNorthEast();
      if (dateTime) {
        dateTime = new Date(dateTime);
      }
      const res = await new DataSource(layer).getGeoraster(
        layer,
        {
          southWestCoordinate: {
            latitude: southWest.lat,
            longitude: southWest.lng,
          },
          northEastCoordinate: {
            latitude: northEast.lat,
            longitude: northEast.lng,
          },
        },
        dateTime,
        resolution
      );
      return res;
    }

    getLayerType(layer) {
      if (layer instanceof L.TileLayer.WMS) {
        return "WMS";
      } else if (layer instanceof L.TileLayer) {
        return "TileLayer";
      } else if (layer instanceof L.Marker) {
        return "Marker";
      }
      // todo: add other type here
    }

    getMapLayers() {
      const layers = [];
      this.map.eachLayer((layer) => {
        layer.type = this.getLayerType(layer);
        if (!layer.options.basemap) {
          layers.push(layer);
        }
      });

      return layers;
    }

    getBaseMap() {
      return this.map.imageryLayers._layers.find((l) => l.isBaseLayer());
    }

    hideBaseMap() {
      const baseMap = this.getBaseMap();
      baseMap.alpha = 0;
    }

    showBaseMap() {
      const baseMap = this.getBaseMap();
      baseMap.alpha = 1;
    }

    getLayer(name) {
      for (let layer of this.map.imageryLayers._layers) {
        if (layer.options && layer.options.name === name) {
          return layer;
        }
      }

      for (let dataSource of this.map.dataSources._dataSources) {
        if (dataSource.name === name) {
          return dataSource;
        }
      }
    }

    hideLayer(name) {
      const layer = this.getLayer(name);
      delete this.selectedLayersTimestamps[name];
      const selectedLayersTimestamps = getTimestampsfromLayers(
        this.selectedLayersTimestamps
      );
      updateCsTimeline(
        selectedLayersTimestamps,
        this.map,
        this.timelineControl
      );

      if (!layer) {
        console.error("Layer not found in map with name: " + name);
        return;
      }

      // if (layer.setOpacity) {
      //   layer.setOpacity(0)
      // } else if (layer.setStyle) {
      //   layer.setStyle(this.defaultGeoJsonStyleHidden)
      // }
      layer.alpha = 0;
      layer.show = false;
      this.dispatchEvent(
        new CustomEvent("hide-color-bar", {
          detail: { layer: name },
        })
      );
      this.dispatchEvent(
        new CustomEvent("close-graph", {
          detail: { layer: name },
        })
      );
    }

    showLayer(name, opacity = 1) {
      const layer = this.getLayer(name);

      if (layer?.layerData?.csTimeline) {
        this.selectedLayersTimestamps[name] = layer?.layerData?.csTimeline;
      }
      const selectedLayersTimestamps = getTimestampsfromLayers(
        this.selectedLayersTimestamps
      );
      updateCsTimeline(
        selectedLayersTimestamps,
        this.map,
        this.timelineControl
      );

      if (!layer) {
        console.error("Layer not found in map with name: " + name);
        return;
      }

      // if (layer.setOpacity) {
      //   layer.setOpacity(1)
      // } else if (layer.setStyle) {
      //   layer.setStyle(defaultGeoJsonStyle)
      // }
      layer.show = true;
      layer.alpha = opacity;
      this.dispatchEvent(
        new CustomEvent("show-color-bar", {
          detail: { layer: name },
        })
      );
    }

    setLayerOpacity(id, opacity) {
      const layer = this.getMapLayers().find((l) => l.options.id == id);
      if (layer) {
        // we may not find the layer if it is hidden
        layer.setOpacity(opacity);
      }
    }

    // Calculates a bounding box for a point based on map zoom
    getPixelBBox(lat, lng) {
      let pixelSize =
        (40075016.686 *
          Math.abs(Math.cos((this.map.getCenter().lat / 180) * Math.PI))) /
        Math.pow(2, this.map.getZoom() + 8) /
        111120;

      // adjust pixel size to make picking locations less sensitive
      pixelSize = pixelSize * 10;

      let lat1 = lat - pixelSize;
      let lng1 = lng - pixelSize;
      let lat2 = lat + pixelSize;
      let lng2 = lng + pixelSize;

      return [lng1, lat1, lng2, lat2];
    }

    //lat : 1 deg = 111320 m

    //lng: 0.00000898 / cos( latitude ) = 1 m

    getBBox(lat, lng, radiusMetres) {
      const pixelSizeInMeters = this.map.camera.getPixelSize(
        Cesium.BoundingSphere.fromEllipsoid(this.map.scene.globe.ellipsoid),
        this.map.scene.drawingBufferWidth,
        this.map.scene.drawingBufferHeight
      );

      const lat_change = pixelSizeInMeters * 0.00000898;

      // const lon_change = pixelSizeInMeters * 0.00000898 / Math.cos(Number(lat));
      const lon_change = lat_change;

      const bounds = {
        lat_min: lat - lat_change,
        lon_min: lng - lon_change,
        lat_max: lat + lat_change,
        lon_max: lng + lon_change,
      };
      const { lat_min, lon_min, lat_max, lon_max } = bounds;
      return [lon_min, lat_min, lon_max, lat_max];
    }

    removeAllLayers() {
      // This bypasses a bug where not all imagery layers are removed
      // However this assumes that the baselayer will always be at index 0
      while (this.map.imageryLayers.length > 1) {
        const layerToRemove = this.map.imageryLayers.get(
          this.map.imageryLayers.length - 1
        );
        this.map.imageryLayers.remove(layerToRemove);
      }

      while (this.map.dataSources.length > 0) {
        this.map.dataSources.remove(this.map.dataSources.get(0));
      }
      this.hideCompareSlider();
      this.map.selectedEntity = null;
    }

    removeTransientLayers() {
      for (let layer of this.map.imageryLayers._layers) {
        if (!layer.isBaseLayer() && layer.options.transient) {
          this.map.imageryLayers.remove(layer);
        }
      }
      this.hideCompareSlider();
    }

    getCoords(cartesian3Pos) {
      const pos = Cesium.Cartographic.fromCartesian(cartesian3Pos);
      return {
        lon: ((pos.longitude / Math.PI) * 180).toFixed(10),
        lat: ((pos.latitude / Math.PI) * 180).toFixed(10),
      };
    }

    toggleCompareLayers(compareLayerRightName, compareLayerLeftName) {
      if (!compareLayerRightName && !compareLayerLeftName) {
        this.hideCompareSlider();
        return;
      }

      for (let layer of this.map.imageryLayers._layers) {
        if (layer._isBaseLayer) continue;

        if (layer?.options.name === compareLayerRightName) {
          layer.splitDirection = Cesium.SplitDirection.RIGHT;
        } else if (layer?.options.name === compareLayerLeftName) {
          layer.splitDirection = Cesium.SplitDirection.LEFT;
        } else {
          layer.splitDirection = Cesium.SplitDirection.NONE;
        }
      }

      this.rightLayerLabel.innerText = compareLayerRightName;
      this.leftLayerLabel.innerText = compareLayerLeftName;

      if (compareLayerLeftName) {
        this.leftLayerLabel.style.visibility = "visible";
      } else {
        this.leftLayerLabel.style.visibility = "hidden";
      }

      if (compareLayerRightName) {
        this.rightLayerLabel.style.visibility = "visible";
      } else {
        this.rightLayerLabel.style.visibility = "hidden";
      }

      this.showCompareSlider();
    }

    hideCompareSlider() {
      this.compareLayer = null;
      this.slider.style.display = "none";
      for (let layer of this.map.imageryLayers._layers) {
        if (layer._isBaseLayer) continue;
        layer.splitDirection = Cesium.SplitDirection.NONE;
      }
    }

    showCompareSlider() {
      this.slider.style.display = "";
      this.map.scene.splitPosition =
        this.slider.offsetLeft / this.slider.parentElement.offsetWidth;

      const handler = new Cesium.ScreenSpaceEventHandler(this.slider);

      let moveActive = false;

      const move = (movement) => {
        if (!moveActive) {
          return;
        }

        const relativeOffset = movement.endPosition.x;
        const splitPosition =
          (this.slider.offsetLeft + relativeOffset) /
          this.slider.parentElement.offsetWidth;
        this.slider.style.left = `${100.0 * splitPosition}%`;
        this.map.scene.splitPosition = splitPosition;
      };

      handler.setInputAction(() => {
        moveActive = true;
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      handler.setInputAction(() => {
        moveActive = true;
      }, Cesium.ScreenSpaceEventType.PINCH_START);

      handler.setInputAction(move, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.setInputAction(move, Cesium.ScreenSpaceEventType.PINCH_MOVE);

      handler.setInputAction(() => {
        moveActive = false;
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
      handler.setInputAction(() => {
        moveActive = false;
      }, Cesium.ScreenSpaceEventType.PINCH_END);
    }

    showOSMLayer() {
      this.osmLayer.show = true;
    }

    hideOSMLayer() {
      this.osmLayer.show = false;
    }

    async renderDataPointsUsingGeojson(layer, geojson) {
      const dataSource = await Cesium.GeoJsonDataSource.load(geojson);
      dataSource.name = layer.name;
      dataSource.layerData = layer;
      if (layer.ui) {
        dataSource.alpha = layer.ui.opacity;
        if (layer.ui.opacity === 0) {
          dataSource.show = false;
        } else {
          this.selectedLayersTimestamps[layer.name] = layer?.csTimeline;
        }
      }

      this.map.scene.globe.depthTestAgainstTerrain = false;

      for (let dataPoint of dataSource.entities.values) {
        dataPoint.billboard.image = layer.iconPath;
      }
      this.map.dataSources.add(dataSource);

      const onLeftClick = (movement) => {
        let clickedDataSource;

        const pickedFeature = map.scene.pick(movement.position);
        if (!Cesium.defined(pickedFeature)) {
          return;
        }
        const dataPointID = pickedFeature?.id?.id;

        if (!dataPointID) {
          return;
        }

        for (let i = 0; i < map.dataSources.length; i++) {
          const dataSource = map.dataSources.get(i);
          if (dataSource.entities.getById(dataPointID)) {
            clickedDataSource = dataSource;
          }
        }

        if (!clickedDataSource) {
          return;
        }

        if (
          !clickedDataSource?.layerData?.geojson?.features[0]?.properties?.data
        ) {
          return;
        }

        this.selectedFeature = dataPointID;
        this.selectedFeatureLayerName = clickedDataSource.name;
        const layer = clickedDataSource.layerData;
        for (let dataPoint of clickedDataSource.entities.values) {
          if (dataPoint.id !== this.selectedFeature) {
            dataPoint.billboard.image = layer.iconPath;
          } else {
            dataPoint.billboard.image = layer.iconPathHighlight;
          }
        }

        const data = [];
        let variables = [];
        for (let feature of clickedDataSource.layerData.geojson.features) {
          const seriesId = feature.id;
          const dataPoints = JSON.parse(feature.properties.data);
          for (let [key, value] of Object.entries(dataPoints)) {
            const current_variables = Object.keys(value).sort();
            variables = [
              ...new Set(variables.concat(Object.keys(value)).sort()),
            ];

            for (let variable of current_variables) {
              data.push([key, value[variable], `${seriesId}_${variable}`]);
            }
          }
        }

        const selectedLayersTimestamps = getTimestampsfromLayers(
          this.selectedLayersTimestamps
        );

        //expected data format [[timestamp, value, seriesName],...]
        this.dispatchEvent(
          new CustomEvent("load-graph", {
            detail: {
              focus: variables.map((variable) => `${dataPointID}_` + variable),
              data: data,
              variables: variables,
              graphMetadata: layer.graphMetadata,
              selectedLayersTimestamps: selectedLayersTimestamps,
            },
          })
        );
      };

      const removeAllHightlights = () => {
        for (let i = 0; i < map.dataSources.length; i++) {
          const ds = map.dataSources.get(i);

          for (let j = 0; j < ds.entities._entities._array.length; j++) {
            if (ds.entities._entities._array[j]._id != this.selectedFeature) {
              const entity = ds.entities._entities._array[j];
              entity.billboard.image = ds.layerData.iconPath;
            }
          }
        }
      };

      const onHover = (movement) => {
        removeAllHightlights();
        let hoveredDataSource;

        const pickedFeature = map.scene.pick(movement.endPosition);

        if (!Cesium.defined(pickedFeature)) {
          return;
        }

        const dataPointID = pickedFeature?.id?.id;

        if (!dataPointID) {
          return;
        }

        for (let i = 0; i < map.dataSources.length; i++) {
          const dataSource = map.dataSources.get(i);
          if (dataSource.entities.getById(dataPointID)) {
            hoveredDataSource = dataSource;
          }
        }

        if (!hoveredDataSource) {
          return;
        }

        const layer = hoveredDataSource.layerData;
        for (let dataPoint of hoveredDataSource.entities.values) {
          if (
            dataPoint.billboard.image !== layer.iconPath &&
            dataPoint.id !== this.selectedFeature
          ) {
            dataPoint.billboard.image = layer.iconPath;
          }
        }
        const entity = hoveredDataSource.entities.getById(dataPointID);

        entity.billboard.image = layer.iconPathHighlight;
      };

      this.map.screenSpaceEventHandler.setInputAction(
        onLeftClick,
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
      this.map.screenSpaceEventHandler.setInputAction(
        onHover,
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
    }

    async getLayerPropertiesForPoint(layer, lat, lon) {
      if (!layer.ui.visible || layer.ui.opacity === 0) return null;
      const d = new DataSource(layer);
      let featureCollection;
      if (layer.isPointData && this.selectedFeature) {
        featureCollection = await d.getGeoJson(
          layer,
          `IN ('${this.selectedFeature}')`
        );
      } else {
        const bbox = this.getBBox(Number(lat), Number(lon), 200);
        featureCollection = await d.getPointValues(bbox);
      }

      if (featureCollection && featureCollection.features) {
        const properties = featureCollection?.features[0]?.properties;
        if (properties) {
          return {
            name: layer.name,
            properties: featureCollection?.features[0]?.properties,
          };
        }
      }
    }

    async loadMap() {
      if (!this.shadow.querySelector("#map")) return;
      if (!this.zoom) {
        // default map center and zoom
        this.center = {
          lat: 29.749907,
          lng: -95.358421,
        };
        this.zoom = 10;
      }
      // this.map = L.map(this.shadow.querySelector('#map'), {zoomControl: false})
      //   .setView([this.center.lat, this.center.lng], this.zoom);

      Cesium.Ion.defaultAccessToken = app.env.geostudio.cesiumToken;

      const mapboxToken = app.env.geostudio.mapboxToken;

      //Add mapbox basemap as default for when there is no Cesium Ion token

      let imagerySources = Cesium.createDefaultImageryProviderViewModels();
      let terrainSources = Cesium.createDefaultTerrainProviderViewModels();

      //Filter out all Cesium Ion basemaps when there is no Cesium Ion token

      if (!Cesium.Ion.defaultAccessToken) {
        imagerySources = imagerySources.filter((basemap) => {
          return (
            basemap._category != "Cesium ion" &&
            !basemap.name.includes("ArcGIS") &&
            !basemap.name.includes("Esri")
          );
        });

        terrainSources = terrainSources.filter(
          (terrain) => terrain._category != "Cesium ion"
        );
      }

      const mapboxLayer = new Cesium.UrlTemplateImageryProvider({
        url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        tileWidth: 256,
        tileHeight: 256,
        maximumLevel: 19,
      });

      const mapboxViewModel = new Cesium.ProviderViewModel({
        name: "Mapbox satellite streets v12",
        iconUrl: "../../../images/mapbox-hursley.png",
        tooltip: "Mapbox Satellite Imagery",
        category: "Mapbox",
        creationFunction: () => mapboxLayer,
      });

      let mapSettings;

      if (mapboxToken) {
        mapSettings = {
          terrainProviderViewModels: terrainSources,
          selectionIndicator: false,
          imageryProviderViewModels: [...imagerySources, mapboxViewModel],
        };
      } else {
        mapSettings = {
          terrainProviderViewModels: terrainSources,
          selectionIndicator: false,
          imageryProviderViewModels: imagerySources,
        };
      }

      if (Cesium.Ion.defaultAccessToken) {
        mapSettings.terrain = Cesium.Terrain.fromWorldTerrain();
      } else if (mapboxToken) {
        mapSettings.selectedImageryProviderViewModel = mapboxViewModel;
      } else {
        const osmLayer = new Cesium.OpenStreetMapImageryProvider({
          url: "https://a.tile.openstreetmap.org/",
        });

        mapSettings.imageryProvider = osmLayer;
      }

      this.map = new Cesium.Viewer(
        this.shadow.querySelector("#map"),
        mapSettings
      );

      //Hide timeline intially
      hideCsTimeline();

      if (Cesium.Ion.defaultAccessToken) {
        // Add Cesium OSM Buildings, a global 3D buildings layer.
        Cesium.createOsmBuildingsAsync()
          .then((buildingTileset) => {
            this.osmLayer = buildingTileset;
            this.map.scene.primitives.add(buildingTileset);
            this.hideOSMLayer();
          })
          .catch((error) => {
            throw error;
          });
      }

      new Cesium.ScreenSpaceEventHandler(this.map.canvas).setInputAction(
        (event) => {
          onLeftClick(event);
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );

      const onLeftClick = async (event) => {
        const point = new Cesium.Cartesian2(event.position.x, event.position.y);
        const cartesian = this.map.camera.pickEllipsoid(
          point,
          this.map.scene.globe.ellipsoid
        );
        if (!cartesian) {
          return;
        }
        const cartographic =
          this.map.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(10);
        const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(10);

        const coords = { latitude: lat, longitude: lon };

        const layers = app.main.getMapLayers();
        const showLoading = layers.length > 0;

        this.infoBox.setupInfoBox(coords, [], showLoading);

        const isCoordValid = !isNaN(Number(lon)) && !isNaN(Number(lat));

        if (isCoordValid && layers) {
          let layerProperties = await Promise.all(
            layers.map((layer) =>
              this.getLayerPropertiesForPoint(layer, lat, lon)
            )
          );

          layerProperties = layerProperties.filter(
            (layer) => layer && !("icon-path" in layer.properties)
          );
          this.infoBox.setupInfoBox(coords, layerProperties, false);
        }
      };

      this.mapLoaded = true;

      window.map = this.map;

      this.map.imageryLayers.layerAdded.addEventListener(() => {
        this.dispatchEvent(new CustomEvent("layerchange"));
      });

      this.map.imageryLayers.layerRemoved.addEventListener(() => {
        this.dispatchEvent(new CustomEvent("layerchange"));
      });

      //Set a high sensitivity for the camera.changed event
      this.map.camera.percentageChanged = 0.001;

      this.map.camera.changed.addEventListener(() => {
        this.dispatchEvent(new CustomEvent("map-changed"));

        const camera = app.main.map.map.camera;
        const globe = app.main.map.map.scene.globe;

        const width = app.main.map.map.canvas.clientWidth;
        const height = app.main.map.map.canvas.clientWidth;

        const left = new Cesium.Cartesian2(width / 2 - 50, height / 50);
        const right = new Cesium.Cartesian2(width / 2 + 50, height / 50);

        const leftRay = camera.getPickRay(left);
        const rightRay = camera.getPickRay(right);

        var leftPosition = globe.pick(leftRay, app.main.map.map.scene);

        var rightPosition = globe.pick(rightRay, app.main.map.map.scene);

        if (leftPosition && rightPosition) {
          this.scaleBar.showScaleBar();
          var leftCartographic =
            globe.ellipsoid.cartesianToCartographic(leftPosition);
          var rightCartographic =
            globe.ellipsoid.cartesianToCartographic(rightPosition);

          var geodesic = new Cesium.EllipsoidGeodesic();
          geodesic.setEndPoints(leftCartographic, rightCartographic);
          var distance = geodesic.surfaceDistance;

          this.scaleBar.setScale((distance / 1000).toFixed(2) + " km");
        } else {
          this.scaleBar.hideScaleBar();
        }
      });

      this.dispatchEvent(new CustomEvent("load"));

      return;
    }

    async ensureMapLoaded() {
      if (this.mapLoaded) {
        return Promise.resolve();
      } else {
        await this.sleep(100);
        return this.ensureMapLoaded();
      }
    }

    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    getBounds() {
      const rectangle = this.map.camera.computeViewRectangle();
      const southwestLeaflet = L.latLng(
        Cesium.Math.toDegrees(rectangle.south),
        Cesium.Math.toDegrees(rectangle.west)
      );
      const northeastLeaflet = L.latLng(
        Cesium.Math.toDegrees(rectangle.north),
        Cesium.Math.toDegrees(rectangle.east)
      );
      return L.latLngBounds(southwestLeaflet, northeastLeaflet);
    }

    calculateIsViewportAreaAboveThreshold(viewportArea) {
      return viewportArea > 8000000000000;
    }

    calculateIsViewportAreaBelowThreshold(minArea, viewportArea) {
      return viewportArea < minArea;
    }

    fitBounds(layer) {
      let l = this.getLeafletLayer(layer);
      if (l && l.getBounds) this.map.fitBounds(l.getBounds());
    }

    flyTo(latlng, zoom) {
      this.map.flyTo(L.latLng(latlng[0], latlng[1]), zoom);
    }

    flyHome() {
      this.map.camera.flyHome(0);
    }

    flyToBounds(bbox) {
      if (!bbox || bbox.length !== 4) return;

      const rectangle = Cesium.Rectangle.fromDegrees(
        bbox[0],
        bbox[1],
        bbox[2],
        bbox[3]
      );

      this.map.camera.flyTo({ destination: rectangle });
    }

    /**
     * this calculation assumes a flat Earth model and might not be perfectly accurate
     * for large areas or near the poles due to the Earth's curvature
     * @returns
     */
    getViewportArea() {
      const bounds = this.getBounds();

      // Calculate the width and height of the bounding box in meters
      const widthMeters = bounds
        .getNorthEast()
        .distanceTo(bounds.getSouthEast());
      const heightMeters = bounds
        .getNorthEast()
        .distanceTo(bounds.getNorthWest());

      // Calculate the area of the viewport in square meters
      const viewportArea = widthMeters * heightMeters;
      return viewportArea;
    }

    getBoundingBoxBounds(coords) {
      return L.latLngBounds(
        { lat: coords.lat1, lng: coords.lng1 },
        { lat: coords.lat2, lng: coords.lng2 }
      );
    }

    getBoundingBoxArea(coords) {
      const bounds = this.getBoundingBoxBounds(coords);

      // Calculate the width and height of the bounding box in meters
      const widthMeters = bounds
        .getNorthEast()
        .distanceTo(bounds.getSouthEast());
      const heightMeters = bounds
        .getNorthEast()
        .distanceTo(bounds.getNorthWest());

      // Calculate the area of the bounding box in square meters
      const boundingBoxArea = widthMeters * heightMeters;
      return boundingBoxArea;
    }

    isBoundingBoxAreaAboveThreshold(coords) {
      const boundingBoxArea = this.getBoundingBoxArea(coords);
      return boundingBoxArea > 8000000000000;
    }

    isBoundingBoxAreaBelowThreshold(coords, minArea) {
      const boundingBoxArea = this.getBoundingBoxArea(coords);
      return boundingBoxArea < minArea;
    }

    isViewportAreaAboveThreshold() {
      return this.calculateIsViewportAreaAboveThreshold(this.getViewportArea());
    }

    isViewportAreaBelowThreshold(minArea) {
      const viewportArea = this.getViewportArea();
      return this.calculateIsViewportAreaBelowThreshold(minArea, viewportArea);
    }

    canExport(layer) {
      let ds = new DataSource(layer);
      if (!ds || !ds.canGetGeoraster()) return false;

      return true;
    }

    async exportLayer(layer) {
      if (!this.canExport(layer)) return undefined;
      return await this.fetchGeorasterForLayer({
        layer: layer,
        dateTime: layer?.ui?.datetime ? new Date(layer.ui.datetime) : undefined,
        resolution: 512,
      });
    }

    // hideTimeline() {
    //   this.shadow.querySelector(
    //     ".cesium-viewer-timelineContainer"
    //   ).style.visibility = "hidden";

    //   this.timelineControl.style.visibility = "hidden";
    // }
  }
);
