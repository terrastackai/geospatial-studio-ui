/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import { layerIcon, recentlyViewedIcon, datasetIcon } from "../../icons.js";

const template = (obj) => /* HTML */ `
  <style>
    #menu-bar {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .menu-bar-button {
      position: relative;
      padding: 1rem;
      background-color: var(--cds-layer, #363636);
      border: none;
      cursor: pointer;
    }

    .notification::after {
      content: "";
      position: absolute;
      top: 27.5%;
      right: 27.5%;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: var(--cds-support-error, #fa4d56);
    }

    .menu-bar-button:nth-child(1) {
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
    }

    .menu-bar-button:nth-child(2) {
      border-top: 1px solid var(--cds-layer, #454545);
      border-bottom: 1px solid var(--cds-layer, #454545);
    }

    .menu-bar-button:nth-child(3) {
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
    }

    .menu-bar-button:hover {
      background-color: var(--cds-layer-accent-01);
    }

    .menu-bar-button[selected] {
      background-color: var(--cds-layer-accent-active-01, #262626);
    }

    .menu-bar-button svg {
      color: var(--cds-icon-primary, #f4f4f4);
    }
  </style>

  <div id="menu-bar">
    <button
      class="menu-bar-button"
      id="layers-button"
      title="Layers"
      data-name="layers"
    >
      ${layerIcon({ width: 16, height: 16 })}
    </button>
    <button
      class="menu-bar-button"
      id="history-button"
      title="History"
      data-name="history"
    >
      ${recentlyViewedIcon({ width: 16, height: 16 })}
    </button>
    <button
      class="menu-bar-button"
      id="examples-button"
      title="Examples"
      data-name="examples"
    >
      ${datasetIcon({ width: 16, height: 16 })}
    </button>
  </div>
`;

window.customElements.define(
  "menu-bar",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.layersButton = this.shadow.querySelector("#layers-button");
      this.historyButton = this.shadow.querySelector("#history-button");
      this.examplesButton = this.shadow.querySelector("#examples-button");

      this.layersButton.addEventListener("click", () => {
        this.handleSelect(this.layersButton);
      });

      this.historyButton.addEventListener("click", () => {
        this.handleSelect(this.historyButton);
      });

      this.examplesButton.addEventListener("click", () => {
        this.handleSelect(this.examplesButton);
      });
    }

    handleSelect(selectedButton) {
      if (selectedButton.hasAttribute("selected")) {
        selectedButton.removeAttribute("selected");
      } else {
        if (this.shadow.querySelector("[selected]")) {
          this.shadow.querySelector("[selected]").removeAttribute("selected");
        }
        selectedButton.setAttribute("selected", "");
      }

      this.dispatchEvent(
        new CustomEvent("menu-button-clicked", {
          detail: selectedButton.dataset.name,
        })
      );
    }

    deselectPanel() {
      if (this.shadow.querySelector("[selected]")) {
        this.shadow.querySelector("[selected]").removeAttribute("selected");
      }
    }

    addHistoryNotification() {
      this.historyButton.classList.add("notification");
    }

    removeHistoryNotification() {
      this.historyButton.classList.remove("notification");
    }
  }
);
