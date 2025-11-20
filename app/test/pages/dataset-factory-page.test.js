/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import sinon from "sinon";
import "../../js/pages/dataset-factory-page";

describe("dataset-factory-page component", () => {
  let element;

  beforeEach(async () => {
    element = await fixture(`<dataset-factory-page></dataset-factory-page>`);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should initialize with an empty payload", () => {
    expect(element.payload).to.deep.equal({});
  });

  it("should open addFileModal when add-file-button is clicked", () => {
    const addFileButton = element.shadowRoot
      .querySelector("dataset-table")
      .shadowRoot.querySelector("#add-file-button");
    const addFileModal = element.shadowRoot
      .querySelector("add-file-modal")
      .shadowRoot.querySelector("#add-file-modal");

    addFileButton.click();

    expect(addFileModal.hasAttribute("open")).to.be.true;
  });

  it("should open configureDatasetModal when addFileModal is submitted", () => {
    const addFileModalContainer =
      element.shadowRoot.querySelector("add-file-modal");
    const addFileModal =
      addFileModalContainer.shadowRoot.querySelector("#add-file-modal");
    const configureDatasetModal = element.shadowRoot
      .querySelector("configure-dataset-modal")
      .shadowRoot.querySelector("#configure-dataset-modal");

    addFileModalContainer.dispatchEvent(
      new CustomEvent("modal-submitted", { detail: { fileData: "test data" } })
    );

    expect(element.payload).to.deep.include({ fileData: "test data" });
    expect(addFileModal.hasAttribute("open")).to.be.false;
    expect(configureDatasetModal.hasAttribute("open")).to.be.true;
  });

  it("should open configureLabelsModal when configureDatasetModal is submitted", () => {
    const configureDatasetModalContainer = element.shadowRoot.querySelector(
      "configure-dataset-modal"
    );
    const configureDatasetModal =
      configureDatasetModalContainer.shadowRoot.querySelector(
        "#configure-dataset-modal"
      );
    const configureLabelsModal = element.shadowRoot
      .querySelector("configure-labels-modal")
      .shadowRoot.querySelector("#configure-labels-modal");

    configureDatasetModalContainer.dispatchEvent(
      new CustomEvent("modal-submitted", {
        detail: { datasetConfig: "config data" },
      })
    );

    expect(element.payload).to.deep.include({ datasetConfig: "config data" });
    expect(configureDatasetModal.hasAttribute("open")).to.be.false;
    expect(configureLabelsModal.hasAttribute("open")).to.be.true;
  });

  it("should return to addFileModal when back button in configureDatasetModal is clicked", () => {
    const configureDatasetModal = element.shadowRoot
      .querySelector("configure-dataset-modal")
      .shadowRoot.querySelector("#configure-dataset-modal");
    const backButton = configureDatasetModal.querySelector("#back-button");
    const addFileModal = element.shadowRoot
      .querySelector("add-file-modal")
      .shadowRoot.querySelector("#add-file-modal");

    configureDatasetModal.setAttribute("open", "");
    backButton.click();

    expect(configureDatasetModal.hasAttribute("open")).to.be.false;
    expect(addFileModal.hasAttribute("open")).to.be.true;
  });

  it("should return to configureDatasetModal when back button in configureLabelsModal is clicked", () => {
    const configureLabelsModal = element.shadowRoot
      .querySelector("configure-labels-modal")
      .shadowRoot.querySelector("#configure-labels-modal");
    const backButton = configureLabelsModal.querySelector("#back-button");
    const configureDatasetModal = element.shadowRoot
      .querySelector("configure-dataset-modal")
      .shadowRoot.querySelector("#configure-dataset-modal");

    configureLabelsModal.setAttribute("open", "");
    backButton.click();

    expect(configureLabelsModal.hasAttribute("open")).to.be.false;
    expect(configureDatasetModal.hasAttribute("open")).to.be.true;
  });

  it("should handle final payload and close configureLabelsModal when submitted", () => {
    const configureLabelsModalContainer = element.shadowRoot.querySelector(
      "configure-labels-modal"
    );
    const configureLabelsModal =
      configureLabelsModalContainer.shadowRoot.querySelector(
        "#configure-labels-modal"
      );

    const finalPayload = { labelConfig: "label data" };

    const spy = sinon.spy();
    configureLabelsModalContainer.addEventListener("modal-submitted", spy);

    configureLabelsModalContainer.dispatchEvent(
      new CustomEvent("modal-submitted", { detail: finalPayload })
    );

    expect(element.payload).to.deep.include(finalPayload);
    expect(spy.calledOnce).to.be.true;
    expect(configureLabelsModal.hasAttribute("open")).to.be.false;
  });
});
