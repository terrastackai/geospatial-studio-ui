/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import {
  debounce,
  formatdataSetDateString,
  replaceHttpWithHttps,
} from "../../utils.js";
import "../../libs/carbon-web-components/data-table.min.js";
import "../../libs/carbon-web-components/pagination.min.js";
import "../../libs/carbon-web-components/popover.min.js";
import { goToUrl } from "../../router.js";
import {
  errorStatusIcon,
  readyStatusIcon,
  progressStatusIcon,
  pendingStatusIcon,
  unknownStatusIcon,
  downloadIcon,
  trashIcon,
  launchIcon,
} from "../../icons.js";

import "./edit-tune-modal.js";
import "./try-out-modal.js";
import "../refresh-timer.js";
import "../delete-modal.js";

const TABLE_SORT_DIRECTION = {
  NONE: "none",
  ASCENDING: "ascending",
  DESCENDING: "descending",
};
const columnHeaders = [
  {
    id: "name",
    title: "Name",
  },
  {
    id: "id",
    title: "ID",
  },
  {
    id: "type",
    title: "Type",
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
    id: "status",
    title: "Status",
  },
];

const noTuneTemplate = () => /* HTML */ `
  <cds-table-row>
    <div class="no-tune">
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
        <title>Fine-tuning table</title>
      </svg>
      <h4>No Tunes found!</h4>
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
    #table-wrapper {
      margin: 0 1rem;
      width: calc(100% - 2rem);
      overflow: auto;
    }

    .table-overflow-wrapper {
      width: 100%;
      overflow: auto;
    }

    #skeleton-wrapper {
      margin: 0 1rem;
      width: calc(100% - 2rem);
      display: none;
      overflow: hidden;
    }

    #create-tune-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .no-tune {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--cds-text-03);
    }
    .svg-cell span {
      display: flex;
      align-items: center;
      column-gap: 0.5rem;
    }
    .svg-cell:hover {
      cursor: pointer;
    }
    .status-cell span,
    .type-cell span {
      white-space: nowrap;
    }
    #expand-cell {
      width: 52px;
    }
    cds-table-expanded-row span {
      display: block;
      color: var(--cds-text-secondary);
    }

    .model-page-button {
      padding: 0.25rem;
      cursor: pointer;
    }
  </style>

  <div>
    <delete-modal></delete-modal>
    <edit-tune-modal></edit-tune-modal>
    <try-out-modal></try-out-modal>
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
      <div class="no-tune-template-container"></div>
      <cds-pagination
        id="fine-tuning-pagination"
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
  "model-catalog-list-view",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.state = {
        query: "",
        status: [],
        purpose: [],
        type: [],
        sortInfo: {
          columnId: "name",
          direction: TABLE_SORT_DIRECTION.ASCENDING,
        },
        setSortInfo: (sortInfo) => {
          this.state.sortInfo.columnId = sortInfo.columnId;
          this.state.sortInfo.direction = sortInfo.direction;
        },
        tab: "models-and-tunes",
      };

      this.catalog = [];

      this.latestRequestID = 0;
    }

    render() {
      this.setDOM(template(this));

      this.pagination = this.shadow.querySelector("#fine-tuning-pagination");
      this.tableWrapper = this.shadow.querySelector("#table-wrapper");
      this.skeletonWrapper = this.shadow.querySelector("#skeleton-wrapper");
      this.noTuneContainer = this.shadow.querySelector(
        ".no-tune-template-container"
      );
      this.tableBody = this.shadow.querySelector("cds-table-body");
      this.refreshTimer = this.shadow.querySelector("refresh-timer");
      this.deleteModal = this.shadow.querySelector("delete-modal");

      this.refreshTimer.addEventListener("refresh", () => {
        this.loadData();
      });

      this.deleteModal.addEventListener("confirmed", (e) => {
        this.deleteTune(e.detail.id);
      });

      this.deleteModal.addEventListener("cancelled", (e) => {
        this.deleteModal.close();
      });

      //=== Attach Edit Modal Event Listener ===//
      this.editTuneModalContainer =
        this.shadow.querySelector("edit-tune-modal");

      this.editTuneModal =
        this.editTuneModalContainer.shadow.querySelector("#edit-tune-modal");

      this.editTuneModalContainer.addEventListener("modal-submitted", (e) => {
        this.editTuneModal.removeAttribute("open");
        this.updateTune(e.detail.id, e.detail.payload);
      });

      this.tryOutModalV2 = this.shadow.querySelector("try-out-modal");

      //=== Attach Try Out Modal Event Listener ===//

      this.tryOutModalV2.addEventListener("modal-submitted", (e) => {
        this.tryOutModalV2.closeModal();
        this.tryInLabV2(e.detail);
      });
      //========================================//

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

      this.shadow.addEventListener("cds-pagination-changed-current", (e) => {
        if (!this.catalog) {
          return;
        }
        this.loadData();
      });

      this.shadow.addEventListener("cds-page-sizes-select-changed", (e) => {
        this.loadData();
      });

      this.shadow.addEventListener(
        "cds-search-input",
        debounce(this.onSearch.bind(this), 1500)
      );

      this.loadData();
    }

    setLoading() {
      this.renderSkeletonTable();
    }

    onSearch(e) {
      this.state.query = e.detail;
      this.pagination.page = 1;
      this.loadData();
    }

    onFilterChange(e) {
      if (e.detail.checked) {
        this.state[e.detail.filterGroup].push(e.detail.filter);
      } else {
        let index = this.state[e.detail.filterGroup].indexOf(e.detail.filter);

        if (index != -1) {
          this.state[e.detail.filterGroup].splice(index, 1);
        }
      }

      this.loadData();
    }

    onTabChange(e) {
      this.state.tab = e;
      this.loadData();
    }

    loadData() {
      this.renderSkeletonTable();

      if (this.state.tab === "models-and-tunes") {
        this.loadModelsAndTunes();
      } else {
        this.loadBaseModels();
      }
    }

    async loadModelsAndTunes() {
      const requestID = ++this.latestRequestID;

      let start = this.pagination.pageSize * (this.pagination.page - 1);

      try {
        const response = await app.backend.getModelsAndTunes(
          this.pagination.pageSize,
          start,
          this.state.query,
          this.state.purpose,
          this.state.status,
          this.state.type.length === 1 ? this.state.type : null
        );

        if (requestID != this.latestRequestID) return;

        if ("results" in response) {
          this.catalog = response.results;

          this.pagination.setAttribute(
            "total-items",
            `${response.total_records}`
          );
          this.pagination.totalPages = Math.ceil(
            response.total_records / this.pagination.pageSize
          );
          this.updateTable();
          this.refreshTimer.stopAutoRefresh();
          this.refreshTimer.startAutoRefresh();
        } else {
          app.showMessage(
            "Failed to load tunes: " +
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

        console.error("Error loading tunes:", error);
        app.showMessage(
          "An error occured while loading the tunes",
          "",
          "error",
          5000
        );
      }
    }

    async loadBaseModels() {
      const requestID = ++this.latestRequestID;

      let start = this.pagination.pageSize * (this.pagination.page - 1);

      try {
        const response = await app.backend.getBaseModels(
          this.pagination.pageSize,
          start,
          this.state.query,
          this.state.purpose,
          this.state.status
        );

        if (requestID != this.latestRequestID) return;

        if ("results" in response) {
          this.catalog = response.results;

          this.pagination.setAttribute(
            "total-items",
            `${response.total_records}`
          );
          this.pagination.totalPages = Math.ceil(
            response.total_records / this.pagination.pageSize
          );
          this.updateTable();
          this.refreshTimer.stopAutoRefresh();
          this.refreshTimer.startAutoRefresh();
        } else {
          app.showMessage(
            "Failed to load tunes: " +
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

        console.error("Error loading tunes:", error);
        app.showMessage(
          "An error occured while loading the tunes",
          "",
          "error",
          5000
        );
      }
    }

    renderSkeletonTable() {
      this.tableWrapper.style.display = "none";
      this.skeletonWrapper.style.display = "block";

      this.tableBody.innerHTML = "";
      this.noTuneContainer.innerHTML = "";

      this.skeletonWrapper.innerHTML = this._renderTableSkeleton();
    }

    handleJsonMetrics = (metrics) => {
      try {
        const jsonMetrics = JSON.parse(metrics);
        return jsonMetrics.map((jsonMetric) => Object.values(jsonMetric)[0]);
      } catch (error) {
        console.error(
          "Error parsing metrics JSON string (attempting to split):",
          error
        );
        return metrics.split(",");
      }
    };

    setupRow(tune) {
      const rowTemplate = document.createElement("template");
      rowTemplate.innerHTML = this._renderTableRow(tune);
      const rowElement = rowTemplate.content.firstElementChild;
      const expandedRowElement = rowTemplate.content.lastElementChild;

      rowElement
        .querySelector(".model-page-button")
        .addEventListener("click", () => {
          goToUrl(
            "#model?id=" +
              tune.id +
              "&model_type=" +
              (tune.model_type || "Base_Model")
          );
        });

      return [rowElement, expandedRowElement];
    }

    async tryInLab(tune, modelStyle, jsonObject) {
      const payload = (
        "{" +
        jsonObject +
        `,"model_name": "${tune.name}", "model_description":"${tune.description}", "model_style_id":"${modelStyle}", "sharable": "false"}`
      ).replace(/\s/g, "");

      // const payload = {
      //   model_name: tune.name,
      //   model_description: tune.description,
      //   model_style_id: modelStyle,
      //   sharable: false,
      // };

      try {
        const response = await app.backend.deployTunedModel(tune.id, payload);

        if ("details" in response && "id" in response.details) {
          app.showMessage("Model created successfully", "", "success", 5000);
          goToUrl("#inference?istryinlab=true&id=" + response.details.name);
        } else {
          app.showMessage(
            "Failed to create model: " +
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
        console.error("Error creating model:", error);
        app.showMessage(
          "An error occured while creating the model",
          "",
          "error",
          5000
        );
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

    async tryInLabV2(tryInLapPayload) {
      if (tryInLapPayload.tune.created_by === "system@ibm.com") {
        console.log("Shared Tune! Go to inference page!");
        goToUrl("#inference?istryinlab=true&id=" + tryInLapPayload.tune.id);
      } else if (
        tryInLapPayload.isModelSpecAltered ||
        tryInLapPayload.isGeoserverStyleAltered
      ) {
        console.log("Update Tune and go to inference page!");
        const payload = {
          train_options: {
            ...(tryInLapPayload.isModelSpecAltered && {
              model_input_data_spec: tryInLapPayload.model_input_data_spec,
            }),
            ...(tryInLapPayload.isModelSpecAltered && {
              data_connector_config: await this.getDataConnectorConfig(
                tryInLapPayload.model_input_data_spec
              ),
            }),
            ...(tryInLapPayload.isGeoserverStyleAltered && {
              geoserver_push: tryInLapPayload.geoserver_push,
            }),
          },
        };
        this.updateTune(tryInLapPayload.tune.id, payload, true);
      } else {
        console.log("No changes! Go to inference page!");
        goToUrl("#inference?istryinlab=true&id=" + tryInLapPayload.tune.id);
      }
    }

    updateTable() {
      this.skeletonWrapper.style.display = "none";
      this.tableWrapper.style.display = "block";

      this.tableBody.innerHTML = "";

      if (this.catalog.length === 0) {
        this.noTuneContainer.innerHTML = noTuneTemplate();
      }

      this.catalog.forEach((tune) => {
        const rowElements = this.setupRow(tune);
        this.tableBody.appendChild(rowElements[0]);
        this.tableBody.appendChild(rowElements[1]);
      });
    }

    updateTableOnSort() {
      const collator = new Intl.Collator("en");
      this.tableBody.innerHTML = "";

      if (this.state.sortInfo.direction === "none") {
        this.sortedTunes = this.catalog;
      } else {
        this.sortedTunes = this.catalog?.slice().sort((lhs, rhs) => {
          const lhsValue = lhs[this.state.sortInfo.columnId];
          const rhsValue = rhs[this.state.sortInfo.columnId];
          return (
            (this.state.sortInfo.direction === "ascending" ? 1 : -1) *
            collator.compare(lhsValue, rhsValue)
          );
        });
      }

      this.sortedTunes.forEach((tune) => {
        const rowElements = this.setupRow(tune);
        this.tableBody.appendChild(rowElements[0]);
        this.tableBody.appendChild(rowElements[1]);
      });

      if (this.catalog.length === 0 || this.sortedTunes.length === 0) {
        this.noTuneContainer.innerHTML = noTuneTemplate();
      }
    }

    async updateTune(tuneID, payload, istryinlab = false) {
      try {
        const response = await app.backend.updateTune(tuneID, payload);

        if (response && "message" in response) {
          if (istryinlab) {
            goToUrl("#inference?istryinlab=true&id=" + tuneID);
          } else {
            this.loadData();
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

    async deleteTune(tuneID) {
      try {
        app.progress.show();
        const response = await app.backend.deleteTune(tuneID);
        app.progress.hide();

        if (response && "success" in response) {
          this.loadData();

          app.showMessage("Tune deleted successfully", "", "success", 5000);
        } else {
          app.showMessage(
            "Failed to delete tune: " +
              (response ? response.error : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        app.progress.hide();
        console.error("Error deleting tune:", error);
        app.showMessage(
          "An error occured while deleting the tune",
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

    _renderTableRow = (model) => /* HTML */ `
      <cds-table-row>
        <cds-table-cell>${model.name}</cds-table-cell>
        <cds-table-cell>${model.id}</cds-table-cell>
        <cds-table-cell>
          ${model.model_type ? model.model_type : "Base Model"}
        </cds-table-cell>
        <cds-table-cell>
          ${formatdataSetDateString(model.created_at_)}
        </cds-table-cell>
        <cds-table-cell>
          ${formatdataSetDateString(model.updated_at_)}
        </cds-table-cell>
        <cds-table-cell class="svg-cell status-cell">
          <span>
            ${this.getStatusIcon(model.status)}
            ${model.status.charAt(0).toUpperCase() +
            model.status.slice(1).toLowerCase()}
          </span>
        </cds-table-cell>
        <cds-table-cell>
          ${launchIcon({
            width: 16,
            height: 16,
            class: "model-page-button",
            title: `Open model page`,
          })}
        </cds-table-cell>
      </cds-table-row>
      <cds-table-expanded-row>
        <span>${model.description}</span>
      </cds-table-expanded-row>
    `;

    _renderTableSkeleton = () => /* HTML */ `
      <cds-table-skeleton></cds-table-skeleton>
    `;

    getStatusIcon(status) {
      switch (status) {
        case "Complete":
        case "COMPLETED":
        case "Finished":
          return readyStatusIcon();
        case "Failed":
        case "Error":
          return errorStatusIcon();
        case "Pending":
          return pendingStatusIcon();
        case "Scanning":
        case "Tuning":
        case "In_progress":
          return progressStatusIcon();
        default:
          return unknownStatusIcon();
      }
    }
  }
);
