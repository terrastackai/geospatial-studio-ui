/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import DataSource from "./datasource/datasource.js";
import { defaultLayerIcon } from "./icons.js";

export const FINISHED_TUNE = "finished";
export const FAILED_TUNE = "failed";
export const SUBMITTED_TUNE = "submitted";
export const PENDING_TUNE = "pending";
export const RUNNING_TUNE = "running";
export const DEPLOYED_TUNE = "deployed";
export const TEMP_TUNE_ID = "temptuneid";
export const DELETED_TUNE = "deleted";

// Terminal status for inferences: COMPLETED, COMPLETED_WITH_ERRORS, FAILED, STOPPED
export const COMPLETED_INFERENCE_NOTIFICATION = "COMPLETED"; // readyStatusIcon
export const COMPLETED_WITH_ERRORS_INFERENCE_NOTIFICATION = "COMPLETED_WITH_ERRORS"; // completedWithErrorsStatusIcon
export const FAILED_INFERENCE_NOTIFICATION = "FAILED"; // errorStatusIcon
export const STOPPED_INFERENCE_NOTIFICATION = "STOPPED"; // stopStatusIcon
export const STOPPED_WITH_RESULTS_INFERENCE_NOTIFICATION = "STOPPED_WITH_RESULTS"; // stopStatusIcon

//  Status with inference results: PARTIALLY_COMPLETED, COMPLETED, COMPLETED_WITH_ERRORS
export const PARTIALLY_COMPLETED_INFERENCE_NOTIFICATION = "PARTIALLY_COMPLETED"; // partiallyCompletedStatusIcon

// Other statuses: PENDING, RUNNING_INFERENCE
export const PENDING_INFERENCE_NOTIFICATION = "PENDING"; // pendingStatusIcon
export const RUNNING_INFERENCE_INFERENCE_NOTIFICATION = "RUNNING"; // progressStatusIcon
 
let defaultDemoLayer = [
  "weather",
  "Flood-July-2021",
  "velocity",
  "direction",
  "wind-farm",
  "Kenya-Water-Towers",
  "sentinel2-april30th",
  "NASA-Landslide-Risk-2024-05-07",
  "input.2020-11-11",
  "input.2020-09-18",
];
const kenyaFloodingLayerOrder = [
  "sentinel2-april30th",
  "sentinel2-may5th",
  "flood-extent-april-30th",
  "flood-extent-may5th",
  "NASA-Landslide-Risk-2024-05-07",
  "asset-paths",
  "asset-paths-at-risk",
  "asset-locations",
  "assets-flooded",
  "asset-paths-flooded",
  "buildings-flooded",
  "buildings-at-risk",
  "assets-at-risk",
  "population-at-risk",
];
const weatherFMLayerOrder = [
  "weather",
  "Flood-July-2021",
  "LowRes-Precip(CORDEX)",
  "Downscaled-Precip",
  "CORDEX-Precip",
  "ERA5-Precip",
  "LowRes-Tmax(CORDEX)",
  "Downscaled-Tmax",
  "CORDEX-Tmax",
  "ERA5-Tmax",
  "velocity",
  "direction",
  "wind-farm",
  "Kenya-Water-Towers",
  "2017-hls-input",
  "2017-forest-cover",
  "2023-hls-input",
  "2023-forest-cover",
  "change-detection",
  "adoption-blocks",
  "2017-tree-cover-ratio",
  "2023-tree-cover-ratio",
  "2017-agb-prediction",
  "2023-agb-prediction",
];
let layerOrder = [
  "model input",
  "model prediction",
  "processed prediction",
  "impact",
  "change detection",
  "perimeter fencing",
]
  .concat(weatherFMLayerOrder)
  .concat(kenyaFloodingLayerOrder);
const pointDataLayers = {
  "weatherfm:era5_100_metre_wind_wind-farm": {
    iconPath: "/images/wind-turbine.svg",
    iconPathHighlight: "/images/wind-turbine-highlight.svg",
    dataDescription: "Wind Speed (m/s)",
    dataUnits: "m/s",
  },
  gpkg: {
    iconPath: "/images/sail-boat.svg",
    iconPathHighlight: "/images/sail-boat-highlight.svg",
    dataDescription: "Q1 2025 Activities",
    dataUnits: "",
  },
  data_center: {
    iconPath: "/images/data-center.svg",
    iconPathHighlight: "/images/data-center-highlight.svg",
    dataDescription: "",
    dataUnits: "",
  },
};

const getPreComputedExampleSectionName = (inference) => {
  if (inference.model_name === "Terramind Multimodal") {
    return "Think 2025";
  }

  if (
    ["downscaling", "windfarm", "wind", "landslide_segmentation"].includes(
      inference.model_style?.base_style
    ) ||
    [
      "Kenya, Adopt-a-water-tower Campaign",
      "GHG Emissions Saudi Arabia",
      "Europe - Downscaling",
    ].includes(inference.location)
  ) {
    return "Think 2024";
  }

  if (
    inference.model_style?.base_style === "flooding" &&
    inference.location != "None"
  ) {
    return "Flooding";
  }

  if (inference.model_style?.base_style === "fire_scars") {
    return "Fire Scars";
  }

  if (
    inference.model_style?.base_style === "lulc_esri" &&
    inference.location != "None"
  ) {
    return "Land Use and Land Cover";
  }

  if (inference.model_style?.base_style === "agb") {
    return "Above Ground Biomass";
  }

  return null;
};

export const convertInferenceV1ToInferenceV2 = (inferenceV1) => {
  const inferenceV2 = {
    spatial_domain: {
      bbox: [
        inferenceV1.bbox_pred?.[0]
          ? [...inferenceV1.bbox_pred]
          : inferenceV1.bbox?.[0]
          ? [...inferenceV1.bbox]
          : "",
      ],
      polygons: [],
      tiles: [],
      urls: [],
    },
    temporal_domain: [inferenceV1.start_date, inferenceV1.end_date],
    model_display_name: inferenceV1.model_name,
    description: inferenceV1.description,
    location: inferenceV1.location,
    geoserver_layers: {
      predicted_layers: [],
    },
    priority: null,
    demo: {
      demo: inferenceV1.pre_run,
      section_name: inferenceV1.pre_run
        ? getPreComputedExampleSectionName(inferenceV1)
        : null,
    },
    model_id: inferenceV1.model_id,
    inference_output: {
      output_url: inferenceV1.output_url,
    },
    id: inferenceV1.id,
    active: inferenceV1.active,
    created_by: inferenceV1.created_by,
    created_at: inferenceV1.created_at,
    status: inferenceV1.status,
  };

  Object.values(inferenceV1.layers).forEach((geoLayer) => {
    for (let key of Object.keys(geoLayer)) {
      let layerV2;

      if (typeof geoLayer[key] === "object") {
        layerV2 = {
          uri: geoLayer[key]?.uri,
          display_name: key,
          sld_body: geoLayer[key]?.sld,
        };
      } else {
        layerV2 = {
          uri: geoLayer[key],
          display_name: key,
          sld_body: "",
        };
      }

      inferenceV2.geoserver_layers.predicted_layers.push(layerV2);
    }
  });

  return inferenceV2;
};

export const getMinMaxFromTemporalDomain = (temporalDomain) => {
  const minMax = { min: null, max: null };

  for (let dateRange of temporalDomain) {
    if (!dateRange) {
      continue;
    }

    if (dateRange.includes("_")) {
      let dates = dateRange.split("_");

      if (!minMax.min || new Date(dates[0]) < minMax.min) {
        minMax.min = new Date(dates[0]);
      }

      if (!minMax.max || new Date(dates[dates.length - 1]) > minMax.max) {
        minMax.max = new Date(dates[dates.length - 1]);
      }
    } else {
      if (!minMax.min || new Date(dateRange) < minMax.min) {
        minMax.min = new Date(dateRange);
      }

      if (!minMax.max || new Date(dateRange) > minMax.max) {
        minMax.max = new Date(dateRange);
      }
    }
  }

  if (minMax.min) {
    minMax.min = minMax.min.toString().split(" ").slice(1, 4).join(" ");
  }

  if (minMax.max) {
    minMax.max = minMax.max.toString().split(" ").slice(1, 4).join(" ");
  }

  return minMax;
};

// TODO: Update icons for each layer when designs are ready
const getLayerIcon = (layerName) => {
  switch (layerName) {
    case "model input":
      return defaultLayerIcon({
        class: "layer-icon",
        height: 16,
        width: 16,
        title: "Default layer icon",
      });
    case "model prediction":
      return defaultLayerIcon({
        class: "layer-icon",
        height: 16,
        width: 16,
        title: "Default layer icon",
      });
    case "processed prediction":
      return defaultLayerIcon({
        class: "layer-icon",
        height: 16,
        width: 16,
        title: "Default layer icon",
      });
    case "impact":
      return defaultLayerIcon({
        class: "layer-icon",
        height: 16,
        width: 16,
        title: "Default layer icon",
      });
    case "change detection":
      return defaultLayerIcon({
        class: "layer-icon",
        height: 16,
        width: 16,
        title: "Default layer icon",
      });
    case "perimeter fencing":
      return defaultLayerIcon({
        class: "layer-icon",
        height: 16,
        width: 16,
        title: "Default layer icon",
      });
    case "weather":
      return defaultLayerIcon({
        class: "layer-icon",
        height: 16,
        width: 16,
        title: "Default layer icon",
      });
    default:
      return defaultLayerIcon({
        class: "layer-icon",
        height: 16,
        width: 16,
        title: "Default layer icon",
      });
  }
};

const getTimestampsFromNetcdf = async (layer, invalidateCacheWith) => {
  let result;
  try {
    const baseUrl =
      `/geofm-geoserver/geoserver/gwc/service/wmts?Version=1.0.0&REQUEST=GetDomainValues&Layer=${layer}&domain=time` +
      ((invalidateCacheWith &&
        `&_=${new Date(invalidateCacheWith).getTime()}`) ||
        "");
    const textResponse = await (await fetch(baseUrl))?.text();
    result = new DOMParser()
      .parseFromString(textResponse, "text/xml")
      .getElementsByTagName("Domain")[0]
      .textContent.split(",");
  } catch (err) {
    console.error("[getTimestampsFromNetcdf][exception error]", err);
    result = [];
  }
  return result;
};

const getCsTimeline = async (layer, layerObject, invalidateCacheWith) => {
  let result;
  if (layerObject.isPointData) {
    const pointDates = [];

    layerObject?.geojson?.features?.forEach((feature) => {
      if (feature.properties.data) {
        let parsedData = JSON.parse(feature.properties.data);
        Object.keys(parsedData).forEach((key) => {
          if (isValidDateStrict(key)) {
            pointDates.push(new Date(key).toISOString());
          }
        });
      }
    });

    pointDates.sort((a, b) => a - b);
    result = [...new Set(pointDates)];
  } else {
    result = await getTimestampsFromNetcdf(layer, invalidateCacheWith);
  }
  return result?.filter((time) => isValidDate(time));
};

export const decodeBase64 = (base64) => {
  let safeBase64 = base64.replace(/-/g, "+").replace(/_/g, "/");

  while (safeBase64.length % 4) {
    safeBase64 += "=";
  }

  const binaryString = atob(safeBase64);
  const utf8String = decodeURIComponent(
    binaryString
      .split("")
      .map((char) => {
        return "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return utf8String;
};

export const replaceHttpWithHttps = (url) => url.replace("http://", "https://");

export const extractDateFromLayername = (name, format) => {
  // create capture groups
  let formatRegex = format.replaceAll("[", "(").replaceAll("]", ")");

  // layername regex
  formatRegex = formatRegex.replaceAll("layername", ".+");

  // digits regex
  formatRegex = formatRegex.replaceAll(/[Y,M,D,h,m,s]/g, "\\d");
  const re = new RegExp(formatRegex);

  const result = re.exec(name);
  if (!result) {
    return {
      name: name,
    };
  }
  const layerName = result.at(1);
  const year = result.at(2);
  const monthIndex = result.at(3) - 1;
  const day = result.at(4);
  const hours = result.at(5) || 0;
  const minutes = result.at(6) || 0;
  const seconds = result.at(7) || 0;
  return {
    name: layerName,
    date: new Date(Date.UTC(year, monthIndex, day, hours, minutes, seconds)),
  };
};

export const formatLayerNameWithDate = (layerName, date, format) => {
  let res = format;

  res = res.replaceAll("layername", layerName);
  res = res.replaceAll("YYYY", date.getUTCFullYear());
  res = res.replaceAll("MM", padTwoDigits(date.getUTCMonth() + 1));
  res = res.replaceAll("DD", padTwoDigits(date.getUTCDate()));
  res = res.replaceAll("hh", padTwoDigits(date.getUTCHours()));
  res = res.replaceAll("mm", padTwoDigits(date.getUTCMinutes()));
  res = res.replaceAll("ss", padTwoDigits(date.getUTCSeconds()));

  res = res.replaceAll("[", "").replaceAll("]", "");

  return res;
};

export const formatLatLng = (latlng, accuracy = 6) => {
  // 6 decimal places gives us about 11cm accuracy, 5 is about 1m
  return `${Number(latlng.lat).toFixed(accuracy)}, ${Number(latlng.lng).toFixed(
    accuracy
  )}`;
};

export const isValidDate = (candidateDate) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  const date = new Date(candidateDate);
  return (
    !isNaN(Date.parse(candidateDate)) ||
    regex.test(candidateDate) ||
    (date instanceof Date && !isNaN(date))
  );
};

export const isValidDateStrict = (candidateDate) => {
  const regex = /^(?!\d{1,3}$).*/;
  const date = new Date(candidateDate);
  return (
    !isNaN(Date.parse(candidateDate)) &&
    regex.test(candidateDate) &&
    date instanceof Date &&
    !isNaN(date)
  );
};

export const isNotEmpty = (value) => {
  return value !== null && value !== undefined && value.trim() !== "" && value.trim() !== '""' && value.trim() !== "''";
};

export const secondsPassedIsLessThanThreshold = (dateString, threshold) => {
  const differenceInMilliseconds =
    new Date().getTime() - new Date(dateString).getTime();
  const differenceInSeconds = differenceInMilliseconds / 1000;
  return differenceInSeconds < threshold;
};

export const configureLayer = async (
  layer,
  csTimelineFallback = [],
  invalidateCacheWith
) => {
  const formatetLayers = [];
  if (!layer) {
    return formatetLayers;
  }

  let layerGroupKeys = Object.keys(layer);

  for (let layerGroupKey of layerGroupKeys) {
    if (layerGroupKey === "bbox_pred") {
      continue;
    }
    const layerGroup = layer[layerGroupKey];
    if (!layerGroup) {
      continue;
    }

    const getFmType = (str) => {
      if (str.indexOf("weatherfm") > -1) {
        return "weatherfm";
      } else if (str.indexOf("geofm") > -1) {
        return "geofm";
      }
      console.log(
        "[utils.getFmType]",
        `Cannot find supported fm type in string: ${str}`
      );
      return null;
    };

    try {
      await Promise.all(
        layerGroup.map(async (item) => {
          const fmType = getFmType(item["uri"]);
          let thisLayer = {
            datasource: "geoserver",
            transient: true,
            rootUrl: `/geofm-geoserver/geoserver/${fmType}/wms/` + item["uri"],
            layer: item["uri"],
            name: item["display_name"],
            z_index: item["z_index"],
            wmsParams: {
              ...(isNotEmpty(item["sld_body"]) && {
                sld_body: item["sld_body"],
              }),
              ...(invalidateCacheWith && {
                _: new Date(invalidateCacheWith).getTime(),
              }),
            },
            params: {},
            ui: {
              icon: getLayerIcon(item["display_name"]),
              visible: true,
              opacity: item["visible_by_default"] === "True" ? 1 : 0,
            },
          };

          const pointDataKey = Object.keys(pointDataLayers).find((key) =>
            item["uri"].includes(key)
          );

          if (pointDataLayers[pointDataKey]) {
            thisLayer.isPointData = true;
            thisLayer.rootUrl = "/geofm-geoserver/geoserver/wfs";
            thisLayer.params = {
              service: "wfs",
              version: "2.0.0",
              request: "GetFeature",
              typeNames: item["uri"],
              outputFormat: "application/json",
            };
            //build wfs layer to get geojson
            const datasource = new DataSource(thisLayer);
            const geojson = await datasource.getGeoJson(thisLayer);
            thisLayer.geojson = geojson;

            let properties = geojson?.features?.[0]?.properties;
            if (!properties) properties = {};
            const graphMetadata = {
              "y-axis_title": properties["y-axis_title"]
                ? properties["y-axis_title"]
                : pointDataLayers[pointDataKey].dataDescription,
              "y-axis_units": properties["y-axis_units"]
                ? properties["y-axis_units"]
                : pointDataLayers[pointDataKey].dataUnits,
              "x-axis_units": properties["x-axis_units"]
                ? properties["x-axis_units"]
                : "",
            };
            thisLayer.iconPath = properties["icon-path"]
              ? properties["icon-path"]
              : pointDataLayers[pointDataKey].iconPath;
            thisLayer.iconPathHighlight = properties["highlighted-icon-path"]
              ? properties["highlighted-icon-path"]
              : pointDataLayers[pointDataKey].iconPathHighlight;
            thisLayer.graphMetadata = graphMetadata;
          }
          thisLayer["csTimeline"] =
            (await getCsTimeline(
              thisLayer.layer,
              thisLayer,
              invalidateCacheWith
            )) || csTimelineFallback;
          if (thisLayer["csTimeline"].length === 1) {
            const singleDate = thisLayer["csTimeline"][0];
            const incrementedDate = new Date(
              new Date(singleDate).setDate(new Date(singleDate).getDate() + 1)
            );
            thisLayer["csTimeline"].push(
              incrementedDate.toISOString().toString()
            );
          }
          if (item["display_name"] !== "weather") {
            let d = new DataSource(thisLayer);
            let legendGraphic;
            try {
              legendGraphic = (await d?.getLegendGraphics()) || {};
            } catch (error) {
              console.error(
                "[utils.configureLayer - getLegendGraphics]",
                error
              );
              return {};
            }

            if (legendGraphic) {
              thisLayer["legend"] = legendGraphic;
            }
          }
          formatetLayers.push(thisLayer);
        })
      );
    } catch (error) {
      console.log("[utils.configureLayer - Promise.all]", error);
    }
  }
  formatetLayers.sort((a, b) => a.z_index - b.z_index);
  return formatetLayers;
};

export const getElementIdByHash = (hash, element) => {
  let elementId;
  const currentElement = Array.from(
    element.querySelectorAll(".docs-menu-element")
  ).find((elem) => elem.getAttribute("href") === hash);
  if (!currentElement) return elementId;
  const parentElement = currentElement.parentElement;
  if (currentElement.classList.contains("has-md-file")) {
    elementId = currentElement.id;
  } else if (currentElement.classList.contains("no-md-file")) {
    elementId = parentElement.id;
  } else {
    console.log("Unusual case");
  }

  if (currentElement.classList.contains("parent")) {
    currentElement.setAttribute("active", "");
    currentElement.setAttribute("aria-current", "page");
  } else if (currentElement.classList.contains("child")) {
    currentElement.setAttribute("active", "");
    currentElement.setAttribute("aria-current", "page");
    parentElement.setAttribute("expanded", "");
  } else {
    console.log("Unusual case");
  }
  return elementId;
};

export const formatDateString = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }
  return `${date.getUTCFullYear()}/${padTwoDigits(
    date.getUTCMonth() + 1
  )}/${padTwoDigits(date.getUTCDate())}`;
};

const padTwoDigits = (number) => {
  return String(number).padStart(2, "0");
};

export const formatDateTimeStringUTC = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }
  return `${date.getUTCFullYear()}/${padTwoDigits(
    date.getUTCMonth() + 1
  )}/${padTwoDigits(date.getUTCDate())}, ${padTwoDigits(
    date.getUTCHours()
  )}:${padTwoDigits(date.getUTCMinutes())}:${padTwoDigits(
    date.getUTCSeconds()
  )}`;
};

export const formatdataSetDateString = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }
  return `${padTwoDigits(date.getUTCMonth() + 1)}/${padTwoDigits(
    date.getUTCDate()
  )}/${date.getUTCFullYear().toString().slice(-2)}, ${padTwoDigits(
    date.getUTCHours()
  )}:${padTwoDigits(date.getUTCMinutes())}`;
};

export const formatDateWithDashSeparatorUTC = (date) => {
  var d = new Date(date),
    month = "" + (d.getUTCMonth() + 1),
    day = "" + d.getUTCDate(),
    year = d.getUTCFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

export const genNonce = () => {
  const charset =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~";
  const result = [];
  window.crypto
    .getRandomValues(new Uint8Array(32))
    .forEach((c) => result.push(charset[c % charset.length]));
  return result.join("");
};

// Escape a string for using in input field or displayed in HTML
export const escapeHTMLString = (str) => {
  if (!str || str.length == 0) return "";
  return str
    .replaceAll('"', "&#34;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&#60;")
    .replaceAll(">", "&#62;");
};

export const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const hideCsTimeline = () => {
  app.main.map.map.timeline.container.style.visibility = "hidden";
  app.main.map.timelineControl.style.visibility = "hidden";
};

export const updateCsTimeline = (timestamps, map, timelineControl) => {
  if (Array.isArray(timestamps) && timestamps.length > 0) {
    let currentTime = map.clock.currentTime;
    map.timeline.container.style.visibility = "visible";
    map.animation.container.style.visibility = "visible";
    timelineControl.style.visibility = "visible";
    const start = timestamps[0] && Cesium.JulianDate.fromIso8601(timestamps[0]);
    const stop =
      timestamps[timestamps.length - 1] &&
      Cesium.JulianDate.fromIso8601(timestamps[timestamps.length - 1]);
    map.clock.startTime = start;
    map.clock.stopTime = stop;
    map.clock.currentTime = currentTime;
    map.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    map.clock.multiplier = 86400;
    map.timeline.updateFromClock();
    map.timeline.zoomTo(start, stop);
  } else {
    if (map.clockViewModel.shouldAnimate) {
      timelineControl.handleTimelineControl();
    }
    map.timeline.container.style.visibility = "hidden";
    map.animation.container.style.visibility = "hidden";
    timelineControl.style.visibility = "hidden";
  }
};

export const getTimestampsfromLayers = (obj) => {
  // combine all timestamp arrays from layers
  try {
    return Object.keys(obj).reduce((acc, curr) => {
      acc = Array.isArray(obj[curr]) && acc.concat(obj[curr]);
      const result = [...new Set(acc)]
        .map((item) => new Date(item).getTime())
        .sort((a, b) => a - b)
        .map((el) => new Date(el).toISOString().toString());
      const debugMsg =
        result.length > 0
          ? `[Start TS: ${result[0]}][End TS: ${result[result.length - 1]}]`
          : "";
      console.log(
        `[getTimestampsfromLayers][TS array length: ${result.length}]${debugMsg}`
      );
      return result;
    }, []);
  } catch (err) {
    console.error("[getTimestampsfromLayers][err exc]", err);
    return [];
  }
};

export const debounce = (fn, delay) => {
  let timer = null;
  return function (...args) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
};

export const displayStatus = (status) => {
  let statusElements = status?.toLowerCase().split('_');
  return statusElements?.map(statusElement => statusElement.charAt(0).toUpperCase() + statusElement.slice(1)).join(' ');
}

export const percentageStepBreakdown = (inference) => {
  let percentage = '';
  if (!inference?.tasks_count_total || inference?.tasks_count_total === 0) {
    return percentage;
  }

  // Compute completed %
  if (inference.tasks_count_success) {
    const percentage_success = `${((inference.tasks_count_success/inference.tasks_count_total)*100).toFixed(0)}% Completed`;
    percentage = percentage ? `${percentage} ${percentage_success}` : percentage_success;
  }

  // Compute failed %
  if (inference.tasks_count_failed) {
    const percentage_failed = `${((inference.tasks_count_failed/inference.tasks_count_total)*100).toFixed(0)}% Failed`;
    percentage = percentage ? `${percentage} ${percentage_failed}` : percentage_failed;
  }

  // Compute stopped %
  if (inference.tasks_count_stopped) {
      const percentage_stopped = `${((inference.tasks_count_stopped/inference.tasks_count_total)*100).toFixed(0)}% Stopped`;
      percentage = percentage ? `${percentage} ${percentage_stopped}` : percentage_stopped;
    }

  // Compute waiting %
  if (inference.tasks_count_waiting) {
    const percentage_waiting = `${((inference.tasks_count_waiting/inference.tasks_count_total)*100).toFixed(0)}% Waiting`;
    percentage = percentage ? `${percentage} ${percentage_waiting}` : percentage_waiting;
  }
  return percentage;
}

export const isValueObject = (value) => {
  return Object.prototype.toString.call(value) === '[object Object]';
}
