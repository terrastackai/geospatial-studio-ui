/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/data-table.min.js";
import "../../libs/carbon-web-components/pagination.min.js";
import {
  errorStatusIcon,
  readyStatusIcon,
  progressStatusIcon,
  completedWithErrorsStatusIcon,
  stopStatusIcon,
  partiallyCompletedStatusIcon,
  pendingStatusIcon,
} from "../../icons.js";
import * as util from "../../utils.js";
import { goToUrl } from "../../router.js";

const template = () => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    #table-container {
      padding: 1rem 1rem;
      background: #262626;
    }

    h1 {
      font-size: 1.25rem;
      font-weight: 400;
      margin-left: 1rem;
    }

    h4 {
      font-weight: 400;
      margin-left: 1rem;
    }

    .svg-cell span {
      display: flex;
      align-items: center;
      column-gap: 0.5rem;
    }

    #table-overflow-wrapper {
      overflow: auto;
    }

    cds-table-row {
      cursor: pointer;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--cds-button-secondary);
    }
  </style>

  <div id="table-container">
    <h1>History</h1>
    <div id="no-data-template" style="display: none;">
      <cds-table-row>
        <div class="no-data">
          <svg
            focusable="false"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            width="60"
            height="60"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path
              d="M8 18H12V20H8zM14 18H18V20H14zM8 14H12V16H8zM14 22H18V24H14zM20 14H24V16H20zM20 22H24V24H20z"
            ></path>
            <path
              d="M27,3H5A2.0025,2.0025,0,0,0,3,5V27a2.0025,2.0025,0,0,0,2,2H27a2.0025,2.0025,0,0,0,2-2V5A2.0025,2.0025,0,0,0,27,3Zm0,2,0,4H5V5ZM5,27V11H27l0,16Z"
            ></path>
            <title>History Table</title>
          </svg>
          <h4>No History found!</h4>
        </div>
      </cds-table-row>
    </div>
    <div id="skeleton-wrapper">
      <cds-table-skeleton column-count="5" row-count="5" show-header="">
      </cds-table-skeleton>
    </div>
    <div id="table-wrapper" style="display: none;">
      <div id="table-overflow-wrapper">
        <cds-table sort>
          <cds-table-head>
            <cds-table-header-row>
              <cds-table-header-cell>Name:</cds-table-header-cell>
              <cds-table-header-cell>Location:</cds-table-header-cell>
              <cds-table-header-cell>Created on:</cds-table-header-cell>
              <cds-table-header-cell>Created by:</cds-table-header-cell>
              <cds-table-header-cell>Status:</cds-table-header-cell>
            </cds-table-header-row>
          </cds-table-head>
          <cds-table-body></cds-table-body>
        </cds-table>
      </div>
      <cds-pagination
        id="dataset-factory-pagination"
        start="0"
        total-items="0"
        page-size="5"
      >
        <cds-select-item value="5">5</cds-select-item>
        <cds-select-item value="10">10</cds-select-item>
        <cds-select-item value="25">25</cds-select-item>
      </cds-pagination>
    </div>
  </div>
`;

window.customElements.define(
  "model-history-table",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.modelID;
      this.catalogGroup;
    }

    render() {
      this.setDOM(template(this));

      this.noDataTemplate = this.shadow.querySelector("#no-data-template");
      this.skeletonWrapper = this.shadow.querySelector("#skeleton-wrapper");
      this.tableWrapper = this.shadow.querySelector("#table-wrapper");
      this.tableBody = this.shadow.querySelector("cds-table-body");
      this.pagination = this.shadow.querySelector("cds-pagination");

      this.pagination.addEventListener("cds-pagination-changed-current", () => {
        if (!this.modelID) {
          return;
        }

        this.loadInferences();
      });

      this.pagination.addEventListener("cds-page-sizes-select-changed", () => {
        this.loadInferences();
      });
    }

    setHistoryTable(id, catalogGroup) {
      if (catalogGroup === "Model" || catalogGroup === "Tune") {
        this.modelID = id;
        this.catalogGroup = catalogGroup;
        this.loadInferences();
      } else {
        this.setNoDataTemplate();
      }
    }

    setNoDataTemplate() {
      this.noDataTemplate.style.display = "block";
      this.tableWrapper.style.display = "none";
      this.skeletonWrapper.style.display = "none";
    }

    async loadInferences() {
      this.loaded = false;
      this.pagination.setAttribute("disabled", "");
      this.tableWrapper.style.display = "none";
      this.skeletonWrapper.style.display = "block";
      this.skeletonWrapper.innerHTML = this._renderSkeletonTable();

      try {
        let start = this.pagination.pageSize * (this.pagination.page - 1);

        let response;

        if (this.catalogGroup === "Model") {
          response = await app.backend.getInferencesV2(
            this.pagination.pageSize,
            start,
            null,
            false,
            this.modelID
          );
        } else {
          response = await app.backend.getInferencesV2(
            this.pagination.pageSize,
            start,
            null,
            false,
            null,
            this.modelID
          );
        }

        if ("results" in response) {
          if (response.results.length === 0) {
            this.setNoDataTemplate();
            return;
          }

          this.tableBody.innerHTML = "";

          response.results.forEach((inference) => {
            const tableRowTemplate = document.createElement("template");
            tableRowTemplate.innerHTML = this._renderTableRow(inference);
            const tableRowElement = tableRowTemplate.content.firstElementChild;

            tableRowElement.addEventListener("click", () => {
              goToUrl(`#inference?id=${inference.id}`);
            });

            this.tableBody.appendChild(tableRowElement);
          });

          this.pagination.setAttribute(
            "total-items",
            `${response.total_records}`
          );

          this.pagination.totalPages = Math.ceil(
            response.total_records / this.pagination.pageSize
          );
        } else {
        }
      } catch (error) {}

      this.loaded = true;
      this.pagination.removeAttribute("disabled");
      this.skeletonWrapper.style.display = "none";
      this.tableWrapper.style.display = "block";
    }

    _renderTableRow = (inference) => /* HTML */ `
      <cds-table-row>
        <cds-table-cell>${inference.description}</cds-table-cell>
        <cds-table-cell
          >${inference.location
            .split(",")
            .slice(0, 2)
            .join(",")}</cds-table-cell
        >
        <cds-table-cell
          >${util.formatdataSetDateString(inference.created_at)}</cds-table-cell
        >
        <cds-table-cell>${inference.created_by}</cds-table-cell>
        <cds-table-cell class="svg-cell">
          <span>
            ${( inference?.geoserver_layers?.predicted_layers?.length
              && inference.status === util.STOPPED_INFERENCE_NOTIFICATION)
              ? this.getStatusIcon("STOPPED_WITH_RESULTS"): this.getStatusIcon(inference.status)} ${inference.status}
          </span>
        </cds-table-cell>
      </cds-table-row>
    `;

    _renderSkeletonTable = () => /* HTML */ `
      <cds-table-skeleton
        column-count="5"
        row-count="${this.pagination.pageSize}"
        show-header=""
      >
      </cds-table-skeleton>
    `;

    getStatusIcon(status) {
      switch (status) {
        case util.COMPLETED_INFERENCE_NOTIFICATION:
          return readyStatusIcon({ width: 16, height: 16 });
        case util.COMPLETED_WITH_ERRORS_INFERENCE_NOTIFICATION:
          return completedWithErrorsStatusIcon({ width: 18, height: 18 });
        case util.STOPPED_WITH_RESULTS_INFERENCE_NOTIFICATION:
          return stoppedWithResultsStatusIcon({ width: 18, height: 18 });
        case util.FAILED_INFERENCE_NOTIFICATION:
          return errorStatusIcon({ width: 16, height: 16 });
        case util.STOPPED_INFERENCE_NOTIFICATION:
          return stopStatusIcon({ width: 16, height: 16 });
        case util.PARTIALLY_COMPLETED_INFERENCE_NOTIFICATION:
          return partiallyCompletedStatusIcon({ width: 16, height: 16 });
        case util.PENDING_INFERENCE_NOTIFICATION:
          return pendingStatusIcon({ width: 16, height: 16 });
        case util.RUNNING_INFERENCE_INFERENCE_NOTIFICATION:
          return progressStatusIcon({ width: 16, height: 16 });
        default:
          return pendingStatusIcon({ width: 16, height: 16 });
      }
    }
  }
);
