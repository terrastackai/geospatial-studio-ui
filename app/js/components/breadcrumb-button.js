/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import "../libs/carbon-web-components/breadcrumb.min.js";
import { arrowLeftIcon } from "../icons.js";

const template = (obj) => /* HTML */ `
  <style>
    cds-breadcrumb-link svg {
      color: var(--cds-text-01);
    }
    .breadcrumb-text {
      padding: 0px 10px;
      color: var(--cds-text-01);
      margin-left: 0.1rem;
    }
  </style>
  <div>
    <cds-breadcrumb>
      <cds-breadcrumb-link href="/#${obj.getAttribute("breadcrumb-href")}">
        ${arrowLeftIcon({ width: 16, height: 16 })}
        <span class="breadcrumb-text"
          >${obj.getAttribute("breadcrumb-text")}</span
        ></cds-breadcrumb-link
      >
    </cds-breadcrumb>
  </div>
`;

window.customElements.define(
  "breadcrumb-button",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));
    }
  }
);
