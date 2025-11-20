/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import { arrowRightIcon } from "../../icons.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      margin: 0;
      padding: 0;
    }

    button {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
      width: 14rem;
      color: var(--cds-text-primary, #f4f4f4);
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
    }

    h4 {
      display: flex;
      column-gap: 0.25rem;
      font-weight: 600;
      font-size: 1rem;
    }

    p {
      font-weight: 400;
      font-size: 0.825rem;
      letter-spacing: 0.025rem;
    }
  </style>

  <button>
    <img src="${obj.getAttribute("image-src")}" width="28px" height="28px" />
    <h4>
      <span>${obj.getAttribute("header-text")}</span>
      <span>
        ${arrowRightIcon({
          height: 16,
          width: 16,
          fill: "#f4f4f4",
        })}
      </span>
    </h4>
    <p>${obj.getAttribute("body-text")}</p>
  </button>
`;

window.customElements.define(
  "secondary-card",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));
    }
  }
);
