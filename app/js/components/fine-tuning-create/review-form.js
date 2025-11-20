/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    #review-form-container {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
      width: 100%;
      height: 100%;
      padding-bottom: 4rem;
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

    #basic-settings-container,
    #advanced-settings-container {
      display: flex;
      flex-wrap: wrap;
      padding: 1rem;
      border-radius: 10px;
      background: var(--Layer-layer-03, #525252);
    }

    #basic-settings-container {
      gap: 2rem;
    }

    #advanced-settings-container {
      column-gap: 2rem;
      row-gap: 1rem;
    }

    .setting-container {
      width: calc(50% - 2rem);
    }

    .setting-title {
      margin: 0;
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
      line-height: 24px;
    }

    .setting-value {
      margin: 0;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      letter-spacing: 0.16px;
    }
  </style>

  <div id="review-form-container">
    <h2>Review</h2>
    <p>
      Please review your tune settings before submitting the job. Once the job
      is submitted, you can track progress on the tune landing page.
    </p>
    <div id="basic-settings-container"></div>
    <div id="advanced-settings-container"></div>
  </div>
`;

window.customElements.define(
  "review-form",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.basicSettingsContainer = this.shadow.querySelector(
        "#basic-settings-container"
      );

      this.advancedSettingsContainer = this.shadow.querySelector(
        "#advanced-settings-container"
      );
    }

    async setupReviewForm(payload, formData, task) {
      this.basicSettingsContainer.innerHTML = this._renderBasicSettings(
        payload,
        formData
      );

      this.advancedSettingsContainer.innerHTML = "";

      if (Object.keys(payload.model_parameters).length > 0) {
        this.advancedSettingsContainer.style.display = "flex";
        this.handleObject(
          payload.model_parameters,
          task.model_params.properties
        );
      } else {
        this.advancedSettingsContainer.style.display = "none";
      }
    }

    handleObject(object, objectFromSchema) {
      for (let key of Object.keys(object)) {
        if (typeof object[key] !== "object") {
          this.setupAdvancedProperty(key, object[key], objectFromSchema[key]);
          continue;
        }

        this.handleObject(object[key], objectFromSchema[key].properties);
      }
    }

    setupAdvancedProperty(key, property, propertySchema) {
      if ("studio_name" in propertySchema) {
        this.advancedSettingsContainer.innerHTML += this._renderProperty(
          propertySchema.studio_name,
          property
        );
      } else {
        this.advancedSettingsContainer.innerHTML += this._renderProperty(
          key,
          property
        );
      }
    }

    _renderBasicSettings = (payload, formData) => /* HTML */ `
      <div class="setting-container">
        <h3 class="setting-title">Tune Name</h3>
        <span class="setting-value">${payload.name}</span>
      </div>
      <div class="setting-container">
        <h3 class="setting-title">Description</h3>
        <span class="setting-value">${payload.description}</span>
      </div>
      <div class="setting-container">
        <h3 class="setting-title">Model</h3>
        <span class="setting-value">${formData.base_model_name}</span>
      </div>
      <div class="setting-container">
        <h3 class="setting-title">Task</h3>
        <span class="setting-value">${formData.task_name}</span>
      </div>
      <div class="setting-container">
        <h3 class="setting-title">Dataset</h3>
        <span class="setting-value">${formData.dataset_name}</span>
      </div>
    `;

    _renderProperty = (name, value) => /* HTML */ `
      <div class="setting-container">
        <h3 class="setting-title">${name}</h3>
        <span class="setting-value">${value}</span>
      </div>
    `;
  }
);
