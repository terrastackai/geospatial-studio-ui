/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/text-input.min.js";
import "../../libs/carbon-web-components/textarea.min.js";
import "../../libs/carbon-web-components/combo-box.min.js";
import "../../libs/carbon-web-components/inline-loading.min.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    .display-none {
      display: none;
    }

    #setup-form-container {
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

    #task-input::part(menu-body),
    #base-model-input::part(menu-body) {
      position: absolute;
      top: unset;
      bottom: 100%;
      left: 0;
      max-height: 400px;
      outline: 1px solid white;
    }

    #description-input {
      width: 100%;
      margin-top: 1rem;
    }
  </style>

  <div id="setup-form-container">
    <h2>Set up your tune</h2>
    <p>
      Provide some details about your custom tune, including the base model.
    </p>
    <cds-text-input
      label="Tune name (required) [Max 32 characters]"
      invalid-text="Error message"
      placeholder="e.g. my-tune-2"
      id="name-input"
      helper-text="Tune names must consist solely of lowercase letters, numbers, and dashes (e.g., 'valid-input-123'). No spaces or special characters allowed."
    >
    </cds-text-input>
    <cds-textarea
      label="Description (required)"
      placeholder="e.g. This tune is for my new weather model"
      rows="4"
      id="description-input"
    >
    </cds-textarea>

    <cds-inline-loading status="active">
      Loading base models and tasks...
    </cds-inline-loading>

    <cds-combo-box title-text="Config Template (required)" id="task-input">
      <cds-combo-box-item value="">Select a config template</cds-combo-box-item>
    </cds-combo-box>
    <cds-combo-box title-text="Base model (required)" id="base-model-input">
      <cds-combo-box-item value="">Select a model</cds-combo-box-item>
    </cds-combo-box>
  </div>
`;

window.customElements.define(
  "setup-form",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.payloadContribution = {
        name: null,
        description: null,
        base_model_id: null,
        tune_template_id: null,
      };

      this.reviewFormDataContribution = {
        base_model_name: null,
        task_name: null,
        task_purpose: null,
      };

      this.baseModels = [];
      this.tasks = [];

      this.prePopulatedDatasetPurpose = null;
      this.duplicateTune = null;
    }

    render() {
      this.setDOM(template(this));

      this.nameInput = this.shadow.querySelector("#name-input");
      this.descriptionInput = this.shadow.querySelector("#description-input");
      this.baseModelInput = this.shadow.querySelector("#base-model-input");
      this.taskInput = this.shadow.querySelector("#task-input");

      //=== Add Input Event Listeners ===//

      this.nameInput.addEventListener("input", () => {
        const nameValid = this.validateName();
        if (nameValid) {
          this.nameInput.removeAttribute("invalid");
        } else {
          this.nameInput.setAttribute("invalid", "");
        }

        this.dispatchEvent(
          new CustomEvent("form-validated", {
            detail: this.validateForm(),
          })
        );
      });

      this.descriptionInput.addEventListener("input", () => {
        this.dispatchEvent(
          new CustomEvent("form-validated", {
            detail: this.validateForm(),
          })
        );
      });

      this.baseModelInput.addEventListener("cds-combo-box-selected", () => {
        this.dispatchEvent(
          new CustomEvent("form-validated", {
            detail: this.validateForm(),
          })
        );
      });

      this.taskInput.addEventListener("cds-combo-box-selected", async () => {
        await this.handleTaskTemplateChange();
      });

      this.setupSetupFormV2();
    }

    async handleTaskTemplateChange() {
      const selectedTask = this.tasks.find(
        (task) => task.id === this.taskInput.value
      );
      const modelCategory = selectedTask?.extra_info?.model_category;

      const inlineLoading = this.shadow.querySelector("cds-inline-loading");
      inlineLoading.classList.remove("display-none");
      this.baseModelInput.setAttribute("disabled", "");
      this.baseModelInput._handleUserInitiatedClearInput();
      await this.setupBaseModels(modelCategory);
      inlineLoading.classList.add("display-none");
      this.baseModelInput.removeAttribute("disabled");

      this.dispatchEvent(
        new CustomEvent("form-validated", {
          detail: this.validateForm(),
        })
      );
    }

    async setupSetupFormV2() {
      const inlineLoading = this.shadow.querySelector("cds-inline-loading");

      inlineLoading.classList.remove("display-none");
      this.baseModelInput.setAttribute("disabled", "");
      this.taskInput.setAttribute("disabled", "");

      await this.setupTasks();

      inlineLoading.classList.add("display-none");
      this.taskInput.removeAttribute("disabled");

      if (this.duplicateTune) {
        if (this.duplicateTune?.name)
          this.nameInput.value = this.duplicateTune?.name;
        if (this.duplicateTune?.description)
          this.descriptionInput.value = this.duplicateTune?.description;

        const tasksResponse = await app.backend.getTask(
          this.duplicateTune?.tune_template_id
        );
        this.refreshComboBoxInnerHTML(this.tasks, this.taskInput);
        if (!("id" in tasksResponse)) return;
        if (this.duplicateTune?.tune_template_id)
          this.taskInput.value = this.duplicateTune?.tune_template_id;
        await this.handleTaskTemplateChange();

        const baseModelsResponse = await app.backend.getBaseModel(
          this.duplicateTune?.base_model?.id
        );
        if (!("id" in baseModelsResponse)) return;
        if (this.duplicateTune?.base_model?.id)
          this.baseModelInput.value = this.duplicateTune?.base_model?.id;

        this.dispatchEvent(
          new CustomEvent("form-validated", {
            detail: this.validateForm(),
          })
        );
      }
    }

    setPrePopulatedDatasetPurpose(prePopulatedDatasetPurpose) {
      this.prePopulatedDatasetPurpose = prePopulatedDatasetPurpose;
      this.setupSetupFormV2();
    }

    setDuplicateTune = (tune) => {
      this.duplicateTune = tune;
      this.setupSetupFormV2();
    };

    handleFormSubmission() {
      this.payloadContribution.name = this.nameInput.value;
      this.payloadContribution.description = this.descriptionInput.value;
      this.payloadContribution.base_model_id = this.baseModelInput.value;
      this.payloadContribution.tune_template_id = this.taskInput.value;

      for (let baseModel of this.baseModels) {
        if (baseModel.id === this.payloadContribution.base_model_id) {
          this.reviewFormDataContribution.base_model_name = baseModel.name;
          break;
        }
      }

      for (let task of this.tasks) {
        if (task.id === this.payloadContribution.tune_template_id) {
          this.reviewFormDataContribution.task_name = task.name;
          this.reviewFormDataContribution.task_purpose = task.purpose;
          break;
        }
      }

      this.dispatchEvent(
        new CustomEvent("form-submitted", {
          detail: {
            payload: this.payloadContribution,
            reviewFormData: this.reviewFormDataContribution,
          },
        })
      );
    }

    validateName() {
      const nameRegex = /^[a-z0-9\-]{1,32}$/;
      return nameRegex.test(this.nameInput.value);
    }

    validateForm() {
      const nameValid = this.validateName();

      return (
        nameValid &&
        this.descriptionInput.value != "" &&
        this.baseModelInput.value != "" &&
        this.taskInput.value != ""
      );
    }

    async setupBaseModels(modelCategory = null) {
      try {
        const response = await app.backend.getBaseModels(25, 0, modelCategory);

        if (response && "results" in response) {
          this.baseModels = response.results;

          this.setupComboBox(this.baseModels, this.baseModelInput);
        } else {
          app.showMessage(
            "Failed to get base models: " +
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
        console.error("Error loading base models:", error);
        app.showMessage(
          "An error occured while loading the base models",
          "",
          "error",
          5000
        );
      }
    }

    async setupTasks() {
      try {
        const purposeCopy = this.prePopulatedDatasetPurpose;
        const response = await app.backend.getTasks(
          25,
          0,
          null,
          this.prePopulatedDatasetPurpose
        );
        if (response && "results" in response) {
          if (!purposeCopy && this.tasks.length > 0) return;
          this.tasks = response.results;

          this.setupComboBox(this.tasks, this.taskInput);
        } else {
          app.showMessage(
            "Failed to get tasks: " +
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
        console.error("Error loading tasks:", error);
        app.showMessage(
          "An error occured while loading the tasks",
          "",
          "error",
          5000
        );
      }
    }

    setupComboBox(items, comboBoxElement) {
      comboBoxElement.value = "";
      comboBoxElement.innerHTML = "";
      items.forEach((item) => {
        comboBoxElement.innerHTML += this.__renderComboBoxItem(item);
      });
    }

    refreshComboBoxInnerHTML(items, comboBoxElement) {
      comboBoxElement.innerHTML = "";
      items.forEach((item) => {
        comboBoxElement.innerHTML += this.__renderComboBoxItem(item);
      });
    }

    __renderComboBoxItem = (item) => /* HTML */ `
      <cds-combo-box-item value="${item.id}">${item.name}</cds-combo-box-item>
    `;
  }
);
