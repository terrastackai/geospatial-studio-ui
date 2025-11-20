/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../../webcomponent.js";
import "../../../libs/carbon-web-components/modal.min.js";
import "../../../libs/carbon-web-components/text-input.min.js";
import "../../../libs/carbon-web-components/dropdown.min.js";
import "../../../libs/carbon-web-components/button.min.js";
import "../../../libs/carbon-web-components/accordion.min.js";
import "../../../libs/carbon-web-components/structured-list.min.js";
import "../../../libs/carbon-web-components/number-input.min.js";
import "../../../libs/carbon-web-components/pagination.min.js";

import "../../dataset-settings-form/data-sources-form.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    .display-none {
      display: none;
    }

    section {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;
    }

    cds-text-input,
    cds-dropdown {
      width: 100%;
    }

    cds-button {
      width: fit-content;
    }

    #data-sources-container {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .data-source-form {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;
    }

    .label-text {
      margin: 0;
      color: var(--cds-text-02, #525252);
      font-size: var(--cds-label-01-font-size, 0.75rem);
      font-weight: 400;
      line-height: 1rem;
      letter-spacing: var(--cds-label-01-letter-spacing, 0.32px);
    }

    cds-accordion,
    cds-accordion-item {
      width: 100%;
    }

    cds-accordion-item::part(content) {
      padding-right: 1rem !important;
    }

    cds-structured-list {
      width: 100%;
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

    .band-name-dropdown {
      display: inline-block;
      max-width: 20rem;
    }
  </style>

  <section>
    <p>Add more details to your dataset, such as bands</p>
    <cds-text-input
      id="dataset-name-input"
      placeholder="Dataset name"
      label="Dataset name *"
    >
    </cds-text-input>
    <cds-text-input
      id="dataset-description-input"
      placeholder="Dataset description"
      label="Dataset description *"
    >
    </cds-text-input>
    <data-sources-form></data-sources-form>
  </section>
`;

window.customElements.define(
  "configure-dataset-form",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.collections = [];
      this.dataSources = [];
    }

    render() {
      this.setDOM(template(this));

      this.datasetNameInput = this.shadow.querySelector("#dataset-name-input");
      this.datasetDescriptionInput = this.shadow.querySelector(
        "#dataset-description-input"
      );
      this.dataSourcesForm = this.shadow.querySelector("data-sources-form");

      this.datasetNameInput.addEventListener("input", () => {
        this.validateInputs();
      });

      this.datasetDescriptionInput.addEventListener("input", () => {
        this.validateInputs();
      });

      this.dataSourcesForm.addEventListener("form-updated", () => {
        this.validateInputs();
      });

      this.dataSourcesForm.addEventListener("form-submitted", (e) => {
        this.dispatchEvent(
          new CustomEvent("form-submitted", {
            detail: {
              dataset_name: this.datasetNameInput.value,
              description: this.datasetDescriptionInput.value,
              data_sources: e.detail.data_sources,
            },
          })
        );
      });
    }

    submitForm() {
      this.dataSourcesForm.submitForm();
    }

    resetForm() {
      this.datasetNameInput.value = "";
      this.datasetDescriptionInput.value = "";

      this.dataSourcesForm.resetInputs();
    }

    validateInputs() {
      if (
        this.datasetNameInput.value === "" ||
        this.datasetDescriptionInput.value === ""
      ) {
        this.dispatchEvent(
          new CustomEvent("form-update", {
            detail: { valid: false },
          })
        );
        return;
      }

      if (this.dataSourcesForm.validateInputs()) {
        this.dispatchEvent(
          new CustomEvent("form-update", {
            detail: { valid: true },
          })
        );
      } else {
        this.dispatchEvent(
          new CustomEvent("form-update", {
            detail: { valid: false },
          })
        );
      }
    }

    setPreScannedDataSources(preScannedDataSources) {
      this.dataSourcesForm.addPreScannedDataSources(preScannedDataSources);
    }
  }
);
