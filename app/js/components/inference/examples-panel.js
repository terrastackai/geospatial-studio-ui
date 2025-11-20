/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import {
  errorStatusIcon,
  readyStatusIcon,
  progressStatusIcon,
  popupIcon,
  modelIcon,
  arrowRightIcon,
  pendingStatusIcon,
  partiallyCompletedStatusIcon,
  lulcIcon,
  closeIcon,
  locationIcon,
  calendarIcon,
  stopStatusIcon,
  completedWithErrorsStatusIcon,
} from "../../icons.js";
import "../../libs/carbon-web-components/loading.min.js";
import * as util from "../../utils.js";

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
    h4,
    h5,
    h6 {
      margin: 0;
      color: var(--cds-text-primary, #f4f4f4);
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

    #examples-panel-container {
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
      margin: 0;
      color: var(--cds-text-primary, #f4f4f4);
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

    #examples-container {
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

    .example-series-header {
      width: 100%;
      padding: 0.75rem;
      border-top: 1px solid var(--cds-field-04, #6f6f6f);
    }

    .example-series-header h3 {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
    }

    .example-group-container {
      border-top: 1px solid var(--cds-field-04, #6f6f6f);
    }

    .example-group-header {
      width: 100%;
      padding: 0.75rem;
      border-bottom: 1px solid var(--cds-field-04, #6f6f6f);
    }

    .example-group-header h4 {
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      font-weight: 400;
      line-height: 18px;
      letter-spacing: 0.16px;
    }

    .example-container {
      display: flex;
      align-items: flex-start;
      width: 100%;
    }

    .example-container:not(:last-child) {
      border-bottom: 1px dashed var(--cds-field-04, #6f6f6f);
    }

    .run-example-button {
      display: flex;
      flex-grow: 1;
      align-items: flex-start;
      column-gap: 0.5rem;
      min-width: 0;
      padding: 0.5rem 0.5rem 0.5rem 0.75rem;
      text-align: left;
    }

    .run-example-button:hover {
      background-color: #ffffff14;
    }

    .overflow-menu-toggle {
      padding: 0.5rem 0.75rem 0.5rem 0.5rem;
    }

    .example-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 2.5rem;
      min-height: 2.5rem;
      background: #d0e2ff;
      border-radius: 0.5rem;
      margin-right: 0.25rem;
    }

    .example-info {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      row-gap: 0.25rem;
      min-width: 0;
    }

    .example-description {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.16px;
      line-height: normal;
      color: var(--cds-text-primary, #f4f4f4);
    }

    .example-model,
    .example-location {
      display: flex;
      column-gap: 0.25rem;
    }

    .example-info-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: normal;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.32px;
      color: var(--cds-text-secondary, #c6c6c6);
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
      background-color: var(--cds-field-01, #262626);
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

    .overflow-info-container h4 {
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      letter-spacing: 0.16px;
    }

    .overflow-info-container h5 {
      color: var(--cds-text-secondary, #c6c6c6);
      font-size: 12px;
      font-weight: 400;
      line-height: 16px;
      letter-spacing: 0.32px;
    }

    .status-history-button,
    #panel-close-button {
      color: var(--cds-icon-primary, #f4f4f4);
    }
  </style>

  <div id="examples-panel-container">
    <div id="panel-header">
      <h2 id="title">Examples</h2>
      <button id="panel-close-button" title="Close examples panel">
        ${closeIcon({ width: 16, height: 16 })}
      </button>
    </div>
    <div id="loading-container">
      <cds-loading></cds-loading>
    </div>
    <div id="examples-container" class="display-none"></div>
  </div>
`;

window.customElements.define(
  "examples-panel",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.loaded = 0;
    }

    render() {
      this.setDOM(template(this));

      this.loadingContainer = this.shadow.querySelector("#loading-container");
      this.examplesContainer = this.shadow.querySelector("#examples-container");
      this.closeButton = this.shadow.querySelector("#panel-close-button");

      this.closeButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("close-panel"));
      });
    }

    setupMyExamples(myExamples) {
      const exampleSectionTemplate = document.createElement("template");
      exampleSectionTemplate.innerHTML = this._renderExampleGroupSection(
        "My Examples",
        "my-examples"
      );
      const exampleSection = exampleSectionTemplate.content.firstElementChild;

      myExamples.forEach((example) => {
        this.setupExample(
          example,
          lulcIcon({ height: 20, width: 20 }),
          exampleSection.querySelector(".example-group")
        );
      });

      this.examplesContainer.appendChild(exampleSection);

      this.loaded++;
      this.handleLoading();
    }

    setupSystemExamples(systemExamples) {
      // systemExamples = systemExamples.filter(
      //   (item) => item.status === "COMPLETED"
      // );

      for (let inference of systemExamples) {
        let exampleSection;

        let sectionID = inference.demo.section_name
          .toLowerCase()
          .split(" ")
          .join("-");

        if (this.shadow.querySelector(`#${sectionID}`)) {
          exampleSection = this.shadow.querySelector(`#${sectionID}`);
        } else {
          const exampleSectionTemplate = document.createElement("template");
          exampleSectionTemplate.innerHTML = this._renderExampleGroupSection(
            inference.demo.section_name,
            sectionID
          );
          exampleSection = exampleSectionTemplate.content.firstElementChild;

          this.examplesContainer.appendChild(exampleSection);
        }

        this.setupExample(
          inference,
          lulcIcon({ height: 20, width: 20 }),
          exampleSection.querySelector(".example-group")
        );
      }

      this.loaded++;
      this.handleLoading();
    }

    handleLoading() {
      if (this.loaded === 2) {
        this.loadingContainer.classList.add("display-none");
        this.examplesContainer.classList.remove("display-none");
      }
    }

    filterExamples = (examples, filterFn) => {
      const filteredExamples = examples.filter(filterFn);
      const remainingExamples = examples.filter(
        (item) => !filteredExamples.includes(item)
      );
      return { filteredExamples, remainingExamples };
    };

    setupExample(example, icon, examplesContainer) {
      const minMaxDates = util.getMinMaxFromTemporalDomain(
        example.temporal_domain
      );

      const exampleTemplate = document.createElement("template");
      exampleTemplate.innerHTML = this._renderExample(
        example,
        minMaxDates.min,
        minMaxDates.max,
        icon
      );
      const exampleElement = exampleTemplate.content.firstElementChild;

      //Attach Example Button Click Event Listener
      exampleElement
        .querySelector(".run-example-button")
        .addEventListener("click", () => {
          this.dispatchEvent(new CustomEvent("load-map", { detail: example }));
        });

      //=== Attach Overflow Menu Event Listener ===
      const overflowMenuToggle = exampleElement.querySelector(
        ".overflow-menu-toggle"
      );
      overflowMenuToggle.addEventListener("click", () => {
        if (exampleElement.hasAttribute("expanded")) {
          this.removeOverflowMenu(exampleElement);
        } else {
          this.setupOverflowMenu(exampleElement, example);
        }
      });

      examplesContainer.appendChild(exampleElement);
    }

    setupOverflowMenu(exampleElement, example) {
      example["statusMessage"] = util.percentageStepBreakdown(example);
      const examplesContainer = this.shadow.querySelector(
        "#examples-container"
      );

      if (examplesContainer.querySelector("[expanded]")) {
        this.removeOverflowMenu(examplesContainer.querySelector("[expanded]"));
      }

      let xCoord = examplesContainer.getBoundingClientRect().right + 5;
      let yCoord = exampleElement.getBoundingClientRect().top;

      let y;
      let x;

      if (yCoord + 350 < window.innerHeight) {
        y = "top:" + yCoord + "px;";
      } else {
        yCoord =
          window.innerHeight - exampleElement.getBoundingClientRect().bottom;
        y = "bottom:" + yCoord + "px;";
      }

      x = "left:" + xCoord + "px;";

      const overflowTemplate = document.createElement("template");

      overflowTemplate.innerHTML = this._renderOverflowMenu(y, x, example);

      const overflowMenu = overflowTemplate.content.firstElementChild;

      overflowMenu
        .querySelector(".overflow-close-button")
        .addEventListener("click", () => {
          this.removeOverflowMenu(exampleElement);
        });

      overflowMenu
        .querySelector(".status-history-button")
        .addEventListener("click", () => {
          this.dispatchEvent(
            new CustomEvent("show-status-history", {
              detail: example,
            })
          );
        });

      exampleElement.appendChild(overflowMenu);

      exampleElement.setAttribute("expanded", "");
    }

    removeOverflowMenu(example) {
      example.removeAttribute("expanded");
      example.querySelector(".overflow-menu-container").remove();
    }

    _renderExampleGroupSection = (groupTitle, groupId) => /* HTML */ `
      <section id="${groupId}" class="example-group-container">
        <div class="example-group-header">
          <h4>${groupTitle}</h4>
        </div>
        <div class="example-group"></div>
      </section>
    `;

    _renderExample = (example, startDate, endDate, icon) => /* HTML */ `
      <div class="example-container">
        <button class="run-example-button">
          <span class="example-icon"> ${icon} </span>
          <div class="example-info">
            <h5 class="example-description">
              ${example.description
                ? example.description
                : example.location
                ? example.location
                : example.model_display_name}
            </h5>
            <h6
              class="example-location"
              title="${example.location ? example.location : "Unavailable"}"
            >
              <span class="example-info-icon">${locationIcon()}</span>
              <span class="example-info-text"
                >${example.location ? example.location : "Unavailable"}</span
              >
            </h6>
            <h6
              class="example-model"
              title="${example.model_display_name
                ? example.model_display_name
                : "Unavailable"}"
            >
              <span class="example-info-icon">${modelIcon()}</span>
              <span class="example-info-text"
                >${example.model_display_name
                  ? example.model_display_name
                  : "Unavailable"}</span
              >
            </h6>
            <h6
              class="example-model"
              title="${startDate
                ? endDate
                  ? startDate + " / " + endDate
                  : "Unavailable"
                : "Unavailable"}"
            >
              <span class="example-info-icon">${calendarIcon()}</span>
              <span class="example-info-text">
                ${startDate
                  ? endDate
                    ? startDate + " / " + endDate
                    : "Unavailable"
                  : "Unavailable"}
              </span>
            </h6>
          </div>
          <span class="run-example-icon">
            ${arrowRightIcon({
              height: 16,
              width: 16,
              title: "Run example",
              fill: "#f4f4f4",
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

    _renderOverflowMenu = (y, x, example) => /* HTML */ `
      <div class="overflow-menu-container" style="${y}; ${x};">
        <div id="overflow-header">
          <h4 id="overflow-title">Example details</h4>
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
                ${this.getStatusIcon(example.status)}
              </span>
              <span class="overflow-status-text">Status</span>
              <button class="status-history-button">
                ${popupIcon({ width: 16, height: 16 })}
              </button>
            </h4>
            <h5>
              ${example.status}${example.statusMessage
                ? `: ${example.statusMessage}`
                : ""}
            </h5>
            ${example.status === util.FAILED_INFERENCE_NOTIFICATION
              ? "<h5>" + example.info + "</h5>"
              : ""}
          </section>
          <section class="overflow-info-container">
            <h4>Description</h4>
            <h5>
              ${example.description ? example.description : "Unavailable"}
            </h5>
          </section>
          <section class="overflow-info-container">
            <h4>Location</h4>
            <h5>${example.location ? example.location : "Unavailable"}</h5>
          </section>
          <section class="overflow-info-container">
            <h4>Model</h4>
            <h5>${example.model_name ? example.model_name : "Unavailable"}</h5>
          </section>
        </div>
      </div>
    `;

    getStatusIcon(status) {
      switch (status) {
        case util.COMPLETED_INFERENCE_NOTIFICATION:
          return readyStatusIcon();
        case util.COMPLETED_WITH_ERRORS_INFERENCE_NOTIFICATION:
          return completedWithErrorsStatusIcon();
        case util.FAILED_INFERENCE_NOTIFICATION:
          return errorStatusIcon();
        case util.STOPPED_INFERENCE_NOTIFICATION:
          return stopStatusIcon();
        case util.PARTIALLY_COMPLETED_INFERENCE_NOTIFICATION:
          return partiallyCompletedStatusIcon();
        case util.PENDING_INFERENCE_NOTIFICATION:
          return pendingStatusIcon();
        case util.RUNNING_INFERENCE_INFERENCE_NOTIFICATION:
          return progressStatusIcon();
        default:
          return pendingStatusIcon();
      }
    }
  }
);
