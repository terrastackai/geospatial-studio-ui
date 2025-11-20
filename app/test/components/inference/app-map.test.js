/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { expect, fixture } from "@open-wc/testing";
import "../../../js/components/inference/app-map";
import {
  calculateIsViewportAreaAboveThreshold,
  calculateIsViewportAreaBelowThreshold,
  camelCase,
  formatNumberValue,
  infoBoxTemplate,
  sleep,
} from "../../../js/components/inference/app-map";

describe("App Map component", () => {
  it("Checks if the entire app map component is mounted to the DOM", async () => {
    const el = await fixture("<app-map></app-map>");
    expect(el).to.exist;
  });
  it("Checks app map default child nodes exist", async () => {
    const el = await fixture("<app-map></app-map>");
    const shadowRoot = el.shadowRoot;

    const mapContainer = shadowRoot.querySelector("#map");
    expect(mapContainer).to.exist;

    const timelineControl = shadowRoot.querySelector("timeline-control");
    expect(timelineControl).to.exist;

    const slider = shadowRoot.querySelector("#slider");
    expect(slider).to.exist;
  });
  it("camelCase function capitalizes the first character of the string", () => {
    expect(camelCase("word")).to.equal("Word");
    expect(camelCase("hello world")).to.equal("Hello world");
  });
  it("formatNumber function formats floats to 3 decimal places", () => {
    expect(formatNumberValue(null)).to.equal(null);
    const val = 123.4567;
    expect(formatNumberValue(val)).to.equal(val.toFixed(3));
    expect(formatNumberValue(123)).to.equal(123);
  });
  it("checks if infoBoxTemplate returns a template", async () => {
    const coords = {
      latitude: "-1.3881558438",
      longitude: "36.7745381464",
    };
    const layerProperties = [
      {
        name: "impact",
        properties: {
          GRAY_INDEX: 4,
        },
      },
    ];
    const showLoading = true;
    const el = await fixture(
      infoBoxTemplate(coords, layerProperties, showLoading)
    );
    expect(el).to.exist;
  });
  it("checks if infoBoxTemplate returns a template and that it's default child nodes exist", async () => {
    const coords = {
      latitude: "-1.3881558438",
      longitude: "36.7745381464",
    };
    const layerProperties = [
      {
        name: "impact",
        properties: {
          GRAY_INDEX: 4,
        },
      },
    ];
    const showLoading = true;
    const el = await fixture(
      infoBoxTemplate(coords, layerProperties, showLoading)
    );
    expect(el.hasChildNodes()).to.equal(true);
  });
  it("checks if sleep function resolves after a specified period", async () => {
    const start = Date.now();
    const ms = 1000;

    await sleep(ms);
    const end = Date.now();
    const elapsed = end - start;

    // Check if the elapsed time is at least the specified time
    expect(elapsed).to.be.at.least(ms);
  });
  it("checks that ViewportAreaAboveThreshold returns true", () => {
    expect(calculateIsViewportAreaAboveThreshold(80000000001)).to.equal(true);
    expect(calculateIsViewportAreaAboveThreshold(800000000)).to.equal(false);
  });

  it("checks that isViewPortAreaBelowThreshold returns true", () => {
    const minArea = 5017600;
    const viewportArea = 80000;
    expect(
      calculateIsViewportAreaBelowThreshold(minArea, viewportArea)
    ).to.equal(true);
    expect(calculateIsViewportAreaBelowThreshold(456896, 80000000)).to.equal(
      false
    );
  });
  it("checks that ensureMapLoaded function loads the map when the user opens the inference-page", async () => {
    const el = await fixture("<app-map></app-map>");
    setTimeout(() => (el.mapLoaded = true), 100);

    await el.ensureMapLoaded();

    expect(el.mapLoaded).to.be.true;
  });
  it("checks that clearMap function when called calls the map-center, map-zoom and map-remove function", async () => {
    const el = await fixture("<app-map></app-map>");

    let removeCalled = false;
    el.map = {
      getCenter: () => ({ lat: 10, lng: 20 }),
      getZoom: () => 12,
      remove: () => {
        removeCalled = true;
      },
    };

    el.clearMap();
    expect(el.center).to.deep.equal({ lat: 10, lng: 20 });
    expect(el.zoom).to.equal(12);
    expect(removeCalled).to.be.true;
  });
  it("checks that getBounds function when called calls returns a BBox using Leaflet and Cesium functions", async () => {
    // Mock Cesium and Leaflet functions
    window.Cesium = {
      Math: {
        toDegrees: (radian) => radian * (180 / Math.PI),
      },
    };

    window.L = {
      latLng: (lat, lng) => ({ lat, lng }),
      latLngBounds: (southwest, northeast) => ({ southwest, northeast }),
    };

    const el = await fixture("<app-map></app-map>");
    el.map = {
      camera: {
        computeViewRectangle: () => ({
          south: 0,
          west: 0,
          north: 1,
          east: 1,
        }),
      },
    };

    const bounds = el.getBounds();

    // Verify the bounds
    expect(bounds.southwest).to.deep.equal({ lat: 0, lng: 0 });
    expect(bounds.northeast).to.deep.equal({
      lat: 57.29577951308232,
      lng: 57.29577951308232,
    });
  });
  it("checks that getLeafletLayer function when called calls returns a valid Leaflet layer", async () => {
    const el = await fixture("<app-map></app-map>");
    const mockLayer = {
      options: {
        id: "layer1",
        datasource: "datasource1",
      },
    };
    el.map = {
      eachLayer: (callback) => {
        callback(mockLayer);
      },
    };
    const result = el.getLeafletLayer({
      id: "layer1",
      datasource: "datasource1",
    });
    expect(result).to.deep.equal(mockLayer);
  });
  it("checks that getLeafletLayer function when called returns undefined when no valid-matching layer is found", async () => {
    const el = await fixture("<app-map></app-map>");
    const mockLayer = {
      options: {
        id: "layer1",
        datasource: "datasource1",
      },
    };
    el.map = {
      eachLayer: (callback) => {
        callback(mockLayer);
      },
    };
    const result = el.getLeafletLayer({
      id: "layer2",
      datasource: "datasource2",
    });
    expect(result).to.deep.equal(undefined);
  });
  it("checks that fitBounds function calls map.fitBounds with the correct bounds", async () => {
    const el = await fixture(`<app-map></app-map>`);

    const mockLayer = {
      getBounds: () => ({ south: 0, west: 0, north: 1, east: 1 }),
      options: { id: "layer1", datasource: "datasource1" },
    };

    el.map = {
      fitBounds: (bounds) => {
        expect(bounds).to.deep.equal(mockLayer.getBounds());
      },
      eachLayer: (callback) => {
        callback(mockLayer);
      },
    };

    el.fitBounds({ id: "layer1", datasource: "datasource1" });
  });
  it("checks that flyTo function calls map.flyTo with correct latlng and zoom", async () => {
    const el = await fixture(`<app-map></app-map>`);
    el.map = {
      flyTo: (latlng, zoom) => {
        expect(latlng).to.deep.equal({ lat: 10, lng: 20 });
        expect(zoom).to.equal(12);
      },
    };

    el.flyTo([10, 20], 12);
  });
  it("checks that flyHome function calls map.camera.flyHome with 0 duration", async () => {
    const el = await fixture(`<app-map></app-map>`);

    el.map = {
      camera: {
        flyHome: (duration) => {
          expect(duration).to.equal(0);
        },
      },
    };

    el.flyHome();
  });
  it("checks that flyToBounds function calls map.camera.flyTo with correct rectangle", async () => {
    const el = await fixture(`<app-map></app-map>`);

    window.Cesium = {
      Rectangle: {
        fromDegrees: (west, south, east, north) => {
          return { west, south, east, north };
        },
      },
    };

    const mockBbox = [-10, -20, 30, 40];

    el.map = {
      camera: {
        flyTo: ({ destination }) => {
          expect(destination).to.deep.equal({
            west: -10,
            south: -20,
            east: 30,
            north: 40,
          });
        },
      },
    };

    el.flyToBounds(mockBbox);
  });

  it("checks that flyToBounds function returns early if bbox is invalid", async () => {
    const el = await fixture(`<app-map></app-map>`);

    el.map = {
      camera: {
        flyTo: () => {
          throw new Error("Should not be called");
        },
      },
    };

    el.flyToBounds([]);
    el.flyToBounds([1, 2, 3]);
    el.flyToBounds(null);
  });

  it("checks that getViewportArea function calculates the correct area in square meters", async () => {
    const el = await fixture(`<app-map></app-map>`);

    el.getBounds = () => ({
      getNorthEast: () => ({
        distanceTo: () => 200,
      }),
      getSouthEast: () => ({
        distanceTo: () => 200,
      }),
      getNorthWest: () => ({
        distanceTo: () => 200,
      }),
    });

    const viewportArea = el.getViewportArea();

    expect(viewportArea).to.equal(40000);
  });

  it("checks that isViewportAreaAboveThreshold function returns true if area is above threshold", async () => {
    const el = await fixture(`<app-map></app-map>`);
    el.getBounds = () => ({
      getNorthEast: () => ({
        distanceTo: () => 20000000,
      }),
      getSouthEast: () => ({
        distanceTo: () => 20000000,
      }),
      getNorthWest: () => ({
        distanceTo: () => 20000000,
      }),
    });
    const viewportArea = el.getViewportArea(); //40000
    calculateIsViewportAreaAboveThreshold(viewportArea);
    const result = el.isViewportAreaAboveThreshold();
    expect(result).to.be.true;
  });

  it("checks that isViewportAreaAboveThreshold function returns true if area is below threshold", async () => {
    const el = await fixture(`<app-map></app-map>`);
    el.getBounds = () => ({
      getNorthEast: () => ({
        distanceTo: () => 20,
      }),
      getSouthEast: () => ({
        distanceTo: () => 20,
      }),
      getNorthWest: () => ({
        distanceTo: () => 20,
      }),
    });
    const viewportArea = el.getViewportArea(); //400
    const minArea = 4000;
    calculateIsViewportAreaBelowThreshold(minArea, viewportArea);
    const result = el.isViewportAreaBelowThreshold(minArea);
    expect(result).to.be.true;
  });

  // it("checks that canExport function returns true if the DataSource can export the layer", async () => {
  //   const el = await fixture(`<app-map></app-map>`);
  //   const mockLayer = {};
  //   class DataSource {
  //     constructor(layer) {
  //       this.layer = layer;
  //       this.ds = {
  //         getDatasource: () => {},
  //       };
  //       this.ds = {
  //         getGeoraster: () => {},
  //       };
  //     }

  //     canGetGeoraster() {
  //       return true;
  //     }
  //   }

  //   window.DataSource = DataSource;
  //   const result = el.canExport(mockLayer);

  //   expect(result).to.be.true;
  // });

  it("checks that exportLayer function returns georaster data if the layer can be exported", async () => {
    const el = await fixture(`<app-map></app-map>`);
    const mockLayer = { ui: { datetime: "2024-08-21T00:00:00Z" } };

    el.canExport = () => true;
    el.fetchGeorasterForLayer = async () => "mockGeorasterData";

    const result = await el.exportLayer(mockLayer);
    expect(result).to.equal("mockGeorasterData");
  });

  it("checks that setMapOptions correctly sets map options", async () => {
    const el = await fixture(`<app-map></app-map>`);

    const customOptions = {
      center: { lat: 35.6895, lng: 139.6917 },
      zoom: 12,
      basemap: "http://{s}.tile.custommap.org/{z}/{x}/{y}.png",
      attribution: "Custom Map Contributors",
    };

    el.setMapOptions(customOptions);

    expect(el.center).to.deep.equal(customOptions.center);
    expect(el.zoom).to.equal(customOptions.zoom);
    expect(el.basemap).to.equal(customOptions.basemap);
    expect(el.attribution).to.equal(customOptions.attribution);
  });

  it("checks that addURLLayer function adds a GeoRaster layer to the map", async () => {
    const el = await fixture(`<app-map></app-map>`);
    const mockLayer = {
      band: "rgb",
      url: "http://mockserver.com/georaster",
      id: "layerId",
      datasource: "mockDatasource",
      ui: { opacity: 0.8 },
    };

    window.parseGeoraster = async () => "mockGeoraster";
    window.GeoRasterLayer = class {
      constructor(options) {
        this.options = options;
      }
      addTo(map) {}
    };

    const result = await el.addURLLayer(mockLayer);

    expect(result.options.georaster).to.equal("mockGeoraster");
    expect(result.options.opacity).to.equal(0.8);
  });

  it("checks that addTifLayer function adds a TIF layer to the map", async () => {
    const el = await fixture(`<app-map></app-map>`);

    const mockLayerName = "mockLayerName";
    const mockTiffFile = "mockTiffFileData";

    window.parseGeoraster = async () => "mockGeoraster";
    window.GeoRasterLayer = class {
      constructor(options) {
        this.options = options;
      }
      addTo(map) {}
    };

    const result = await el.addTifLayer(mockLayerName, mockTiffFile);

    expect(result.options.georaster).to.equal("mockGeoraster");
  });
});
