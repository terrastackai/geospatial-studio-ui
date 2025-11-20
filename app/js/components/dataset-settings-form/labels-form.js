/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/button.min.js";
import { trashIcon } from "../../icons.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    .display-none {
      display: none;
    }

    #labels-form {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;
    }

    cds-button,
    cds-toggle {
      width: fit-content;
    }

    .layer-form {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;
      padding-right: 1rem;
    }

    cds-structured-list {
      width: 100%;
      margin-bottom: 1rem;
    }

    cds-structured-list-cell {
      width: 30%;
      max-width: 30%;
      vertical-align: bottom !important;
    }

    cds-structured-list-cell:last-child {
      width: 10%;
    }

    cds-number-input {
      display: inline-block;
      min-width: 10rem;
    }

    cds-text-input,
    cds-dropdown {
      width: 100%;
    }

    input[type="color"] {
      width: 100%;
      height: 40px;
      margin-bottom: 0.25rem;
      background: var(--cds-field-01, #f4f4f4);
      border: none;
      border-bottom: 0.0625rem solid var(--cds-ui-04, #8d8d8d);
      border-radius: 0;
      cursor: pointer;
    }

    #labels-structured-list cds-structured-list-cell:nth-child(3) {
      max-width: 40px;
      width: 5%;
    }

    #labels-structured-list cds-structured-list-cell:nth-child(6) {
      max-width: 48px;
      width: 5%;
    }
  </style>

  <div id="labels-form">
    <cds-toggle
      id="label-weights-toggle"
      size="sm"
      label-a="enable label weight"
      label-b="enable label weight"
    ></cds-toggle>
    <cds-button id="add-label-button" kind="tertiary" size="sm"
      >Add label</cds-button
    >
    <cds-structured-list>
      <cds-structured-list-head>
        <cds-structured-list-header-row>
          <cds-structured-list-header-cell>
            Label ID
          </cds-structured-list-header-cell>
          <cds-structured-list-header-cell>
            Label name
          </cds-structured-list-header-cell>
          <cds-structured-list-header-cell>
            Color
          </cds-structured-list-header-cell>
          <cds-structured-list-header-cell>
            Opacity
          </cds-structured-list-header-cell>
          <cds-structured-list-header-cell
            id="label-weights-header-cell"
            class="display-none"
          >
            Weight
          </cds-structured-list-header-cell>
          <cds-structured-list-header-cell>
            Actions
          </cds-structured-list-header-cell>
        </cds-structured-list-header-row>
      </cds-structured-list-head>
      <cds-structured-list-body
        id="labels-structured-list"
      ></cds-structured-list-body>
    </cds-structured-list>
    <cds-pagination
      id="labels-pagination"
      start="0"
      page-size="5"
      total-items="0"
    >
      <cds-select-item value="5">5</cds-select-item>
      <cds-select-item value="10">10</cds-select-item>
      <cds-select-item value="25">25</cds-select-item>
    </cds-pagination>
  </div>
`;

window.customElements.define(
  "labels-form",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.labels = [];
    }

    render() {
      this.setDOM(template(this));

      this.labelWeightsToggle = this.shadow.querySelector(
        "#label-weights-toggle"
      );
      this.addLabelsButton = this.shadow.querySelector("#add-label-button");
      this.labelsStructuredListBody = this.shadow.querySelector(
        "#labels-structured-list"
      );
      this.labelsPagination = this.shadow.querySelector("#labels-pagination");
      this.labelWeightsHeaderCell = this.shadow.querySelector(
        "#label-weights-header-cell"
      );

      this.labelWeightsToggle.addEventListener("cds-toggle-changed", () => {
        this.handleWeightInputs();
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      this.addLabelsButton.addEventListener("click", () => {
        this.addLabel();
        this.handleWeightInputs();
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      this.labelsPagination.addEventListener(
        "cds-pagination-changed-current",
        (e) => {
          if (this.labels.length === 0) {
            return;
          }
          this.updateLabelsStructuredList();
        }
      );

      this.labelsPagination.addEventListener(
        "cds-page-sizes-select-changed",
        (e) => {
          this.updateLabelsStructuredList();
        }
      );
    }

    addExistingLabels(existingLabels) {
      for (let existingLabel of existingLabels) {
        this.addLabel(existingLabel);
      }
    }

    addLabel(existingLabel = null) {
      const label = {
        id: null,
        name: "",
        color: "#000000",
        opacity: 1,
        weight: null,
      };

      if (existingLabel) {
        Object.assign(label, existingLabel);
      }

      const labelTemplate = document.createElement("template");
      labelTemplate.innerHTML = this._renderLabelStructuredListRow(label);
      const labelElement = labelTemplate.content.firstElementChild;

      const labelIdInput = labelElement.querySelector(".label-id-input");
      const labelNameInput = labelElement.querySelector(".label-name-input");
      const colorPicker = labelElement.querySelector(".color-picker");
      const labelOpacityInput = labelElement.querySelector(
        ".label-opacity-input"
      );
      const labelWeightInput = labelElement.querySelector(
        ".label-weight-input"
      );

      const deleteButton = labelElement.querySelector(".delete-button");

      labelIdInput.addEventListener("cds-number-input", () => {
        label.id = labelIdInput.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      labelNameInput.addEventListener("input", () => {
        label.name = labelNameInput.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      colorPicker.addEventListener("input", () => {
        label.color = colorPicker.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      labelOpacityInput.addEventListener("cds-number-input", () => {
        label.opacity = labelOpacityInput.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      labelWeightInput.addEventListener("cds-number-input", () => {
        label.weight = labelWeightInput.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      deleteButton.addEventListener("click", () => {
        label.element.remove();
        const index = this.labels.findIndex((l) => l === label);
        this.labels.splice(index, 1);

        if (
          this.labelsPagination.totalItems - 1 <
            this.labelsPagination.pageSize * (this.labelsPagination.page - 1) +
              1 &&
          this.labelsPagination.page !== 1
        ) {
          this.labelsPagination.page = this.labelsPagination.page - 1;
        }

        this.updateLabelsStructuredList();
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      label["element"] = labelElement;

      this.labels.push(label);

      if (existingLabel && label.weight) {
        this.labelWeightsToggle.checked = true;
      }

      this.handleWeightInputs();

      this.updateLabelsStructuredList();
    }

    updateLabelsStructuredList() {
      this.labelsPagination.setAttribute("total-items", this.labels.length);
      this.labelsPagination.totalPages = Math.ceil(
        this.labels.length / this.labelsPagination.pageSize
      );

      this.labelsStructuredListBody.innerHTML = "";

      let start =
        this.labelsPagination.pageSize * (this.labelsPagination.page - 1);

      let itemsToDisplay = this.labels.slice(
        start,
        start + this.labelsPagination.pageSize
      );

      itemsToDisplay.forEach((label) => {
        this.labelsStructuredListBody.appendChild(label.element);
      });
    }

    handleWeightInputs() {
      if (this.labelWeightsToggle.checked) {
        this.labelWeightsHeaderCell.classList.remove("display-none");
      } else {
        this.labelWeightsHeaderCell.classList.add("display-none");
      }

      this.labels.forEach((label) => {
        const labelWeightInput =
          label.element.querySelector(".label-weight-cell");

        if (this.labelWeightsToggle.checked) {
          labelWeightInput.classList.remove("display-none");
        } else {
          labelWeightInput.classList.add("display-none");
        }
      });
    }

    validateInputs() {
      let labelWeightsTotal = 0;

      for (let label of this.labels) {
        labelWeightsTotal += Number(label.weight);

        if (
          label.id === null ||
          label.name === "" ||
          (this.labelWeightsToggle.checked && label.weight === null)
        ) {
          return false;
        }
      }

      if (
        this.labelWeightsToggle.checked &&
        this.labels.length > 0 &&
        labelWeightsTotal != 1
      ) {
        return false;
      }

      let labelIds = new Set();
      let hasDuplicates = this.labels.some((label) => {
        return labelIds.size === labelIds.add(label.id).size;
      });

      if (hasDuplicates) {
        return false;
      }

      return true;
    }

    submitForm() {
      this.dispatchEvent(
        new CustomEvent("form-submitted", {
          detail: {
            label_categories: this.deepCopy(this.labels),
          },
        })
      );
    }

    deepCopy(obj) {
      if (typeof obj !== "object" || obj === null) {
        return obj;
      }

      const copy = Array.isArray(obj) ? [] : {};

      for (const key of Object.keys(obj)) {
        if (!(obj[key] instanceof Element)) {
          copy[key] = this.deepCopy(obj[key]);
        }
      }

      return copy;
    }

    resetInputs() {
      this.labelWeightsToggle.checked = false;
      this.labels = [];
      this.updateLabelsStructuredList();
    }

    _renderLabelStructuredListRow = (label) => /* HTML */ `
      <cds-structured-list-row>
        <cds-structured-list-cell>
          <cds-number-input
            class="label-id-input"
            step="1"
            value="${label.id}"
            min="0"
            max="10000"
          ></cds-number-input>
        </cds-structured-list-cell>
        <cds-structured-list-cell>
          <cds-text-input
            class="label-name-input"
            value="${label.name}"
          ></cds-text-input>
        </cds-structured-list-cell>
        <cds-structured-list-cell>
          <input class="color-picker" type="color" value="${label.color}" />
        </cds-structured-list-cell>
        <cds-structured-list-cell>
          <cds-number-input
            class="label-opacity-input"
            value="${label.opacity}"
            step="0.01"
            max="1"
            min="0"
          ></cds-number-input>
        </cds-structured-list-cell>
        <cds-structured-list-cell class="label-weight-cell">
          <cds-number-input
            class="label-weight-input"
            value="${label.weight}"
            step="0.01"
            max="1"
            min="0"
          ></cds-number-input>
        </cds-structured-list-cell>
        <cds-structured-list-cell>
          <cds-button kind="danger" class="delete-button"
            >${trashIcon({ slot: "icon" })}</cds-button
          >
        </cds-structured-list-cell>
      </cds-structured-list-row>
    `;
  }
);
