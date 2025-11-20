/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import "../libs/carbon-web-components/modal.min.js";

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
  </style>

  <cds-modal size="sm" prevent-close-on-click-outside>
    <cds-modal-header>
      <cds-modal-close-button></cds-modal-close-button>
      <cds-modal-heading>Confirm delete</cds-modal-heading>
    </cds-modal-header>
    <cds-modal-body>
      <p>
        Deleting <span class="item-name"></span> will permanently delete the
        <span class="item-classification"></span>. This action cannot be undone.
      </p>
    </cds-modal-body>
    <cds-modal-footer>
      <cds-modal-footer-button id="cancel-button" kind="secondary"
        >Cancel</cds-modal-footer-button
      >
      <cds-modal-footer-button id="delete-button" kind="danger"
        >Delete</cds-modal-footer-button
      >
    </cds-modal-footer>
  </cds-modal>
`;

window.customElements.define(
  "delete-modal",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.id;
    }

    render() {
      this.setDOM(template(this));

      this.modal = this.shadow.querySelector("cds-modal");
      this.cancelButton = this.shadow.querySelector("#cancel-button");
      this.deleteButton = this.shadow.querySelector("#delete-button");

      this.cancelButton.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("cancelled", { detail: { id: this.id } })
        );
      });

      this.deleteButton.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("confirmed", { detail: { id: this.id } })
        );
      });

      this.modal.addEventListener("cds-modal-closed", () => {
        this.dispatchEvent(
          new CustomEvent("cancelled", { detail: { id: this.id } })
        );
      });
    }

    setup(id, item, classification) {
      this.id = id;
      const itemElements = this.shadow.querySelectorAll(".item-name");
      const itemClassificationElements = this.shadow.querySelectorAll(
        ".item-classification"
      );

      itemElements.forEach((element) => {
        element.innerHTML = item;
      });

      itemClassificationElements.forEach((element) => {
        element.innerHTML = classification;
      });
    }

    open() {
      this.modal.setAttribute("open", "");
    }

    close() {
      this.modal.removeAttribute("open");
    }
  }
);
