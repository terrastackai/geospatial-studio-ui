/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { expect, fixture, html } from "@open-wc/testing";
import sinon from "sinon";
import "../../../js/components/inference/local-data-upload";
import "../../../js/components/inference/file-preview-map";

const mockLeaflet = {
  map: sinon.stub().returns({
    setView: sinon.spy(),
    invalidateSize: sinon.spy(),
    fitBounds: sinon.spy(),
    setZoom: sinon.spy(),
    getBounds: sinon.stub().returns({
      getNorthEast: sinon.stub().returns({ lat: 0, lng: 0 }),
      getSouthWest: sinon.stub().returns({ lat: 0, lng: 0 }),
    }),
  }),
  tileLayer: sinon.stub().returns({
    addTo: sinon.spy(),
  }),
  geoJSON: sinon.stub().returns({
    addTo: sinon.spy(),
    getBounds: sinon.stub().returns({
      getNorthEast: sinon.stub().returns({ lat: 0, lng: 0 }),
      getSouthWest: sinon.stub().returns({ lat: 0, lng: 0 }),
    }),
  }),
  latLng: (lat, lng) => ({ lat, lng }),
  latLngBounds: (southWest, northEast) => ({ southWest, northEast }),
};

window.L = mockLeaflet;

describe("local-data-upload Component", () => {
  let el;

  beforeEach(async () => {
    const existingEl = document.querySelector("local-data-upload");
    if (existingEl) {
      existingEl.remove();
    }

    el = await fixture(`<local-data-upload></local-data-upload>`);
  });

  it("Checks if the local-data-upload component is mounted to the DOM", () => {
    expect(el).to.exist;
  });

  it("Shows and hides the modal correctly", () => {
    el.show();
    expect(el.shadowRoot.querySelector("bx-modal").hasAttribute("open")).to.be
      .true;

    el.hide();
    expect(el.shadowRoot.querySelector("bx-modal").hasAttribute("open")).to.be
      .false;
  });

  it("Validates the input correctly", () => {
    el.layerName.value = "Layer 1";
    expect(el.validate()).to.be.true;

    el.layerName.value = "";
    expect(el.validate()).to.be.false;
  });

  it("Fetches CSV columns correctly", async () => {
    const fileContent = "name,lat,lng\nval1,1,2";
    const file = new File([fileContent], "test.csv", { type: "text/csv" });

    const cols = await el.getCsvCols(file);

    expect(cols).to.deep.equal(["name", "lat", "lng"]);
  });
});
