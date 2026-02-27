/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import {
  errorStatusIcon,
  readyStatusIcon,
  progressStatusIcon,
  locationIcon,
  modelIcon,
  arrowRightIcon,
  calendarIcon,
  popupIcon,
  closeIcon,
  completedWithErrorsStatusIcon,
  stopStatusIcon,
  partiallyCompletedStatusIcon,
  pendingStatusIcon,
  stoppedWithResultsStatusIcon,
} from "../../icons.js";
import asWebComponent from "../../webcomponent.js";
import * as util from "../../utils.js";
import "../../libs/carbon-web-components/loading.min.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    :host {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    h2,
    h3,
    h4 {
      margin: 0;
      color: var(--cds-text-primary, #f4f4f4);
    }

    h4 {
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      letter-spacing: 0.16px;
    }

    h5 {
      margin: 0;
      color: var(--cds-text-secondary, #c6c6c6);
      font-size: 12px;
      font-weight: 400;
      line-height: 16px;
      letter-spacing: 0.32px;
    }

    button {
      padding: 0;
      background: unset;
      border: none;
      line-height: 0;
      cursor: pointer;
    }

    span {
      line-height: 0;
    }

    .display-none {
      display: none !important;
    }

    #history-panel-container {
      display: flex;
      flex-direction: column;
      width: 300px;
      background-color: var(--cds-field-01, #262626);
      box-shadow: rgba(0, 0, 0, 0.3) 0px 2px 6px 0px;
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
    }

    #panel-header {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 0.75rem;
    }

    #title {
      font-size: 20px;
      font-weight: 400;
      line-height: 28px;
      letter-spacing: 0;
    }

    #loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 375px;
    }

    cds-loading {
      width: 2rem;
      height: 2rem;
    }

    #history-container {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      max-height: 375px;
      overflow: auto;
      border-bottom: 1px solid var(--cds-field-04, #6f6f6f);
      background: linear-gradient(
        to right,
        var(--cds-field-01, #262626) 60%,
        var(--cds-field-02, #393939)
      );
    }

    .group-container {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .group-header {
      width: 100%;
      padding: 0.75rem;
      border-top: 1px solid var(--cds-field-04, #6f6f6f);
    }

    .group-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
    }

    .group-entries-container {
      width: 100%;
    }

    .entry-container {
      display: flex;
      align-items: flex-start;
      width: 100%;
      border-top: 1px dashed var(--cds-field-04, #6f6f6f);
    }

    .run-entry-button {
      display: flex;
      flex-grow: 1;
      align-items: flex-start;
      column-gap: 0.5rem;
      min-width: 0;
      padding: 0.5rem 0.5rem 0.5rem 0.75rem;
      text-align: left;
    }

    .run-entry-button:not(:disabled):hover {
      background-color: #ffffff14;
    }

    .run-entry-button:disabled {
      cursor: not-allowed;
    }

    .overflow-menu-toggle {
      padding: 0.5rem 0.75rem 0.5rem 0.5rem;
    }

    .entry-status-icon {
      position: relative;
    }

    .entry-container:not(:last-child) .entry-status-icon::after {
      content: "";
      position: absolute;
      left: 50%;
      width: 1px;
      top: 90%;
      bottom: -5.2rem;
      background: var(--cds-field-04, #6f6f6f);
      transform: translateX(-80%);
    }

    .entry-time {
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      letter-spacing: 0.16px;
    }

    .entry-info {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      row-gap: 0.25rem;
      min-width: 0;
    }

    .entry-description,
    .entry-location,
    .entry-model,
    .entry-dates {
      width: 100%;
    }

    .entry-description {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .entry-location,
    .entry-model,
    .entry-dates {
      display: flex;
      column-gap: 0.25rem;
    }

    .entry-info-text,
    .entry-info-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: normal;
    }

    .overflow-menu-container {
      position: fixed;
      display: flex;
      flex-direction: column;
      width: 300px;
      background-color: var(--cds-field-01, #262626);
      border-top-right-radius: 0.5rem;
      border-top-left-radius: 0.5rem;
    }

    #overflow-header {
      position: relative;
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 1rem 2rem 1rem;
    }

    #overflow-title {
      display: flex;
      align-items: center;
      margin: 0;
      color: var(--cds-text-primary, #f4f4f4);
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      letter-spacing: 0.16px;
    }

    .overflow-close-button {
      position: absolute;
      top: calc(50% - 0.25rem);
      right: 0.25rem;
      transform: translate(-50%, -50%);
      color: var(--cds-icon-primary, #f4f4f4);
    }

    #overflow-body {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
      padding: 0 2rem 2rem;
      max-height: 300px;
      overflow: auto;
    }

    .overflow-info-container {
      display: flex;
      flex-direction: column;
      row-gap: 0.25rem;
      margin-bottom: 0.5rem;
    }

    .overflow-status-container {
      display: flex;
      column-gap: 0.25rem;
    }

    .overflow-status-text {
      line-height: normal;
    }

    .status-history-button,
    #panel-close-button {
      color: var(--cds-icon-primary, #f4f4f4);
    }
  </style>

  <div id="history-panel-container">
    <div id="panel-header">
      <h2 id="title">History</h2>
      <button id="panel-close-button" title="Close history panel">
        ${closeIcon({ width: 16, height: 16 })}
      </button>
    </div>
    <div id="loading-container">
      <cds-loading></cds-loading>
    </div>
    <div id="history-container" class="display-none"></div>
  </div>
`;

window.customElements.define(
  "history-panel",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.history = [];
      this.groupedHistory = [];
    }

    render() {
      this.setDOM(template(this));
      this.loadingContainer = this.shadow.querySelector("#loading-container");
      this.historyContainer = this.shadow.querySelector("#history-container");
      this.closeButton = this.shadow.querySelector("#panel-close-button");

      this.closeButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("close-panel"));
      });
    }

    setHistory = (history) => {
      this.history = history || [];
      this.history = this.history.map((my_inference) => {
        my_inference["created_at"] = new Date(my_inference?.created_at);
        my_inference["statusMessage"] =
          util.percentageStepBreakdown(my_inference);
        if ([util.PENDING_INFERENCE_NOTIFICATION, util.RUNNING_INFERENCE_INFERENCE_NOTIFICATION, util.PARTIALLY_COMPLETED_INFERENCE_NOTIFICATION].includes(my_inference?.status)) {
          if (util.secondsPassedIsLessThanThreshold(my_inference?.created_at, 108000)) {
            this.dispatchEvent(new CustomEvent("event-source", { detail: my_inference?.id }));
            console.log("Started an eventsource for: "+my_inference?.id);
          }
        }
        return my_inference;
      });

      this.setupHistory();
    };

    updateHistoryAfterInferenceCompletes = (completed_inference) => {
      this.history = this.history.map((hist) => {
        if (hist.id === completed_inference.id) return completed_inference;
        return hist;
      });
      this.setupHistory();
    };

    updateHistoryAfterInferenceFails = (event_id, response) => {
      this.history = this.history.map((hist) => {
        if (hist.id === event_id) {
          hist.status = response.status;
          hist.info = response.data.error;
          hist.statusMessage = util.percentageStepBreakdown(response.data);
          return hist;
        }
        return hist;
      });
      this.setupHistory();
    };

    updateHistoryWithUpdateToPendingInference = (event_id, data) => {
      this.history = this.history.map((hist) => {
        if (hist.id === event_id) {
          hist.status = data.status;
          if (data.data.message) {
            hist.statusMessage = data.data.message;
          } else {
            hist.statusMessage = util.percentageStepBreakdown(data.data);
          }
          return hist;
        }
        return hist;
      });
      this.setupHistory();
    };

    updateHistoryWithPendingInference(newInference) {
      this.history.splice(0, 0, newInference);
      this.setupHistory();
    }

    setupHistory() {
      this.historyContainer.innerHTML = "";

      const groupedData = this.history.reduce((groups, item) => {
        const date = util.formatDateWithDashSeparatorUTC(item.created_at); // Extract the date portion
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(item);
        return groups;
      }, {});

      // Convert the grouped data object back into an array
      this.groupedHistory = Object.keys(groupedData).map((date) => {
        const formatedDate = this.formatDate(date);
        const id = formatedDate.replace(/[ ,.]/g, "");
        return {
          created_at: formatedDate,
          id: id,
          items: groupedData[date],
        };
      });

      this.groupedHistory.forEach((group) => {
        this.setupGroup(group);
      });

      this.loadingContainer.classList.add("display-none");
      this.historyContainer.classList.remove("display-none");
    }

    setupGroup(group) {
      const groupTemplate = document.createElement("template");
      groupTemplate.innerHTML = this._renderHistoryGroup(group);
      const groupElement = groupTemplate.content.firstElementChild;

      const entries = group.items;

      entries.forEach((entry) => {
        const entriesContainer = groupElement.querySelector(
          ".group-entries-container"
        );
        this.setupEntry(entry, entriesContainer);
      });

      this.historyContainer.appendChild(groupElement);
    }

    setupEntry(entry, entriesContainer) {
      const minMaxDates = util.getMinMaxFromTemporalDomain(
        entry.temporal_domain
      );

      const entryTemplate = document.createElement("template");
      entryTemplate.innerHTML = this._renderHistoryEntry(
        entry,
        minMaxDates.min,
        minMaxDates.max
      );
      const entryElement = entryTemplate.content.firstElementChild;

      //=== Attach Entry Button Click Event Listener ===
      entryElement
        .querySelector(".run-entry-button")
        .addEventListener("click", () => {
          this.dispatchEvent(new CustomEvent("load-map", { detail: entry }));
        });

      //=== Attach Overflow Menu Event Listener ===

      const overflowMenuToggle = entryElement.querySelector(
        ".overflow-menu-toggle"
      );
      overflowMenuToggle.addEventListener("click", () => {
        if (entryElement.hasAttribute("expanded")) {
          this.removeOverflowMenu(entryElement);
        } else {
          this.setupOverflowMenu(entryElement, entry);
        }
      });

      entriesContainer.appendChild(entryElement);
    }

    setupOverflowMenu(entryElement, entry) {
      if (this.historyContainer.querySelector("[expanded]")) {
        this.removeOverflowMenu(
          this.historyContainer.querySelector("[expanded]")
        );
      }

      let xCoord = this.historyContainer.getBoundingClientRect().right + 5;
      let yCoord = entryElement.getBoundingClientRect().top;

      let y;
      let x;

      if (yCoord + 350 < window.innerHeight) {
        y = "top:" + yCoord + "px;";
      } else {
        yCoord =
          window.innerHeight - entryElement.getBoundingClientRect().bottom;
        y = "bottom:" + yCoord + "px;";
      }

      x = "left:" + xCoord + "px;";

      const overflowTemplate = document.createElement("template");

      overflowTemplate.innerHTML = this._renderOverflowMenu(y, x, entry);

      const overflowMenu = overflowTemplate.content.firstElementChild;

      overflowMenu
        .querySelector(".overflow-close-button")
        .addEventListener("click", () => {
          this.removeOverflowMenu(entryElement);
        });

      overflowMenu
        .querySelector(".status-history-button")
        .addEventListener("click", () => {
          this.dispatchEvent(
            new CustomEvent("show-status-history", {
              detail: entry,
            })
          );
        });

      entryElement.appendChild(overflowMenu);

      entryElement.setAttribute("expanded", "");
    }

    removeOverflowMenu(entry) {
      entry.removeAttribute("expanded");
      entry.querySelector(".overflow-menu-container").remove();
    }

    _renderHistoryGroup = (group) => /* HTML */ `
      <div class="group-container">
        <div class="group-header">
          <h3 class="group-name" title="${group.created_at}">
            <time datetime="2023-08-18">${group.created_at}</time>
          </h3>
        </div>
        <div class="group-entries-container"></div>
      </div>
    `;

    _renderHistoryEntry = (entry, startDate, endDate) => /* HTML */ `
      <div class="entry-container">
        <button
          class="run-entry-button"
          ${[
            util.COMPLETED_INFERENCE_NOTIFICATION,
            util.COMPLETED_WITH_ERRORS_INFERENCE_NOTIFICATION,
            util.PARTIALLY_COMPLETED_INFERENCE_NOTIFICATION,
          ].includes(entry.status) ||
          ( entry?.geoserver_layers?.predicted_layers?.length
            && entry.status === util.STOPPED_INFERENCE_NOTIFICATION)
            ? ""
            : "disabled"}
        >
          <span class="entry-status-icon">
            ${( entry?.geoserver_layers?.predicted_layers?.length
            && entry.status === util.STOPPED_INFERENCE_NOTIFICATION)
            ? this.getStatusIcon("STOPPED_WITH_RESULTS"): this.getStatusIcon(entry.status)}
          </span>
          <h4 class="entry-time">${this.formatTime(entry.created_at)}</h4>
          <div class="entry-info">
            <h4
              class="entry-description"
              title="${entry.description ? entry.description : "Unavailable"}"
            >
              ${entry.description ? entry.description : "Unavailable"}
            </h4>
            <h5
              class="entry-location"
              title="${entry.location ? entry.location : "Unavailable"}"
            >
              <span class="entry-info-icon">${locationIcon()}</span>
              <span class="entry-info-text">
                ${entry.location ? entry.location : "Unavailable"}
              </span>
            </h5>
            <h5
              class="entry-model"
              title="${entry.model_display_name
                ? entry.model_display_name
                : "Unavailable"}"
            >
              <span class="entry-info-icon">${modelIcon()}</span>
              <span class="entry-info-text">
                ${entry.model_display_name
                  ? entry.model_display_name
                  : "Unavailable"}
              </span>
            </h5>
            <h5
              class="entry-dates"
              title="${startDate
                ? endDate
                  ? startDate + " / " + endDate
                  : "Unavailable"
                : "Unavailable"}"
            >
              <span class="entry-info-icon">
                ${calendarIcon({ width: 16, height: 16 })}
              </span>
              <span class="entry-info-text">
                ${startDate
                  ? endDate
                    ? startDate + " / " + endDate
                    : "Unavailable"
                  : "Unavailable"}
              </span>
            </h5>
          </div>
          <span class="run-entry-icon">
            ${[
              util.COMPLETED_INFERENCE_NOTIFICATION,
              util.COMPLETED_WITH_ERRORS_INFERENCE_NOTIFICATION,
              util.PARTIALLY_COMPLETED_INFERENCE_NOTIFICATION,
            ].includes(entry.status)
              ? arrowRightIcon({
                  height: 16,
                  width: 16,
                  title: "Run inference",
                  fill: "#f4f4f4",
                })
              : arrowRightIcon({
                  height: 16,
                  width: 16,
                  title: "Run inference",
                  fill: "#6f6f6f",
                })}
          </span>
        </button>
        <button class="overflow-menu-toggle">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 5C8.55228 5 9 4.55228 9 4C9 3.44772 8.55228 3 8 3C7.44772 3 7 3.44772 7 4C7 4.55228 7.44772 5 8 5Z"
              fill="#F4F4F4"
            />
            <path
              d="M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z"
              fill="#F4F4F4"
            />
            <path
              d="M8 13C8.55228 13 9 12.5523 9 12C9 11.4477 8.55228 11 8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13Z"
              fill="#F4F4F4"
            />
          </svg>
        </button>
      </div>
    `;

    _renderOverflowMenu = (y, x, entry) => /* HTML */ `
      <div class="overflow-menu-container" style="${y}; ${x};">
        <div id="overflow-header">
          <h4 id="overflow-title">Run details</h4>
          <button
            class="overflow-close-button"
            title="Close layer options panel"
          >
            ${closeIcon({ width: 16, height: 16 })}
          </button>
        </div>
        <div id="overflow-body">
          <section class="overflow-info-container">
            <h4 class="overflow-status-container">
              <span class="overflow-status-icon">
                ${( entry?.geoserver_layers?.predicted_layers?.length
                  && entry.status === util.STOPPED_INFERENCE_NOTIFICATION)
                  ? this.getStatusIcon("STOPPED_WITH_RESULTS"): this.getStatusIcon(entry.status)}
              </span>
              <span class="overflow-status-text">Status</span>
              <button class="status-history-button">
                ${popupIcon({ width: 16, height: 16 })}
              </button>
            </h4>
            <h5>
              ${entry.status}${entry.statusMessage
                ? `: ${entry.statusMessage}`
                : ""}
            </h5>
            ${entry.status === util.FAILED_INFERENCE_NOTIFICATION
              ? "<h5>" + entry.info + "</h5>"
              : ""}
          </section>
          <section class="overflow-info-container">
            <h4>Description</h4>
            <h5>${entry.description ? entry.description : "Unavailable"}</h5>
          </section>
          <section class="overflow-info-container">
            <h4>Location</h4>
            <h5>${entry.location ? entry.location : "Unavailable"}</h5>
          </section>
          <section class="overflow-info-container">
            <h4>Model</h4>
            <h5>${entry.model_name ? entry.model_name : "Unavailable"}</h5>
          </section>
        </div>
      </div>
    `;

    formatDate(dateString) {
      const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const date = new Date(dateString);
      const dayOfWeek = weekdays[date.getUTCDay()];
      const month = months[date.getUTCMonth()];
      const day = date.getUTCDate();
      const year = date.getUTCFullYear();

      return `${dayOfWeek}, ${month} ${day}, ${year}`;
    }

    formatTime = (date) => {
      var d = new Date(date),
        hours = "0" + d.getHours(),
        minutes = "0" + d.getMinutes();

      return [hours.slice(-2), minutes.slice(-2)].join(":");
    };

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
