/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";

import "../../libs/carbon-web-components/inline-loading.min.js";
import "../../libs/carbon-web-components/tabs.min.js";
import "../../libs/carbon-web-components/number-input.min.js";
import "../../libs/carbon-web-components/dropdown.min.js";
import "../../libs/carbon-web-components/text-input.min.js";
import "../../libs/carbon-web-components/multi-select.min.js";
import { launchIcon } from "../../icons.js";
import { isValueObject } from "../../utils.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    .display-none {
      display: none;
    }

    #parameters-form-container {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
      width: 100%;
      height: 100%;
      padding-bottom: 4rem;
    }

    .parameters-main-section {
      margin-bottom: 1rem;
      padding: 0.5rem;
      border: 2px solid var(--cds-layer-active-02, #6f6f6f);
      border-radius: 4px;
    }

    .parameters-secondary-section {
      padding: 0.5rem;
      border-left: 2px solid var(--cds-layer-active-02, #6f6f6f);
    }

    h2 {
      font-weight: 400;
      margin: 0;
      line-height: 3rem;
    }

    p {
      font-weight: 400;
      margin: 0;
    }

    cds-inline-loading {
      margin-top: 0.5rem;
    }

    .advanced-settings-container {
      margin-top: 0.5rem;
    }

    .cds-ce-demo-devenv--tab-panels div[role="tabpanel"] {
      width: 100%;
      padding: 1rem 0;
    }

    .cds-ce-demo-devenv--tab-panels h4,
    .cds-ce-demo-devenv--tab-panels h5,
    .cds-ce-demo-devenv--tab-panels h6,
    .cds-ce-demo-devenv--tab-panels p {
      margin: 0.5rem 0 1rem;
    }

    .cds-ce-demo-devenv--tab-panels h4 {
      font-size: 20px;
    }

    .cds-ce-demo-devenv--tab-panels h5 {
      font-size: 16px;
    }

    .cds-ce-demo-devenv--tab-panels h6 {
      font-size: 16px;
      font-weight: normal;
    }

    .cds-ce-demo-devenv--tab-panels p {
      font-size: 12px;
      font-weight: normal;
    }

    cds-number-input,
    cds-dropdown,
    cds-text-input,
    cds-multi-select {
      display: block;
      margin-bottom: 1rem;
    }

    .advanced-settings-container {
      position: relative;
    }
  </style>

  <div id="parameters-form-container">
    <h2>Configure parameters</h2>
    <p>
      You can set additional optional parameters below. Sensible defaults have
      been set for each of the parameters.
    </p>
    <cds-link
      href="/docs/tuning-studio/#set-the-tune-parameters"
      target="_blank"
    >
      View documentation ${launchIcon({ width: 16, height: 16 })}
    </cds-link>

    <cds-inline-loading status="active">
      Loading Parameters...
    </cds-inline-loading>

    <div class="advanced-settings-container">
      <cds-tabs type="contained"></cds-tabs>
      <div class="parameter-settings-tabs"></div>
    </div>
  </div>
`;

window.customElements.define(
  "parameters-form",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.task = {};
      this.propertyInputs = [];
      this.duplicateTune = null;
    }

    render() {
      this.setDOM(template(this));

      this.tabsContainer = this.shadow.querySelector("cds-tabs");
      this.tabPanelsContainer = this.shadow.querySelector(
        ".parameter-settings-tabs"
      );
      this.advancedSettingsContainer = this.shadow.querySelector(
        ".advanced-settings-container"
      );
      this.inlineLoading = this.shadow.querySelector("cds-inline-loading");
    }

    async getTask(taskId) {
      try {
        const response = await app.backend.getTask(taskId);

        if (response && "id" in response) {
          return response;
        } else {
          app.showMessage(
            "Failed to get task: " +
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
        console.error("Error loading task:", error);
        app.showMessage(
          "An error occured while loading the task",
          "",
          "error",
          5000
        );
      }

      this.inlineLoading.status = "error";
      this.inlineLoading.textContent = "Loading failed";

      return {};
    }

    async handleFormSubmission() {
      const refinedPropertyInputs = this.refinePropertyInputs();

      const model_parameters = {};
      this.handleObject(
        this.task.model_params.properties,
        model_parameters,
        refinedPropertyInputs
      );

      this.payloadContribution = { model_parameters: model_parameters };

      this.dispatchEvent(
        new CustomEvent("form-submitted", {
          detail: { payload: this.payloadContribution, task: this.task },
        })
      );
    }

    handleObject(object, objectCopy, refinedPropertyInputs) {
      for (let key of Object.keys(object)) {
        if (object[key].type != "object") {
          for (let propertyInput of refinedPropertyInputs) {
            if (propertyInput.property === object[key]) {
              objectCopy[key] = propertyInput.inputElement.value;
              break;
            }
          }
          continue;
        }

        objectCopy[key] = {};
        this.handleObject(
          object[key].properties,
          objectCopy[key],
          refinedPropertyInputs
        );

        if (Object.keys(objectCopy[key]).length === 0) {
          delete objectCopy[key];
        }
      }
    }

    refinePropertyInputs() {
      const refinedPropertyInputs = [];

      this.propertyInputs.forEach((input) => {
        if (input.property.default.toString() != input.inputElement.value) {
          refinedPropertyInputs.push(input);
        }
      });

      return refinedPropertyInputs;
    }

    setDuplicateTune = (tune) => {
      this.duplicateTune = tune;
    };

    setDuplicateTuneParamsRecursively = (duplicateTuneParams, value) => {
      if (!isValueObject(duplicateTuneParams) || !isValueObject(value)) return;
      Object.entries(duplicateTuneParams).forEach(([dupKey, dupValue]) => {
        if (isValueObject(dupValue)) {
          const newValue = value?.properties?.[dupKey];
          this.setDuplicateTuneParamsRecursively(dupValue, newValue);
        } else {
          value.properties[dupKey]["duplicate"] = dupValue;
        }
      });
    };

    async setupParametersForm(taskId) {
      this.advancedSettingsContainer.classList.add("display-none");
      this.inlineLoading.classList.remove("display-none");

      this.task = await this.getTask(taskId);

      if (Object.keys(this.task).length === 0) return;

      const model_params = this.task.model_params;

      this.tabsContainer.innerHTML = "";
      this.tabPanelsContainer.innerHTML = "";
      Object.entries(model_params.properties).forEach(([key, value], idx) => {
        const duplicateTuneParams = this.duplicateTune?.model_parameters?.[key];
        if (duplicateTuneParams) {
          this.setDuplicateTuneParamsRecursively(duplicateTuneParams, value);
        }
        //If tab should not be displayed
        if (value.type === "string" && !("enum" in value)) return;

        const tabTemplate = document.createElement("template");
        tabTemplate.innerHTML = this._renderTab(key, value.studio_name, idx);
        const tabElement = tabTemplate.content.firstElementChild;

        this.tabsContainer.appendChild(tabElement);

        const tabContentTemplate = document.createElement("template");
        tabContentTemplate.innerHTML = this._renderTabContentContainer(key);
        const tabContentElement = tabContentTemplate.content.firstElementChild;

        this.setupTabContent(key, value, tabContentElement);

        this.tabPanelsContainer.appendChild(tabContentElement);
      });

      //=== Hide loading wheel, enable accordion and add Event Listeners to the populated tabs to handle the change functionality ===

      this.inlineLoading.classList.add("display-none");
      this.advancedSettingsContainer.classList.remove("display-none");

      const panels =
        this.advancedSettingsContainer.querySelectorAll('[role="tabpanel"]');
      panels.forEach((panel) => panel.setAttribute("hidden", ""));

      const tabsComponent =
        this.advancedSettingsContainer.querySelector("cds-tabs");

      tabsComponent.setAttribute("value", tabsComponent.children[0].value);

      this.advancedSettingsContainer
        .querySelector(`#${tabsComponent.children[0].target}`)
        .removeAttribute("hidden");

      tabsComponent.addEventListener("cds-tabs-selected", (e) => {
        this.handleTabChange(e.detail.item.target);
      });
    }

    handleTabChange(targetPanelId) {
      const panels =
        this.advancedSettingsContainer.querySelectorAll('[role="tabpanel"]');
      panels.forEach((panel) => panel.setAttribute("hidden", ""));
      this.showTabPanel(targetPanelId);
    }

    showTabPanel(panelId) {
      let panel = this.advancedSettingsContainer.querySelector(`#${panelId}`);
      if (panel) {
        panel.removeAttribute("hidden");
      }
    }

    setupTabContent(tabObjectKey, tabObject, tabElement) {
      if (tabObject.type === "object") {
        Object.entries(tabObject.properties).forEach(([key, value]) => {
          this.setupProperty(key, value, tabElement, 4);
        });
      } else {
        this.setupProperty(tabObjectKey, tabObject, tabElement, 4);
      }
    }

    setupProperty(propertyKey, property, containerElement, headingLevel) {
      if (property.type === "object") {
        const sectionElement = this.setupTitleSection(
          propertyKey,
          property,
          headingLevel,
          containerElement
        );
        Object.entries(property.properties).forEach(([key, value]) => {
          this.setupProperty(key, value, sectionElement, headingLevel + 1);
        });
      } else {
        this.setupInput(propertyKey, property, containerElement);
      }
    }

    setupInput(propertyKey, property, containerElement) {
      const inputTemplate = document.createElement("template");

      if (property.type === "int") {
        inputTemplate.innerHTML = this._renderNumberInput(
          propertyKey,
          property,
          1
        );
      }

      if (property.type === "float") {
        inputTemplate.innerHTML = this._renderNumberInput(
          propertyKey,
          property,
          0.1
        );
      }

      if (property.type === "bool") {
        inputTemplate.innerHTML = this._renderBooleanDropdown(
          propertyKey,
          property
        );
      }

      if (property.type === "enum" || "enum" in property) {
        inputTemplate.innerHTML = this._renderDropdown(propertyKey, property);
      }

      if (property.type === "string" && !("enum" in property)) {
        inputTemplate.innerHTML = this._renderInput(propertyKey, property);
      }

      if (property.type === "array") {
        inputTemplate.innerHTML = this._renderArray(propertyKey, property);
      }

      const inputElement = inputTemplate.content.firstElementChild;

      // property["ui-element"] = inputElement;

      this.propertyInputs.push({
        property: property,
        inputElement: inputElement,
      });

      containerElement.appendChild(inputElement);
    }

    setupTitleSection(key, value, headingLevel, containerElement) {
      const titleElement = document.createElement(
        headingLevel <= 6 ? "h" + headingLevel : "p"
      );
      titleElement.innerHTML = value.studio_name || key;

      const sectionElement = document.createElement("div");

      if (headingLevel === 4) {
        sectionElement.classList.add("parameters-main-section");
      } else {
        sectionElement.classList.add("parameters-secondary-section");
      }

      sectionElement.appendChild(titleElement);

      containerElement.appendChild(sectionElement);

      return sectionElement;
    }

    _renderTab = (key, studioName, idx) => /* HTML */ `
      <cds-tab id="tab-${key}" target="panel-${key}" value="${key}">
        ${studioName || key}
      </cds-tab>
    `;

    _renderTabContentContainer = (key) => /* HTML */ `
      <div id="panel-${key}" role="tabpanel" aria-labelledby="tab-${key}"></div>
    `;

    _renderNumberInput = (propertyKey, property, step) => /* HTML */ `
      <cds-number-input
        label="${property.studioName || propertyKey}"
        value="${property.duplicate || property.default || 0}"
        step="${step}"
        helper-text="${property.description}"
        min="-10000"
        max="10000"
      ></cds-number-input>
    `;

    _renderBooleanDropdown = (propertyKey, property) => /* HTML */ `
      <cds-dropdown
        title-text="${property.studio_name || propertyKey}"
        value="${property.duplicate || property.default || false}"
        helper-text="${property.description}"
      >
        <cds-dropdown-item value="true">True</cds-dropdown-item>
        <cds-dropdown-item value="false">False</cds-dropdown-item>
      </cds-dropdown>
    `;

    _renderDropdown = (propertyKey, property) => /* HTML */ `
      <cds-dropdown
        label="${property.studio_name || propertyKey}"
        value="${property.duplicate || property.default || null}"
        helper-text="${property.description}"
      >
        ${property.enum
          .map(
            (option) => /* HTML */ `
              <cds-dropdown-item value="${option}">${option}</cds-dropdown-item>
            `
          )
          .join("")}
      </cds-dropdown>
    `;

    _renderInput = (propertyKey, property) => /* HTML */ `
      <cds-text-input
        label="${property.studio_name || propertyKey}"
        value="${property.duplicate || property.default}"
        helper-text="${property.description}"
      >
      </cds-text-input>
    `;

    _renderArray = (propertyKey, property) => /* HTML */ `
      <cds-multi-select
        label="${property.studio_name || propertyKey}"
        value="${property.duplicate || property.default}"
        helper-text="${property.description}"
      >
        ${property.items.enum
          .map(
            (option) => /* HTML */ `
              <cds-multi-select-item value="${option}"
                >${option}</cds-multi-select-item
              >
            `
          )
          .join("")}
      </cds-multi-select>
    `;
  }
);
