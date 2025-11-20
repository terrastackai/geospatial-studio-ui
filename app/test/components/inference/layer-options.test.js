/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { expect, fixture, oneEvent } from "@open-wc/testing";
import "../../../js/components/inference/layer-options.js";

describe("<layer-options></layer-options", () => {
  let element;
  beforeEach(async () => {
    element = await fixture("<layer-options></layer-options>");
  });
  it("should have a delete button with the correct id", () => {
    const deleteBtn = element.shadowRoot.querySelector("#delete-btn");
    expect(deleteBtn).to.exist;
  });
  it("should have a show button with the correct id", () => {
    const showBtn = element.shadowRoot.querySelector("#show-btn");
    expect(showBtn).to.exist;
  });
  it("should dispatch delete-layer event on clicking delete button", async () => {
    const deleteBtn = element.shadowRoot.querySelector("#delete-btn");
    setTimeout(() => deleteBtn.click(), 0);
    const event = await oneEvent(element, "delete-layer");
    expect(event).to.exist;
  });
  it("should dispatch show layer event on clicking show button", async () => {
    const showBtn = element.shadowRoot.querySelector("#show-btn");
    setTimeout(() => showBtn.click(), 0);
    const event = await oneEvent(element, "show-layer");
    expect(event).to.exist;
  });
});
