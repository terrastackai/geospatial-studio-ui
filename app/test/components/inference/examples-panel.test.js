/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect, oneEvent } from "@open-wc/testing";
import "../../../js/components/inference/examples-panel";

describe("examples-panel", () => {
  it("should  render the component", async () => {
    const el = await fixture("<examples-panel></examples-panel>");
    expect(el).to.exist;
  });
  it("should have an empty examples list initially", async () => {
    const el = await fixture("<examples-panel></examples-panel>");
    expect(el.examples).to.be.an("array").that.is.empty;
  });
  it("should render the close button", async () => {
    const el = await fixture("<examples-panel></examples-panel>");
    const button = el.shadowRoot.getElementById("close-button");
    expect(button).to.exist;
  });
  it("should dispatch the correct event when close button is clicked", async () => {
    const el = await fixture("<examples-panel></examples-panel>");
    const button = el.shadowRoot.getElementById("close-button");
    setTimeout(() => button.click());
    const event = await oneEvent(el, "close-example");
    expect(event).to.exist;
  });
  it("should render correct  items when setExamples is called", async () => {
    const el = await fixture("<examples-panel></examples-panel>");
    const examples = [
      {
        id: "1",
        status: "COMPLETED",
        model_usecase: { base_style: "lulc_esri" },
      },
      {
        id: "2",
        status: "COMPLETED",
        model_usecase: { base_style: "flooding" },
      },
      {
        id: "3",
        status: "COMPLETED",
        model_usecase: { base_style: "fire_scars" },
      },
      {
        id: "4",
        status: "COMPLETED",
        model_usecase: { base_style: "agb" },
      },
      {
        id: "5",
        status: "COMPLETED",
        model_usecase: { base_style: "p2t" },
      },
      {
        id: "6",
        status: "COMPLETED",
        model_usecase: { base_style: "wind" },
      },
    ];
    el.setExamples(examples);
    await el.updateComplete;
    expect(
      el.shadowRoot.getElementById("lulc-list-ul").children.length
    ).to.equal(1);
    expect(
      el.shadowRoot.getElementById("flood-list-ul").children.length
    ).to.equal(1);
    expect(
      el.shadowRoot.getElementById("firescar-list-ul").children.length
    ).to.equal(1);
    expect(
      el.shadowRoot.getElementById("agb-list-ul").children.length
    ).to.equal(1);
    expect(
      el.shadowRoot.getElementById("p2t-list-ul").children.length
    ).to.equal(1);
    expect(
      el.shadowRoot.getElementById("wind-list-ul").children.length
    ).to.equal(1);
  });
});
