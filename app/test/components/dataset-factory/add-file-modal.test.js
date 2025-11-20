/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import "../../../js/components/data-set-factory/add-file-modal";

describe("Add File Modal Component", () => {
  it("mounts the modal on the DOM and its child nodes", async () => {
    const el = await fixture("<add-file-modal></add-file-modal>");
    const shadowRoot = el.shadowRoot;
    const modal = shadowRoot.querySelector("#add-file-modal");
    const modalHeader = shadowRoot.querySelector("bx-modal-Header");
    const modalBody = shadowRoot.querySelector("bx-modal-body");
    const modalFooter = shadowRoot.querySelector("bx-modal-footer");

    expect(modal).to.exist;
    expect(modalHeader).to.exist;
    expect(modalBody).to.exist;
    expect(modalFooter).to.exist;

    expect(el).dom.to.equalSnapshot();
  });
  it("checks if the dropdown and textarea exist", async () => {
    const el = await fixture("<add-file-modal></add-file-modal>");
    const shadowRoot = el.shadowRoot;
    const dropdown = shadowRoot.querySelector("#type-dropdown");
    const textarea = shadowRoot.querySelector("#url-input");

    expect(dropdown).to.exist;
    expect(textarea).to.exist;
  });
  it("checks if the buttons exist", async () => {
    const el = await fixture("<add-file-modal></add-file-modal>");
    const shadowRoot = el.shadowRoot;
    const cancelButton = shadowRoot.querySelector("#cancel-button");
    const configureButton = shadowRoot.querySelector(
      "#configure-dataset-button"
    );

    expect(cancelButton).to.exist;
    expect(configureButton).to.exist;
  });
  it("validates the form correctly", async () => {
    const el = await fixture("<add-file-modal></add-file-modal>");
    const shadowRoot = el.shadowRoot;
    const typeDropdown = shadowRoot.querySelector("#type-dropdown");
    const urlInput = shadowRoot.querySelector("#url-input");
    const configureButton = shadowRoot.querySelector(
      "#configure-dataset-button"
    );

    //== Test invalid form ==
    typeDropdown.value = "none";
    urlInput.value = "invalid-url";
    configureButton.click();

    expect(typeDropdown.hasAttribute("invalid")).to.be.true;
    expect(urlInput.hasAttribute("invalid")).to.be.true;

    //== Test valid form ==
    typeDropdown.value = "dataset";
    urlInput.value = "https://example.com";
    configureButton.click();

    expect(typeDropdown.hasAttribute("invalid")).to.be.false;
    expect(urlInput.hasAttribute("invalid")).to.be.false;
  });
});
