/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/modal.min.js";
import "../../libs/carbon-web-components/dropdown.min.js";
import "../../libs/carbon-web-components/text-input.min.js";
import "../../libs/carbon-web-components/textarea.min.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }

    * {
      box-sizing: border-box;
    }

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

  <cds-modal prevent-close-on-click-outside>
    <cds-modal-header>
      <cds-modal-close-button></cds-modal-close-button>
      <cds-modal-heading>Submit feedback</cds-modal-heading>
    </cds-modal-header>
    <cds-modal-body>
      <cds-dropdown id="issue-type-input" title-text="Issue Type" value="null">
        <cds-dropdown-item value="null">Select an issue type</cds-dropdown-item>
        <cds-dropdown-item value="Task">Task</cds-dropdown-item>
        <cds-dropdown-item value="Bug">Bug</cds-dropdown-item>
        <cds-dropdown-item value="Story">Story</cds-dropdown-item>
        <cds-dropdown-item value="Incident">Incident</cds-dropdown-item>
        <cds-dropdown-item value="Risk">Risk</cds-dropdown-item>
        <cds-dropdown-item value="Change Request">
          Change Request
        </cds-dropdown-item>
        <cds-dropdown-item value="Service Ticket">
          Service Ticket
        </cds-dropdown-item>
      </cds-dropdown>
      <cds-text-input
        id="summary-input"
        placeholder="A brief summary of the issue"
        label="Summary"
      >
      </cds-text-input>
      <cds-textarea
        id="description-input"
        placeholder="A description of the issue"
        rows="5"
        label="Description"
      >
      </cds-textarea>
    </cds-modal-body>
    <cds-modal-footer>
      <cds-modal-footer-button
        id="cancel-button"
        kind="secondary"
        data-modal-close
      >
        Cancel
      </cds-modal-footer-button>
      <cds-modal-footer-button kind="primary" id="submit-button" disabled>
        Submit
      </cds-modal-footer-button>
    </cds-modal-footer>
  </cds-modal>
`;

window.customElements.define(
  "feedback-modal",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.modal = this.shadow.querySelector("cds-modal");
      this.issueTypeInput = this.shadow.querySelector("#issue-type-input");
      this.summaryInput = this.shadow.querySelector("#summary-input");
      this.descriptionInput = this.shadow.querySelector("#description-input");
      this.submitButton = this.shadow.querySelector("#submit-button");

      this.issueTypeInput.addEventListener("cds-dropdown-selected", () => {
        this.validateForm();
      });

      this.summaryInput.addEventListener("input", () => {
        this.validateForm();
      });

      this.descriptionInput.addEventListener("input", () => {
        this.validateForm();
      });

      this.submitButton.addEventListener("click", () => {
        this.postIssue({
          issuetype: this.issueTypeInput.value,
          summary: this.summaryInput.value,
          description: this.descriptionInput.value,
        });
      });
    }

    openModal() {
      this.modal.setAttribute("open", "");
    }

    closeModal() {
      this.modal.removeAttribute("open");
    }

    resetModal() {
      this.issueTypeInput.value = "null";
      this.summaryInput.value = "";
      this.descriptionInput.value = "";
      this.submitButton.setAttribute("disabled", "");
    }

    validateForm() {
      if (
        this.issueTypeInput.value != "null" &&
        this.summaryInput.value != "" &&
        this.descriptionInput.value != ""
      ) {
        this.submitButton.removeAttribute("disabled");
      } else {
        this.submitButton.setAttribute("disabled", "");
      }
    }

    async postIssue(payload) {
      this.submitButton.setAttribute("disabled", "");
      this.issueTypeInput.setAttribute("disabled", "");
      this.descriptionInput.setAttribute("disabled", "");
      this.summaryInput.setAttribute("disabled", "");

      try {
        const response = await app.backend.postIssue(payload);

        if ("key" in response) {
          app.showMessage(
            "Feedback uploaded successfully",
            "",
            "success",
            5000
          );

          this.dispatchEvent(new CustomEvent("feedback-sent"));
          this.resetModal();
          this.closeModal();
        } else {
          app.showMessage(
            "Failed to upload feedback: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );

          this.submitButton.removeAttribute("disabled");
        }
      } catch (error) {
        console.error("Error uploading feedback:", error);
        app.showMessage(
          "An error occured while uploading the feedback",
          "",
          "error",
          5000
        );

        this.submitButton.removeAttribute("disabled");
      }

      this.issueTypeInput.removeAttribute("disabled");
      this.descriptionInput.removeAttribute("disabled");
      this.summaryInput.removeAttribute("disabled");
    }
  }
);
