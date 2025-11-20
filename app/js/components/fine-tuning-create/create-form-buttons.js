/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/button.min.js";

const template = (obj) => /* HTML */ `
  <style>
    #buttons-container {
      width: 100%;
      height: 100%;
      display: flex;
    }

    #previous-btn,
    #next-btn {
      width: 150px;
    }

    #cancel-btn {
      flex-grow: 1;
      max-width: unset;
      min-width: 150px;
    }

    @media screen and (max-width: 600px) {
      #previous-btn,
      #next-btn,
      #cancel-btn {
        width: 33%;
      }
      #cancel-btn {
        flex-grow: 1;
        max-width: unset;
        min-width: unset;
      }
    }
  </style>

  <div id="buttons-container">
    <cds-button id="cancel-btn" href="/#model_catalog" size="xl" kind="ghost"
      >Cancel</cds-button
    >
    <cds-button id="previous-btn" size="xl" kind="secondary"
      >Previous</cds-button
    >
    <cds-button id="next-btn" size="xl" kind="primary">Next</cds-button>
  </div>
`;

window.customElements.define(
  "create-form-buttons",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));
    }
  }
);
