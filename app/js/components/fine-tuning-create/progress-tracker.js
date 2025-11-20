/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/progress-indicator.min.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    #progress-tracker-container {
      width: 100%;
      height: 100%;
      padding: 2rem 2rem 0 2rem;
    }

    h1 {
      font-weight: 400;
      margin: 0;
      margin-bottom: 2rem;
      line-height: normal;
    }

    cds-progress-step {
      position: relative;
      min-height: unset;
      height: 40px;
    }

    cds-progress-step::after {
      content: attr(data-label);
      position: absolute;
      top: 0;
      left: 32px;
      font-size: 14px;
      font-weight: 400;
      font-family: IBM Plex Sans;
    }

    @media screen and (max-width: 1400px) {
      h1 {
        margin-bottom: 1rem;
      }

      cds-progress-step {
        width: 25%;
        min-width: unset;
      }

      cds-progress-step::after {
        top: 20%;
        left: 25px;
        width: calc(100% - 30px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  </style>

  <div id="progress-tracker-container">
    <h1>Create New Tune</h1>
    <cds-progress-indicator>
      <cds-progress-step
        data-label="Provide tune details"
        title="Provide tune details"
      >
      </cds-progress-step>
      <cds-progress-step
        data-label="Assign training data"
        title="Assign training data"
      >
      </cds-progress-step>
      <cds-progress-step
        data-label="Adjust parameters"
        title="Adjust parameters"
      >
      </cds-progress-step>
      <cds-progress-step data-label="Review" title="Review"></cds-progress-step>
    </cds-progress-indicator>
  </div>
`;

window.customElements.define(
  "progress-tracker",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      const progressIndicator = this.shadow.querySelector(
        "cds-progress-indicator"
      );

      this.setProgressIndicatorOrientation(progressIndicator);

      window.addEventListener("resize", () => {
        this.setProgressIndicatorOrientation(progressIndicator);
      });
    }

    setProgressIndicatorOrientation(progressIndicator) {
      if (window.innerWidth <= 1400) {
        progressIndicator.removeAttribute("vertical");
      } else {
        progressIndicator.setAttribute("vertical", "");
      }
    }
  }
);
