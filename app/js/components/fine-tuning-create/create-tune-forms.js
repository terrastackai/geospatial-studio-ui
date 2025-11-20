/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "./setup-form.js";
import "./training-data-form.js";
import "./parameters-form.js";
import "./review-form.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    #forms-container {
      width: 100%;
      height: 100%;
      padding: 2rem 3rem 0;
    }

    @media screen and (max-width: 600px) {
      #forms-container {
        padding: 2rem 2rem 0;
      }
    }
  </style>

  <div id="forms-container">
    <setup-form></setup-form>
    <training-data-form></training-data-form>
    <parameters-form></parameters-form>
    <review-form></review-form>
  </div>
`;

window.customElements.define(
  "create-tune-forms",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));
    }
  }
);
