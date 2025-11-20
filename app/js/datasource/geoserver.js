/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { extractDateFromLayername, formatLayerNameWithDate } from "../utils.js"
import "../libs/geoblaze/geoblaze.web.min.js"

const xmlParser = new DOMParser();

const MAX_LAYERS = 10000

function tryParseDate(str) {
  let date = new Date(str)
  if (!isNaN(date)) {
    return date
  }

  const dateOnlyMatch = str.match(/^(\d\d\d\d)(\d\d)(\d\d)$/)

  if (dateOnlyMatch) {
    return new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) -1, Number(dateOnlyMatch[3]))
  }

  const dateTimeMatch = str.match(/^(\d\d\d\d)(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)$/)
  if (dateTimeMatch) {
    return new Date(Number(dateTimeMatch[1]),
      Number(dateTimeMatch[2]) -1,
      Number(dateTimeMatch[3],
      Number(dateTimeMatch[4]),
      Number(dateTimeMatch[5]),
      Number(dateTimeMatch[6])))
  }

  console.error("Unable to parse date string " + str)
}

export class GeoServer {
  constructor(url) {
    this.url = url
  }

  // TODO - geoserver authentication
  async getAuth() {
    return undefined;
  }

  // Implementation of DataSource.getLayerName()
  getLayerName(layer, dateTime) {
    if (layer.dateFormat && layer.timeRange) {
      return formatLayerNameWithDate(layer.layer, new Date(dateTime), layer.dateFormat)
    }

    return layer.layer
  }

  // implemetation of DataSource.getLayerParams
  getLayerParams(layerName, layerData, dateTime) {
    return {
      layers: layerName
    }
  }

  supportsTimeSeries(layer) {
    if (layer.sideCarServiceURL) {
      return true
    }
    return false
  }

  async getTimeSeries(layer, latlng, startTime, endTime) {
    //call http://cccxl010.pok.ibm.com:8010/api/v1/timeseries/oco2_grid_MOE_G39/17.978733/50.405273/100
    // return in this format

    // Get timeseries data for the layer and point
    // @param latlng: Object {
    //   "lat": xx.xxxx, "lng": yy.yyyy
    // }
    // @param startTime: Date object of starting time
    // @param endTime: Date object of ending time
    // @return Promise with Array of timeseries, e.g. [
    //   {
    //     "dateTime": "2022-03-25T13:50:30.953Z", "value": 1.234
    //   }, ...
    // ]

    const layerName = layer.layer.split(":").at(-1)
    const maxLayers = 20

    const res = await (await fetch(`${layer.sideCarServiceURL}/timeseries/${layerName}/${latlng.lat}/${latlng.lng}/${maxLayers}`)).json()
    
    if (res.error) {
      console.error(res)
      return null
    }

    let data = res.map(d => {
      const dateString = d[0]
      const value = d[1][0]

      return {
        timestamp: tryParseDate(dateString).toISOString(),
        value: value
      }
    })

    return {
      data: data
    }
  }

  async getTemporalCoverage(layer) {
    if (!layer.dateFormat || !layer.timeRange) {
      return
    }
    const allGeoserverLayers = await this.readAllLayers(layer.rootUrl)

    // find layers that include the base layer name
    const geoserverLayers = allGeoserverLayers.filter(l =>
      l.name.match(layer.name + "_[0-9]{8}") ||
      l.name.match(layer.name + "_[0-9]{8}T[0-9]{6}")
    )

    const timestamps = []

    for (let geoserverLayer of geoserverLayers) {
      const layerDate = extractDateFromLayername(geoserverLayer.name, layer.dateFormat)
      if (layerDate.date) {
        timestamps.push({ date: layerDate.date })
      }
    }

    return timestamps.slice(-100) // TODO instead of truncating it, allow zoom in/out on timeline view
  }

  /**
   * GeoServer has a bug where the GetCapabilities XML output has mismatched
   * <Layer>...</Layer> tags
   * Here, we fix any imbalance
   */
  fixGeoServerBug(xmlResponse) {
    // count opening and closing Layer tags
    let open = xmlResponse.split(/<Layer[ >]/).length
    let close = xmlResponse.split(/<\/Layer>/).length

    if (open == close) return xmlResponse;

    // add closing tags to fix the imbalance
    let fix = "";
    for (let i = 0; i < open - close; i++) {
      fix += "</Layer>";
    }

    return xmlResponse.replace("</Capability>", fix + "</Capability>");
  }

  async readAllLayers(url = this.url) {
    const response = await fetch(url + "/wms?service=WMS&version=2.0.1&request=GetCapabilities", {}).catch(e => {
      console.error(e)
      throw new Error("Unable to connect to server")
    })

    if (!response || !response.ok) {
      throw new Error("Error connecting to server")
    }
    // const response = await fetch("http://braas1.sl.cloud9.ibm.com:8080/geoserver/nurc/wms?service=WCS&version=2.0.1&request=DescribeCoverage&coverageid=Pk50095", { })

    try {
      const xmlResponse = await response.text()
      const fixedXml = this.fixGeoServerBug(xmlResponse)
      const xmlDoc = xmlParser.parseFromString(fixedXml, "text/xml")
      const rawLayers = xmlDoc.querySelectorAll('Layer[queryable="1"]')

      const layers = []

      rawLayers.forEach((layer, i) => {
        if (i < MAX_LAYERS) {
          const bboxNode = layer.querySelector("EX_GeographicBoundingBox")
          layers.push({
            name: layer.querySelector("Name").innerHTML,
            title: layer.querySelector("Title").innerHTML,
            abstract: layer.querySelector("Abstract").innerHTML,
            style: layer.querySelector("Style Name").innerHTML,
            bbox: {
              westBoundLongitude: bboxNode.querySelector("westBoundLongitude").innerHTML,
              eastBoundLongitude: bboxNode.querySelector("eastBoundLongitude").innerHTML,
              southBoundLatitude: bboxNode.querySelector("southBoundLatitude").innerHTML,
              northBoundLatitude: bboxNode.querySelector("northBoundLatitude").innerHTML,
            }
          })
        }
      })
      return layers

    } catch (e) {
      console.error(e)
      throw new Error("Unable to read data from server. Please verify that it is a valid Geoserver.")
    }
  }

  // Implementation of DataSource.getPointValues()
  async getPointValues(layer, bbox) {
    try {

      let layerName = layer.layer

      if (layer.dateFormat && layer.ui.datetime) {
        layerName = formatLayerNameWithDate(layer.layer, new Date(layer.ui.datetime), layer.dateFormat)
      }

      const url = new URL(window.location.origin+layer.rootUrl)

      const urlParams = {
        service: "WMS",
        version: "1.1.1",
        request: "GetFeatureInfo",
        format: "image/png",
        transparency: "true",
        exceptions: "application/json",
        layers: layerName,
        query_layers: layerName,
        feature_count: 10,
        info_format: "application/json",
        srs: "EPSG:4326",
        width: 101,
        height: 101,
        x: 50,
        y: 50,
        bbox: `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`

      }

      for (let [key, value] of Object.entries(urlParams)) {
        url.searchParams.set(key, value)
      }

      let res = await fetch(url);
      return res.json();
    } catch (e) {
      console.error(e)
    }

  }

  async getLegendGraphics(layer) {
    try {

      let layerName = layer.layer

      if (layer.dateFormat && layer.ui.datetime) {
        layerName = formatLayerNameWithDate(layer.layer, new Date(layer.ui.datetime), layer.dateFormat)
      }

      const url = new URL(window.location.origin+layer.rootUrl)

      const urlParams = {
        service: "WMS",
        version: "1.1.1",
        request: "GetLegendGraphic",
        format: "application/json",
        layer: layerName,
        ...layer.wmsParams
      }

      for (let [key, value] of Object.entries(urlParams)) {
        url.searchParams.set(key, value)
      }

      let res = await fetch(url);
      return res.json();
    } catch (e) {
      console.error(e)
    }
  }

  /*
   * Allows you to query one or more properties from one of more layers, and it returns the result as a Js object
   * multiple properties are comma-separated, multiple layers are in a string array, but if you have different properties per layer, then specify the properties per layer in a string array
   * e.g. layers = ['layer1', 'layer2'], and properties = "prop1, prop2" gets prop1 and prop2 from both layers, but properties = "['prop1', 'prop2']" gets prop1 from layer1 and prop2 from layer2
   * to retrieve time-series data, you have to specify each timestamp as a layerid
   */
  async getProperty(layer, prop, bbox) {
    let layerParam = layer
    if (Array.isArray(layer)) layerParam = layer.join(",")

    let propParam = prop
    if (Array.isArray(prop)) propParam = "(" + prop.join(")(") + ")"

    let urlWFS = `${this.url}?service=wfs&version=1.1.0&request=GetFeature&typeName=${layerParam}&propertyName=${propParam}&count=1&bbox=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`

    return await fetch(urlWFS).then(async (res) => {
      let html = await res.text()
      let e = document.createElement('div')
      e.innerHTML = html;

      let ret = {}
      let members = e.getElementsByTagName("gml:featureMembers")[0].children
      for (let m of members) {
        let layerName = m.tagName;
        let props = ret[layerName];
        if (props === undefined) props = {}

        for (let p of m.children) {
          if (!Array.isArray(props[p.tagName])) props[p.tagName] = []
          props[p.tagName] = props[p.tagName].concat(p.innerText);
        }

        ret[layerName] = props;
      }

      return ret;
    });
  }

  async getGeoraster(layer, { southWestCoordinate, northEastCoordinate }, dateTime = null, resolution = 256) {
    let layerName = layer.layer

    if (dateTime) {
      layerName = this.getLayerName(layer, dateTime)
    }

    const params = {
      service: "WCS",
      version: "2.0.1",
      request: "GetCoverage",
      coverageid: layerName,
      format: "image/geotiff",
      scalesize: `i(${resolution}),j(${resolution})`,
      subsettingcrs: "http://www.opengis.net/def/crs/EPSG/0/4326"
    }

    const subset = `SUBSET=Lat(${southWestCoordinate.latitude},${northEastCoordinate.latitude})&SUBSET=Long(${southWestCoordinate.longitude},${northEastCoordinate.longitude})`

    const urlParams = new URLSearchParams(params)

    const url = `${layer.rootUrl}?${urlParams.toString()}&${subset}`

    let response = await fetch(url)
    let type = response.headers.get("content-type")
    if (type != "image/geotiff") {
      const msg = await response.text()
      throw new Error("Failed to get data for specified region\n\n" + msg)
    }

    const arrayBuffer = await response.arrayBuffer();
    const georaster = await geoblaze.parse(arrayBuffer);
    return georaster
  }

  async getGeoJson(layer, cqlFilter = null) {
    const params = layer.params

    if (cqlFilter) {
      params.cql_filter = cqlFilter
    }

    const urlParams = new URLSearchParams(params)
    const url = `${layer.rootUrl}?${urlParams.toString()}`

    let res = await fetch(url);

    let json = await res.json();
    return json;
  }
}
