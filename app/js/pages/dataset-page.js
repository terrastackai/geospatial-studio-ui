/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import "../components/breadcrumb-button.js";
import "../components/dataset/dataset-action-bar.js";
import "../components/dataset/dataset-information.js";
import "../components/dataset/dataset-preview-panel.js";
import { goToUrl } from "../router.js";
import { replaceHttpWithHttps } from "../utils.js";
import "../components/delete-modal.js";
import "../components/refresh-timer.js";

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

    refresh-timer {
      align-self: flex-end;
    }
  </style>

  <img
    fetchpriority="high"
    class="earth-bg"
    src="/images/Geospatial_Earth_5.jpg"
  />
  <div class="page-content">
    <breadcrumb-button
      breadcrumb-href="data_catalog"
      breadcrumb-text="Data Catalog"
    ></breadcrumb-button>
    <delete-modal></delete-modal>
    <refresh-timer></refresh-timer>
    <dataset-action-bar></dataset-action-bar>
    <dataset-information></dataset-information>
    <dataset-preview-panel></dataset-preview-panel>
  </div>
`;

window.customElements.define(
  "dataset-page",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.datasetObject;
    }

    render() {
      this.setDOM(template(this));

      this.deleteModal = this.shadow.querySelector("delete-modal");
      this.datasetActionBar = this.shadow.querySelector("dataset-action-bar");
      this.datasetInformation = this.shadow.querySelector(
        "dataset-information"
      );
      this.datasetPreviewPanel = this.shadow.querySelector(
        "dataset-preview-panel"
      );
      this.refreshTimer = this.shadow.querySelector("refresh-timer");

      //=== Attach Dataset Action Bar Event Listeners ===
      this.deleteModal.addEventListener("confirmed", (e) => {
        if (e.detail.id === "dataset") {
          this.deleteDataset();
        }
      });

      this.deleteModal.addEventListener("cancelled", (e) => {
        this.deleteModal.close();
      });

      this.datasetActionBar.addEventListener("edit", () => {
        console.log("edit");
      });

      this.datasetActionBar.addEventListener("download", () => {
        this.getDatasetLogs(this.datasetObject.id);
      });

      this.datasetActionBar.addEventListener("share", () => {
        console.log("share");
      });

      this.datasetActionBar.addEventListener("fine-tune", () => {
        goToUrl(
          "#fine_tuning_create?id=" +
            this.datasetObject.id +
            "&purpose=" +
            this.datasetObject.purpose
        );
      });

      this.datasetActionBar.addEventListener("delete", () => {
        if (this.datasetObject.created_by != "system@ibm.com") {
          this.deleteModal.setup(
            "dataset",
            this.datasetObject.dataset_name,
            "dataset"
          );
          this.deleteModal.open();
        }
      });

      this.datasetPreviewPanel.addEventListener("image-index-changed", (e) => {
        this.datasetActionBar.setTitle(e.detail);
      });

      this.refreshTimer.addEventListener("refresh", () => {
        this.loadDataset();
      });

      this.datasetId = this.getDatasetIdFromSearchParams();
      this.loadDataset();
    }

    getDatasetIdFromSearchParams() {
      const paramsString = window.location.hash.split("?")?.[1]?.toString();
      const params = new URLSearchParams(paramsString);

      let id = params.get("id");

      if (id) {
        id = id.split("%20").join(" ");
      }

      return id;
    }

    async loadDataset() {
      try {
        const response = await app.backend.getDatasetV2(this.datasetId);

        if ("id" in response) {
          this.datasetObject = response;

          this.datasetActionBar.setup(this.datasetObject);
          this.datasetInformation.setupInformation(this.datasetObject);

          if (response.status === "Succeeded") {
            this.getSampleData();
          } else {
            this.datasetPreviewPanel.showEmptyState();
          }
          this.refreshTimer.stopAutoRefresh();
          this.refreshTimer.startAutoRefresh();
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

    async getSampleData() {
      try {
        let response = await app.backend.getSampleGeodata(this.datasetId);

        if ("dataset_name" in response) {
          const processedData = this.getProcessesImagesAndLabels(
            response.sample_images,
            response.sample_label
          );

          const dataObject = {
            bands: response.custom_bands,
            images: processedData[0],
            labels: processedData[1],
          };

          this.datasetPreviewPanel.setData(dataObject);
        } else {
          this.datasetPreviewPanel.showEmptyState();
          app.showMessage(
            "Failed to load preview: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error("Error loading sample data:", error);
        app.showMessage(
          "An error occured while loading the preview",
          "",
          "error",
          5000
        );
      }
    }

    getProcessesImagesAndLabels(images, labels) {
      let processedImages = [];
      let processedLabels = [];

      images.forEach((image, idx) => {
        let splitString = image.split("training_data/")[1].split("_");

        const fileName = splitString[0] + "_" + splitString[1];

        const imageObject = {
          name: fileName,
          url: image,
          opacity: 1,
          type: "image",
          id: fileName + "_image",
        };

        const labelObject = {
          name: fileName,
          url: labels[idx],
          opacity: 1,
          type: "label",
          id: fileName + "_label",
        };

        processedImages.push(imageObject);
        processedLabels.push(labelObject);
      });

      return [processedImages, processedLabels];
    }

    async deleteDataset() {
      try {
        app.progress.show();
        const response = await app.backend.deleteDataset(this.datasetId);
        app.progress.hide();

        if (!response.detail) {
          app.showMessage("Dataset deleted successfully", "", "success", 5000);
          goToUrl("#data_catalog");
        } else {
          app.showMessage(
            "Failed to delete dataset: " +
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
        console.error("Error deleting dataset:", error);
        app.showMessage(
          "An error occured while deleting the dataset",
          "",
          "error",
          5000
        );
      }
    }

    async getDatasetLogs(id) {
      try {
        const response = await app.backend.getDatasetV2(id);

        if ("logs_presigned_url" in response && response.logs_presigned_url) {
          window.open(
            replaceHttpWithHttps(response.logs_presigned_url),
            "_blank"
          );
        } else if ("id" in response) {
          app.showMessage(
            "There are no logs available for this dataset: ",
            "",
            "error",
            5000
          );
        } else {
          app.showMessage(
            "Failed to get dataset logs: " +
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
        console.error("Error getting dataset logs:", error);
        app.showMessage(
          "An error occured while getting dataset logs",
          "",
          "error",
          5000
        );
      }
    }
  }
);
