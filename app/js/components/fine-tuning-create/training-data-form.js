/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/link.min.js";
import "../../libs/carbon-web-components/combo-box.min.js";
import "../../libs/carbon-web-components/inline-loading.min.js";
import "../../libs/carbon-web-components/radio-button.min.js";
import "../../libs/carbon-web-components/tabs.min.js";
import "../dataset-settings-form/data-sources-form.js";
import "../dataset-settings-form/labels-form.js";
import { launchIcon } from "../../icons.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    .display-none {
      display: none;
    }

    #training-data-form-container {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
      width: 100%;
      height: 100%;
      padding-bottom: 4rem;
    }

    h2 {
      font-weight: 400;
      margin: 0;
      line-height: 3rem;
    }

    p {
      font-weight: 400;
      margin: 0;
    }

    cds-combo-box::part(menu-body) {
      outline: 1px solid white;
    }

    #dataset-description-container {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: var(--cds-layer-active-02, #6f6f6f);
      border-radius: 4px;
      color: var(--cds-text-primary, #f4f4f4);
      font-size: var(--cds-body-short-01-font-size, 0.875rem);
      font-weight: var(--cds-body-short-01-font-weight, 400);
    }

    cds-link svg {
      margin-left: 2px;
      align-self: center;
    }

    cds-link:hover svg {
      filter: saturate(75%) brightness(1.1);
    }

    cds-link:hover svg {
      filter: saturate(75%) brightness(1.1);
    }

    #dataset-input {
      margin-top: 0.5rem;
    }
  </style>

  <div id="training-data-form-container">
    <h2>Provide your training data</h2>
    <p>
      Select an existing dataset for customising your model. You can also
      explore and manage datasets that you have uploaded in the
      <cds-link href="/#data_catalog">Data Catalog.</cds-link>
    </p>
    <cds-link href="/docs/tuning-studio/#select-your-dataset" target="_blank">
      View documentation ${launchIcon({ width: 16, height: 16 })}
    </cds-link>

    <cds-inline-loading status="active">
      Loading datasets...
    </cds-inline-loading>

    <cds-combo-box title-text="Dataset (required)" id="dataset-input" disabled>
    </cds-combo-box>
    <div id="dataset-description-container" class="display-none">
      <span>Description:</span>
      <span id="dataset-description"> </span>
    </div>
    <cds-tabs value="data-source">
      <cds-tab id="tab-dataSource" target="panel-dataSource" value="data-source"
        >Data Sources</cds-tab
      >
      <cds-tab id="tab-label" target="panel-label" value="label"
        >Labels</cds-tab
      >
    </cds-tabs>
    <div id="panel-dataSource" role="tabpanel" aria-labelledby="tab-dataSource">
      <data-sources-form></data-sources-form>
    </div>
    <div id="panel-label" role="tabpanel" aria-labelledby="tab-label" hidden>
      <labels-form></labels-form>
    </div>
  </div>
`;

window.customElements.define(
  "training-data-form",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.payloadContribution = {
        dataset_id: null,
      };

      this.datasetSettings = {};

      this.reviewFormDataContribution = {
        dataset_name: null,
      };

      this.datasets = [];
      this.prePopulatedDatasetId = null;
      this.duplicateTune = null;
    }

    render() {
      this.setDOM(template(this));

      this.datasetInput = this.shadow.querySelector("#dataset-input");
      this.tabs = this.shadow.querySelector("cds-tabs");
      this.dataSourcesForm = this.shadow.querySelector("data-sources-form");
      this.labelsForm = this.shadow.querySelector("labels-form");

      this.tabs.addEventListener("cds-tabs-selected", (e) => {
        this.handleTabChange(e.detail.item.target);
      });

      //=== Add Input Event Listeners ===//

      this.datasetInput.addEventListener("cds-combo-box-selected", (e) => {
        this.setDescription(e.target.value);

        if (e.target.value) {
          this.getDataset(e.target.value);
        }

        this.dispatchEvent(
          new CustomEvent("form-validated", {
            detail: this.validateForm(),
          })
        );
      });

      this.dataSourcesForm.addEventListener("form-updated", () => {
        this.dispatchEvent(
          new CustomEvent("form-validated", { detail: this.validateForm() })
        );
      });

      this.labelsForm.addEventListener("form-updated", () => {
        this.dispatchEvent(
          new CustomEvent("form-validated", { detail: this.validateForm() })
        );
      });

      this.dataSourcesForm.addEventListener("form-submitted", (e) => {
        this.datasetSettings.data_sources = e.detail.data_sources;
      });

      this.labelsForm.addEventListener("form-submitted", (e) => {
        this.datasetSettings.label_categories = e.detail.label_categories;
      });
    }

    handleTabChange(targetPanelId) {
      const panels = this.shadow.querySelectorAll('[role="tabpanel"]');
      panels.forEach((panel) => panel.setAttribute("hidden", ""));

      let panel = this.shadow.querySelector(`#${targetPanelId}`);
      if (panel) {
        panel.removeAttribute("hidden");
      }
    }

    async getDataset(id) {
      this.dataSourcesForm.resetInputs();
      this.labelsForm.resetInputs();
      this.dataSourcesForm.classList.add("display-none");
      this.labelsForm.classList.add("display-none");
      try {
        const response = await app.backend.getDatasetV2(id);

        if ("id" in response) {
          for (let dataSource of response.data_sources) {
            this.dataSourcesForm.addDataSource(dataSource);
          }

          this.labelsForm.addExistingLabels(response.label_categories);

          this.dispatchEvent(
            new CustomEvent("form-validated", {
              detail: this.validateForm(),
            })
          );

          this.dataSourcesForm.classList.remove("display-none");
          this.labelsForm.classList.remove("display-none");
        } else {
          app.showMessage(
            "Failed to load dataset: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error("Error loading dataset:", error);
        app.showMessage(
          "An error occured while loading the dataset",
          "",
          "error",
          5000
        );
      }
    }

    setDescription(id) {
      const descriptionContainer = this.shadow.querySelector(
        "#dataset-description-container"
      );
      const description = this.shadow.querySelector("#dataset-description");

      for (let dataset of this.datasets) {
        if (dataset.id === id) {
          descriptionContainer.classList.remove("display-none");
          description.innerHTML = dataset.description;
          return;
        }
      }

      descriptionContainer.classList.add("display-none");
      description.innerHTML = "";
    }

    handleFormSubmission() {
      this.payloadContribution.dataset_id = this.datasetInput.value;

      for (let dataset of this.datasets) {
        if (dataset.id === this.payloadContribution.dataset_id) {
          this.reviewFormDataContribution.dataset_name = dataset.dataset_name;
          break;
        }
      }

      this.dataSourcesForm.submitForm();
      this.labelsForm.submitForm();

      this.dispatchEvent(
        new CustomEvent("form-submitted", {
          detail: {
            datasetSettings: this.datasetSettings,
            payload: this.payloadContribution,
            reviewFormData: this.reviewFormDataContribution,
          },
        })
      );
    }

    validateForm() {
      return (
        this.datasetInput.value != "" &&
        this.dataSourcesForm.validateInputs() &&
        this.labelsForm.validateInputs()
      );
    }

    async setupTrainingDataForm(purpose) {
      const inlineLoading = this.shadow.querySelector("cds-inline-loading");

      inlineLoading.classList.remove("display-none");
      this.datasetInput.setAttribute("disabled", "");
      this.datasetInput.value = "";
      this.datasetInput._handleUserInitiatedClearInput();
      this.dataSourcesForm.resetInputs();
      this.labelsForm.resetInputs();
      this.dataSourcesForm.classList.add("display-none");
      this.labelsForm.classList.add("display-none");

      try {
        let response;
        response = await app.backend.getDatasetV2Identities(purpose);

        if (response?.["results"]) {
          this.datasets = response["results"];

          this.setupComboBox();

          inlineLoading.classList.add("display-none");
          this.datasetInput.removeAttribute("disabled", "");

          if (this.prePopulatedDatasetId) {
            this.preSelectDataset();
          }

          if (this.duplicateTune) {
            this.duplicateTuneDataset();
          }

          return;
        } else {
          app.showMessage(
            "Failed to get datasets: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        app.progress.hide();
        console.error("Error loading datasets:", error);
        app.showMessage(
          "An error occured while loading the datasets",
          "",
          "error",
          5000
        );
      }

      inlineLoading.status = "error";
      inlineLoading.textContent = "Loading failed";
    }

    duplicateTuneDataset = async () => {
      const response = await app.backend.getDatasetV2(
        this.duplicateTune?.dataset_id
      );
      if (!("id" in response)) return;
      this.datasetInput.value = this.duplicateTune?.dataset_id;
      this.datasetInput.setAttribute("disabled", "");

      this.dataSourcesForm.resetInputs();
      this.labelsForm.resetInputs();
      this.dataSourcesForm.classList.add("display-none");
      this.labelsForm.classList.add("display-none");

      if (
        this.duplicateTune?.train_options?.model_input_data_spec &&
        this.duplicateTune?.train_options?.label_categories
      ) {
        for (let dataSource of this.duplicateTune.train_options
          .model_input_data_spec) {
          this.dataSourcesForm.addDataSource(dataSource);
        }

        this.labelsForm.addExistingLabels(
          this.duplicateTune.train_options.label_categories
        );

        this.dispatchEvent(
          new CustomEvent("form-validated", {
            detail: this.validateForm(),
          })
        );

        this.dataSourcesForm.classList.remove("display-none");
        this.labelsForm.classList.remove("display-none");
      } else {
        this.getDataset(this.duplicateTune?.dataset_id);
      }

      this.dispatchEvent(
        new CustomEvent("form-validated", {
          detail: this.validateForm(),
        })
      );
    };

    preSelectDataset() {
      this.datasetInput.value = this.prePopulatedDatasetId;
      this.datasetInput.setAttribute("disabled", "");

      this.getDataset(this.prePopulatedDatasetId);

      this.dispatchEvent(
        new CustomEvent("form-validated", {
          detail: this.validateForm(),
        })
      );
    }

    setPrePopulatedDatasetId(prePopulatedDatasetId) {
      this.prePopulatedDatasetId = prePopulatedDatasetId;
    }

    setDuplicateTune = (tune) => {
      this.duplicateTune = tune;
    };

    setupComboBox() {
      this.setDescription();
      this.datasetInput.innerHTML = "";
      this.datasets.forEach((dataset) => {
        this.datasetInput.innerHTML += this.__renderComboBoxItem(dataset);
      });
    }

    __renderComboBoxItem = (dataset) => /* HTML */ `
      <cds-combo-box-item value="${dataset.id}"
        >${dataset.dataset_name}</cds-combo-box-item
      >
    `;
  }
);
