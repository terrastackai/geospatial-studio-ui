/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/modal.min.js";
import "../../libs/carbon-web-components/inline-loading.min.js";
import "../../libs/carbon-web-components/tabs.min.js";
import "../../libs/carbon-web-components/data-table.min.js";
import "../refresh-timer.js";
import * as util from "../../utils.js";
import {
  downloadIcon,
  errorStatusIcon,
  pendingStatusIcon,
  progressStatusIcon,
  readyStatusIcon,
  stopStatusIcon,
} from "../../icons.js";

const template = (obj) => /* HTML */ `
  <style>
    .display-none {
      display: none;
    }

    button {
      margin: 0;
      padding: 0;
      background: unset;
      border: none;
      cursor: pointer;
      color: var(--cds-text-01, #f4f4f4);
    }

    cds-modal {
      background-color: #000000cc;
    }

    cds-modal p {
      color: var(--cds-text-primary, #f4f4f4);
      font-size: 14px;
      font-weight: 400;
    }

    cds-modal-body {
      max-height: 400px;
      padding-right: 1rem;
    }

    .panel-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding-top: 0.5rem;
    }

    .status-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      row-gap: 0.5rem;
      width: fit-content;
      height: 5rem;
      text-align: center;
    }
  </style>

  <div>
    <cds-modal size="lg" prevent-close-on-click-outside>
      <cds-modal-header>
        <cds-modal-close-button></cds-modal-close-button>
        <cds-modal-heading>Status History</cds-modal-heading>
      </cds-modal-header>
      <cds-modal-body>
        <cds-tabs value="table">
          <cds-tab
            value="table"
            target="panel-table"
            aria-labelledby="table-tab"
          >
            Tasks
          </cds-tab>
          <cds-tab value="list" target="panel-list" aria-labelledby="list-tab">
            Notifications
          </cds-tab>
        </cds-tabs>
        <refresh-timer></refresh-timer>
        <cds-inline-loading status="active">
          Loading status history...
        </cds-inline-loading>
        <section id="panel-table" role="tabpanel" aria-labelledby="table-tab">
          <div class="panel-content">
            <cds-table>
              <cds-table-header-title slot="title"
                >Task Status</cds-table-header-title
              >
              <cds-table-header-description slot="description"
                >View the status of each step for each task of this inference
                run</cds-table-header-description
              >
              <cds-table-head>
                <cds-table-header-row>
                  <cds-table-header-cell>Task</cds-table-header-cell>
                  <cds-table-header-cell id="action-header-cell"
                    >Action</cds-table-header-cell
                  >
                </cds-table-header-row>
              </cds-table-head>
              <cds-table-body> </cds-table-body>
            </cds-table>
          </div>
        </section>
        <section
          id="panel-list"
          role="tabpanel"
          aria-labelledby="list-tab"
          hidden
        >
          <div class="panel-content"></div>
        </section>
      </cds-modal-body>
    </cds-modal>
  </div>
`;

window.customElements.define(
  "status-history-modal",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.inference = null;

      this.modal = this.shadow.querySelector("cds-modal");
      this.modalBody = this.shadow.querySelector("cds-modal-body");
      this.tabsComponent = this.shadow.querySelector("cds-tabs");
      this.inlineLoading = this.shadow.querySelector("cds-inline-loading");
      this.listPanel = this.shadow.querySelector("#panel-list");
      this.tablePanel = this.shadow.querySelector("#panel-table");
      this.tableBody = this.shadow.querySelector("cds-table-body");
      this.tableHeaderRow = this.shadow.querySelector("cds-table-header-row");
      this.actionHeaderCell = this.shadow.querySelector("#action-header-cell");
      this.refreshTimer = this.shadow.querySelector("refresh-timer");

      this.tabsComponent.addEventListener("cds-tabs-selected", (e) => {
        this.handleTabChange(e.detail.item.target);
      });

      this.refreshTimer.addEventListener("refresh", () => {
        this.setupModal(this.inference);
      });
    }

    show() {
      this.modal.setAttribute("open", "");
    }

    hide() {
      this.modal.removeAttribute("open");
    }

    async setupWebhooks(inference) {
      this.inlineLoading.classList.remove("display-none");
      this.listPanel.classList.add("display-none");
      this.listPanel.innerHTML = "";

      this.show();

      let history;
      if (
        [
          util.COMPLETED_INFERENCE_NOTIFICATION,
          util.COMPLETED_WITH_ERRORS_INFERENCE_NOTIFICATION,
          util.FAILED_INFERENCE_NOTIFICATION,
          util.STOPPED_INFERENCE_NOTIFICATION,
        ].includes(inference.status) &&
        inference.webhooks?.length > 0
      ) {
        history = inference.webhooks;
      } else {
        history = await this.getWebhooks(inference.id);
      }

      if (!history) {
        return;
      }

      // TODO: REMOVE THIS AFTER BACKEND STARTS SORTING NOTIFICATIONS
      history.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      this.listPanel.innerHTML = "";

      history.forEach((entry) => {
        const entryElement = document.createElement("p");

        entryElement.innerHTML +=
          util.formatdataSetDateString(entry.timestamp) + " - ";

        if (entry.detail.status) {
          entryElement.innerHTML += entry.detail.status + " - ";
        }

        if (entry.detail.message) {
          entryElement.innerHTML += entry.detail.message + " ";
        }

        if (entry.detail.error) {
          entryElement.innerHTML += entry.detail.error;
        }

        this.listPanel.appendChild(entryElement);
      });

      this.inlineLoading.classList.add("display-none");
      this.listPanel.classList.remove("display-none");
    }

    async setupTasks(inference) {
      this.inlineLoading.classList.remove("display-none");
      this.tablePanel.classList.add("display-none");
      const tasks = await this.getTasks(inference.id);

      if (!tasks) {
        return;
      } else {
        this.tableBody.innerHTML = "";
      }

      let stepHeaderCellElements =
        this.tableHeaderRow.querySelectorAll(".step-cell");
      stepHeaderCellElements.forEach((cell) => {
        cell.remove();
      });

      let maxStepLength = null;

      for (let task of tasks) {
        if (task.pipeline_steps.length > maxStepLength) {
          maxStepLength = task.pipeline_steps.length;
        }
      }

      for (let i = 0; i < maxStepLength; i++) {
        let headerCell = document.createElement("cds-table-header-cell");
        headerCell.innerHTML = "Step " + i;
        this.tableHeaderRow.insertBefore(headerCell, this.actionHeaderCell);
        headerCell.className = "step-cell";
      }

      for (let task of tasks) {
        const taskTemplate = document.createElement("template");
        taskTemplate.innerHTML = this._renderTask(task);
        const taskElement = taskTemplate.content.firstElementChild;

        for (let i = 0; i < maxStepLength; i++) {
          const stepTemplate = document.createElement("template");

          if (i < task.pipeline_steps.length) {
            stepTemplate.innerHTML = this._renderStep(task.pipeline_steps[i]);
          } else {
            stepTemplate.innerHTML = this._renderStep();
          }

          const stepElement = stepTemplate.content.firstElementChild;

          const downloadStepButton = stepElement.querySelector(
            ".download-step-button"
          );

          if (downloadStepButton) {
            downloadStepButton.addEventListener("click", () => {
              this.downloadStep(
                task.task_id,
                task.pipeline_steps[i].process_id
              );
            });
          }

          taskElement.appendChild(stepElement);
        }

        const downloadTaskCellTemplate = document.createElement("template");
        downloadTaskCellTemplate.innerHTML = this._renderDownloadTaskCell();
        const downloadTaskCellElement =
          downloadTaskCellTemplate.content.firstElementChild;

        const downloadTaskButton = downloadTaskCellElement.querySelector(
          ".download-task-button"
        );

        downloadTaskButton.addEventListener("click", () => {
          this.downloadTaskOutput(task.task_id);
        });

        taskElement.appendChild(downloadTaskCellElement);

        this.tableBody.appendChild(taskElement);
      }

      this.inlineLoading.classList.add("display-none");
      this.tablePanel.classList.remove("display-none");
    }

    async downloadStep(taskID, stepID) {
      try {
        const response = await app.backend.getTaskStepLogs(taskID, stepID);

        if ("step_log_url" in response) {
          window.open(
            util.replaceHttpWithHttps(response.step_log_url),
            "_blank"
          );
        } else {
          app.showMessage(
            "Failed to load step logs: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error("Error loading step logs:", error);
        app.showMessage(
          "An error occured while loading the step logs",
          "",
          "error",
          5000
        );
      }
    }

    async downloadTaskOutput(taskID) {
      try {
        const response = await app.backend.getTaskOutputURL(taskID);

        if ("output_url" in response) {
          window.open(util.replaceHttpWithHttps(response.output_url), "_blank");
        } else {
          app.showMessage(
            "Failed to load task output: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error("Error loading task output:", error);
        app.showMessage(
          "An error occured while loading the task output",
          "",
          "error",
          5000
        );
      }
    }

    async setupModal(inference) {
      this.inference = inference;

      await this.setupWebhooks(inference);
      await this.setupTasks(inference);

      this.refreshTimer.stopAutoRefresh();
      this.refreshTimer.startAutoRefresh();
    }

    handleTabChange(targetPanelId) {
      const panels = this.shadow.querySelectorAll('[role="tabpanel"]');
      panels.forEach((panel) => panel.setAttribute("hidden", ""));

      this.showTabPanel(targetPanelId);
    }

    showTabPanel(panelId) {
      let panel = this.shadow.querySelector(`#${panelId}`);
      if (panel) {
        panel.removeAttribute("hidden");
      }
    }

    async getWebhooks(inferenceId) {
      try {
        const res = await app.backend.getNotificationsV2(inferenceId, 50, 0);

        if ("webhooks" in res) {
          return res.webhooks;
        } else if ("results" in res) {
          return res.results;
        } else {
          app.showMessage(
            "Failed to load status history: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error("Error loading status history:", error);
        app.showMessage(
          "An error occured while loading the status history",
          "",
          "error",
          5000
        );
      }

      return;
    }

    async getTasks(inferenceID) {
      try {
        const response = await app.backend.getInferenceTasksV2(inferenceID);

        if ("tasks" in response) {
          return response.tasks;
        } else {
          app.showMessage(
            "Failed to load status tasks: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error("Error loading status tasks:", error);
        app.showMessage(
          "An error occured while loading the status tasks",
          "",
          "error",
          5000
        );
      }

      return;
    }

    _renderTask = (task) => /* HTML */ `
      <cds-table-row>
        <cds-table-cell>
          <p>${task.task_id.split("-")[5]}</p>
        </cds-table-cell>
      </cds-table-row>
    `;

    _renderDownloadTaskCell = () => /* HTML */ `
      <cds-table-cell>
        <cds-btn class="download-task-button" kind="ghost"
          >${downloadIcon({ slot: "icon" })}</cds-btn
        >
      </cds-table-cell>
    `;

    _renderTableExpandedRow = (span) => /* HTML */ `
      <cds-table-expanded-row colspan="${span}"></cds-table-expanded-row>
    `;

    _renderStep = (step) => /* HTML */ `
      <cds-table-cell
        ><div
          class="status-container"
          title="${step?.status ? step.status + " " + step.process_id : ""}"
        >
          ${step?.status ? this.getStatusIcon(step.status) : ""}
          ${step
            ? /* HTML */ `<button class="download-step-button">
                ${downloadIcon({ width: 16, height: 16 })}
              </button>`
            : ""}
        </div></cds-table-cell
      >
    `;

    getStatusIcon(status) {
      switch (status) {
        case "READY":
          return readyStatusIcon({
            width: 32,
            height: 32,
            fill: "#0f62fe",
          });
        case "WAITING":
          return pendingStatusIcon({
            width: 32,
            height: 32,
          });
        case "RUNNING":
          return progressStatusIcon({
            width: 32,
            height: 32,
          });
        case "FINISHED":
          return readyStatusIcon({
            width: 32,
            height: 32,
          });
        case "FAILED":
          return errorStatusIcon({
            width: 32,
            height: 32,
          });
        case "STOP":
        case "STOPPED":
          return stopStatusIcon({
            width: 32,
            height: 32,
            fill: "#da1e28",
          });
        default:
          return progressStatusIcon({ width: 32, height: 32 });
      }
    }
  }
);
