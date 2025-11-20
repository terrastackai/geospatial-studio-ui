/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import "../../../js/components/data-set-factory/configure-labels-modal";

describe("Configure Labels Modal Component", () => {
  it("renders the modal and it's child elements", async () => {
    const el = await fixture(
      "<configure-labels-modal></configure-labels-modal>"
    );
    const shadowRoot = el.shadowRoot;

    const modal = shadowRoot.querySelector("#configure-labels-modal");
    const modalHeader = shadowRoot.querySelector("bx-modal-header");
    const modalBody = shadowRoot.querySelector("bx-modal-body");
    const modalFooter = shadowRoot.querySelector("bx-modal-footer");

    expect(modal).to.exist;
    expect(modalHeader).to.exist;
    expect(modalBody).to.exist;
    expect(modalFooter).to.exist;
  });

  it("checks if the input fields and structured list exist", async () => {
    const el = await fixture(
      "<configure-labels-modal></configure-labels-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const labelSuffixInput = shadowRoot.querySelector("#label-suffix-input");
    const structuredList = shadowRoot.querySelector("bx-structured-list");

    expect(labelSuffixInput).to.exist;
    expect(structuredList).to.exist;
  });

  it("checks if the buttons exist", async () => {
    const el = await fixture(
      "<configure-labels-modal></configure-labels-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const addButton = shadowRoot.querySelector("#add-label-button");
    const cancelButton = shadowRoot.querySelector("#cancel-button");
    const backButton = shadowRoot.querySelector("#back-button");
    const saveLabelButton = shadowRoot.querySelector("#save-button");

    expect(addButton).to.exist;
    expect(cancelButton).to.exist;
    expect(backButton).to.exist;
    expect(saveLabelButton).to.exist;
    expect(el).dom.to.equalSnapshot();
  });

  it("adds a new label entry when the add label button is clicked", async () => {
    const el = await fixture(
      "<configure-labels-modal></configure-labels-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const labelList = shadowRoot.querySelector("bx-structured-list-body");
    const addLabelBtn = shadowRoot.querySelector("#add-label-button");

    expect(labelList.children.length).to.equal(0);
    addLabelBtn.click();
    expect(labelList.children.length).to.equal(1);
  });

  it("validates the form correctly", async () => {
    const el = await fixture(
      "<configure-labels-modal></configure-labels-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const suffixInput = shadowRoot.querySelector("#label-suffix-input");
    const saveButton = shadowRoot.querySelector("#save-button");

    //== Test invalid form ==
    saveButton.click();
    expect(suffixInput.hasAttribute("invalid")).to.be.true;

    //== Test valid form ==
    suffixInput.value = "_suffix";
    saveButton.click();
    expect(suffixInput.hasAttribute("invalid")).to.be.false;
  });
  it("updates pagination correctly when adding labels", async () => {
    const el = await fixture(
      "<configure-labels-modal></configure-labels-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const addLabelButton = shadowRoot.querySelector("#add-label-button");
    const paginationElement = shadowRoot.querySelector("bx-pagination");

    expect(paginationElement.total).to.equal(0);

    addLabelButton.click();
    expect(paginationElement.total).to.equal(1);

    addLabelButton.click();
    expect(paginationElement.total).to.equal(2);
  });

  it("allows editing of label entries", async () => {
    const el = await fixture(
      "<configure-labels-modal></configure-labels-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const addLabelButton = shadowRoot.querySelector("#add-label-button");

    addLabelButton.click();
    const editButton = shadowRoot.querySelector("#edit-button");
    editButton.click();

    const labelIdInput = shadowRoot.querySelector("#label-id bx-input");
    const labelNameInput = shadowRoot.querySelector("#label-name bx-input");
    const labelDescriptionInput = shadowRoot.querySelector(
      "#label-description bx-input"
    );
    const confirmButton = shadowRoot.querySelector("#confirm-button");

    labelIdInput.value = "L1";
    labelNameInput.value = "Label 1";
    labelDescriptionInput.value = "Description 1";
    confirmButton.click();

    const updatedLabelId = shadowRoot.querySelector("#label-id");
    const updatedLabelName = shadowRoot.querySelector("#label-name");
    const updatedLabelDescription =
      shadowRoot.querySelector("#label-description");

    expect(updatedLabelId.textContent.trim()).to.equal("L1");
    expect(updatedLabelName.textContent.trim()).to.equal("Label 1");
    expect(updatedLabelDescription.textContent.trim()).to.equal(
      "Description 1"
    );
  });

  it("allows deletion of label entries", async () => {
    const el = await fixture(
      "<configure-labels-modal></configure-labels-modal>"
    );
    const shadowRoot = el.shadowRoot;
    const addLabelButton = shadowRoot.querySelector("#add-label-button");
    const labelList = shadowRoot.querySelector("bx-structured-list-body");

    addLabelButton.click();
    expect(labelList.children.length).to.equal(1);

    const deleteButton = shadowRoot.querySelector("#delete-button");
    deleteButton.click();
    expect(labelList.children.length).to.equal(0);
  });
});
