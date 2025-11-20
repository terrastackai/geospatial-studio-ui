/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import "../libs/carbon-web-components/notification.min.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      position: absolute;
      top: 3em;
      right: 0.8em;
      z-index: 10000;
    }
  </style>

  <cds-toast-notification kind="error" title="Error"></cds-toast-notification>
`;

class ErrorHandler extends HTMLElement {
  constructor() {
    super();
    this.dom = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.dom.innerHTML = template(this);
    this.error = this.dom.querySelector("cds-toast-notification");
    this.error.open = false;

    window.addEventListener("show-error", (e) => {
      const message = e?.detail?.message;
      if (message) {
        this.show(message);
      }
    });

    window.onerror = (msg, url, lineNo, columnNo, error) => {
      console.error(error || msg);
      if (msg.indexOf("ResizeObserver") >= 0) {
        return true;
      }

      window.dispatchEvent(new CustomEvent("show-error", { detail: error }));
      return true;
    };

    window.addEventListener("unhandledrejection", (e) => {
      window.dispatchEvent(new CustomEvent("show-error", { detail: e.reason }));
    });
  }

  show(message) {
    this.error.open = true;
    this.error.subtitle = message;
  }
}

if (!customElements.get("error-handler")) {
  customElements.define("error-handler", ErrorHandler);
}
