/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/modal.min.js";
import "../../libs/carbon-web-components/inline-loading.min.js";
import "../../libs/carbon-web-components/tabs.min.js";
import "../dataset-settings-form/data-sources-form.js";
import "../dataset-settings-form/layers-form.js";
import { launchIcon } from "../../icons.js";

const template = (obj) => /* HTML */ `
  <style>
    cds-modal {
      top: 3rem;
      max-height: calc(100% - 3rem);
      background-color: #000000cc;
    }

    cds-modal-body {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      min-height: 16rem;
      padding-right: 1rem;
    }

    .display-none {
      display: none;
    }

    /* Don't remove */
    .tabs-container {
      min-height: 2.5rem;
    }
  </style>

  <cds-modal size="lg" prevent-close-on-click-outside>
    <cds-modal-header>
      <cds-modal-close-button></cds-modal-close-button>
      <cds-modal-heading>Trying your tune in the lab</cds-modal-heading>
    </cds-modal-header>
    <cds-modal-body>
      <p>
        Configure your tune for trying out in Inference Lab
        <cds-link
          href="/docs/tuning-studio/#trying-your-tune-in-the-lab"
          target="_blank"
        >
          View documentation ${launchIcon({ width: 16, height: 16 })}
        </cds-link>
      </p>

      <cds-inline-loading status="active">
        Loading tune ...
      </cds-inline-loading>
      <div class="tabs-container">
        <cds-tabs value="data-source">
          <cds-tab
            id="tab-dataSource"
            target="panel-dataSource"
            value="data-source"
            >Data Sources</cds-tab
          >
          <cds-tab id="tab-layer" target="panel-layer" value="layer"
            >Layers</cds-tab
          >
        </cds-tabs>
      </div>
      <div
        id="panel-dataSource"
        role="tabpanel"
        aria-labelledby="tab-dataSource"
      >
        <data-sources-form></data-sources-form>
      </div>
      <div id="panel-layer" role="tabpanel" aria-labelledby="tab-layer" hidden>
        <layers-form></layers-form>
      </div>
    </cds-modal-body>
    <cds-modal-footer>
      <cds-modal-footer-button
        id="cancel-button"
        kind="secondary"
        data-modal-close
        >Cancel</cds-modal-footer-button
      >
      <cds-modal-footer-button kind="primary" id="save-button"
        >Try Out</cds-modal-footer-button
      >
    </cds-modal-footer>
  </cds-modal>
`;

window.customElements.define(
  "try-out-modal",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.tune = {};
      this.payload = {};
    }

    render() {
      this.setDOM(template(this));

      this.modal = this.shadow.querySelector("cds-modal");
      this.tabs = this.shadow.querySelector("cds-tabs");

      this.dataSourcesForm = this.shadow.querySelector("data-sources-form");
      this.layersForm = this.shadow.querySelector("layers-form");
      this.inlineLoading = this.shadow.querySelector("cds-inline-loading");
      this.saveButton = this.shadow.querySelector("#save-button");
      this.cancelButton = this.shadow.querySelector("#cancel-button");

      this.tabs.addEventListener("cds-tabs-selected", (e) => {
        this.handleTabChange(e.detail.item.target);
      });

      this.dataSourcesForm.addEventListener("form-updated", () => {
        this.validateModal();
      });

      this.layersForm.addEventListener("form-updated", () => {
        this.validateModal();
      });

      this.dataSourcesForm.addEventListener("form-submitted", (e) => {
        this.payload.data_sources = e.detail.data_sources;
      });

      this.layersForm.addEventListener("form-submitted", (e) => {
        this.payload.layers = e.detail.layers;
      });

      this.saveButton.addEventListener("click", () => {
        this.dataSourcesForm.submitForm();
        this.layersForm.submitForm();
        this.submitForm();
      });

      this.cancelButton.addEventListener("click", () => {});
    }

    submitForm() {
      const trainOptionsDeepCopy = JSON.parse(
        JSON.stringify(this.tune.train_options)
      );

      trainOptionsDeepCopy.geoserver_push = this.payload.layers;

      trainOptionsDeepCopy.model_input_data_spec = this.payload.data_sources;

      this.dispatchEvent(
        new CustomEvent("modal-submitted", {
          detail: {
            tune: this.tune,
            isModelSpecAltered:
              JSON.stringify(trainOptionsDeepCopy.model_input_data_spec) !==
              JSON.stringify(this.tune.train_options.model_input_data_spec),
            isGeoserverStyleAltered:
              JSON.stringify(trainOptionsDeepCopy.geoserver_push) !==
              JSON.stringify(this.tune.train_options.geoserver_push),
            model_input_data_spec: trainOptionsDeepCopy.model_input_data_spec,
            geoserver_push: trainOptionsDeepCopy.geoserver_push,
          },
        })
      );
    }

    handleTabChange(targetPanelId) {
      const panels = this.shadow.querySelectorAll('[role="tabpanel"]');
      panels.forEach((panel) => panel.setAttribute("hidden", ""));

      let panel = this.shadow.querySelector(`#${targetPanelId}`);
      if (panel) {
        panel.removeAttribute("hidden");
      }
    }

    async setTune(tune) {
      this.dataSourcesForm.classList.add("display-none");
      this.layersForm.classList.add("display-none");
      this.inlineLoading.classList.remove("display-none");

      this.tune = await app.backend.getTune(tune.id);

      if (this.tune.train_options) {
        if (this.tune.train_options.model_input_data_spec) {
          for (let dataSource of this.tune.train_options
            .model_input_data_spec) {
            this.dataSourcesForm.addDataSource(dataSource);
          }
        }
        if (this.tune.train_options.geoserver_push) {
          this.layersForm.setupLayers(this.tune.train_options.geoserver_push);
        }
      }

      this.validateModal();
      this.dataSourcesForm.classList.remove("display-none");
      this.layersForm.classList.remove("display-none");
      this.inlineLoading.classList.add("display-none");
    }

    validateModal() {
      if (
        this.dataSourcesForm.validateInputs() &&
        this.layersForm.validateInputs()
      ) {
        this.saveButton.removeAttribute("disabled");
      } else {
        this.saveButton.setAttribute("disabled", "");
      }
    }

    resetForm() {
      this.tune = {};
      this.payload = {};
      this.dataSourcesForm.resetInputs();
      this.layersForm.resetInputs();
    }

    openModal() {
      this.modal.setAttribute("open", "");
      this.resetForm();
    }

    closeModal() {
      this.modal.removeAttribute("open");
      this.resetForm();
    }
  }
);
