/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/button.min.js";

import {
  editIcon,
  shareIcon,
  fineTuneIcon,
  trashIcon,
  demoteIcon,
  modelBuilderIcon,
  dashboardIcon2,
  replicateIcon,
  downloadIcon,
  documentDownloadIcon,
} from "../../icons.js";

const template = () => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    #action-bar-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      column-gap: 1rem;
      row-gap: 1rem;
      flex-wrap: wrap;
      width: 100%;
    }

    #action-bar-container:not([tune]) #try-in-lab-button,
    #action-bar-container:not([tune]) #duplicate-button,
    #action-bar-container:not([tune]) #edit-button,
    #action-bar-container:not([tune]) #logs-button,
    #action-bar-container:not([tune]) #mlflow-button {
      display: none;
    }

    #title {
      margin: 0;
      color: var(--cds-text-01, #f4f4f4);
      font-size: 1.75rem;
      font-weight: 400;
    }

    #actions-container {
      display: flex;
      column-gap: 0.5rem;
      row-gap: 1rem;
      flex-wrap: wrap;
    }

    .icon-button {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 2rem;
      height: 2rem;
      margin: 0;
      padding: 0;
      background: unset;
      border: none;
      border-radius: unset;
      color: var(--cds-ui-05, #f4f4f4);
      cursor: pointer;
    }

    .icon-button:hover {
      background: #ffffff11;
    }

    .icon-button:focus {
      outline: 2px solid var(--cds-ui-05, #f4f4f4);
    }

    .icon-button:disabled {
      opacity: 25%;
      cursor: not-allowed;
    }
  </style>

  <div id="action-bar-container">
    <h1 id="title"></h1>
    <div id="actions-container">
      <button id="duplicate-button" class="icon-button" title="Duplicate">
        ${replicateIcon({ width: 16, height: 16 })}
      </button>
      <button
        id="edit-button"
        class="icon-button"
        title="Edit"
        style="display: none;"
      >
        ${editIcon({ width: 16, height: 16 })}
      </button>
      <button id="logs-button" class="icon-button" title="Download logs">
        ${documentDownloadIcon({ width: 16, height: 16 })}
      </button>
      <button
        id="model-builder-button"
        class="icon-button"
        title="Build model"
        style="display: none;"
      >
        ${modelBuilderIcon({ width: 16, height: 16 })}
      </button>
      <button id="mlflow-button" class="icon-button" title="MLFlow metrics">
        ${dashboardIcon2({ width: 16, height: 16 })}
      </button>
      <button
        id="share-button"
        class="icon-button"
        title="Share"
        style="display: none;"
      >
        ${shareIcon({ width: 16, height: 16 })}
      </button>
      <cds-button id="try-in-lab-button" kind="primary" size="sm">
        Try in Lab ${fineTuneIcon({ width: 16, height: 16, slot: "icon" })}
      </cds-button>
      <cds-button
        id="demote-button"
        kind="secondary"
        size="sm"
        style="display: none;"
      >
        Demote ${demoteIcon({ width: 16, height: 16, slot: "icon" })}
      </cds-button>
      <cds-button id="delete-button" kind="danger-tertiary" size="sm" disabled>
        Delete ${trashIcon({ width: 16, height: 16, slot: "icon" })}
      </cds-button>
    </div>
  </div>
`;

window.customElements.define(
  "model-action-bar",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.positiveStatus = ["Succeeded", "Finished", "COMPLETED"];
    }

    render() {
      this.setDOM(template(this));

      this.actionBarContainer = this.shadow.querySelector(
        "#action-bar-container"
      );
      this.editButton = this.shadow.querySelector("#edit-button");
      this.modelBuilderButton = this.shadow.querySelector(
        "#model-builder-button"
      );
      this.mlFlowButton = this.shadow.querySelector("#mlflow-button");
      this.shareButton = this.shadow.querySelector("#share-button");
      this.tryInLabButton = this.shadow.querySelector("#try-in-lab-button");
      this.demoteButton = this.shadow.querySelector("#demote-button");
      this.deleteButton = this.shadow.querySelector("#delete-button");
      this.duplicateButton = this.shadow.querySelector("#duplicate-button");
      this.logsButton = this.shadow.querySelector("#logs-button");

      this.editButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("edit"));
      });

      this.modelBuilderButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("model-builder"));
      });

      this.mlFlowButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("mlflow"));
      });

      this.shareButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("share"));
      });

      this.tryInLabButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("try-in-lab"));
      });

      this.demoteButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("demote"));
      });

      this.deleteButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("delete"));
      });

      this.duplicateButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("duplicate"));
      });

      this.logsButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("download-logs"));
      });
    }

    setup(model, catalogGroup) {
      this.shadow.querySelector("#title").innerHTML = model.name
        ? model.name
        : model.display_name;

      this.actionBarContainer.setAttribute(`${catalogGroup}`, "");

      if (model.created_by != "system@ibm.com") {
        this.deleteButton.removeAttribute("disabled");
      }

      if (model.status !== "Pending") {
        this.logsButton.setAttribute("disabled", "");
      }

      if (model?.logs?.includes('log') && !["Pending", "Submitted"].includes(model.status)) {
        this.logsButton.removeAttribute("disabled");
      }

      if (
        !model.metrics ||
        model.metrics.length === 0 ||
        "error" in model.metrics[0]
      ) {
        this.mlFlowButton.setAttribute("disabled", "");
      }
    }
  }
);
