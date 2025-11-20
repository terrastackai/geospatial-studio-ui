/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { GeoServer } from "./geoserver.js"
import { GeoBlaze } from "./geoblaze.js"

/**
 * A Base class to abstract access to metadata and data from various geo-data
 * repositories, like GeoServer. Give it a map layer and it 
 * will figure out where the data comes from, and provides metadata like 
 * coverage and timeseries data.
 */
export default class {
  constructor(layer) {
    this.geoserver = new GeoServer();
    this.geoblaze = new GeoBlaze();
    this.layer = layer;
    this.ds = this.getDataSource(layer);
  }

  // Get an object to retrieve metadata and data for a given layer.
  // You shouldn't call this directly, rather use the various methods in this
  // class, since all repositories may not implement all methods.
  // @params layer: The layer JSON data from config.json
  // @return instance of this DataSource class
  getDataSource(layer) {
    if (!layer) return undefined;

    switch (layer.datasource) {
      case 'geoserver': return this.geoserver;
      case 'computed': return this.geoblaze;
      case 'remote-url': return this.geoblaze;
      default: return undefined;
    }
  }

  // Perform authentication for the layer if needed
  getAuth() {
    if (!this.ds || !this.ds.getAuth)
      return new Promise((res, rej) => res(undefined));
    return this.ds.getAuth(this.layer);
  }

  // Does this datasource support getting timeseries data?
  supportsTimeSeries() {
    if (this.ds && this.ds.supportsTimeSeries) return this.ds.supportsTimeSeries(this.layer);
    return false;
  }

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
  getTimeSeries(latlng, startTime, endTime) {
    if (!this.ds || !this.ds.getTimeSeries) 
      return new Promise((res,rej) => res(undefined));
    return this.ds.getTimeSeries(this.layer, latlng, startTime, endTime);
  }

  // Returns the dates for which the datasource has spatial data (layers)
  // @param latitude, longitude: point at which to get coverage
  // @return Promise with Array of coverage timestamps, e.g. [
  //    {
  //      date: "2022-03-25T13:50:30.953Z", ...
  //    }, 
  //    ...
  // ]
  getTemporalCoverage(latitude, longitude) {
    if (!this.ds || !this.ds.getTemporalCoverage) 
      return new Promise((res,rej) => res(undefined));
    return this.ds.getTemporalCoverage(this.layer, latitude, longitude);
  }

  // Returns the layer id for the specified timestamp. Layer may not exist
  // at the specified timestamp, so  ensure the timestamp is valid from 
  // getTemporalCoverage()
  // @param dateTime A Date object representing the timestamp
  getLayerName(dateTime) {
    if (!this.ds || !this.ds.getLayerName) 
      return new Promise((res,rej) => res(undefined));
    let layerName = this.ds.getLayerName(this.layer, dateTime);
    return layerName; 
  }

  // Gets the changed layer params for the given timestamp 
  // @param dateTime A Date object representing the timestamp
  // @param wmsParams details like 'name', 'geoserverUrl', etc.
  getLayerParams(dateTime, wmsDetails) {
    if (!this.ds || !this.ds.getLayerParams) 
      return {}

    let layerName = ""
    if (wmsDetails && wmsDetails.name) {
      layerName = wmsDetails.name;
    } else {
      layerName = this.getLayerName(dateTime)
    }
    
    let layerParams =  this.ds.getLayerParams(layerName, this.layer, dateTime)

    // update the layer params where applicable
    if (wmsDetails) {
      if (wmsDetails.filter) {
        layerParams.cql_filter = wmsDetails.filter;
      }
      if (wmsDetails.styledLayerDescriptor) {
        layerParams.sld = wmsDetails.styledLayerDescriptor;
      }
      if (wmsDetails.params) {
        console.log(wmsDetails.params)
      }
    } 
    return layerParams;
  }

  // Get the values of the raster/vector/calculated layer at the specified co-ords
  // @param bbox: bounding box taking pixel size into account, array with:
  //              [ a1, b1, a2, b2 ] optionally with CRS at the end
  //              [ a1, b1, a2, b2, CRS ]
  //							Should pass in values from app-map.js#363
  // @return [] array of values for the point
  getPointValues(bbox) {
    if (!this.ds || !this.ds.getPointValues) 
      return new Promise((res,rej) => res(undefined));
    let values = this.ds.getPointValues(this.layer, bbox);
    return values; 
  }

  getLegendGraphics() {
    if (!this.ds || !this.ds.getLegendGraphics) 
      return new Promise((res,rej) => res(undefined));
    let lg = this.ds.getLegendGraphics(this.layer);
    return lg; 
  }

  getGeoraster(layer, bounds, dateTime, resolution, params) {
    if (!this.ds || !this.ds.getGeoraster) {
      throw new Error("Not implemented")
    } 
    return this.ds.getGeoraster(layer, bounds, dateTime, resolution, params)
  }
  
  getGeoJson(layer, cqlFilter) {
    if (!this.ds || !this.ds.getGeoJson) {
      throw new Error("Not implemented")
    } 
    return this.ds.getGeoJson(layer, cqlFilter)
  }

  canGetGeoraster() {
    if (!this.ds || !this.ds.getGeoraster) {
      return false
    } 

    return true;
  }
}
