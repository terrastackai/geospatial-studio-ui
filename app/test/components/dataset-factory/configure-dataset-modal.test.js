/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import "../../../js/components/data-set-factory/configure-dataset-modal";

describe("Configure Dataset Modal Component", () => {
  it("renders the modal and its child elements", async () => {
    const el = await fixture(
      "<configure-dataset-modal></configure-dataset-modal>"
    );
    const shadowRoot = el.shadowRoot;

    const modal = shadowRoot.querySelector("#configure-dataset-modal");
    const modalHeader = shadowRoot.querySelector("bx-modal-header");
    const modalBody = shadowRoot.querySelector("bx-modal-body");
    const modalFooter = shadowRoot.querySelector("bx-modal-footer");

    expect(modal).to.exist;
    expect(modalHeader).to.exist;
    expect(modalBody).to.exist;
    expect(modalFooter).to.exist;

    expect(el).dom.to.equalSnapshot();
  });

  it("checks if the input fields and structured list exist", async () => {
    const el = await fixture(
      "<configure-dataset-modal></configure-dataset-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const datasetNameInput = shadowRoot.querySelector("#dataset-name-input");
    const datasetDescriptionInput = shadowRoot.querySelector(
      "#dataset-description-input"
    );
    const dataSuffixInput = shadowRoot.querySelector("#data-suffix-input");
    const structuredList = shadowRoot.querySelector("bx-structured-list");

    expect(datasetNameInput).to.exist;
    expect(datasetDescriptionInput).to.exist;
    expect(dataSuffixInput).to.exist;
    expect(structuredList).to.exist;
  });

  it("checks if the buttons exist", async () => {
    const el = await fixture(
      "<configure-dataset-modal></configure-dataset-modal>"
    );
    const shadowRoot = el.shadowRoot;

    const addButton = shadowRoot.querySelector("#add-band-button");
    const cancelButton = shadowRoot.querySelector("#cancel-button");
    const backButton = shadowRoot.querySelector("#back-button");
    const configureLabelsButton = shadowRoot.querySelector(
      "#configure-labels-button"
    );

    expect(addButton).to.exist;
    expect(cancelButton).to.exist;
    expect(backButton).to.exist;
    expect(configureLabelsButton).to.exist;
  });

  it("adds a new band entry when the add band button is clicked", async () => {
    const el = await fixture(
      "<configure-dataset-modal></configure-dataset-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const bandList = shadowRoot.querySelector("bx-structured-list-body");
    const addBandBtn = shadowRoot.querySelector("#add-band-button");

    expect(bandList.children.length).to.equal(0);

    addBandBtn.click();
    expect(bandList.children.length).to.equal(1);
  });

  it("validates the form correctly", async () => {
    const el = await fixture(
      "<configure-dataset-modal></configure-dataset-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const nameInput = shadowRoot.querySelector("#dataset-name-input");
    const descriptionInput = shadowRoot.querySelector(
      "#dataset-description-input"
    );
    const suffixInput = shadowRoot.querySelector("#data-suffix-input");
    const configureLabelsButton = shadowRoot.querySelector(
      "#configure-labels-button"
    );

    //== Test invalid form ==
    configureLabelsButton.click();
    expect(nameInput.hasAttribute("invalid")).to.be.true;
    expect(descriptionInput.hasAttribute("invalid")).to.be.true;
    expect(suffixInput.hasAttribute("invalid")).to.be.true;

    //== Test valid form ==
    nameInput.value = "Test Dataset";
    descriptionInput.value = "Test Description";
    suffixInput.value = "_suffix";
    configureLabelsButton.click();
    expect(nameInput.hasAttribute("invalid")).to.be.false;
    expect(descriptionInput.hasAttribute("invalid")).to.be.false;
    expect(suffixInput.hasAttribute("invalid")).to.be.false;
  });

  it("dispatches modal-submitted event with correct payload", async () => {
    const el = await fixture(
      "<configure-dataset-modal></configure-dataset-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const nameInput = shadowRoot.querySelector("#dataset-name-input");
    const descriptionInput = shadowRoot.querySelector(
      "#dataset-description-input"
    );
    const suffixInput = shadowRoot.querySelector("#data-suffix-input");
    const configureLabelsButton = shadowRoot.querySelector(
      "#configure-labels-button"
    );

    nameInput.value = "Test Dataset";
    descriptionInput.value = "Test Description";
    suffixInput.value = "_suffix";

    let eventFired = false;
    let eventDetail = null;

    el.addEventListener("modal-submitted", (e) => {
      eventFired = true;
      eventDetail = e.detail;
    });

    configureLabelsButton.click();

    expect(eventFired).to.be.true;
    expect(eventDetail).to.deep.equal({
      dataset_name: "Test Dataset",
      description: "Test Description",
      training_data_suffix: "_suffix",
      custom_bands: [],
    });
  });

  it("updates pagination correctly when adding bands", async () => {
    const el = await fixture(
      "<configure-dataset-modal></configure-dataset-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const addBandButton = shadowRoot.querySelector("#add-band-button");
    const paginationElement = shadowRoot.querySelector("bx-pagination");

    expect(paginationElement.total).to.equal(0);

    addBandButton.click();
    expect(paginationElement.total).to.equal(1);

    addBandButton.click();
    expect(paginationElement.total).to.equal(2);
  });

  it("allows editing of band entries", async () => {
    const el = await fixture(
      "<configure-dataset-modal></configure-dataset-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const addBandButton = shadowRoot.querySelector("#add-band-button");

    addBandButton.click();
    const editButton = shadowRoot.querySelector("#edit-button");
    editButton.click();

    const bandIdInput = shadowRoot.querySelector("#band-id bx-input");
    const bandLabelInput = shadowRoot.querySelector("#band-label bx-input");
    const confirmButton = shadowRoot.querySelector("#confirm-button");

    bandIdInput.value = "B1";
    bandLabelInput.value = "Band 1";
    confirmButton.click();

    const updatedBandId = shadowRoot.querySelector("#band-id");
    const updatedBandLabel = shadowRoot.querySelector("#band-label");

    expect(updatedBandId.textContent.trim()).to.equal("B1");
    expect(updatedBandLabel.textContent.trim()).to.equal("Band 1");
  });

  it("allows deletion of band entries", async () => {
    const el = await fixture(
      "<configure-dataset-modal></configure-dataset-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const addBandButton = shadowRoot.querySelector("#add-band-button");
    const bandList = shadowRoot.querySelector("bx-structured-list-body");

    addBandButton.click();
    expect(bandList.children.length).to.equal(1);

    const deleteButton = shadowRoot.querySelector("#delete-button");
    deleteButton.click();
    expect(bandList.children.length).to.equal(0);
  });
});
