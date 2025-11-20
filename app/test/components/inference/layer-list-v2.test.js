/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import "../../../js/components/inference/layer-list-v2.js";
import sinon from "sinon";
describe("layer-list-v2", () => {
  let element;
  let appMock;
  before(() => {
    //mock global app
    appMock = {
      main: {
        map: {
          hideBaseMap: sinon.stub(),
          showBaseMap: sinon.stub(),
          hideLayer: sinon.stub(),
          toggleCompareLayer: sinon.stub(),
        },
      },
    };
    window.app = appMock;
  });
  after(() => {
    delete window.app;
  });

  beforeEach(async () => {
    element = await fixture("<layer-list-v2></layer-list-v2>");
  });

  it("should render the component correctly", async () => {
    element.render();
    await element.updateComplete;
    const layerList = element.shadowRoot.querySelector(".layer-list");
    const baseLayerContainer = element.shadowRoot.querySelector(".base-layer");
    const addBtn = element.shadowRoot.querySelector("#add-button");
    expect(layerList).to.exist;
    expect(baseLayerContainer).to.exist;
    expect(addBtn).to.exist;
  });
  it("should dispatch add-layer event when add-button is clicked", () => {
    const addBtn = element.shadowRoot.querySelector("#add-button");
    const spy = sinon.spy();
    element.addEventListener("add-layer", spy);
    addBtn.click();
    expect(spy.calledOnce).to.be.true;
  });
  it("should toggle basemap visibility on click", async () => {
    element.renderBasemapItem();
    await element.updateComplete;
    const baseLayerItem = element.shadowRoot.querySelector(".layer-item");
    expect(baseLayerItem).to.exist;
    const toggleViewIcon = baseLayerItem.querySelector(".toggle-view-icon");
    expect(toggleViewIcon).to.exist;
    toggleViewIcon.dispatchEvent(new Event("click"));
    expect(appMock.main.map.hideBaseMap.calledOnce).to.be.true;
    expect(element.basemap.ui.opacity).to.equal(0);
    toggleViewIcon.dispatchEvent(new Event("click"));
    expect(appMock.main.map.showBaseMap.calledOnce).to.be.true;
    expect(element.basemap.ui.opacity).to.equal(1);
  });
});
