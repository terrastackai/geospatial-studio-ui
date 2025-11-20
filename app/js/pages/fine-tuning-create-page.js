/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import "../components/breadcrumb-button.js";
import "../components/fine-tuning-create/create-form-buttons.js";
import "../components/fine-tuning-create/create-tune-forms.js";
import "../components/fine-tuning-create/progress-tracker.js";
import { goToUrl } from "../router.js";
import asWebComponent from "../webcomponent.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }

    .earth-bg {
      position: fixed;
      top: 3rem;
      left: 0;
      width: 100vw;
      height: calc(100vh - 3rem);
      object-fit: cover;
    }

    .page-content {
      color: var(--cds-text-primary);
      margin: 2rem 4rem 4rem;
      width: calc(100vw - 8rem);
      z-index: 1;
    }

    .form-wrapper {
      display: flex;
      width: 100%;
      height: 75vh;
      min-height: 500px;
      margin-top: 2rem;
      border: 1px dashed transparent;
      border-radius: 0.25rem;
      background: var(--cds-ui-01, #262626);
      overflow: hidden;
    }

    progress-tracker {
      width: 300px;
      min-width: 300px;
      height: 100%;
      border-right: 1px solid var(--cds-layer-active-02, #6f6f6f);
    }

    #right-side {
      flex-grow: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    create-tune-forms {
      flex-grow: 1;
      overflow: auto;
    }

    create-form-buttons {
      height: 80px;
      border-top: 1px solid var(--cds-ui-layer-active-02, #6f6f6f);
    }

    @media screen and (max-width: 1400px) {
      .form-wrapper {
        flex-direction: column;
        height: unset;
      }

      progress-tracker {
        width: 100%;
        height: unset;
        border-right: none;
        border-bottom: 1px solid var(--cds-ui-layer-active-02, #6f6f6f);
      }

      #right-side {
        height: unset;
      }
    }
  </style>

  <img
    fetchpriority="high"
    class="earth-bg"
    src="/images/Geospatial_Earth_5.jpg"
  />
  <div class="page-content">
    <breadcrumb-button
      breadcrumb-href="model_catalog"
      breadcrumb-text="Model Catalog"
    ></breadcrumb-button>
    <div class="form-wrapper">
      <progress-tracker></progress-tracker>
      <div id="right-side">
        <create-tune-forms></create-tune-forms>
        <create-form-buttons></create-form-buttons>
      </div>
    </div>
  </div>
`;

window.customElements.define(
  "fine-tuning-create-page",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.progressCounter = 0;

      this.payload = {
        name: null,
        description: null,
        base_model_id: null,
        tune_template_id: null,
        dataset_id: null,
        model_parameters: {},
      };

      this.reviewFormData = {
        base_model_name: null,
        task_name: null,
        task_purpose: null,
        dataset_name: null,
      };

      this.prePopulatedDatasetId = null;
    }

    render() {
      this.setDOM(template(this));

      this.setupForm = this.shadow
        .querySelector("create-tune-forms")
        .shadow.querySelector("setup-form");

      this.trainingDataForm = this.shadow
        .querySelector("create-tune-forms")
        .shadow.querySelector("training-data-form");

      this.parametersForm = this.shadow
        .querySelector("create-tune-forms")
        .shadow.querySelector("parameters-form");

      this.reviewForm = this.shadow
        .querySelector("create-tune-forms")
        .shadow.querySelector("review-form");

      this.nextButton = this.shadow
        .querySelector("create-form-buttons")
        .shadow.querySelector("#next-btn");

      this.previousButton = this.shadow
        .querySelector("create-form-buttons")
        .shadow.querySelector("#previous-btn");

      this.cancelButton = this.shadow
        .querySelector("create-form-buttons")
        .shadow.querySelector("#cancel-btn");

      this.getDatasetIdFromSearchParams();

      //=== Attach Form Validation Event Listeners ===//
      this.setupForm.addEventListener("form-validated", (e) => {
        this.handleNextButton(e.detail);
      });

      this.trainingDataForm.addEventListener("form-validated", (e) => {
        this.handleNextButton(e.detail);
      });

      //=== Attach Setup Form Submission Event Listener ===//

      this.setupForm.addEventListener("form-submitted", (e) => {
        if (this.areSharedKeyValuesTheSame(this.payload, e.detail.payload)) {
          this.payload = { ...this.payload, ...e.detail.payload };
          this.reviewFormData = {
            ...this.reviewFormData,
            ...e.detail.reviewFormData,
          };
          this.trainingDataForm.setupTrainingDataForm(
            this.reviewFormData.task_purpose
          );
        }

        this.progressCounter++;
        this.updateProgress();
      });

      //=== Attach Training Data Form Submission Event Listener ===//

      this.trainingDataForm.addEventListener("form-submitted", (e) => {
        if (this.areSharedKeyValuesTheSame(this.payload, e.detail.payload)) {
          this.payload = { ...this.payload, ...e.detail.payload };
          this.reviewFormData = {
            ...this.reviewFormData,
            ...e.detail.reviewFormData,
          };
          this.parametersForm.setupParametersForm(
            this.payload.tune_template_id
          );
        }

        this.payload["train_options"] = {
          model_input_data_spec: e.detail.datasetSettings.data_sources,
          label_categories: e.detail.datasetSettings.label_categories,
        };

        this.progressCounter++;
        this.updateProgress();
      });

      //=== Attach Parameter Form Submission Event Listener ===//

      this.parametersForm.addEventListener("form-submitted", (e) => {
        this.payload = { ...this.payload, ...e.detail.payload };

        this.reviewForm.setupReviewForm(
          this.payload,
          this.reviewFormData,
          e.detail.task
        );
        this.progressCounter++;
        this.updateProgress();
      });

      //========================

      this.nextButton.addEventListener("click", () => {
        if (this.progressCounter === 0) {
          this.setupForm.handleFormSubmission();
        } else if (this.progressCounter === 1) {
          this.trainingDataForm.handleFormSubmission();
        } else if (this.progressCounter === 2) {
          this.parametersForm.handleFormSubmission();
        } else if (this.progressCounter === 3) {
          this.submitTune();
        }
      });

      this.previousButton.addEventListener("click", () => {
        if (this.progressCounter > 0) {
          this.progressCounter--;
          this.updateProgress();
        }
      });

      this.updateProgress();
    }

    areSharedKeyValuesTheSame(payload, newPayload) {
      //Checks to see if the keys shared by the payloads contain the same values.
      //If they don't then the new payload contains updated information.

      for (let key of Object.keys(newPayload)) {
        if (payload[key] != newPayload[key]) {
          return true;
        }
      }

      return false;
    }

    async getDatasetIdFromSearchParams() {
      const paramsString = window.location.hash.split("?")?.[1]?.toString();
      const params = new URLSearchParams(paramsString);

      this.prePopulatedDatasetId = params.get("id");
      const tune_id = params.get("tune_id");

      if (this.prePopulatedDatasetId) {
        let prePopulatedDatasetPurpose = params.get("purpose");
        prePopulatedDatasetPurpose = prePopulatedDatasetPurpose
          .split("%20")
          .join(" ");

        this.setupForm.setPrePopulatedDatasetPurpose(
          prePopulatedDatasetPurpose
        );

        this.trainingDataForm.setPrePopulatedDatasetId(
          this.prePopulatedDatasetId
        );
      }

      if (tune_id) {
        const response = await app.backend.getTune(tune_id);
        if (response && response.id) {
          this.setupForm.setDuplicateTune(response);
          this.trainingDataForm.setDuplicateTune(response);
          this.parametersForm.setDuplicateTune(response);
        }
      }
    }

    async submitTune() {
      this.nextButton.setAttribute("disabled", "");
      this.previousButton.setAttribute("disabled", "");

      try {
        const response = await app.backend.submitTune(this.payload);

        if (response && "tune_id" in response) {
          app.showMessage("Tune submitted successfully ", "", "success", 5000);
          goToUrl("#model_catalog");
        } else {
          app.showMessage(
            "Failed to submit tune: " +
              (response?.detail ? response.detail[0].msg : "Unknown error"),
            "",
            "error",
            5000
          );

          this.nextButton.removeAttribute("disabled");
          this.previousButton.removeAttribute("disabled");
        }
      } catch (error) {
        app.progress.hide();
        console.error("Error submitting tune:", error);
        app.showMessage(
          "An error occured while submitting tune",
          "",
          "error",
          5000
        );
      }
    }

    updateProgress() {
      const progressIndicator = this.shadow
        .querySelector("progress-tracker")
        .shadow.querySelector("cds-progress-indicator");

      const forms = [
        this.setupForm,
        this.trainingDataForm,
        this.parametersForm,
        this.reviewForm,
      ];

      forms.forEach((form, idx) => {
        if (this.progressCounter === idx) {
          form.style.display = "block";
        } else {
          form.style.display = "none";
        }
      });

      if (this.progressCounter === 0) {
        this.previousButton.setAttribute("disabled", "");
      } else if (this.progressCounter === 4) {
        this.previousButton.setAttribute("disabled", "");
      } else {
        this.previousButton.removeAttribute("disabled");
      }

      if (this.progressCounter === 3) {
        this.nextButton.innerHTML = "Create tune";
      } else {
        this.nextButton.innerHTML = "Next";
      }

      if (this.progressCounter === 0) {
        this.handleNextButton(this.setupForm.validateForm());
      } else if (this.progressCounter === 1) {
        this.handleNextButton(this.trainingDataForm.validateForm());
      }

      const progressSteps =
        progressIndicator.querySelectorAll("cds-progress-step");

      for (let i = 0; i < progressSteps.length; i++) {
        if (i < this.progressCounter) {
          progressSteps[i].setAttribute("state", "complete");
        }
        if (i === this.progressCounter) {
          progressSteps[i].setAttribute("state", "current");
        }
        if (i > this.progressCounter) {
          progressSteps[i].setAttribute("state", "incomplete");
        }
      }
    }

    handleNextButton(valid) {
      if (valid) {
        this.nextButton.removeAttribute("disabled");
      } else {
        this.nextButton.setAttribute("disabled", "");
      }
    }
  }
);
