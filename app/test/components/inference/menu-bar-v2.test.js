/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import "../../../js/components/inference/menu-bar-v2.js";

describe("menu-bar-v2", () => {
  it("renders three menu items", async () => {
    const el = await fixture("<menu-bar-v2><menu-bar-v2>");
    const items = el.shadowRoot.querySelectorAll("button");
    expect(items.length).to.equal(3);
  });
  it("renders specific menu items", async () => {
    const el = await fixture("<menu-bar-v2><menu-bar-v2>");
    const items = el.shadowRoot.querySelectorAll("button");
    const svgs = el.shadowRoot.querySelectorAll("svg");
    expect(svgs).to.not.be.null;
    expect(items[0].classList.contains("menu-bar-v2-button")).to.be.true;
    expect(items[0].id).to.equal("menu-bar-v2-layers-button");
    expect(items[0].title).to.equal("Layers");

    expect(items[1].classList.contains("menu-bar-v2-button")).to.be.true;
    expect(items[1].id).to.equal("menu-bar-v2-history-button");
    expect(items[1].title).to.equal("History");

    expect(items[2].classList.contains("menu-bar-v2-button")).to.be.true;
    expect(items[2].id).to.equal("menu-bar-v2-examples-button");
    expect(items[2].title).to.equal("Examples");
  });

  it("matches the snapshot", async () => {
    const el = await fixture("<menu-bar-v2></menu-bar-v2>");
    expect(el).dom.to.equalSnapshot();
  });
});
