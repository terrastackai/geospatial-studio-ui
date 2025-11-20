/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../../webcomponent.js";
import "../../../libs/carbon-web-components/modal.min.js";
import "./add-file-form.js";
import "./configure-dataset-form.js";
import "./configure-labels-form.js";

const template = (obj) => /* HTML */ `
  <style>
    cds-modal {
      top: 3rem;
      max-height: calc(100% - 3rem);
      background-color: #000000cc;
    }

    cds-modal-body {
      padding-right: 1rem;
    }

    [form-hidden] {
      display: none;
    }

    #cancel-button {
      flex: 0 1 50%;
    }

    #back-button,
    #next-button {
      flex: 0 1 25%;
    }
  </style>

  <cds-modal size="lg" prevent-close-on-click-outside>
    <cds-modal-header>
      <cds-modal-close-button></cds-modal-close-button>
      <cds-modal-heading>Add File</cds-modal-heading>
    </cds-modal-header>
    <cds-modal-body>
      <add-file-form></add-file-form>
      <configure-dataset-form form-hidden></configure-dataset-form>
      <configure-labels-form form-hidden></configure-labels-form>
    </cds-modal-body>
    <cds-modal-footer>
      <cds-modal-footer-button kind="ghost" id="cancel-button" data-modal-close>
        Cancel
      </cds-modal-footer-button>
      <cds-modal-footer-button kind="secondary" id="back-button" disabled>
        Back
      </cds-modal-footer-button>
      <cds-modal-footer-button kind="primary" id="next-button" disabled>
        Configure dataset
      </cds-modal-footer-button>
    </cds-modal-footer>
  </cds-modal>
`;

window.customElements.define(
  "dataset-onboarding-modal",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.currentFormIndex = 0;
      this.payload = {};
    }

    render() {
      this.setDOM(template(this));

      this.modal = this.shadow.querySelector("cds-modal");
      this.addFileForm = this.shadow.querySelector("add-file-form");
      this.configigureDatasetForm = this.shadow.querySelector(
        "configure-dataset-form"
      );
      this.configureLabelsForm = this.shadow.querySelector(
        "configure-labels-form"
      );
      this.nextButton = this.shadow.querySelector("#next-button");
      this.backButton = this.shadow.querySelector("#back-button");
      this.cancelButton = this.shadow.querySelector("#cancel-button");

      this.forms = [
        this.addFileForm,
        this.configigureDatasetForm,
        this.configureLabelsForm,
      ];

      this.addFileForm.addEventListener("form-update", (e) => {
        this.handleNextButton(e.detail.valid);
      });

      this.configigureDatasetForm.addEventListener("form-update", (e) => {
        this.handleNextButton(e.detail.valid);
      });

      this.configureLabelsForm.addEventListener("form-update", (e) => {
        this.handleNextButton(e.detail.valid);
      });

      this.addFileForm.addEventListener("prescan-complete", (e) => {
        this.configigureDatasetForm.setPreScannedDataSources(e.detail);
      });

      this.addFileForm.addEventListener("form-submitted", (e) => {
        Object.assign(this.payload, e.detail);
        this.moveToNextForm();
      });

      this.configigureDatasetForm.addEventListener("form-submitted", (e) => {
        Object.assign(this.payload, e.detail);
        this.moveToNextForm();
      });

      this.configureLabelsForm.addEventListener("form-submitted", (e) => {
        Object.assign(this.payload, e.detail);
        this.moveToNextForm();
      });

      this.nextButton.addEventListener("click", () => {
        this.forms[this.currentFormIndex].submitForm();
      });

      this.backButton.addEventListener("click", () => {
        if (this.currentFormIndex > 0) {
          this.forms[this.currentFormIndex].setAttribute("form-hidden", "");
          this.forms[this.currentFormIndex - 1].removeAttribute("form-hidden");
          this.currentFormIndex--;
          this.setModalText();
          this.forms[this.currentFormIndex].validateInputs();
        }

        if (this.currentFormIndex === 0) {
          this.backButton.setAttribute("disabled", "");
        }
      });

      this.cancelButton.addEventListener("click", () => {
        this.resetModal();
      });
    }

    resetModal() {
      this.currentFormIndex = 0;
      this.setModalText();

      this.addFileForm.removeAttribute("form-hidden");
      this.configigureDatasetForm.setAttribute("form-hidden", "");
      this.configureLabelsForm.setAttribute("form-hidden", "");

      this.addFileForm.resetForm();
      this.configigureDatasetForm.resetForm();
      this.configureLabelsForm.resetForm();

      this.nextButton.setAttribute("disabled", "");
      this.backButton.setAttribute("disabled", "");
    }

    moveToNextForm() {
      if (
        this.currentFormIndex === 1 &&
        this.payload.purpose != "Segmentation"
      ) {
        this.submitModal();
        return;
      } else if (this.currentFormIndex < this.forms.length - 1) {
        this.forms[this.currentFormIndex].setAttribute("form-hidden", "");
        this.forms[this.currentFormIndex + 1].removeAttribute("form-hidden");
        this.currentFormIndex++;
        this.setModalText();
        this.backButton.removeAttribute("disabled");
        this.forms[this.currentFormIndex].validateInputs();
      } else {
        this.submitModal();
      }
    }

    deepCopy(obj) {
      if (typeof obj !== "object" || obj === null) {
        return obj;
      }

      const copy = Array.isArray(obj) ? [] : {};

      for (const key of Object.keys(obj)) {
        if (!(obj[key] instanceof Element)) {
          copy[key] = this.deepCopy(obj[key]);
        }
      }

      return copy;
    }

    async submitModal() {
      this.nextButton.setAttribute("disabled", "");

      let payloadDeepCopy = this.deepCopy(this.payload);
      payloadDeepCopy.version = "v2";

      try {
        const response = await app.backend.submitDatasetV2(payloadDeepCopy);

        if ("dataset_id" in response) {
          app.showMessage("File uploaded successfully", "", "success", 5000);
          this.dispatchEvent(new CustomEvent("modal-submitted"));
          this.resetModal();
          return;
        } else {
          app.showMessage(
            "Failed to upload dataset: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error("Error uploading dataset:", error);
        app.showMessage(
          "An error occured while uploading the dataset",
          "",
          "error",
          5000
        );
      }

      this.nextButton.removeAttribute("disabled", "");
    }

    openModal() {
      this.modal.setAttribute("open", "");
    }

    closeModal() {
      this.modal.removeAttribute("open");
    }

    setModalText() {
      const modalHeading = this.shadow.querySelector("cds-modal-heading");

      if (this.currentFormIndex === 0) {
        modalHeading.innerHTML = "Add file";
        this.nextButton.textContent = "Configure Dataset";
      }

      if (this.currentFormIndex === 1) {
        modalHeading.innerHTML = "Configure dataset";

        if (this.payload.purpose === "Segmentation") {
          this.nextButton.textContent = "Configure Labels";
        } else {
          this.nextButton.textContent = "Submit";
        }
      }

      if (this.currentFormIndex === 2) {
        modalHeading.innerHTML = "Configure labels";
        this.nextButton.textContent = "Submit";
      }
    }

    setNextButton(text) {
      this.nextButton.textContent = text;
    }

    handleNextButton(enable) {
      if (enable) {
        this.nextButton.removeAttribute("disabled");
      } else {
        this.nextButton.setAttribute("disabled", "");
      }
    }
  }
);
