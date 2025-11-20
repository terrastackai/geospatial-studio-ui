/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import { gridIcon, listIcon } from "../../icons.js";

const template = () => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    #content-switcher-container {
      display: flex;
      justify-content: space-between;
      column-gap: 1rem;
      row-gap: 1rem;
      flex-wrap: wrap;
      width: 100%;
    }

    #model-count {
      display: flex;
      align-items: center;
      column-gap: 1rem;
    }

    h2 {
      margin: 0;
      color: var(--cds-text-01, #f4f4f4);
      font-size: 1.5rem;
      font-weight: 400;
    }

    p {
      margin: 0;
      color: var(--cds-text-02, #c6c6c6);
      font-size: 0.8rem;
      font-weight: 400;
    }

    #switch {
      display: flex;
      border: 1px solid var(--cds-ui-05, #f4f4f4);
      border-radius: 0.25rem;
    }

    #switch button {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0;
      padding: 0.675rem;
      color: var(--cds-ui-05, #f4f4f4);
      background: unset;
      border: none;
      cursor: pointer;
    }

    #switch button:first-child {
      border-right: 1px solid var(--cds-ui-05, #f4f4f4);
    }

    #switch .button-active {
      color: var(--cds-ui-01, #262626);
      background: var(--cds-ui-05, #f4f4f4);
    }

    #switch button svg {
      pointer-events: none;
    }
  </style>

  <div id="content-switcher-container">
    <span id="model-count">
      <h2>Models</h2>
    </span>
    <div id="switch">
      <button id="grid-button" class="button-active" data-name="grid">
        ${gridIcon({ width: 16, height: 16 })}
      </button>
      <button id="list-button" data-name="list">
        ${listIcon({ width: 16, height: 16 })}
      </button>
    </div>
  </div>
`;

window.customElements.define(
  "model-catalog-content-switcher",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.currentView = "grid";
    }

    render() {
      this.setDOM(template(this));

      this.gridButton = this.shadow.querySelector("#grid-button");
      this.listButton = this.shadow.querySelector("#list-button");

      this.gridButton.addEventListener("click", (e) => {
        this.handleContentSwitch(e);
      });

      this.listButton.addEventListener("click", (e) => {
        this.handleContentSwitch(e);
      });
    }

    handleContentSwitch(e) {
      if (this.currentView != e.target.dataset.name) {
        this.currentView = e.target.dataset.name;

        this.gridButton.classList.toggle("button-active");
        this.listButton.classList.toggle("button-active");

        this.dispatchEvent(
          new CustomEvent("contentSwitched", {
            detail: this.currentView,
          })
        );
      }
    }
  }
);
