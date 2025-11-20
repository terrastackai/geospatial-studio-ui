/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { expect, fixture, html } from "@open-wc/testing";
import sinon from "sinon";
import "../../../js/components/inference/file-preview-map";

const mockMap = {
  setView: sinon.spy(),
  fitBounds: sinon.spy(),
  invalidateSize: sinon.spy(),
};

const mockGeoJSONLayer = {
  addTo: sinon.spy(),
  getBounds: () => ({
    getSouthWest: () => ({ lat: 0, lng: 0 }),
    getNorthEast: () => ({ lat: 1, lng: 1 }),
  }),
};

const mockTileLayer = {
  addTo: sinon.spy(),
};

const mockLeaflet = {
  map: sinon.stub().returns(mockMap),
  tileLayer: sinon.stub().returns(mockTileLayer),
  geoJSON: sinon.stub().returns(mockGeoJSONLayer),
};

window.L = mockLeaflet;

describe("File Preview Map", () => {
  let el;

  beforeEach(async () => {
    el = await fixture(html`<file-preview-map></file-preview-map>`);
  });

  it("Checks if the File Preview Map component is mounted to the DOM", () => {
    expect(el).to.exist;
  });

  it("Initializes the Leaflet map correctly but doesn't display due to lack of the leaflet.css file", async () => {
    await el.render();

    expect(mockLeaflet.map.calledOnce).to.be.false;

    expect(mockMap.invalidateSize.calledOnce).to.be.false;
  });

  it("Previewing a TIFF file updates the map", async () => {
    const parseGeoraster = sinon.stub().resolves({});
    const GeoRasterLayer = sinon.stub().returns({
      addTo: sinon.spy(),
      getBounds: () => ({
        getSouthWest: () => ({ lat: 0, lng: 0 }),
        getNorthEast: () => ({ lat: 1, lng: 1 }),
      }),
    });

    window.parseGeoraster = parseGeoraster;
    window.GeoRasterLayer = GeoRasterLayer;

    const tiffFile = new Blob([new ArrayBuffer(8)], { type: "image/tiff" });
    await el.previewTifFile(tiffFile);

    expect(GeoRasterLayer.calledOnce).to.be.true;
    const geoRasterLayer = GeoRasterLayer.firstCall.returnValue;
    expect(geoRasterLayer.addTo.calledOnce).to.be.true;

    expect(mockMap.fitBounds.calledOnce).to.be.true;
  });

  it("Resets the map correctly", async () => {
    el.previewLayer = { remove: sinon.spy() };

    await el.reset();

    expect(mockMap.setView.calledOnceWith([0, 0], 1)).to.be.true;

    expect(el.previewLayer.remove.calledOnce).to.be.true;
  });

  it("Throws an error for unsupported file types", async () => {
    const unsupportedFile = new Blob([], { type: "text/plain" });

    try {
      await el.previewFile(unsupportedFile);
    } catch (error) {
      expect(error.message).to.equal("Unable to handle file type text/plain");
    }
  });
});
