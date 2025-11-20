/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { arrowRightIcon } from "../../icons.js";
import asWebComponent from "../../webcomponent.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      color: #ffffff;
      width: 300px;
      min-width: 245px;
      height: 330px;
    }

    .container {
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
      background-color: var(--cds-layer, #262626);
      height: 100%;
      border-radius: 16px;
      border: 1px solid #393939;
      align-items: center;
    }

    .header {
      padding-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: IBM Plex Sans;
      font-size: 20px;
      font-weight: 400;
      line-height: 28px;
      letter-spacing: 0px;
      text-align: left;
      color: var(--cds-text-01, #f4f4f4);
      margin-block-start: 0;
      margin-block-end: 0;
    }

    .icon {
      padding-top: 2rem;
      color: var(--cds-icon-secondary, #c6c6c6);
    }

    .description {
      font-family: IBM Plex Sans;
      font-size: 16px;
      font-weight: 400;
      line-height: 24px;
      letter-spacing: 0px;
      text-align: left;
      color: var(--cds-text-02, #c6c6c6);
      margin-bottom: 2.5em;
    }

    cds-button {
      width: 100%;
      max-width: 400rem;
    }

    cds-button::part(button) {
      border-radius: 0 0 16px 0;
      padding-right: 2.5rem;
    }

    .card-body {
      flex: 1 1 auto;
      padding-bottom: 1rem;
      z-index: 0;
      position: relative;
      width: 80%;
    }

    .break-line {
      background-color: var(--cds-ui-02, #393939);
      border: none;
      height: 1px;
    }
  </style>
  <div class="container">
    <div class="card-body">
      <div class="icon">
        <slot name="icon"></slot>
      </div>
      <h3 class="header">${obj.getAttribute("title")}</h3>
      <hr class="break-line" />
      <p class="description">${obj.getAttribute("description")}</p>
      <slot name="content"></slot>
    </div>
    <div style="margin-right: 0px; margin-left: auto;">
      <cds-button
        id="action-btn"
        button-class-name="customized-btn"
        kind="${obj.hasAttribute("primary") ? "primary" : "ghost"}"
      >
        ${obj.getAttribute("action-text")}
        ${arrowRightIcon({ width: 16, height: 16, slot: "icon" })}
      </cds-button>
    </div>
  </div>
`;

window.customElements.define(
  "action-card",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));
      this.actionButton = this.shadow.querySelector("#action-btn");
      this.actionButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("open"));
      });
    }
  }
);
