/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }

    .page-content {
      padding: 1.67em 4em 1.67em 1.67em;
      margin-bottom: 4em;
    }
  </style>
  <div class="page-content">Page not found</div>
`;

window.customElements.define(
  "not-found-page",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));
    }
  }
);
