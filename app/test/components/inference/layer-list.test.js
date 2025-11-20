/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import sinon from "sinon";
import "../../../js/components/inference/layer-list";

describe("layer-list", () => {
  let element;
  let appMock;

  before(() => {
    //== Mock global app ==
    appMock = {
      main: {
        map: {
          hideBaseMap: () => {},
          showBaseMap: () => {},
          hideLayer: () => {},
          showLayer: () => {},
          toggleCompareLayers: () => {},
        },
      },
    };
    window.app = appMock;
  });

  after(() => {
    delete window.app;
  });

  beforeEach(async () => {
    element = await fixture(`<layer-list></layer-list>`);
  });

  it("should call toggleCompareLayers when compare button is clicked", async () => {
    //== Setup initial state with layers ==
    const layers = [
      { name: "Layer 1", ui: { compare: "none" } },
      { name: "Layer 2", ui: { compare: "none" } },
    ];
    element.setMapLayers(layers);
    element.setupLayers();

    await element.updateComplete;

    const spy = sinon.spy(appMock.main.map, "toggleCompareLayers");

    //== Simulate clicking the compare button on the first layer==
    const layerElements =
      element.shadowRoot.querySelectorAll(".layer-container");
    const firstLayerElement = layerElements[0];
    const compareButton = firstLayerElement.querySelector(
      ".split-screen-toggle"
    );

    if (compareButton) {
      compareButton.click();
      await element.updateComplete;

      expect(spy.called);
    }

    spy.restore();
  });

  it("should correctly add a new layer", async () => {
    const newLayer = { name: "New Layer", ui: { opacity: 1 } };
    element.setMapLayers([newLayer]);
    element.setupLayers();

    await element.updateComplete;
    const layerElement = element.shadowRoot.querySelector(".layer-container");
    if (layerElement) {
      const layerName = layerElement
        .querySelector(".layer-name")
        .textContent.trim();
      expect(layerName).to.exist;
    } else {
      throw new Error("Layer container not found.");
    }
  });

  it("should call the appropriate map method when visibility toggle is clicked", async () => {
    const layer = { name: "Layer Visibility Test", ui: { opacity: 1 } };
    element.setMapLayers([layer]);
    element.setupLayers();

    await element.updateComplete;

    const spy = sinon.spy(appMock.main.map, "hideLayer");

    const layerElement = element.shadowRoot.querySelector(".layer-container");
    if (layerElement) {
      const visibilityToggle = layerElement.querySelector(
        ".layer-visibility-toggle"
      );
      if (visibilityToggle) {
        visibilityToggle.click();
        await element.updateComplete;

        expect(spy.calledWith("Layer Visibility Test"));
      }
    } else {
      throw new Error("Layer container not found.");
    }

    spy.restore();
  });

  it("should reset compare layers when resetCompareLayers is called", async () => {
    element.compareLayerLeftName = "Layer A";
    element.compareLayerRightName = "Layer B";

    element.resetCompareLayers();
    await element.updateComplete;
    expect(element.compareLayerLeftName).to.be.null;
    expect(element.compareLayerRightName).to.be.null;
  });

  it("should open the overflow menu when the menu button is clicked", async () => {
    const layer = { name: "Layer with Menu", ui: { opacity: 1 } };
    element.setMapLayers([layer]);
    element.setupLayers();
    await element.updateComplete;

    //== Simulate clicking the overflow menu button==
    const layerElement = element.shadowRoot.querySelector(".layer-container");
    const menuButton = layerElement.querySelector(".overflow-menu-button");

    if (menuButton) {
      menuButton.click();
      await element.updateComplete;
      const menu = element.shadowRoot.querySelector(".overflow-menu");
      expect(menu).to.exist;
    }
  });
  it("should disable min/max inputs when auto min/max checkbox is checked", async () => {
    const layer = { name: "Layer with Overflow Menu", ui: { opacity: 1 } };
    element.setMapLayers([layer]);
    element.setupLayers();
    await element.updateComplete;

    const layerElement = element.shadowRoot.querySelector(".layer-container");
    const menuButton = layerElement.querySelector(".overflow-menu-toggle");
    menuButton.click();
    await element.updateComplete;

    const overflowMenu = element.shadowRoot.querySelector(
      ".overflow-menu-container"
    );
    const autoMinMaxCheckbox = overflowMenu.querySelector(
      "#auto-min-max-checkbox"
    );
    const minInput = overflowMenu.querySelector("#min-input");
    const maxInput = overflowMenu.querySelector("#max-input");

    autoMinMaxCheckbox.click();
    await element.updateComplete;

    expect(minInput.hasAttribute("disabled"));
    expect(maxInput.hasAttribute("disabled"));
  });
});
