/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import "../components/breadcrumb-button.js";
import "../components/model/model-action-bar.js";
import "../components/model/model-information.js";
import { goToUrl } from "../router.js";
import { replaceHttpWithHttps } from "../utils.js";
import "../components/model-catalog/try-out-modal.js";
import "../components/model/model-history-table.js";
import "../components/model/mlflow-graph.js";
import "../components/delete-modal.js";

const template = () => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }

    .display-none {
      display: none;
    }

    * {
      box-sizing: border-box;
    }

    .earth-bg {
      position: fixed;
      width: 100vw;
      height: calc(100vh - 3rem);
      object-fit: cover;
      top: 3rem;
      left: 0;
    }

    .page-content {
      display: flex;
      flex-direction: column;
      row-gap: 2rem;
      color: var(--cds-text-01, #f4f4f4);
      margin: 2rem 4rem 4rem;
      width: calc(100vw - 8rem);
      z-index: 1;
    }

    cds-tile {
      position: relative;
      width: 22rem;
      aspect-ratio: 5 / 6;
      padding: 1rem 1rem 2rem;
      cursor: pointer;
    }

    cds-tile:hover {
      background: var(--cds-ui-03, #393939);
    }

    h4,
    p {
      margin: 0;
      font-size: 1rem;
      font-weight: 400;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    h4 {
      margin-bottom: 1rem;
    }

    p {
      margin-bottom: 1rem;
    }

    img {
      width: 100%;
      aspect-ratio: 3 / 2;
      margin-bottom: 1rem;
      object-fit: cover;
    }

    #graphs-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    mlflow-graph {
      flex: 0 0 calc(50% - 0.5rem);
      max-width: calc(50% - 0.5rem);
    }
  </style>

  <img
    fetchpriority="high"
    class="earth-bg"
    src="/images/Geospatial_Earth_5.jpg"
  />
  <div class="page-content">
    <breadcrumb-button
      breadcrumb-href="model_catalog"
      breadcrumb-text="Model Catalog"
    ></breadcrumb-button>
    <try-out-modal></try-out-modal>
    <delete-modal></delete-modal>
    <model-action-bar></model-action-bar>
    <model-information></model-information>
    <model-history-table></model-history-table>
    <div id="graphs-container">
      <mlflow-graph id="graph-1"></mlflow-graph>
      <mlflow-graph id="graph-2"></mlflow-graph>
    </div>
  </div>
`;

window.customElements.define(
  "model-page",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.model;
      this.catalogGroup;
    }
    render() {
      this.setDOM(template(this));

      this.actionBar = this.shadow.querySelector("model-action-bar");
      this.modelInformation = this.shadow.querySelector("model-information");
      this.tryOutModalV2 = this.shadow.querySelector("try-out-modal");
      this.modelHistoryTable = this.shadow.querySelector("model-history-table");
      this.graph1 = this.shadow.querySelector("#graph-1");
      this.graph2 = this.shadow.querySelector("#graph-2");
      this.deleteModal = this.shadow.querySelector("delete-modal");

      this.tryOutModalV2.addEventListener("modal-submitted", (e) => {
        this.tryOutModalV2.closeModal();
        this.tryInLabV2(e.detail);
      });

      this.actionBar.addEventListener("edit", () => {
        console.log("edit");
      });

      this.actionBar.addEventListener("model-builder", () => {
        console.log("model builder");
      });

      this.actionBar.addEventListener("mlflow", () => {
        if (
          !this.model.metrics ||
          this.model.metrics.length === 0 ||
          "error" in this.model.metrics[0]
        ) {
          return;
        }

        this.model.metrics.forEach((metric) => {
          const url = Object.values(metric)[0];

          window.open("/mlflow/#" + url, "_blank");
        });
      });

      this.actionBar.addEventListener("share", () => {
        console.log("share");
      });

      this.actionBar.addEventListener("try-in-lab", () => {
        this.tryOutModalV2.setTune(this.model);
        this.tryOutModalV2.openModal();
      });

      this.actionBar.addEventListener("demote", () => {
        console.log("demote");
      });

      this.actionBar.addEventListener("delete", () => {
        if (this.model.created_by != "system@ibm.com") {
          this.deleteModal.setup("model", this.model.name, "model");
          this.deleteModal.open();
        }
      });

      this.actionBar.addEventListener("duplicate", () => {
        if (this.catalogGroup === "Tune") {
          goToUrl("#fine_tuning_create?tune_id=" + this.model.id);
        }
      });

      this.actionBar.addEventListener("download-logs", () => {
        if (this.catalogGroup === "Tune" && this.model.status === "Failed") {
          this.getTuneLogs(this.model.id);
        }
      });

      this.deleteModal.addEventListener("confirmed", (e) => {
        if (e.detail.id === "model") {
          this.deleteModel(this.model.id);
        }
      });

      this.deleteModal.addEventListener("cancelled", (e) => {
        this.deleteModal.close();
      });

      this.getModelData();
    }

    getParamsFromURL() {
      const paramsString = window.location.hash.split("?")?.[1]?.toString();
      const params = new URLSearchParams(paramsString);

      this.catalogGroup = params.get("model_type") || "base_model";

      return params.get("id");
    }

    async getModelData() {
      const id = this.getParamsFromURL();

      try {
        let response;

        if (this.catalogGroup === "Tune") {
          response = await app.backend.getTune(id);
        } else if (this.catalogGroup === "Model") {
          response = await app.backend.getModelsV2(1, 0, false, id);
        } else {
          response = await app.backend.getBaseModel(id);
        }

        if (
          "id" in response ||
          (this.catalogGroup === "Model" && "results" in response)
        ) {
          if (this.catalogGroup === "Model") {
            this.model = response.results[0];
          } else {
            this.model = response;
          }

          this.getMlFlowData();
          this.actionBar.setup(this.model, this.catalogGroup);
          this.modelInformation.setupInformation(this.model, this.catalogGroup);
          this.modelHistoryTable.setHistoryTable(
            this.model.id,
            this.catalogGroup
          );
        } else {
          app.showMessage(
            `Failed to load ${this.catalogGroup}: ` +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error(`Error loading ${this.catalogGroup}:`, error);
        app.showMessage(
          `An error occured while loading the ${this.catalogGroup}`,
          "",
          "error",
          5000
        );
      }
    }

    async getMlFlowData() {
      try {
        const response = await app.backend.getTuneMetrics(this.model.id);

        if (!("runs" in response) || response.runs.length === 0) {
          this.graph1.setNoDataState();
          this.graph2.setNoDataState();
        } else if (response.runs.length === 1) {
          this.graph1.setRun(response.runs[0]);
          this.graph2.setNoDataState();
        } else {
          this.graph1.setRun(response.runs[0]);
          this.graph2.setRun(response.runs[1]);
        }
      } catch (error) {
        console.log(error);
      }
    }

    async deleteModel(id) {
      try {
        let response;

        if (this.catalogGroup === "Tune") {
          response = await app.backend.deleteTune(id);
        } else if (this.catalogGroup === "Model") {
          response = await app.backend.deleteModel(id);
        } else {
          return;
        }

        if (response && "success" in response) {
          goToUrl("#model_catalog");

          app.showMessage(
            `${this.catalogGroup} deleted successfully`,
            "",
            "success",
            5000
          );
        } else {
          app.showMessage(
            `Failed to delete ${this.catalogGroup}: ` +
              (response ? response.error : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        app.progress.hide();
        console.error(`Error deleting ${this.catalogGroup}:`, error);
        app.showMessage(
          `An error occured while deleting the ${this.catalogGroup}`,
          "",
          "error",
          5000
        );
      }
    }

    async tryInLabV2(tryInLabPayload) {
      if (tryInLabPayload.tune.created_by === "system@ibm.com") {
        console.log("Shared Tune! Go to inference page!");
        goToUrl("#inference?istryinlab=true&id=" + tryInLabPayload.tune.id);
      } else if (
        tryInLabPayload.isModelSpecAltered ||
        tryInLabPayload.isGeoserverStyleAltered
      ) {
        console.log("Update Tune and go to inference page!");
        const payload = {
          train_options: {
            ...(tryInLabPayload.isModelSpecAltered && {
              model_input_data_spec: tryInLabPayload.model_input_data_spec,
            }),
            ...(tryInLabPayload.isModelSpecAltered && {
              data_connector_config: await this.getDataConnectorConfig(
                tryInLabPayload.model_input_data_spec
              ),
            }),
            ...(tryInLabPayload.isGeoserverStyleAltered && {
              geoserver_push: tryInLabPayload.geoserver_push,
            }),
          },
        };
        this.updateTune(tryInLabPayload.tune.id, payload, true);
      } else {
        console.log("No changes! Go to inference page!");
        goToUrl("#inference?istryinlab=true&id=" + tryInLabPayload.tune.id);
      }
    }

    getDataConnectorConfig = async (model_input_data_spec) => {
      const fetchDataSourcePromises = model_input_data_spec.map(
        async (mids) => {
          const response = await app.backend.getDataSourcesV2(
            25,
            0,
            mids.collection,
            mids.connector
          );
          if (!response?.results?.[0]?.data_connector_config) {
            throw new Error(
              `Error fetching Collection: ${mids.collection} and Connector: ${mids.connector}`
            );
          }
          return response.results[0].data_connector_config;
        }
      );

      const results = await Promise.all(fetchDataSourcePromises);
      return results;
    };

    async updateTune(tuneID, payload, istryinlab = false) {
      try {
        const response = await app.backend.updateTune(tuneID, payload);

        if (response && "message" in response) {
          if (istryinlab) {
            goToUrl("#inference?istryinlab=true&id=" + tuneID);
          } else {
            this.getModelData();
          }
          app.showMessage("Tune successfully updated", "", "success", 5000);
        } else {
          app.showMessage(
            "Failed to update tune: " +
              (response?.error ? response.error : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (e) {
        console.error("Error updating tune:", e);
        app.showMessage(
          "An error occured while updating the tune",
          "",
          "error",
          5000
        );
      }
    }

    async getTuneLogs(id) {
      try {
        const response = await app.backend.getTune(id);

        if ("logs_presigned_url" in response) {
          window.open(
            replaceHttpWithHttps(response.logs_presigned_url),
            "_blank"
          );
        } else if ("id" in response) {
          app.showMessage(
            "There are no logs available for this tune: ",
            "",
            "error",
            5000
          );
        } else {
          app.showMessage(
            "Failed to get tune logs: " +
              (response ? response.error : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        app.progress.hide();
        console.error("Error getting tune logs:", error);
        app.showMessage(
          "An error occured while getting tune logs",
          "",
          "error",
          5000
        );
      }
    }
  }
);
