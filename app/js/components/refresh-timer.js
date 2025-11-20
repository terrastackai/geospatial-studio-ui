/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import { renewIcon } from "../icons.js";
import "../libs/carbon-web-components/toggle.min.js";
import "../libs/carbon-web-components/button.min.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }

    * {
      box-sizing: border-box;
    }

    #refresh-timer-container {
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
      width: 100%;
      padding: 0.5rem 1rem;
    }

    #countdown-label {
      display: flex;
      column-gap: 0.5rem;
      color: var(--cds-text-secondary, #c6c6c6);
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1rem;
      letter-spacing: 0.32px;
    }
  </style>

  <div id="refresh-timer-container">
    <cds-button id="refresh-button" kind="ghost" size="xs"
      >refresh
      ${renewIcon({
        width: 16,
        height: 16,
        slot: "icon",
      })}</cds-button
    >
    <p id="countdown-label"></p>
    <cds-toggle
      id="refresh-toggle"
      size="sm"
      label-a="auto refresh enabled"
      label-b="auto refresh disabled"
    ></cds-toggle>
  </div>
`;

window.customElements.define(
  "refresh-timer",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.refreshButton = this.shadow.querySelector("#refresh-button");
      this.refreshToggle = this.shadow.querySelector("#refresh-toggle");

      this.refreshButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("refresh"));
        clearInterval(this.countdownInterval);
        this.refreshButton.innerHTML = "refreshing ...";
        this.refreshButton.setAttribute("disabled", "");
        this.refreshToggle.setAttribute("disabled", "");
      });

      this.refreshToggle.addEventListener("cds-toggle-changed", () => {
        this.stopAutoRefresh();
        this.startAutoRefresh();
      });
    }

    disconnectedCallback() {
      this.stopAutoRefresh();
    }

    handleAutoRefresh(refreshInterval) {
      const refreshButton = this.shadow.querySelector("#refresh-button");
      const refreshToggle = this.shadow.querySelector("#refresh-toggle");
      let count = refreshInterval;

      const getCountdownString = () => {
        let minutes = Math.floor(count / 60);
        let seconds = count % 60;

        let countdownString;

        if (minutes > 0 && seconds === 0) {
          countdownString = `${minutes} minute${minutes !== 1 ? "s" : ""}`;
        } else if (minutes > 0) {
          countdownString = `${minutes} minute${
            minutes !== 1 ? "s" : ""
          } and ${seconds} second${seconds !== 1 ? "s" : ""}`;
        } else {
          countdownString = `${seconds} second${seconds !== 1 ? "s" : ""}`;
        }

        return (
          countdownString +
          `${renewIcon({
            width: 16,
            height: 16,
            slot: "icon",
          })}`
        );
      };

      this.refreshButton.innerHTML = getCountdownString();

      this.countdownInterval = setInterval(() => {
        count--;

        refreshButton.innerHTML = getCountdownString();

        if (count === 0) {
          this.dispatchEvent(new CustomEvent("refresh"));
          clearInterval(this.countdownInterval);
          refreshButton.innerHTML = "refreshing ...";
          refreshButton.setAttribute("disabled", "");
          refreshToggle.setAttribute("disabled", "");
        }
      }, 1000);
    }

    disable() {
      this.refreshButton.setAttribute("disabled", "");
      this.refreshToggle.setAttribute("disabled", "");
    }

    startAutoRefresh() {
      this.refreshButton.removeAttribute("disabled");
      this.refreshToggle.removeAttribute("disabled");

      if (!this.refreshToggle.checked) {
        this.refreshButton.innerHTML = `refresh
      ${renewIcon({
        width: 16,
        height: 16,
        slot: "icon",
      })}`;
        return;
      }

      this.handleAutoRefresh(30);
    }

    stopAutoRefresh() {
      clearInterval(this.countdownInterval);
    }
  }
);
