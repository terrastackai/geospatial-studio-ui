/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";

const template = (obj) => /* HTML */ `
  <style>
    .display-none {
      display: none;
    }

    #scale-bar-container {
      height: 3rem;
      padding: 0.5rem;
      text-align: center;
      background-color: #262626cc;
      backdrop-filter: blur(10px);
      border-radius: 10px;
      z-index: 2;
    }

    #scale-bar {
      width: 100px;
      height: 10px;
      margin-top: 0.5rem;
      border-left: 1px var(--cds-icon-01, #f4f4f4) solid;
      border-right: 1px var(--cds-icon-01, #f4f4f4) solid;
      border-bottom: 1px var(--cds-icon-01, #f4f4f4) solid;
    }

    #scale-bar-label {
      color: var(--cds-text-02, #525252);
      font-size: var(--cds-label-01-font-size, 0.75rem);
      font-weight: var(--cds-label-01-font-weight, 400);
      letter-spacing: var(--cds-label-01-letter-spacing, 0.32px);
    }
  </style>

  <div id="scale-bar-container" class="display-none">
    <span id="scale-bar-label">N/A km</span>
    <div id="scale-bar"></div>
  </div>
`;

window.customElements.define(
  "scale-bar",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.scaleBarContainer = this.shadow.querySelector(
        "#scale-bar-container"
      );

      this.scaleBarLabel = this.shadow.querySelector("#scale-bar-label");
    }

    setScale(scale) {
      this.scaleBarLabel.textContent = scale;
    }

    showScaleBar() {
      this.scaleBarContainer.classList.remove("display-none");
    }

    hideScaleBar() {
      this.scaleBarContainer.classList.add("display-none");
    }
  }
);
