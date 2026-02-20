/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { formatdataSetDateString, replaceHttpWithHttps } from "../../utils.js";
import {
  readyStatusIcon,
  errorStatusIcon,
  progressStatusIcon,
  addIcon2,
  trashIcon,
  downloadIcon,
  launchIcon,
} from "../../icons.js";
import asWebComponent from "../../webcomponent.js";
import { goToUrl } from "../../router.js";
import "../refresh-timer.js";
import "../delete-modal.js";

import "../../libs/carbon-web-components/data-table.min.js";
import "../../libs/carbon-web-components/pagination.min.js";

const TABLE_SORT_DIRECTION = {
  NONE: "none",
  ASCENDING: "ascending",
  DESCENDING: "descending",
};

const columnHeaders = [
  {
    id: "dataset_name",
    title: "Name",
  },
  {
    id: "dataset_id",
    title: "ID",
  },
  {
    id: "purpose",
    title: "Tasks",
  },
  {
    id: "dataset_size",
    title: "Size",
  },
  {
    id: "created_at",
    title: "Created",
  },
  {
    id: "updated_at",
    title: "Updated",
  },
  {
    id: "dataset_status",
    title: "Status",
  },
];

export const noDataTemplate = () => /* HTML */ `
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
        <title>Data table</title>
      </svg>
      <h4>No Datasets found!</h4>
    </div>
  </cds-table-row>
`;

const template = (obj) => /* HTML */ `
  <style>
    h1,
    h4 {
      font-weight: 400;
      margin-left: 1rem;
    }
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--cds-button-secondary);
    }
    #table-wrapper {
      margin: 0 1rem;
      width: calc(100% - 2rem);
    }

    .table-overflow-wrapper {
      width: 100%;
      overflow: auto;
    }
    .svg-cell span {
      display: flex;
      align-items: center;
      column-gap: 0.5rem;
    }
    .svg-cell:hover {
      cursor: pointer;
    }

    /* Added a fixed width to the first column to determine margin-left for expanded row */
    #expand-cell {
      width: 52px;
    }

    cds-table-expanded-row span {
      display: block;
      color: var(--cds-text-secondary);
      padding: 1rem;
    }

    .dataset-page-button {
      padding: 0.25rem;
      cursor: pointer;
    }
  </style>

  <div>
    <delete-modal></delete-modal>
    <refresh-timer></refresh-timer>
    <div id="skeleton-wrapper"></div>
    <div id="table-wrapper">
      <div class="table-overflow-wrapper">
        <cds-table sort expandable>
          <cds-table-head>
            <cds-table-header-row>
              ${columnHeaders
                .map((columnHeader) => {
                  const { id: columnId, title } = columnHeader;
                  return /* HTML */ `
                    <cds-table-header-cell
                      sort-direction="${TABLE_SORT_DIRECTION.NONE}"
                      data-column-id="${columnId}"
                      >${title}</cds-table-header-cell
                    >
                  `;
                })
                .join("")}
              <cds-table-header-cell></cds-table-header-cell>
            </cds-table-header-row>
          </cds-table-head>
          <cds-table-body></cds-table-body>
        </cds-table>
      </div>
      <div class="no-data-template-container"></div>
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
  "data-catalog-list-view",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.state = {
        query: "",
        purpose: null,
        status: null,
        sortInfo: {
          columnId: "name",
          direction: TABLE_SORT_DIRECTION.ASCENDING,
        },
        setSortInfo: (sortInfo) => {
          this.state.sortInfo.columnId = sortInfo.columnId;
          this.state.sortInfo.direction = sortInfo.direction;
        },
      };

      this.latestRequestID = 0;
    }

    render() {
      this.setDOM(template(this));

      this.pagination = this.shadow.querySelector(
        "#dataset-factory-pagination"
      );
      this.tableWrapper = this.shadow.querySelector("#table-wrapper");
      this.skeletonWrapper = this.shadow.querySelector("#skeleton-wrapper");
      this.noDatasetContainer = this.shadow.querySelector(
        ".no-data-template-container"
      );
      this.tableBody = this.shadow.querySelector("cds-table-body");
      this.refreshTimer = this.shadow.querySelector("refresh-timer");
      this.deleteModal = this.shadow.querySelector("delete-modal");

      this.deleteModal.addEventListener("confirmed", (e) => {
        this.deleteDataset(e.detail.id);
      });

      this.deleteModal.addEventListener("cancelled", (e) => {
        this.deleteModal.close();
      });

      this.refreshTimer.addEventListener("refresh", () => {
        this.loadDatasets();
      });

      this.shadow.addEventListener("cds-table-header-cell-sort", (e) => {
        if (!e.defaultPrevented) {
          const { columnId } = e.target.dataset;
          const { sortDirection: direction } = e.detail;

          const sortInfo = {
            columnId,
            direction,
          };

          this.state.setSortInfo(sortInfo);
          this.updateTableOnSort();
        }
      });

      this.shadow.addEventListener("cds-pagination-changed-current", () => {
        if (!this.datasets) {
          return;
        }
        this.loadDatasets();
      });

      this.shadow.addEventListener("cds-page-sizes-select-changed", () => {
        this.loadDatasets();
      });

      this.loadDatasets();
    }

    async loadDatasets() {
      this.setLoading();
      let pageSize = this.pagination.pageSize;
      let start = pageSize * (this.pagination.page - 1);

      const requestID = ++this.latestRequestID;

      try {
        const datasetsObject = await app.backend.getDatasetsV2(
          pageSize,
          start,
          this.state.query,
          this.state.purpose,
          this.state.status
        );

        if (requestID != this.latestRequestID) return;

        if ("results" in datasetsObject) {
          this.datasets = datasetsObject.results;
          this.pagination.setAttribute(
            "total-items",
            `${datasetsObject.total_records}`
          );
          this.pagination.totalPages = Math.ceil(
            datasetsObject.total_records / this.pagination.pageSize
          );
          this.updateTable();
          this.refreshTimer.stopAutoRefresh();
          this.refreshTimer.startAutoRefresh();
        } else {
          app.showMessage(
            "Failed to load datasets: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        if (requestID != this.latestRequestID) return;

        console.error("Error loading datasets:", error);
        app.showMessage(
          "An error occured while loading the datasets",
          "",
          "error",
          5000
        );

        return false;
      }
    }

    renderSkeletonTable() {
      this.tableWrapper.style.display = "none";
      this.skeletonWrapper.style.display = "block";

      this.tableBody.innerHTML = "";
      this.noDatasetContainer.innerHTML = "";

      this.skeletonWrapper.innerHTML = this._renderTableSkeleton();
    }

    setupRow(dataset) {
      const rowTemplate = document.createElement("template");
      rowTemplate.innerHTML = this._renderTableRow(dataset);
      const rowElement = rowTemplate.content.firstElementChild;
      const expandedRowElement = rowTemplate.content.lastElementChild;

      rowElement
        .querySelector(".dataset-page-button")
        .addEventListener("click", () => {
          goToUrl("#dataset?id=" + dataset.id);
        });

      return [rowElement, expandedRowElement];
    }

    updateTable() {
      this.skeletonWrapper.style.display = "none";
      this.tableWrapper.style.display = "block";

      this.tableBody.innerHTML = "";

      if (this.datasets.length === 0) {
        this.noDatasetContainer.innerHTML = noDataTemplate();
      }

      this.datasets.forEach((dataset) => {
        const rowElements = this.setupRow(dataset);
        this.tableBody.appendChild(rowElements[0]);
        this.tableBody.appendChild(rowElements[1]);
      });
    }

    updateTableOnSort() {
      const collator = new Intl.Collator("en");
      this.tableBody.innerHTML = "";

      if (this.state.sortInfo.direction === "none") {
        this.sortedDatasets = this.datasets;
      } else {
        this.sortedDatasets = this.datasets?.slice().sort((lhs, rhs) => {
          const lhsValue = lhs[this.state.sortInfo.columnId];
          const rhsValue = rhs[this.state.sortInfo.columnId];
          return (
            (this.state.sortInfo.direction === "ascending" ? 1 : -1) *
            collator.compare(lhsValue, rhsValue)
          );
        });
      }

      this.sortedDatasets.forEach((dataset) => {
        const rowElements = this.setupRow(dataset);
        this.tableBody.appendChild(rowElements[0]);
        this.tableBody.appendChild(rowElements[1]);
      });

      if (this.datasets.length === 0 || this.sortedDatasets.length === 0) {
        this.noDatasetContainer.innerHTML = noDataTemplate();
      }
    }

    async deleteDataset(datasetID) {
      try {
        app.progress.show();
        const response = await app.backend.deleteDataset(datasetID);
        app.progress.hide();

        if (!response.detail) {
          this.loadDatasets();

          app.showMessage("Dataset deleted successfully", "", "success", 5000);
          this.deleteModal.close();
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

    setLoading() {
      this.renderSkeletonTable();
    }

    onSearch(e) {
      this.state.query = e.detail;
      this.pagination.page = 1;
      this.loadDatasets();
    }

    onFilterChange(e) {
      if (e.detail.checked) {
        this.state[e.detail.filterGroup] = e.detail.filter;
      } else {
        this.state[e.detail.filterGroup] = null;
      }
      this.pagination.page = 1;
      this.loadDatasets();
    }

    fineTune(dataset) {
      goToUrl(
        "#fine_tuning_create?id=" + dataset.id + "&purpose=" + dataset.purpose
      );
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

    _renderTableRow = (dataset) => /* HTML */ `
      <cds-table-row>
        <cds-table-cell>${dataset.dataset_name}</cds-table-cell>
        <cds-table-cell>${dataset.id}</cds-table-cell>
        <cds-table-cell>${dataset.purpose}</cds-table-cell>
        <cds-table-cell>${dataset.size}</cds-table-cell>
        <cds-table-cell
          >${formatdataSetDateString(dataset.created_at)}</cds-table-cell
        >
        <cds-table-cell
          >${formatdataSetDateString(dataset.updated_at)}</cds-table-cell
        >
        <cds-table-cell class="svg-cell">
          <span
            >${this.getStatusIcon(dataset.status ? dataset.status : "Error")}
            ${dataset.status ? dataset.status : "undefined"}
          </span>
        </cds-table-cell>
        <cds-table-cell>
          ${launchIcon({
            width: 16,
            height: 16,
            class: "dataset-page-button",
            title: "Open dataset page",
          })}
        </cds-table-cell>
      </cds-table-row>
      <cds-table-expanded-row>
        <span>${dataset.description}</span>
      </cds-table-expanded-row>
    `;

    _renderTableSkeleton = () => /* HTML */ `
      <cds-table-skeleton></cds-table-skeleton>
    `;

    getStatusIcon(status) {
      switch (status) {
        case "Succeeded":
          return readyStatusIcon();
        case "Failed":
          return errorStatusIcon();
        case "Onboarding":
          return progressStatusIcon();
        case "Scanning":
        case "Pending":
          return progressStatusIcon();
      }
    }
  }
);
