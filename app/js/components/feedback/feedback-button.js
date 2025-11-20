/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import { feedbackIcon } from "../../icons.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }

    * {
      box-sizing: border-box;
    }

    #feedback-button {
      position: fixed;
      bottom: 0;
      right: 0;
      display: flex;
      align-items: baseline;
      column-gap: 0.5rem;
      margin: 0;
      padding: 0.5rem 1rem;
      background: var(--cds-ui-01, #262626);
      border: none;
      color: var(--cds-link-01, #78a9ff);
      cursor: pointer;
      z-index: 99;
    }

    #feedback-button:hover {
      background-color: var(--cds-layer-accent-01, #4589ff);
      color: var(--cds-text-primary);
    }

    #feedback-button:hover::after {
      content: "Ran into an issue? Have questions or ideas? Give us some feedback.";
      position: absolute;
      bottom: 100%;
      right: 100%;
      width: 10rem;
      padding: 0.5rem;
      background: var(--cds-ui-03, #393939);
      color: var(--cds-text-primary, #f4f4f4);
      font-weight: 400;
      font-size: 0.75rem;
      border-radius: 4px 4px 0 4px;
      z-index: 99;
    }
  </style>

  <button id="feedback-button">
    Feedback ${feedbackIcon({ width: 16, height: 16 })}
  </button>
`;

window.customElements.define(
  "feedback-button",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.feedbackButton = this.shadow.querySelector("#feedback-button");

      this.feedbackButton.addEventListener("click", () => {
        app.feedbackModal.openModal();
      });
    }
  }
);
