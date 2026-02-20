/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/button.min.js";
import {
  editIcon,
  downloadIcon,
  shareIcon,
  fineTuneIcon,
  trashIcon,
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
      <button
        id="edit-button"
        class="icon-button"
        title="Edit"
        style="display: none;"
      >
        ${editIcon({ width: 16, height: 16 })}
      </button>
      <button
        id="download-button"
        class="icon-button"
        title="Download"
        disabled
      >
        ${documentDownloadIcon({ width: 16, height: 16 })}
      </button>
      <button
        id="share-button"
        class="icon-button"
        title="Share"
        style="display: none;"
      >
        ${shareIcon({ width: 16, height: 16 })}
      </button>
      <cds-button id="fine-tune-button" kind="primary" size="sm" disabled>
        Fine tune ${fineTuneIcon({ width: 16, height: 16, slot: "icon" })}
      </cds-button>
      <cds-button id="delete-button" kind="danger-tertiary" size="sm" disabled>
        Delete ${trashIcon({ width: 16, height: 16, slot: "icon" })}
      </cds-button>
    </div>
  </div>
`;

window.customElements.define(
  "dataset-action-bar",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.editButton = this.shadow.querySelector("#edit-button");
      this.downloadButton = this.shadow.querySelector("#download-button");
      this.shareButton = this.shadow.querySelector("#share-button");
      this.fineTuneButton = this.shadow.querySelector("#fine-tune-button");
      this.deleteButton = this.shadow.querySelector("#delete-button");

      this.editButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("edit"));
      });

      this.downloadButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("download"));
      });

      this.shareButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("share"));
      });

      this.fineTuneButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("fine-tune"));
      });

      this.deleteButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("delete"));
      });
    }

    setup(datasetObject) {
      this.shadow.querySelector("#title").innerHTML =
        datasetObject.dataset_name;

      if (datasetObject.created_by != "system@ibm.com") {
        this.deleteButton.removeAttribute("disabled");
      }

      if (datasetObject.status === "Succeeded") {
        this.fineTuneButton.removeAttribute("disabled");
      }

      if (datasetObject.status !== "Pending") {
        this.downloadButton.removeAttribute("disabled");
      }
    }
  }
);
