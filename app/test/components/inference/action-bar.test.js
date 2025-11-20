/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";

import "../../../js/components/inference/action-bar";

describe("Action Bar Component", () => {
  it("mounts action bar on the dom and it's default child nodes", async () => {
    const el = await fixture("<action-bar></action-bar>");
    const shadowRoot = el.shadowRoot;
    const spanText = shadowRoot.querySelector("#action-bar-title-text");
    const downloadButton = shadowRoot.querySelector("#action-bar-download");
    const searchBar = shadowRoot.querySelector("#search-bar");
    const rightSection = shadowRoot.querySelector(".right-section");

    expect(spanText).to.exist;
    expect(downloadButton).to.exist;
    expect(searchBar).to.exist;
    expect(rightSection).to.exist;

    expect(el).dom.to.equalSnapshot();
  });
  it("checks if the right section buttons exists", async () => {
    const el = await fixture("<action-bar></action-bar>");
    const shadowRoot = el.shadowRoot;

    const workFlowCatalogButton = shadowRoot.querySelector(
      "#action-bar-work-flow-catalog"
    );
    const runInferenceButton = shadowRoot.querySelector(
      "#action-bar-run-inference"
    );

    expect(workFlowCatalogButton).to.exist;
    expect(runInferenceButton).to.exist;
    expect(el).dom.to.equalSnapshot();
  });
});
