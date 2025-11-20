/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/modal.min.js";
import "../../libs/carbon-web-components/text-input.min.js";
import "../../libs/carbon-web-components/textarea.min.js";

const template = (obj) => /* HTML */ `
  <style>
    cds-modal {
      background-color: #000000cc;
    }

    cds-modal-body {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      padding-right: 1rem;
    }
  </style>

  <div>
    <cds-modal id="edit-tune-modal" prevent-close-on-click-outside>
      <cds-modal-header>
        <cds-modal-close-button></cds-modal-close-button>
        <cds-modal-heading>Edit tune</cds-modal-heading>
      </cds-modal-header>
      <cds-modal-body>
        <p>Edit your tune</p>
        <cds-input
          placeholder="Tune name"
          id="name-input"
          helper-text="Tune names must consist solely of lowercase letters, numbers, and dashes (e.g., 'valid-input-123'). No spaces or special characters allowed."
        >
          <span slot="label-text">Tune name [Max 32 characters]</span>
        </cds-input>
        <cds-textarea
          placeholder="Tune description"
          rows="3"
          id="description-input"
        >
          <span slot="label-text">Description</span>
        </cds-textarea>
      </cds-modal-body>
      <cds-modal-footer>
        <cds-modal-footer-button
          id="cancel-button"
          kind="secondary"
          data-modal-close
          >Cancel</cds-modal-footer-button
        >
        <cds-modal-footer-button kind="primary" id="save-button"
          >Save</cds-modal-footer-button
        >
      </cds-modal-footer>
    </cds-modal>
  </div>
`;

window.customElements.define(
  "edit-tune-modal",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.tuneId;

      this.payload = {
        name: "",
        description: "",
      };
    }

    render() {
      this.setDOM(template(this));

      this.nameInput = this.shadow.querySelector("#name-input");
      this.descriptionInput = this.shadow.querySelector("#description-input");

      this.saveButton = this.shadow.querySelector("#save-button");

      this.saveButton.addEventListener("click", () => {
        this.payload.name = this.nameInput.value;
        this.payload.description = this.descriptionInput.value;

        this.dispatchEvent(
          new CustomEvent("modal-submitted", {
            detail: { id: this.tuneId, payload: this.payload },
          })
        );
      });

      //=== Add Input Event Listeners===//
      this.nameInput.addEventListener("input", () => {
        this.handleSaveButton(this.validateForm());
      });

      this.descriptionInput.addEventListener("input", () => {
        this.handleSaveButton(this.validateForm());
      });
    }

    handleSaveButton(valid) {
      if (valid) {
        this.saveButton.removeAttribute("disabled");
      } else {
        this.saveButton.setAttribute("disabled", "");
      }
    }

    populateForm(tune) {
      this.tuneId = tune.id;
      this.nameInput.value = tune.name;
      this.descriptionInput.value = tune.description;

      this.handleSaveButton(this.validateForm());
    }

    validateForm() {
      const nameRegex = /^[a-z0-9\-]{1,32}$/;

      let formValid = true;

      if (nameRegex.test(this.nameInput.value)) {
        this.nameInput.removeAttribute("invalid");
      } else {
        this.nameInput.setAttribute("invalid", "");
        formValid = false;
      }

      if (this.descriptionInput.value != "") {
        this.descriptionInput.removeAttribute("invalid");
      } else {
        this.descriptionInput.setAttribute("invalid", "");
        formValid = false;
      }

      return formValid;
    }
  }
);
