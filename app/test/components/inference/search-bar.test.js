/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect, oneEvent } from "@open-wc/testing";
import "../../../js/components/inference/search-bar.js";

describe("search-bar", () => {
  it("renders input-field  and icon correctly", async () => {
    const el = await fixture("<search-bar></search-bar>");
    const inputField = el.shadowRoot.querySelector(".input-field");
    const icon = el.shadowRoot.querySelector(".icon");
    expect(inputField).to.exist;
    expect(inputField.getAttribute("placeholder")).to.equal("Search map");
    expect(icon).to.exist;
  });
  it('dispatches "geocode-this" event on input', async () => {
    const el = await fixture("<search-bar></search-bar>");
    const inputField = el.shadowRoot.getElementById("geocode-input");
    setTimeout(() => inputField.dispatchEvent(new Event("input")));

    const event = await oneEvent(el, "geocode-this");
    expect(event).to.exist;
    expect(event.detail).to.be.an.instanceof(Event);
  });
  it('dispatches "geocode-this" event on keydown', async () => {
    const el = await fixture("<search-bar></search-bar>");
    const inputField = el.shadowRoot.getElementById("geocode-input");
    setTimeout(() => inputField.dispatchEvent(new KeyboardEvent("keydown")));

    const event = await oneEvent(el, "geocode-this");
    expect(event).to.exist;
    expect(event.detail).to.be.an.instanceof(KeyboardEvent);
  });
});
