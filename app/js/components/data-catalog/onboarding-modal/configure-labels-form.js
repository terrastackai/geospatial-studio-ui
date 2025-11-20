/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../../webcomponent.js";
import "../../../libs/carbon-web-components/modal.min.js";
import "../../../libs/carbon-web-components/toggle.min.js";
import "../../../libs/carbon-web-components/button.min.js";
import "../../../libs/carbon-web-components/number-input.min.js";
import "../../../libs/carbon-web-components/text-input.min.js";

import "../../dataset-settings-form/labels-form.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    .display-none {
      display: none;
    }

    section {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;
    }
  </style>

  <section>
    <p>Add more details regarding your labels</p>
    <labels-form></labels-form>
  </section>
`;

window.customElements.define(
  "configure-labels-form",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.labelsForm = this.shadow.querySelector("labels-form");

      this.labelsForm.addEventListener("form-updated", () => {
        this.dispatchEvent(
          new CustomEvent("form-update", {
            detail: { valid: this.labelsForm.validateInputs() },
          })
        );
      });

      this.labelsForm.addEventListener("form-submitted", (e) => {
        this.dispatchEvent(
          new CustomEvent("form-submitted", {
            detail: e.detail,
          })
        );
      });
    }

    validateInputs() {
      this.labelsForm.validateInputs();
    }

    resetForm() {
      this.labelsForm.resetInputs();
    }

    submitForm() {
      this.labelsForm.submitForm();
    }
  }
);
