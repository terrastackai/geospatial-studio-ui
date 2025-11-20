/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import "../libs/carbon-web-components/ui-shell.min.js";
import "../components/inference/app-map.js";
import "../components/inference/layer-panel.js";
import "../components/inference/history-panel.js";
import "../components/inference/examples-panel.js";
import "../components/inference/inference-panel.js";
import "../components/inference/menu-bar.js";
import "../components/inference/action-bar.js";
// import "../components/inference/app-timeline.js";
import "../components/inference/timeseries-graph.js";
import "../components/inference/color-bar.js";
import "../libs/carbon-web-components/content-switcher.min.js";
import "../libs/carbon-web-components/text-input.min.js";
import "../libs/carbon-web-components/dropdown.min.js";
import "../libs/carbon-web-components/date-picker.min.js";
import "../libs/carbon-web-components/tabs.min.js";
import "../libs/carbon-web-components/button.min.js";
import "../libs/carbon-web-components/file-uploader.min.js";
import "../libs/carbon-web-components/combo-box.min.js";
import "../components/inference/status-history-modal.js";
import "../components/inference/add-data-layer-modal.js";
import * as util from "../utils.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }
    * {
      font-family: "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      height: 100vh;
      background: #ffffff;
    }

    ol,
    ul {
      list-style: none;
    }

    .home {
      position: relative;
      width: 100%;
      height: calc(100vh - 3rem);
      background: white;
      z-index: 1;
    }

    .display-none {
      display: none;
    }

    menu-bar {
      position: absolute;
      left: 25px;
      top: 105px;
      z-index: 2;
    }

    layer-panel {
      position: absolute;
      display: flex;
      align-items: flex-end;
      top: 105px;
      left: 80px;
      z-index: 3;
    }

    history-panel {
      position: absolute;
      display: flex;
      align-items: flex-end;
      top: 105px;
      left: 80px;
      z-index: 3;
    }

    examples-panel {
      position: absolute;
      display: flex;
      align-items: flex-end;
      top: 105px;
      left: 80px;
      z-index: 3;
    }

    inference-panel {
      position: absolute;
      top: 105px;
      right: 25px;
      z-index: 3;
    }

    app-timeline {
      position: absolute;
      left: 200px;
      right: 200px;
      bottom: 0px;
      margin-top: auto;
      z-index: 2;
    }

    timeseries-graph {
      position: fixed;
      transform: translateX(-50%);
      width: calc(60% + 4rem + 3.75rem + 0.5rem);
      left: 50%;
      bottom: 105px;
      height: 150px;
      margin-top: auto;
      z-index: 2;
      box-shadow: 0 3px 0 0 rgba(0, 0, 0, 0.25);
    }

    color-bar {
      position: absolute;
      right: 25px;
      bottom: 7rem;
      margin-top: auto;
      z-index: 2;
    }
  </style>
  <add-data-layer-modal></add-data-layer-modal>
  <status-history-modal></status-history-modal>
  <div id="body" class="page-content">
    <section id="home" class="home">
      <action-bar></action-bar>
      <menu-bar></menu-bar>
      <layer-panel class="display-none"></layer-panel>
      <history-panel class="display-none"></history-panel>
      <examples-panel class="display-none"></examples-panel>
      <inference-panel
        id="inference_panel"
        class="display-none"
      ></inference-panel>
      <timeseries-graph
        id="timeseries_graph"
        class="display-none"
      ></timeseries-graph>
      <app-map id="map"></app-map>
    </section>
  </div>
`;

window.customElements.define(
  "inference-page",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.current_inference = null;
      this.layers = [];
      this.eventSourceList = [];
      this.isTryInLab = false;
      this.userEmail;
    }

    async render() {
      this.setDOM(template(this));

      const idToken = localStorage.getItem("id_token");
      if (idToken) {
        const payload = idToken.split(".")[1];
        const decodedPayload = util.decodeBase64(payload);
        const parsedPayload = JSON.parse(decodedPayload);
        this.userEmail = parsedPayload.email;
      }

      this.inferencePanel = this.shadow.querySelector("inference-panel");
      this.layersPanel = this.shadow.querySelector("layer-panel");
      this.historyPanel = this.shadow.querySelector("history-panel");
      this.examplesPanel = this.shadow.querySelector("examples-panel");
      this.menuBar = this.shadow.querySelector("menu-bar");
      this.timeseriesGraph = this.shadow.querySelector("timeseries-graph");
      this.actionBar = this.shadow.querySelector("action-bar");
      this.addDataLayerModal = this.shadow.querySelector(
        "add-data-layer-modal"
      );

      if (app.env.geostudio.mapboxToken) {
        this.provider = new GeoSearch.MapBoxProvider({
          params: {
            access_token: app.env.geostudio.mapboxToken,
          },
        });
      } else {
        this.provider = new GeoSearch.OpenStreetMapProvider();
      }

      this.inferencePanel.addEventListener("close-panel", () => {
        this.toggleRunInferencePanel();
      });

      this.actionBar.addEventListener("inference-panel-button-click", () => {
        if (app.env.geostudio.disableLI === "true") {
          app.showMessage(
            "Running live inferences is disabled!",
            "",
            "info",
            5000
          );
          return;
        }
        this.toggleRunInferencePanel();
      });

      this.actionBar.addEventListener("download-button-click", () => {
        this.downloadInference();
      });

      this.actionBar.addEventListener("reset-button-click", () => {
        this.clearInference();
      });

      this.actionBar.addEventListener("geocode-this", (e) => {
        this.geocodeThis(e.detail);
      });

      this.menuBar.addEventListener("menu-button-clicked", (e) => {
        this.togglePanels(e.detail);
      });

      this.layersPanel.addEventListener("close-panel", () => {
        this.togglePanels("layers");
        this.menuBar.deselectPanel();
      });

      this.historyPanel.addEventListener("close-panel", () => {
        this.togglePanels("history");
        this.menuBar.deselectPanel();
      });

      this.examplesPanel.addEventListener("close-panel", () => {
        this.togglePanels("examples");
        this.menuBar.deselectPanel();
      });

      this.examplesPanel.addEventListener("load-map", (e) => {
        this.loadMap(e.detail);
      });

      this.historyPanel.addEventListener("load-map", (e) => {
        this.loadMap(e.detail);
      });

      this.historyPanel.addEventListener("event-source", (e) => {
        this.connectEventSource(e.detail);
      });

      this.historyPanel.addEventListener("show-status-history", (e) => {
        const statusHistoryModal = this.shadow.querySelector(
          "status-history-modal"
        );

        statusHistoryModal.setupModal(e.detail);
      });

      this.examplesPanel.addEventListener("show-status-history", (e) => {
        const statusHistoryModal = this.shadow.querySelector(
          "status-history-modal"
        );

        statusHistoryModal.setupModal(e.detail);
      });

      this.timeseriesGraph.addEventListener("close-graph", () => {
        this.displayTimeseriesGraph(false);
        app.main.map.selectedFeature = null;
        app.main.map.selectedFeatureLayerName = null;
      });

      const workspace = await app.workspace.getWorkspace();
      const workspaceLayers = workspace.projects[0].layers;

      this.layers = workspaceLayers;

      this.layersPanel.addEventListener("add-layer", () => {
        this.addDataLayerModal.show();
      });

      this.layersPanel.addEventListener("delete-layer", async (e) => {
        const layer = e.detail;

        this.layers = this.layers.filter((l) => l.id !== layer.id);
        this.map.removeAllLayers();

        const index = this.layers.indexOf(layer);
        this.layers.splice(index, 1);
        this.layersPanel.setMapLayers(this.layers);

        this.renderLayers();
      });

      this.layersPanel.addEventListener("show-layer", async (e) => {
        const layer = e.detail;

        await app.main.map.fitBounds(layer);
      });

      this.inferencePanel.addEventListener("inference-response", (e) => {
        this.connectEventSource(e.detail.event_id || e.detail.id);
        this.historyPanel.updateHistoryWithPendingInference(e.detail);
        this.menuBar.addHistoryNotification();
      });

      this.map = this.shadow.querySelector("#map");
      if (app.env.geostudio.mapboxToken) {
        this.map.setMapOptions({
          basemap:
            "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=" +
            app.env.geostudio.mapboxToken,
          attribution:
            '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
        });
      }

      this.map.addEventListener("map-changed", () => {
        this.inferencePanel.setBBoxReadout();
      });

      this.map.addEventListener("load-graph", (e) => {
        this.displayTimeseriesGraph(true, e.detail);
      });

      this.map.addEventListener("load", (l) => {
        this.layersPanel.setMapLayers(this.getMapLayers());
      });

      this.map.addEventListener("layerchange", (l) => {
        this.layersPanel.resetCompareLayers();
        this.layersPanel.setMapLayers(this.getMapLayers());
      });

      this.map.addEventListener("mapchange", (l) => {
        this.inferencePanel.updateQueryButtonState();
      });

      this.map.addEventListener("close-graph", (e) => {
        const closedLayer = e?.detail?.layer;
        if (closedLayer === app.main.map.selectedFeatureLayerName) {
          this.displayTimeseriesGraph(false);
          app.main.map.selectedFeature = null;
          app.main.map.selectedFeatureLayerName = null;
        }
      });

      this.map.addEventListener("hide-color-bar", (e) => {
        for (let layer of this.layers) {
          if (layer.name === e.detail.layer) {
            this.displayLayerLegend(layer, false);
          }
        }
      });

      this.map.addEventListener("show-color-bar", (e) => {
        for (let layer of this.layers) {
          if (layer.name === e.detail.layer) {
            this.displayLayerLegend(layer, true);
          }
        }
      });

      requestIdleCallback(async () => {
        this.map.loadMap();

        await this.map.ensureMapLoaded();

        this.renderLayers();

        const graph = this.shadow.querySelector("timeseries-graph");
        if (app.main.map.map.clockViewModel.clock) {
          app.main.map.map.clockViewModel.clock.onTick.addEventListener(
            function (clock) {
              if (app.main.map.map.clockViewModel.shouldAnimate) {
                var currentTime = Cesium.JulianDate.toDate(clock.currentTime);
                !graph.classList.contains("display-none") &&
                  graph.drawCurrentTime(currentTime);
              }
            }
          );
        }

        let timelineBar = this.map.shadow.querySelector(
          ".cesium-viewer-timelineContainer"
        );
        timelineBar.addEventListener("mouseup", (e) => {
          const clock = app.main.map.map.clockViewModel.clock;
          if (clock) {
            var currentTime = Cesium.JulianDate.toDate(clock.currentTime);
            !graph.classList.contains("display-none") &&
              graph.drawCurrentTime(currentTime);
          }
        });
      });
    }

    togglePanels(panelName) {
      const pairs = {
        layers: this.layersPanel,
        history: this.historyPanel,
        examples: this.examplesPanel,
      };

      const selectedPanel = pairs[panelName];

      if (!selectedPanel.classList.contains("display-none")) {
        selectedPanel.classList.add("display-none");
      } else {
        Object.values(pairs).forEach((panel) => {
          panel.classList.add("display-none");
        });

        selectedPanel.classList.remove("display-none");
      }
    }

    disconnectedCallback() {
      this.eventSourceList.forEach((item) => {
        if (item.readyState === 1) {
          item.close();
        }
      });
      this.eventSourceList = [];
    }

    connectedCallback() {
      this.render();
      const inference_id = this.getInferenceIdFromSearchParams();

      if (this.isTryInLab) {
        this.loadData();
        this.toggleRunInferencePanel();
        this.inferencePanel.setTryTuneInLab(inference_id);
      } else {
        this.loadData(inference_id);
      }
    }

    getInferenceIdFromSearchParams() {
      const paramsString = window.location.hash.split("?")?.[1]?.toString();
      const params = new URLSearchParams(paramsString);

      if (params.get("istryinlab") && params.get("istryinlab") === "true") {
        this.isTryInLab = true;
      }

      let id = params.get("id");

      if (id) {
        id = id.split("%20").join(" ");
      }

      return id;
    }

    toggleRunInferencePanel() {
      this.inferencePanel.classList.toggle("display-none");
    }

    displayTimeseriesGraph(display, eventData = null) {
      if (display) {
        const {
          data,
          focus,
          variables,
          graphMetadata,
          selectedLayersTimestamps,
        } = eventData;
        this.timeseriesGraph.data = data;
        this.timeseriesGraph.focus = focus;
        this.timeseriesGraph.variables = variables;
        this.timeseriesGraph.graphMetadata = graphMetadata;
        this.timeseriesGraph.selectedLayersTimestamps =
          selectedLayersTimestamps;
        this.timeseriesGraph.classList.remove("display-none");
        this.timeseriesGraph.drawGraph();
      } else {
        this.timeseriesGraph.classList.add("display-none");
      }
    }

    connectEventSource = (event_id) => {
      const eventSourceInitDict = { headers: app.backend.getHeaders() };

      let eventSourceUrl = "/studio-gateway/v2/async/notify/" + event_id;

      const es = new EventSourcePolyfill(eventSourceUrl, eventSourceInitDict);

      es.onmessage = (event) => {
        console.log(event);

        if (!event || !event.data) return;
        const data = JSON.parse(event.data);

        if (
          [
            util.PENDING_INFERENCE_NOTIFICATION,
            util.RUNNING_INFERENCE_INFERENCE_NOTIFICATION,
          ].includes(data.status)
        ) {
          let subtitle = data?.data?.message;
          let type = "info";
          if (data.detail_type === "Inf:Task:Error") {
            subtitle = data?.data?.error;
            type = "error";
          }
          app.showMessage(
            "Inference " + util.displayStatus(data.status),
            subtitle,
            type,
            5000
          );
          this.historyPanel.updateHistoryWithUpdateToPendingInference(
            event_id,
            data
          );
        } else if (data.status === util.FAILED_INFERENCE_NOTIFICATION) {
          app.showMessage(
            "Inference " + util.displayStatus(data.status),
            data.data.error,
            "error",
            5000
          );
          this.historyPanel.updateHistoryAfterInferenceFails(event_id, data);
          this.menuBar.addHistoryNotification();
          es.close();
        } else if (
          [
            util.COMPLETED_INFERENCE_NOTIFICATION,
            util.COMPLETED_WITH_ERRORS_INFERENCE_NOTIFICATION,
            util.PARTIALLY_COMPLETED_INFERENCE_NOTIFICATION,
          ].includes(data.status)
        ) {
          if (data.detail_type === "Inf:Task:Updated") {
            this.loadMap(data.data);
            this.toggleRunInferencePanel();
            app.showMessage(
              `Inference ${util.displayStatus(data.status)}`,
              util.percentageStepBreakdown(data.data),
              "success",
              5000
            );
            this.historyPanel.updateHistoryAfterInferenceCompletes(data.data);
            this.menuBar.addHistoryNotification();
            if (
              [
                util.COMPLETED_INFERENCE_NOTIFICATION,
                util.COMPLETED_WITH_ERRORS_INFERENCE_NOTIFICATION,
              ].includes(data.status)
            ) {
              es.close();
            }
          } else {
            app.showMessage(
              "Inference " + util.displayStatus(data.status),
              data.data.message,
              "info",
              5000
            );
          }
        } else if (data.status === util.STOPPED_INFERENCE_NOTIFICATION) {
          this.toggleRunInferencePanel();
          app.showMessage(
            `Inference ${util.displayStatus(data.status)}`,
            util.percentageStepBreakdown(data.data),
            "success",
            5000
          );
          this.historyPanel.updateHistoryAfterInferenceCompletes(data.data);
          this.menuBar.addHistoryNotification();
          es.close();
        }
      };

      es.onerror = (event) => {
        event.url = es.url;
        console.error(event);
        es.close();
      };

      es.onopen = (event) => {
        event.url = es.url;
        console.log(event);
      };
      this.eventSourceList.push(es);
    };

    presigned_url_expires(presigned_url, expiry_threshold = 120) {
      let presigned_url_expired = false;
      const expiration_seconds = presigned_url
        .split("Expires=")[1]
        .split("&")[0];
      const current_seconds = Math.floor(new Date().getTime() / 1000);

      const seconds_remaining =
        parseInt(expiration_seconds) - parseInt(current_seconds);

      if (seconds_remaining < expiry_threshold) {
        presigned_url_expired = true;
      }
      return presigned_url_expired;
    }

    downloadInference() {
      if (
        this.current_inference?.inference_output?.output_url != null &&
        this.current_inference?.inference_output?.output_url?.toLowerCase() !==
          "none"
      ) {
        if (
          this.presigned_url_expires(
            this.current_inference.inference_output.output_url
          )
        ) {
          app.backend
            .getInferenceV2(this.current_inference["id"])
            .then((temp_inference) => {
              this.current_inference = temp_inference;
              window.open(temp_inference.inference_output.output_url);
            })
            .catch((error) => {
              throw error;
            });
        } else {
          window.open(this.current_inference.inference_output.output_url);
        }
      }
    }

    geocodeThis = (e) => {
      const text = e;
      if (text.length >= 5) {
        this.provider.search({ query: text }).then((data) => {
          if (!data || !data[0]) return;
          if (!data[0].bounds || !data[0].bounds[0]) {
            app.main.map.flyTo([data[0].y, data[0].x], 12);
          } else {
            app.main.map.flyToBounds([
              data[0].bounds[0][1],
              data[0].bounds[0][0],
              data[0].bounds[1][1],
              data[0].bounds[1][0],
            ]);
          }
        });
      }
    };

    async loadData(inference_id = null) {
      const modelsPromise = app.backend
        .getModelsV2()
        .then((models) => {
          this.inferencePanel.setModels(models);
        })
        .catch((error) => {
          throw error;
        });

      const sharedTunesPromise = app.backend
        .getSharedTunes()
        .then((sharedTunes) => {
          this.inferencePanel.setSharedTunes(sharedTunes);
        })
        .catch((error) => {
          throw error;
        });

      const systemExamplesPromise = app.backend
        .getInferencesV2(50, 0, "system@ibm.com", true)
        .then((systemExamples) => {
          this.examplesPanel.setupSystemExamples(systemExamples.results);
        })
        .catch((error) => {
          throw error;
        });

      const userExamplesPromise = app.backend
        .getInferencesV2(25, 0, this.userEmail, true)
        .then((userExamples) => {
          this.examplesPanel.setupMyExamples(userExamples.results);
        })
        .catch((error) => {
          throw error;
        });

      const historyInferencesPromise = app.backend
        .getInferencesV2(25, 0, this.userEmail)
        .then((historyInferences) => {
          this.historyPanel.setHistory(historyInferences.results);
        })
        .catch((error) => {
          throw error;
        });

      const arrayOfPromises = [
        modelsPromise,
        sharedTunesPromise,
        systemExamplesPromise,
        userExamplesPromise,
        historyInferencesPromise,
      ];

      if (inference_id) {
        const inferenceByIdPromise = app.backend
          .getInferenceV2(inference_id)
          .then((inference) => {
            if ("id" in inference) {
              if (
                inference.status === util.COMPLETED_INFERENCE_NOTIFICATION ||
                inference.status ===
                  util.COMPLETED_WITH_ERRORS_INFERENCE_NOTIFICATION ||
                inference.status ===
                  util.PARTIALLY_COMPLETED_INFERENCE_NOTIFICATION
              ) {
                if (inference?.geoserver_layers?.predicted_layers) {
                  this.loadMap(inference);
                } else {
                  const statusHistoryModal = this.shadow.querySelector(
                    "status-history-modal"
                  );

                  statusHistoryModal.setupModal(inference);

                  app.showMessage(
                    `Inference has no visible layers`,
                    "Showing inference status history",
                    "info",
                    5000
                  );
                }
              } else {
                const statusHistoryModal = this.shadow.querySelector(
                  "status-history-modal"
                );

                statusHistoryModal.setupModal(inference);

                app.showMessage(
                  `Inference is ${inference.status.toLowerCase()}`,
                  "Showing inference status history",
                  "info",
                  5000
                );
              }
            } else {
              console.error(inference);
              app.showMessage(
                "Searched inference lacks results",
                inference?.status,
                "error",
                5000
              );
            }
          })
          .catch((error) => {
            throw error;
          });

        arrayOfPromises.push(inferenceByIdPromise);
      }

      Promise.all(arrayOfPromises)
        .then(() => {
          console.log("Promises completed");
        })
        .catch((err) => {
          console.log("A promise failed to resolve", err);
          return arrayOfPromises;
        });
    }

    async renderLayers() {
      for (let layer of this.layers) {
        if (layer.ui && layer.ui.visible) {
          switch (layer.datasource) {
            case "geoserver":
              if (layer.isPointData) {
                this.map.addWFSPointLayer(layer);
              } else {
                this.map.addWMSLayer({
                  ...layer,
                  location: this.current_inference?.location,
                });
              }
              break;
            case "remote-url":
              this.map.addURLLayer(layer);
              break;
            case "localfile":
              this.map.addLocalFileLayer(layer);
              break;
          }
        }
      }
    }

    isFilterAndPolygon(layer) {
      return layer?.legend?.Legend[0]?.rules?.some(
        (rule) =>
          rule.filter &&
          rule?.symbolizers?.some((sym) => sym.Polygon && sym.Polygon.title)
      );
    }

    createLayerLegend(layer) {
      const home = this.shadow.getElementById("home");
      const colorBar = document.createElement("color-bar");
      colorBar.setAttribute("id", `${layer.name}-color-bar`);
      colorBar.classList.add("display-none");
      home.appendChild(colorBar);
      if (this.isFilterAndPolygon(layer)) {
        const data = layer?.legend?.Legend[0]?.rules;
        const headerArr = layer?.legend?.Legend[0]?.title?.split("_");
        const header = headerArr[headerArr.length - 1];
        colorBar.drawColorScaleLegend(data, header);
      } else {
        colorBar.drawColorScale(
          layer.legend.Legend[0].rules[0].symbolizers[0].Raster.colormap
            .entries,
          `${layer.legend.Legend[0].rules[0].title} (${layer.legend.Legend[0].rules[0].abstract})`
        );
      }
    }

    isContinous(entries) {
      return entries.some((entry) => !entry.label);
    }

    displayLayerLegend(layer, shouldDisplay) {
      const colormapEntries =
        layer.legend?.Legend[0]?.rules[0]?.symbolizers[0]?.Raster?.colormap
          ?.entries;
      if (
        (layer.legend &&
          colormapEntries &&
          this.isContinous(colormapEntries)) ||
        this.isFilterAndPolygon(layer)
      ) {
        let colorBar = this.shadow.getElementById(`${layer.name}-color-bar`);
        if (!colorBar) {
          this.createLayerLegend(layer);
          colorBar = this.shadow.getElementById(`${layer.name}-color-bar`);
        }

        if (shouldDisplay) {
          const allColorBars = this.shadow.querySelectorAll("color-bar");
          for (let c of allColorBars) {
            c.classList.add("display-none");
          }
          colorBar.classList.remove("display-none");
        } else {
          colorBar.classList.add("display-none");
        }
      }
    }

    async addLayersToMap(inference) {
      const layers = inference.geoserver_layers;

      this.resetLayers();

      let csTimelineFallback;
      const { min, max } =
        util.getMinMaxFromTemporalDomain(inference.temporal_domain) || {};

      if (min && max) {
        csTimelineFallback = [...new Set([min, max])];
      }

      let invalidateCacheWith;
      if (inference?.updated_at) {
        invalidateCacheWith = inference.updated_at;
      }

      const inferenceLayers = await util.configureLayer(
        layers,
        csTimelineFallback,
        invalidateCacheWith
      );

      this.layers = [...this.layers, ...inferenceLayers];
      const allColorBars = this.shadow.querySelectorAll("color-bar");

      for (let colorBar of allColorBars) {
        colorBar.remove();
      }

      this.layers.map((layer) => {
        this.displayLayerLegend(layer, layer.ui.opacity === 1);
      });

      return this.renderLayers();
    }

    clearInference() {
      this.resetLayers();
      this.actionBar.setupActionBar();
      this.map.zoomControls.zoomHome();

      const allColorBars = this.shadow.querySelectorAll("color-bar");

      allColorBars.forEach((colorBar) => {
        colorBar.remove();
      });

      if (app.main.map.map.clockViewModel.shouldAnimate) {
        app.main.map.timelineControl.handleTimelineControl();
      }
      this.map.infoBox.hideInfoBox();
      util.hideCsTimeline();
      this.current_inference = null;
    }

    async loadMap(inference) {
      if (!inference?.geoserver_layers?.predicted_layers) {
        return;
      }
      this.map.infoBox.hideInfoBox();

      if (app.main.map.map.clockViewModel.shouldAnimate) {
        app.main.map.timelineControl.handleTimelineControl();
      }

      // if (!inferenceResult || inferenceResult.status !== "COMPLETED") {
      //   this.resetLayers();
      //   this.renderLayers();
      //   if (inferenceResult.status.toLowerCase() === "pending") {
      //     app.showMessage(
      //       inferenceResult.status + " TASK",
      //       "Inference run with ID: " +
      //         inferenceResult.id +
      //         " is in " +
      //         inferenceResult.status +
      //         " status",
      //       "info",
      //       6000
      //     );
      //   } else {
      //     app.showMessage(
      //       inferenceResult.status + " TASK",
      //       "Inference run with ID: " +
      //         inferenceResult.id +
      //         " is in " +
      //         inferenceResult.status +
      //         " status",
      //       "error",
      //       5000
      //     );
      //   }
      //   this.actionBar.setupActionBar();
      //   this.current_inference = null;
      //   return;
      // }

      if (inference?.spatial_domain?.bbox?.length > 0) {
        if (typeof inference.spatial_domain.bbox[0][0] != "object") {
          this.map.flyToBounds(inference.spatial_domain.bbox[0]);
        } else {
          this.map.flyToBounds(inference.spatial_domain.bbox[0][0]);
        }
      } else if (inference?.geoserver_layers?.bbox_pred?.length > 0) {
        if (typeof inference.geoserver_layers.bbox_pred[0][0] != "object") {
          this.map.flyToBounds(inference.geoserver_layers.bbox_pred[0]);
        } else {
          this.map.flyToBounds(inference.geoserver_layers.bbox_pred[0][0]);
        }
      } else {
        this.map.flyHome();
      }

      this.addLayersToMap(inference);

      this.actionBar.setupActionBar(inference);

      this.current_inference = inference;

      this.layersPanel.setUserCreatedLayers(
        inference.created_by === this.userEmail
      );

      if (!this.menuBar.layersButton.hasAttribute("selected")) {
        this.menuBar.deselectPanel();
        this.menuBar.layersButton.setAttribute("selected", "");
        this.togglePanels("layers");
      }
    }

    extractLayerTimestamps(layers) {
      const layerGroupKeys = Object.keys(layers);
      const timestamps = [];
      for (let layerGroupKey of layerGroupKeys) {
        if (util.isValidDate(layerGroupKey)) {
          timestamps.push(new Date(layerGroupKey));
        }
      }

      return timestamps;
    }

    getMapLayers() {
      return this.layers;
    }

    resetLayers() {
      this.map.removeAllLayers();
      this.displayTimeseriesGraph(false);

      // Only remove transient inference layers
      this.layers = this.layers.filter((layer) => !layer.transient);
      this.layersPanel.setMapLayers(this.getMapLayers());
    }
  }
);
