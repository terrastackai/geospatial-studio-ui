/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { expect, fixture, html } from "@open-wc/testing";
import "../../../js/components/inference/color-bar";
import {
  legendEntryTemplate,
  legendLayerTemplate,
  drawColorScaleLegendDiv,
} from "../../../js/components/inference/color-bar";
import asWebComponent from "../../../js/webcomponent";

describe("Color Bar Component", () => {
  it("checks that the entire Color Bar Component is mounted correctly on the DOM", async () => {
    const el = await fixture("<color-bar></color-bar>");
    expect(el).to.exist;
  });

  it("checks that the Color Bar Component default child nodes exist", async () => {
    const el = await fixture("<color-bar></color-bar>");
    expect(el).to.exist;
    const shadowRoot = el.shadowRoot;

    const colorBarContainer = shadowRoot.querySelector("#color-bar-container");
    const chartSvg = shadowRoot.querySelector("#color-bar-container");
    const colorBarContainerSkeleton = shadowRoot.querySelector("#skeleton");

    expect(colorBarContainer).to.exist;
    expect(chartSvg).to.exist;
    expect(colorBarContainerSkeleton).to.exist;
  });

  it("checks that the legendEntryTemplate fuction returns a valid legend-entry node that is actually mounted on the DOM", async () => {
    const element = {
      color: "#4589FF",
      title: "Permanent Water",
    };
    const el = await fixture(legendEntryTemplate(element));
    expect(el).to.exist;
  });

  it("checks that the legendEntryTemplate fuction returns it's default child nodes", async () => {
    const element = {
      color: "#4589FF",
      title: "Permanent Water",
    };
    const el = await fixture(legendEntryTemplate(element));

    expect(el.hasChildNodes()).to.equal(true);
  });

  it("checks that the legendLayerTemplate fuction returns a valid legend-header node and legendEntryTemplates that are actually mounted on the DOM", async () => {
    const header = "Hello";
    const entries = [
      {
        title: "Permanent Water",
        color: "#4589FF",
      },
    ];
    const el = await fixture(legendLayerTemplate(entries, header));

    expect(el).to.exist;
    expect(entries.map(legendEntryTemplate).join("\n")).to.exist;
  });

  it("checks that the drawColorScaleLegend function mounts a div with the legendLayerTemplate and the header", async () => {
    const colorMap = [
      {
        title: "Test Title",
        symbolizers: [{ Polygon: { fill: "#FF0000" } }],
      },
    ];
    const header = "Test Header";
    const legendLayerDiv = document.createElement("div");
    const legendLayerDivInnerHTML = legendLayerTemplate(colorMap, header);

    const el = await fixture(
      drawColorScaleLegendDiv(legendLayerDiv, legendLayerDivInnerHTML)
    );
    expect(el.innerHTML).to.equal("Test Header");
  });
});
