/*
 * © Copyright IBM Corporation 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import asWebComponent from "../../webcomponent.js";
import * as icons from "../../icons.js";
import * as util from "../../utils.js";
import "../../libs/carbon-web-components/button.min.js";
import "../../libs/carbon-web-components/tabs.min.js";
import "../../libs/carbon-web-components/toggle.min.js";
import "../../libs/carbon-web-components/text-input.min.js";
import "../../libs/carbon-web-components/combo-box.min.js";
import "../../libs/carbon-web-components/date-picker.min.js";
import "../../libs/carbon-web-components/textarea.min.js";
import "../../libs/carbon-web-components/radio-button.min.js";

export const containsAnySubstring = (targetString, substringList) => {
  for (const substring of substringList) {
    if (targetString.includes(substring)) {
      return true;
    }
  }
  return false;
};

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    button {
      display: flex;
      align-items: center;
      background: unset;
      border: none;
      cursor: pointer;
    }

    .label-text {
      color: var(--cds-text-secondary, #c6c6c6);
      font-size: 0.75rem;
      font-weight: 400;
      line-height: 1rem;
      letter-spacing: 0.32px;
    }

    .helper-link {
      margin-top: 0.25rem;
      color: var(--cds-link-primary, #78a9ff);
      font-size: 0.75rem;
      letter-spacing: 0.32px;
      text-decoration: none;
      cursor: pointer;
    }

    .helper-link:hover {
      color: var(--cds-interactive, #4589ff);
    }

    #inference-panel-container {
      display: flex;
      flex-direction: column;
      width: 340px;
      background: var(--cds-field-01, #262626);
      border-radius: 1rem;
    }

    #inference-panel-header {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 0.75rem;
    }

    #inference-panel-header h2 {
      color: var(--cds-text-primary, #f4f4f4);
      font-size: 20px;
      font-weight: 400;
      line-height: 28px;
    }

    #inference-panel-header button {
      color: var(--cds-text-primary, #f4f4f4);
    }

    #inference-panel-body {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;
      padding: 0 0 1rem 1rem;
    }

    cds-tabs {
      width: calc(100% - 1rem);
      padding-right: 1rem;
    }

    cds-tab {
      width: 120px;
    }

    #inference-panel-body section {
      width: 100%;
      height: 48vh;
      padding-right: 1rem;
      max-height: 450px;
      overflow-y: auto;
      scroll-behavior: smooth;
    }

    #bounding-box-label-container {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    #bounding-box-label-container .tool-tip {
      position: relative;
      display: flex;
      color: var(--cds-text-secondary, #c6c6c6);
    }

    #bounding-box-label-container .tool-tip:hover::after {
      content: "To adjust the bounding box, search for a location and adjust the map accordingly.";
      position: absolute;
      top: 100%;
      right: 100%;
      width: 10rem;
      padding: 0.5rem;
      background: var(--cds-field-03, #393939);
      color: var(--cds-text-primary, #f4f4f4);
      font-weight: 400;
      font-size: 0.75rem;
      border-radius: 4px 0 4px 4px;
      z-index: 2;
    }

    cds-toggle,
    cds-text-input,
    cds-combo-box,
    cds-date-picker-input,
    cds-textarea {
      display: inline-block;
    }

    cds-combo-box::part(menu-body) {
      outline: 1px solid white;
    }

    #bounding-box-toggle {
      margin-left: 0.2rem;
    }

    #bounding-box-input {
      margin-top: -1rem;
    }

    #date-availability-button {
      width: fit-content;
      margin-top: 1rem;
    }

    #query-title-input,
    #query-model-input,
    #link-title-input,
    #link-location-input,
    #link-model-input {
      width: 100%;
      margin-top: 1rem;
    }

    #date-picker-container {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-top: 1rem;
    }

    #date-picker-container .tool-tip {
      position: relative;
      display: flex;
      color: var(--cds-text-secondary, #c6c6c6);
    }

    #date-picker-container .tool-tip:hover::after {
      content: "Selecting a large time period will substantially increase the time it takes to complete an inference run.";
      position: absolute;
      bottom: 100%;
      right: 100%;
      width: 10rem;
      padding: 0.5rem;
      background: var(--cds-field-03, #393939);
      color: var(--cds-text-primary, #f4f4f4);
      font-weight: 400;
      font-size: 0.75rem;
      border-radius: 4px 0 4px 4px;
      z-index: 2;
    }

    cds-date-picker {
      position: relative;
      flex-grow: 1;
      display: flex;
      justify-content: space-between;
    }

    #inference-panel-footer {
      display: flex;
      flex-direction: row-reverse;
      width: 100%;
    }

    #inference-panel-footer cds-button {
      width: 50%;
    }

    #inference-panel-footer cds-button::part(button) {
      border-bottom-right-radius: 1rem;
    }

    #available-dates-container {
      display: flex;
      row-gap: 0.5rem;
      column-gap: 0.5rem;
      flex-wrap: wrap;
      width: 100%;
      margin-top: 1rem;
    }

    .available-date {
      display: flex;
      justify-content: center;
      align-items: center;
      width: fit-content;
      padding: 0.5rem 1rem;
      background: var(--cds-field-01, #262626);
      border: 1px solid var(--cds-icon-primary, #f4f4f4);
      border-radius: 20px;
    }

    .available-date span {
      color: var(--cds-text-primary, #f4f4f4);
      font-size: 14px;
      font-weight: 400;
      white-space: nowrap;
    }

    cds-radio-button-group {
      margin-top: 1rem;
    }

    cds-radio-button-group div {
      margin-top: 0.5rem;
      display: flex;
      justify-content: space-between;
      column-gap: 2.5rem;
    }

    cds-radio-button {
      color: var(--cds-text-secondary, #c6c6c6);
    }
  </style>

  <div id="inference-panel-container">
    <div id="inference-panel-header">
      <h2>Run Inference</h2>
      <button id="panel-close-button" title="Close inference panel">
        ${icons.closeIcon({ width: 16, height: 16 })}
      </button>
    </div>
    <div id="inference-panel-body">
      <cds-tabs value="query">
        <cds-tab value="query" target="panel-query" aria-labelledby="query-tab">
          Query
        </cds-tab>
        <cds-tab value="link" target="panel-link" aria-labelledby="link-tab">
          Link
        </cds-tab>
      </cds-tabs>
      <section id="panel-query" role="tabpanel" aria-labelledby="query-tab">
        <div id="bounding-box-label-container">
          <span class="label-text">Bounding Box Coordinates</span>
          <span class="tool-tip">
            ${icons.infoIcon({ width: 16, height: 16 })}
          </span>
        </div>
        <cds-toggle
          id="bounding-box-toggle"
          size="sm"
          label-a="Set manually"
          label-b="Set manually"
        ></cds-toggle>
        <cds-text-input
          id="bounding-box-input"
          helper-text="Format: min-lng;min-lat;max-lng;max-lat"
          readonly
          placeholder="Set your bounding box coordinates"
        >
        </cds-text-input>
        <cds-text-input
          id="query-title-input"
          label="Title"
          placeholder="e.g. downscaling example"
          helper-text="Add a descriptive title for this run"
        >
        </cds-text-input>

        <cds-radio-button-group
          id="models_tunes_radio_btn_group"
          legend-text="Models & Tunes label"
          name="query-models-tunes-group"
          value="model"
        >
          <div>
            <cds-radio-button
              label-text="Models"
              value="model"
            ></cds-radio-button>
            <cds-radio-button
              label-text="Tunes"
              value="tune"
            ></cds-radio-button>
          </div>
        </cds-radio-button-group>
        <cds-combo-box id="query-model-input" value=""> </cds-combo-box>
        <a href="/#model_catalog" class="helper-link">
          Find more details on models
        </a>
        <div id="date-picker-container">
          <cds-date-picker date-format="Y-m-d">
            <cds-date-picker-input
              id="start-date-input"
              kind="from"
              label-text="Start date"
              placeholder="Y-m-d"
            ></cds-date-picker-input>
            <cds-date-picker-input
              id="end-date-input"
              kind="to"
              label-text="End date"
              placeholder="Y-m-d"
            ></cds-date-picker-input>
          </cds-date-picker>
          <span class="tool-tip">
            ${icons.infoIcon({ width: 16, height: 16 })}
          </span>
        </div>
        <cds-button
          id="date-availability-button"
          icon-layout
          title="Check date availablity"
          kind="secondary"
          size="sm"
        >
          Check date availablity
          ${icons.calendarIcon({ slot: "icon", width: 16, height: 16 })}
        </cds-button>
        <div id="available-dates-container"></div>
      </section>
      <section
        id="panel-link"
        role="tabpanel"
        aria-labelledby="link-tab"
        hidden
      >
        <cds-textarea
          id="url-input"
          label="Add a pre-signed url"
          helper-text="Presigned URL to user provided data - This is a link that allows
        direct download of the user data."
          rows="3"
        >
        </cds-textarea>
        <cds-text-input
          id="link-title-input"
          label="Title"
          placeholder="e.g. downscaling example"
          helper-text="Add a descriptive title for this run"
        >
        </cds-text-input>
        <cds-text-input
          id="link-location-input"
          label="Location"
          placeholder="e.g. Hursley"
        >
        </cds-text-input>
        <cds-radio-button-group
          id="url_models_tunes_radio_btn_group"
          legend-text="Models & Tunes label"
          name="link-models-tunes-group"
          value="model"
        >
          <cds-radio-button
            label-text="Models"
            value="model"
          ></cds-radio-button>
          <cds-radio-button label-text="Tunes" value="tune"></cds-radio-button>
        </cds-radio-button-group>
        <cds-combo-box id="link-model-input" value=""> </cds-combo-box>
        <a href="/#model_catalog" class="helper-link">
          Find more details on models
        </a>
      </section>
    </div>
    <div id="inference-panel-footer">
      <cds-button id="run-button" icon-layout title="Run inference" disabled>
        Run ${icons.runIcon({ slot: "icon", width: 16, height: 16 })}
      </cds-button>
    </div>
  </div>
`;

export const returnValidatedQueryFields = (
  titleValue,
  inferenceTaskValue,
  startDateValue,
  endDateValue
) => {
  return titleValue && inferenceTaskValue && startDateValue && endDateValue;
};

window.customElements.define(
  "inference-panel",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.models = [];
      this.sharedTunes = [];
      this.tryTuneInLabId = null;
      this.isModelTuneMode = "model";
    }

    render() {
      this.setDOM(template(this));

      this.closeButton = this.shadow.querySelector("#panel-close-button");
      this.tabs = this.shadow.querySelector("cds-tabs");
      this.boundingBoxToggle = this.shadow.querySelector(
        "#bounding-box-toggle"
      );
      this.boundingBoxInput = this.shadow.querySelector("#bounding-box-input");
      this.queryTitleInput = this.shadow.querySelector("#query-title-input");
      this.queryModelInput = this.shadow.querySelector("#query-model-input");
      this.datePicker = this.shadow.querySelector("cds-date-picker");
      this.startDateInput = this.shadow.querySelector("#start-date-input");
      this.endDateInput = this.shadow.querySelector("#end-date-input");
      this.availableDatesContainer = this.shadow.querySelector(
        "#available-dates-container"
      );
      this.URLInput = this.shadow.querySelector("#url-input");
      this.linkTitleInput = this.shadow.querySelector("#link-title-input");
      this.linkLocationInput = this.shadow.querySelector(
        "#link-location-input"
      );
      this.linkModelInput = this.shadow.querySelector("#link-model-input");
      this.runButton = this.shadow.querySelector("#run-button");
      this.modelsTunesRadioBtnGroup = this.shadow.querySelector(
        "#models_tunes_radio_btn_group"
      );
      this.urlModelsTunesRadioBtnGroup = this.shadow.querySelector(
        "#url_models_tunes_radio_btn_group"
      );
      this.modelsTunesRadioBtnGroup.style.display = "none";
      this.urlModelsTunesRadioBtnGroup.style.display = "none";

      this.modelsTunesRadioBtnGroup.addEventListener(
        "cds-radio-button-group-changed",
        (event) => {
          this.isModelTuneMode = event?.detail?.value;
          this.clearComboBox();
          this.setupModelTuneComboBoxes();
          this.urlModelsTunesRadioBtnGroup.value = this.isModelTuneMode;
        }
      );
      this.urlModelsTunesRadioBtnGroup.addEventListener(
        "cds-radio-button-group-changed",
        (event) => {
          this.isModelTuneMode = event?.detail?.value;
          this.clearComboBox();
          this.setupModelTuneComboBoxes();
          this.modelsTunesRadioBtnGroup.value = this.isModelTuneMode;
        }
      );

      this.startDateInput.addEventListener("click", () => {
        this.startDateInput.scrollIntoView();
      });

      this.endDateInput.addEventListener("click", () => {
        this.endDateInput.scrollIntoView();
      });

      this.queryModelInput.addEventListener("click", () => {
        this.queryModelInput.scrollIntoView();
      });

      this.linkModelInput.addEventListener("click", () => {
        this.linkModelInput.scrollIntoView();
      });

      this.closeButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("close-panel"));
      });

      this.tabs.addEventListener("cds-tabs-selected", (e) => {
        this.handleTabChange(e.detail.item.target);
        this.handleRunButtonState();
        this.handleDataCheckerButtonState();
      });

      this.boundingBoxToggle.addEventListener("cds-toggle-changed", () => {
        this.handleBoundingBoxCheckboxClick();

        this.handleDataCheckerButtonState();
        this.handleRunButtonState();
      });

      this.boundingBoxInput.addEventListener("input", () => {
        this.boundingBoxInput.value = this.boundingBoxInput.value.replaceAll(
          ",",
          ";"
        );
        this.flyToBoundingBox();

        this.handleDataCheckerButtonState();
        this.handleRunButtonState();
      });

      this.queryTitleInput.addEventListener("input", () => {
        this.handleRunButtonState();
      });

      this.queryModelInput.addEventListener("cds-combo-box-selected", () => {
        this.handleDataCheckerButtonState();
        this.handleRunButtonState();
      });

      this.datePicker.addEventListener("cds-date-picker-changed", () => {
        this.handleDataCheckerButtonState();
        this.handleRunButtonState();
      });

      this.dateAvailablityButton = this.shadow.querySelector(
        "#date-availability-button"
      );

      this.dateAvailablityButton.addEventListener("click", () => {
        this.checkDataAvailability();
      });

      this.URLInput.addEventListener("input", () => {
        this.handleRunButtonState();
      });

      this.linkTitleInput.addEventListener("input", () => {
        this.handleRunButtonState();
      });

      this.linkLocationInput.addEventListener("input", () => {
        this.handleRunButtonState();
      });

      this.linkModelInput.addEventListener("cds-combo-box-selected", () => {
        this.handleRunButtonState();
      });

      this.runButton.addEventListener("click", () => {
        this.runButton.setAttribute("disabled", "");

        if (this.tabs.value === "query") {
          this.submitQueryInferenceV2();
        }

        if (this.tabs.value === "link") {
          this.submitLinkInferenceV2();
        }
      });

      this.handleDataCheckerButtonState();
      this.setDatePickerSVGColor();
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

    clearComboBox = () => {
      this.queryModelInput.value = "";
      this.linkTitleInput.value = "";
      this.queryModelInput._handleUserInitiatedClearInput();
      this.linkModelInput._handleUserInitiatedClearInput();
    };

    getModel(input) {
      const model = this.models.find((model) => model.id === input);

      return model;
    }

    getSharedTune(input) {
      const sharedTune = this.sharedTunes.find(
        (sharedTune) => sharedTune.id === input
      );
      return sharedTune;
    }

    async submitLinkInferenceV2() {
      let display_name;
      let fine_tuning_id;
      if (this.isModelTuneMode === "model") {
        const model = this.getModel(this.linkModelInput.value);
        display_name = model.display_name;
      } else if (this.isModelTuneMode === "tune") {
        display_name = "geofm-sandbox-models";
        fine_tuning_id = this.linkModelInput.value;
      }

      const urls = this.URLInput.value.replace(/\s+/g, "").split(",");

      // TODO: Remove this simulation after a facility to add date for each url is provided
      const fakeDate = new Date().setDate(
        new Date().getDate() - urls.length + 1
      );
      const dates = urls.map((url, index) => {
        const date = new Date(fakeDate);
        date.setDate(date.getDate() + index);
        return date.toISOString().split("T")[0];
      });

      let req = {
        description: this.linkTitleInput.value,
        location: this.linkLocationInput.value,
        ...(fine_tuning_id && { fine_tuning_id: fine_tuning_id }),
        model_display_name: display_name,
        spatial_domain: {
          urls: urls,
        },
        temporal_domain: dates,
      };

      this.submitInferenceV2(req);
    }

    async submitQueryInferenceV2() {
      let display_name;
      let fine_tuning_id;
      if (this.isModelTuneMode === "model") {
        const model = this.getModel(this.queryModelInput.value);
        display_name = model.display_name;
      } else if (this.isModelTuneMode === "tune") {
        display_name = "geofm-sandbox-models";
        fine_tuning_id = this.queryModelInput.value;
      }

      const coords = this.getCoords();

      let bounds;
      if (this.boundingBoxToggle.checked) {
        bounds = app.main.map.getBoundingBoxBounds(coords);
      } else {
        bounds = app.main.map.getBounds();
      }

      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();
      const apiBBox = [
        parseFloat(southWest.lng),
        parseFloat(southWest.lat),
        parseFloat(northEast.lng),
        parseFloat(northEast.lat),
      ];

      const location = await this.getLocationFromBBox(
        southWest.lat,
        northEast.lat,
        southWest.lng,
        northEast.lng
      );

      let req = {
        spatial_domain: {
          bbox: [apiBBox],
        },
        temporal_domain: [
          util.formatDateWithDashSeparatorUTC(this.startDateInput.value) +
            "_" +
            util.formatDateWithDashSeparatorUTC(this.endDateInput.value),
        ],
        model_display_name: display_name,
        ...(fine_tuning_id && { fine_tuning_id: fine_tuning_id }),
        description: this.queryTitleInput.value,
        location: location,
      };

      this.submitInferenceV2(req);
    }

    async submitInferenceV2(req) {
      let submitInferenceSub;
      if (this.isModelTuneMode === "tune") {
        submitInferenceSub = app.backend.tryoutInferenceV2(req);
      } else if (this.isModelTuneMode === "model") {
        submitInferenceSub = app.backend.submitInferenceV2(req);
      }

      submitInferenceSub
        .then((response) => {
          if (response && response.id) {
            this.resetInputs();

            this.dispatchEvent(
              new CustomEvent("inference-response", {
                detail: response,
              })
            );
            app.showMessage("Inference Submitted", "", "info", 5000);

            return;
          } else {
            app.showMessage(
              "Inference Failed",
              response?.detail,
              "error",
              5000
            );
            this.runButton.removeAttribute("disabled");
          }
        })
        .catch((error) => {
          app.showMessage("Inference Failed", error?.message, "error", 5000);
          this.runButton.removeAttribute("disabled");
          throw error;
        });
    }

    containsAnySubstring(targetString, substringList) {
      for (const substring of substringList) {
        if (targetString.includes(substring)) {
          return true;
        }
      }
      return false;
    }

    setTryTuneInLab(id) {
      this.tryTuneInLabId = id;
      this.isModelTuneMode = "tune";
      this.modelsTunesRadioBtnGroup.value = this.isModelTuneMode;
      this.modelsTunesRadioBtnGroup.setAttribute("disabled", "");
      this.urlModelsTunesRadioBtnGroup.value = this.isModelTuneMode;
      this.urlModelsTunesRadioBtnGroup.setAttribute("disabled", "");
      this.setupModelTuneComboBoxes();
    }

    setModels = (models) => {
      this.models = models.results || [];
      this.setupModelTuneComboBoxes();

      this.modelsTunesRadioBtnGroup.style.display = "";
      this.urlModelsTunesRadioBtnGroup.style.display = "";
    };

    setSharedTunes = (sharedTunes) => {
      this.sharedTunes = sharedTunes || [];
      this.setupModelTuneComboBoxes();
    };

    async setupModelTuneComboBoxes() {
      this.queryModelInput.innerHTML = "";
      this.linkModelInput.innerHTML = "";

      if (this.isModelTuneMode === "model") {
        this.models.map((item) => {
          this.queryModelInput.innerHTML += this._renderModelItemV2(item);
          this.linkModelInput.innerHTML += this._renderModelItemV2(item);
        });
      } else if (this.isModelTuneMode === "tune") {
        this.sharedTunes.map((item) => {
          this.queryModelInput.innerHTML += this._renderSharedTuneItemV2(item);
          this.linkModelInput.innerHTML += this._renderSharedTuneItemV2(item);
        });

        if (this.tryTuneInLabId) {
          let tuneToTry = this.getSharedTune(this.tryTuneInLabId);
          if (!tuneToTry) {
            tuneToTry = await app.backend.getTune(this.tryTuneInLabId);
            this.queryModelInput.innerHTML +=
              this._renderSharedTuneItemV2(tuneToTry);
            this.linkModelInput.innerHTML +=
              this._renderSharedTuneItemV2(tuneToTry);
            this.sharedTunes.push(tuneToTry);
          }

          this.queryModelInput.value = tuneToTry.id;
          this.linkModelInput.value = tuneToTry.id;

          this.queryModelInput.setAttribute("disabled", "");
          this.linkModelInput.setAttribute("disabled", "");
        }
      }
    }

    _renderModelItemV2 = (model) => /* HTML */ `
      <cds-combo-box-item value="${model.id}">
        ${model.display_name}
      </cds-combo-box-item>
    `;

    _renderSharedTuneItemV2 = (sharedTune) => /* HTML */ `
      <cds-combo-box-item value="${sharedTune.id}">
        ${sharedTune.name}
      </cds-combo-box-item>
    `;

    _renderComboBoxItem = (item) => /* HTML */ `
      <cds-combo-box-item value="${item.name}">
        ${item.name}
      </cds-combo-box-item>
    `;

    handleDataCheckerButtonState() {
      if (
        !this.getCoords() ||
        !this.queryModelInput.value ||
        !this.startDateInput.value ||
        !this.endDateInput.value
      ) {
        this.dateAvailablityButton.setAttribute("disabled", "");
      } else {
        this.dateAvailablityButton.removeAttribute("disabled");
      }
    }

    handleRunButtonState() {
      if (this.tabs.value === "query") {
        if (
          !this.getCoords() ||
          !this.queryTitleInput.value ||
          !this.queryModelInput.value ||
          !this.startDateInput.value ||
          !this.endDateInput.value
        ) {
          this.runButton.setAttribute("disabled", "");
        } else {
          this.runButton.removeAttribute("disabled");
        }
      } else if (this.tabs.value === "link") {
        if (
          !this.URLInput.value ||
          !this.linkTitleInput.value ||
          !this.linkLocationInput.value ||
          !this.linkModelInput.value
        ) {
          this.runButton.setAttribute("disabled", "");
        } else {
          this.runButton.removeAttribute("disabled");
        }
      }
    }

    handleBoundingBoxCheckboxClick() {
      if (this.boundingBoxToggle.checked) {
        this.boundingBoxInput.removeAttribute("readonly");
      } else {
        this.boundingBoxInput.setAttribute("readonly", "");
      }
    }

    flyToBoundingBox() {
      const coords = this.getCoords();
      if (!coords) {
        return;
      }

      app.main.map.flyToBounds([
        coords.lng1,
        coords.lat1,
        coords.lng2,
        coords.lat2,
      ]);
    }

    getCoords() {
      const rawCoords = this.boundingBoxInput.value
        .replace(/\s/g, "")
        .split(";");

      if (rawCoords.length != 4) {
        return;
      } else {
        rawCoords.forEach((coord) => {
          parseFloat(coord);
          if (isNaN(coord)) {
            return;
          }
        });

        const coords = {
          lng1: rawCoords[0],
          lat1: rawCoords[1],
          lng2: rawCoords[2],
          lat2: rawCoords[3],
        };

        return coords;
      }
    }

    setBBoxReadout() {
      if (this.boundingBoxToggle.checked) {
        return;
      }

      const bounds = app.main.map.getBounds();
      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();

      this.boundingBoxInput.value =
        southWest.lng.toFixed(6) +
        ";" +
        southWest.lat.toFixed(6) +
        ";" +
        northEast.lng.toFixed(6) +
        ";" +
        northEast.lat.toFixed(6);

      this.handleRunButtonState();
      this.handleDataCheckerButtonState();
    }

    async getLocationFromBBox(minLat, maxLat, minLng, maxLng) {
      //This function calls the mapbox geocode reverse function which accepts a single coordinate (long, lat).
      //There for we need to find the mid-point of our min and max lat and long.
      const midLat = ((minLat + maxLat) / 2).toFixed(6);
      const midLng = ((minLng + maxLng) / 2).toFixed(6);

      let location;

      try {
        const response = await app.backend.getLocationFromLatLong(
          midLat,
          midLng
        );

        if (
          response &&
          ((app.env.geostudio.mapboxToken && "features" in response) ||
            (!app.env.geostudio.mapboxToken && "address" in response))
        ) {
          if (app.env.geostudio.mapboxToken) {
            for (let feature of response.features) {
              if (
                feature.properties.feature_type === "locality" ||
                feature.properties.feature_type === "place"
              ) {
                location = feature.properties.full_address;
                break;
              }
            }
            if (!location) {
              location = response.features[0].properties.full_address;
            }
          } else {
            location = `${
              response.address.village ? response.address.village + ", " : ""
            }${response.address.suburb ? response.address.suburb + ", " : ""}${
              response.address.city ? response.address.city + ", " : ""
            }${
              response.address.country ? response.address.country + ", " : ""
            }`;
          }
        } else {
          app.showMessage(
            "Failed to load bounding box: " +
              (response?.message ? response.message : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        app.progress.hide();
        console.error("Error loading bounding box:", error);
        app.showMessage(
          "An error occured while loading the bounding box",
          "",
          "error",
          5000
        );
      }
      return location;
    }

    resetInputs() {
      this.queryTitleInput.value = "";

      this.linkTitleInput.value = "";

      this.availableDatesContainer.innerHTML = "";
    }

    async checkDataAvailability() {
      this.availableDatesContainer.innerHTML = "";

      this.dateAvailablityButton.setAttribute("disabled", "");

      let dataChoice;

      let model_input_data_spec;
      if (this.isModelTuneMode === "tune") {
        const tune = this.getSharedTune(this.queryModelInput.value);
        model_input_data_spec = tune?.train_options?.model_input_data_spec?.[0];
        if (!model_input_data_spec) {
          const tuneToCheckData = await app.backend.getTune(
            this.queryModelInput.value
          );
          model_input_data_spec =
            tuneToCheckData?.train_options?.model_input_data_spec?.[0];
        }
      } else {
        const model = this.getModel(this.queryModelInput.value);
        model_input_data_spec = model?.model_input_data_spec?.[0];
      }

      if (model_input_data_spec) {
        dataChoice = `${model_input_data_spec.connector}:${model_input_data_spec.collection}`;
      }

      const coords = this.getCoords();

      let bounds;
      if (this.boundingBoxToggle.checked) {
        bounds = app.main.map.getBoundingBoxBounds(coords);
      } else {
        bounds = app.main.map.getBounds();
      }

      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();
      const apiBBox = [
        parseFloat(southWest.lng),
        parseFloat(southWest.lat),
        parseFloat(northEast.lng),
        parseFloat(northEast.lat),
      ];

      const data_connector_collection = dataChoice.split(":");

      const req = {
        data_connector: data_connector_collection[0],
        collections: [data_connector_collection[1]],
        dates: [
          util.formatDateWithDashSeparatorUTC(this.startDateInput.value) +
            "_" +
            util.formatDateWithDashSeparatorUTC(this.endDateInput.value),
        ],
        bbox: [apiBBox],
        maxcc: 80,
      };

      try {
        let res = await app.backend.checkDataAvailability(req);

        if (!res?.["results"]?.[0]) {
          app.showMessage(
            "Failed to check data availability: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
          this.dateAvailablityButton.removeAttribute("disabled");
          return;
        }

        res = res["results"][0];

        if ("unique_dates" in res && res.unique_dates.length > 0) {
          //sorts dates into accending order before rendering them
          res.unique_dates
            .sort((a, b) => {
              return new Date(a) - new Date(b);
            })
            .forEach((date) => {
              this.availableDatesContainer.innerHTML +=
                this._renderAvailableDate(date);
            });

          this.scrollToEnd();

          app.showMessage(
            "Successfully retrived dates in the given date range",
            "",
            "success",
            5000
          );
        } else if ("message" in res) {
          if (!res.message.includes("No nearest")) {
            res.message
              .replaceAll(" ", "")
              .replace("Nodata.Try", "")
              .replace("or", ",")
              .replace("Bef_Days:", "")
              .replace("Aft_Days:", "")
              .split(",")
              .forEach((date) => {
                this.availableDatesContainer.innerHTML +=
                  this._renderAvailableDate(date);
              });
            this.scrollToEnd();
          }

          app.showMessage(
            res.message
              .replace("Bef_Days", "dates before")
              .replace("Aft_Days", "dates after"),
            "",
            "error",
            5000
          );
        } else {
          app.showMessage(
            "Failed to check data availability: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
          this.dateAvailablityButton.removeAttribute("disabled");
        }
      } catch (error) {
        console.error("Error checking data availablity:", error);
        app.showMessage(
          "An error occured while checking data availablity",
          "",
          "error",
          5000
        );
        this.dateAvailablityButton.removeAttribute("disabled");
      }
    }

    _renderAvailableDate = (date) => /* HTML */ `
      <div class="available-date"><span>${date}</span></div>
    `;

    scrollToEnd() {
      const queryTabContainer = this.shadow.querySelector("#panel-query");

      queryTabContainer.scrollTop += this.availableDatesContainer.offsetTop;
    }

    configureModelStyle = (task_paylod, model_name) => {
      let model;
      if (model_name) {
        model = this.models.find(
          (md) => md.name.toLowerCase() === model_name.toLowerCase()
        );
      }
      if (model && model.model_style) {
        if (
          model.model_style.base_style &&
          model.model_style.base_style !== "None"
        ) {
          task_paylod.base_style = model.model_style.base_style;
        }
        if (
          model.model_style.asset_style &&
          model.model_style.asset_style !== "None"
        ) {
          task_paylod.asset_style = model.model_style.asset_style;
        }
        if (
          model.model_style.asset_categories &&
          model.model_style.asset_categories !== "None"
        ) {
          task_paylod.asset_categories = model.model_style.asset_categories;
        }
        if (
          model.model_style.rgb_constant_multiply &&
          model.model_style.rgb_constant_multiply !== "None"
        ) {
          task_paylod.rgb_constant_multiply =
            model.model_style.rgb_constant_multiply;
        }
      }
      return task_paylod;
    };

    setDatePickerSVGColor() {
      //There is no way to target elements inside of an open shadowRoot without using either
      //the part attribute or accessing the shadow root though JavaScript.
      //This function is used to change the date picker calendar arrow svgs to a lighter color.
      const datePicker = this.shadow.querySelector("cds-date-picker");
      if (datePicker.shadowRoot) {
        const shadowRoot = datePicker.shadowRoot;
        const observer = new MutationObserver(() => {
          const svgs = shadowRoot.querySelectorAll("svg");
          if (svgs.length != 0) {
            svgs.forEach((svg) => {
              svg.style.fill = "#f4f4f4";
            });

            observer.disconnect();
          }
        });
        observer.observe(shadowRoot, { childList: true, subtree: true });
      }
    }
  }
);
