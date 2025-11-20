/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../../webcomponent.js";
import "../../../libs/carbon-web-components/modal.min.js";
import "../../../libs/carbon-web-components/dropdown.min.js";
import "../../../libs/carbon-web-components/text-input.min.js";
import "../../../libs/carbon-web-components/button.min.js";
import "../../../libs/carbon-web-components/inline-loading.min.js";

const template = (obj) => /* HTML */ ` <style>
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

    .input-row {
      display: flex;
      column-gap: 1rem;
      width: 100%;
    }

    cds-dropdown,
    cds-text-input {
      width: 100%;
    }

    cds-button,
    cds-inline-loading {
      width: fit-content;
    }
  </style>

  <section>
    <p>Add files to your project</p>
    <div class="input-row">
      <cds-dropdown
        id="type-dropdown"
        title-text="Type *"
        value="dataset-and-labels"
      >
        <cds-dropdown-item value="dataset-and-labels">
          Dataset & Labels
        </cds-dropdown-item>
      </cds-dropdown>
      <cds-dropdown
        id="purpose-dropdown"
        title-text="Purpose *"
        value="Segmentation"
      >
        <cds-dropdown-item value="Regression">Regression</cds-dropdown-item>
        <cds-dropdown-item value="Segmentation">Segmentation</cds-dropdown-item>
        <cds-dropdown-item value="Generate">Generate</cds-dropdown-item>
        <cds-dropdown-item value="NER">NER</cds-dropdown-item>
        <cds-dropdown-item value="Classify">Classify</cds-dropdown-item>
        <cds-dropdown-item value="Other">Other</cds-dropdown-item>
      </cds-dropdown>
    </div>
    <cds-text-input
      id="url-input"
      placeholder="https://github.com"
      helper-text="Provide URL to access data from"
      label="URL *"
    >
    </cds-text-input>
    <div class="input-row">
      <cds-text-input
        id="training-data-suffix-input"
        helper-text="These suffixes will be applied to the dataset when onboarding, they must be entered in a comma seperated list"
        placeholder="_S2GeodnHand.tif, .rgb.tif"
        label="Training Data Suffixes (comma seperated list) *"
      >
      </cds-text-input>
      <cds-text-input
        id="label-suffix-input"
        placeholder="_LabelHand.tif"
        helper-text="This suffix will be applied to the labels when onboarding"
        label="Label suffix *"
      >
      </cds-text-input>
    </div>
    <div class="input-row">
      <cds-button id="prescan-button" kind="secondary" disabled
        >Pre-scan dataset</cds-button
      >
      <cds-inline-loading status="active" class="display-none">
        Data processing...
      </cds-inline-loading>
    </div>
  </section>`;

window.customElements.define(
  "add-file-form",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.typeDropdown = this.shadow.querySelector("#type-dropdown");
      this.purposeDropdown = this.shadow.querySelector("#purpose-dropdown");
      this.urlInput = this.shadow.querySelector("#url-input");
      this.trainingDataSuffixInput = this.shadow.querySelector(
        "#training-data-suffix-input"
      );
      this.labelSuffixInput = this.shadow.querySelector("#label-suffix-input");
      this.prescanButton = this.shadow.querySelector("#prescan-button");
      this.inlineLoading = this.shadow.querySelector("cds-inline-loading");

      this.resetForm();

      this.typeDropdown.addEventListener("cds-dropdown-selected", () => {
        this.validateInputs();
      });
      this.purposeDropdown.addEventListener("cds-dropdown-selected", () => {
        this.validateInputs();
      });
      this.urlInput.addEventListener("input", () => {
        this.validateInputs();
      });
      this.trainingDataSuffixInput.addEventListener("input", () => {
        this.validateInputs();
      });
      this.labelSuffixInput.addEventListener("input", () => {
        this.validateInputs();
      });
      this.prescanButton.addEventListener("click", () => {
        this.runPrescan();
      });
    }

    validateInputs() {
      let urlValid = this.validateURL();

      if (
        this.typeDropdown.value &&
        this.purposeDropdown.value &&
        urlValid &&
        this.trainingDataSuffixInput.value != "" &&
        this.labelSuffixInput.value != ""
      ) {
        this.prescanButton.removeAttribute("disabled");
        this.dispatchEvent(
          new CustomEvent("form-update", {
            detail: { valid: true },
          })
        );
      } else {
        this.prescanButton.setAttribute("disabled", "");
        this.dispatchEvent(
          new CustomEvent("form-update", {
            detail: { valid: false },
          })
        );
      }
    }

    async runPrescan() {
      this.typeDropdown.setAttribute("disabled", "");
      this.purposeDropdown.setAttribute("disabled", "");
      this.urlInput.setAttribute("disabled", "");
      this.trainingDataSuffixInput.setAttribute("disabled", "");
      this.labelSuffixInput.setAttribute("disabled", "");

      this.inlineLoading.status = "active";
      this.inlineLoading.textContent = "Data processing...";
      this.inlineLoading.classList.remove("display-none");

      const prescanPayload = {
        dataset_url: this.urlInput.value,
        label_suffix: this.labelSuffixInput.value,
        training_data_suffixes: this.trainingDataSuffixInput.value
          .replace(/\s/g, "")
          .split(","),
      };

      try {
        const response = await app.backend.preScanDatasetV2(prescanPayload);

        if (response && !("detail" in response)) {
          this.inlineLoading.status = "finished";
          this.inlineLoading.textContent = "Data processed successfully";

          this.dispatchEvent(
            new CustomEvent("prescan-complete", {
              detail: response,
            })
          );

          app.showMessage("Data processed successfully", "", "success", 5000);
        } else {
          this.prescanButton.removeAttribute("disabled");
          this.inlineLoading.status = "error";
          this.inlineLoading.textContent = "Error processing the data";

          app.showMessage(
            "Failed to process data: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error("Error scanning data:", error);
        app.showMessage(
          "An error occured while scanning the data",
          "",
          "error",
          5000
        );
      }

      this.typeDropdown.removeAttribute("disabled");
      this.purposeDropdown.removeAttribute("disabled");
      this.urlInput.removeAttribute("disabled");
      this.trainingDataSuffixInput.removeAttribute("disabled");
      this.labelSuffixInput.removeAttribute("disabled");
    }

    submitForm() {
      this.dispatchEvent(
        new CustomEvent("form-submitted", {
          detail: {
            purpose: this.purposeDropdown.value,
            dataset_url: this.urlInput.value,
            label_suffix: this.labelSuffixInput.value,
          },
        })
      );
    }

    resetForm() {
      this.typeDropdown.value = "dataset-and-labels";
      this.purposeDropdown.value = "Segmentation";
      this.urlInput.value = "";
      this.trainingDataSuffixInput.value = "";
      this.labelSuffixInput.value = "";
      this.prescanButton.setAttribute("disabled", "");
    }

    validateURL() {
      try {
        new URL(this.urlInput.value);
        return true;
      } catch (error) {
        return false;
      }
    }
  }
);
