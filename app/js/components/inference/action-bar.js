/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import {
  downloadIcon,
  runIcon2,
  resetIcon,
  scriptIcon,
  locationIcon,
  calendarIcon,
} from "../../icons.js";
import "./search-bar.js";
import * as util from "../../utils.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    .display-none {
      display: none;
    }

    .visibility-hidden {
      visibility: hidden;
    }

    #action-bar {
      position: fixed;
      top: 3rem;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 1rem 25px 2rem;
      backdrop-filter: blur(1px);
      background: linear-gradient(
        180deg,
        #000000bb 0%,
        #00000077 70%,
        #00000000 100%
      );
      z-index: 2;
    }

    #inference-information {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
    }

    #title {
      color: var(--cds-text-01, #ffffff);
      font-size: 20px;
      font-weight: 400;
      line-height: 28px;
      letter-spacing: 0px;
    }

    #meta-information-container {
      display: flex;
      column-gap: 1rem;
    }

    .info-container {
      display: flex;
      align-items: center;
      column-gap: 0.25rem;
      color: var(--cds-text-02, #c6c6c6);
      font-size: 14px;
      font-weight: 400;
      line-height: 18px;
      letter-spacing: 0.16px;
    }

    #location {
      max-width: 10rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #buttons {
      display: flex;
      column-gap: 0.5rem;
    }

    #search-bar {
      position: absolute;
      top: calc(50% + 0.5rem);
      left: 50%;
      transform: translate(-50%, -50%);
    }
  </style>

  <div id="action-bar">
    <div id="inference-information">
      <span id="title" title="Basemap">Basemap</span>
      <div id="meta-information-container">
        <span class="info-container"
          >${locationIcon({ width: 16, height: 16 })}
          <span id="location" title="Location">Location</span></span
        >
        <span class="info-container"
          >${calendarIcon({ width: 16, height: 16 })}
          <span id="dates" title="DD-MM-YY / DD-MM-YY"
            >DD-MM-YY / DD-MM-YY</span
          ></span
        >
      </div>
    </div>
    <search-bar id="search-bar"></search-bar>
    <div id="buttons">
      <cds-button
        id="script-button"
        kind="secondary"
        title="script"
        disabled
        class="display-none"
        >${scriptIcon({ width: 16, height: 16, slot: "icon" })}</cds-button
      >
      <cds-button
        id="download-button"
        kind="secondary"
        title="download inference"
        disabled
        >${downloadIcon({ width: 16, height: 16, slot: "icon" })}</cds-button
      >
      <cds-button id="reset-button" kind="secondary" title="reset map"
        >${resetIcon({ width: 16, height: 16, slot: "icon" })}</cds-button
      >

      <cds-button id="inference-panel-button" kind="primary">
        Run Inference ${runIcon2({ width: 16, height: 16, slot: "icon" })}
      </cds-button>
    </div>
  </div>
`;

window.customElements.define(
  "action-bar",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.runInferenceButton = this.shadow.querySelector(
        "#inference-panel-button"
      );
      this.scriptButton = this.shadow.querySelector("#script-button");
      this.downloadButton = this.shadow.querySelector("#download-button");
      this.resetButton = this.shadow.querySelector("#reset-button");
      this.searchBar = this.shadow.querySelector("search-bar");

      this.runInferenceButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("inference-panel-button-click"));
      });

      this.downloadButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("download-button-click"));
      });

      this.resetButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("reset-button-click"));
      });

      this.searchBar.addEventListener("geocode-this", (e) => {
        this.dispatchEvent(
          new CustomEvent("geocode-this", {
            detail: e.detail,
          })
        );
      });
    }

    setupActionBar(inference = null) {
      const titleElement = this.shadow.querySelector("#title");
      const locationElement = this.shadow.querySelector("#location");
      const datesElement = this.shadow.querySelector("#dates");

      if (inference) {
        this.scriptButton.removeAttribute("disabled");

        if (inference.output_url != "None") {
          this.downloadButton.removeAttribute("disabled");
        } else {
          this.downloadButton.setAttribute("disabled", "");
        }

        titleElement.textContent = inference.description
          ? inference.description
          : "Unavailable";
        titleElement.setAttribute(
          "title",
          `${inference.description ? inference.description : "Unavailable"}`
        );

        locationElement.textContent = inference.location
          ? inference.location
          : "Unavailable";
        locationElement.setAttribute(
          "title",
          `${inference.location ? inference.location : "Unavailable"}`
        );

        const minMaxDates = util.getMinMaxFromTemporalDomain(
          inference.temporal_domain
        );

        datesElement.textContent =
          (minMaxDates.min ? minMaxDates.min : "Unavailable") +
          " / " +
          (minMaxDates.max ? minMaxDates.max : "Unavailable");

        datesElement.setAttribute(
          "title",
          `${
            (minMaxDates.min ? minMaxDates.min : "Unavailable") +
            " / " +
            (minMaxDates.max ? minMaxDates.max : "Unavailable")
          }`
        );
      } else {
        this.scriptButton.setAttribute("disabled", "");
        this.downloadButton.setAttribute("disabled", "");

        titleElement.textContent = "Basemap";
        titleElement.setAttribute("title", "Basemap");
        locationElement.textContent = "Location";
        locationElement.setAttribute("title", "Location");
        datesElement.textContent = "DD-MM-YY / DD-MM-YY";
        datesElement.setAttribute("title", "DD-MM-YY / DD-MM-YY");
      }
    }
  }
);
