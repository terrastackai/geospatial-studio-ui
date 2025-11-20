/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { searchIcon } from "../../icons.js";
import asWebComponent from "../../webcomponent.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      font-family: "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    #search-bar-container {
      display: flex;
      width: 100%;
      margin-bottom: 15px;
      min-height: 48px;
    }

    .icon {
      padding-left: 10px;
      background: var(--cds-field-01, #262626);
      color: var(--cds-icon-primary, #f4f4f4);
      border: 1px solid var(--cds-field-02, #393939);
      border-right: none;
      min-width: 50px;
      text-align: center;
      font-size: 20px;
      border-radius: 10px 0 0 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    .input-field {
      background: var(--cds-field-01, #262626);
      width: 100%;
      font-size: 14px;
      line-height: 18px;
      letter-spacing: 0.16px;
      font-weight: 400;
      font-family: IBM Plex Sans;
      padding: 5px;
      outline: none;
      border: 1px solid var(--cds-field-02, #393939);
      border-left: none;
      color: var(--cds-text-secondary, #c6c6c6);
      border-radius: 0 10px 10px 0;
      min-width: 250px;
    }

    .input-field::placeholder {
      color: var(--cds-text-secondary, #c6c6c6);
      font-size: 14px;
      line-height: 18px;
      letter-spacing: 0.16px;
      font-weight: 400;
      font-family: IBM Plex Sans;
    }

    .input-field:focus::placeholder {
      color: transparent;
    }
  </style>

  <div id="search-bar-container">
    <i class="icon"> ${searchIcon({ width: 16, height: 16, slot: "icon" })} </i>
    <input
      class="input-field"
      type="text"
      placeholder="Search map"
      id="geocode-input"
    />
  </div>
`;

window.customElements.define(
  "search-bar",
  class extends asWebComponent(HTMLElement) {
    init() {}

    render() {
      this.setDOM(template(this));

      const geocodeThis = (e) => {
        this.dispatchEvent(
          new CustomEvent("geocode-this", {
            detail: e,
          })
        );
      };

      const geocodeInput = this.shadow.getElementById("geocode-input");

      if (app.env.geostudio.mapboxToken) {
        geocodeInput.addEventListener("input", (e) => {
          geocodeThis(e.target.value);
        });

        geocodeInput.addEventListener("keydown", (e) => {
          geocodeThis(e.target.value);
        });
      } else {
        let debounceTimer;

        geocodeInput.addEventListener("input", (e) => {
          const data = e.target.value;

          clearTimeout(debounceTimer);

          debounceTimer = setTimeout(() => {
            geocodeThis(data);
          }, 500);
        });

        geocodeInput.addEventListener("keydown", (e) => {
          const data = e.target.value;

          clearTimeout(debounceTimer);

          debounceTimer = setTimeout(() => {
            geocodeThis(data);
          }, 500);
        });
      }
    }
  }
);
