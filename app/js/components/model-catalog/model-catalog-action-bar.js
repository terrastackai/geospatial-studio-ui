/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/button.min.js";
import { musicAddIcon, searchIcon } from "../../icons.js";

const template = () => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    #action-bar-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      column-gap: 1rem;
      row-gap: 1rem;
      flex-wrap: wrap;
      width: 100%;
    }

    h1 {
      margin: 0;
      color: var(--cds-text-01, #f4f4f4);
      font-size: 1.75rem;
      font-weight: 400;
    }

    #actions-container {
      display: flex;
      column-gap: 1rem;
      row-gap: 1rem;
      flex-wrap: wrap;
    }

    #search-bar-container {
      display: flex;
      height: fit-content;
      min-height: 48px;
    }

    .icon {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      min-width: 50px;
      padding-left: 10px;
      background: var(--cds-ui-01, #262626);
      color: var(--cds-ui-05, #f4f4f4);
      border: 1px solid var(--cds-field-02, #393939);
      border-right: none;
      text-align: center;
      font-size: 20px;
    }

    .input-field {
      width: 250px;
      min-width: calc(100% - 50px);
      background: var(--cds-ui-01, #262626);
      font-size: 14px;
      line-height: 18px;
      letter-spacing: 0.16px;
      font-weight: 400;
      font-family: IBM Plex Sans;
      padding: 5px;
      outline: none;
      border: 1px solid var(--cds-field-02, #393939);
      border-left: none;
      color: var(--cds-text-02, #c6c6c6);
    }

    .input-field::placeholder {
      color: var(--cds-text-02, #c6c6c6);
      font-size: 14px;
      line-height: 18px;
      letter-spacing: 0.16px;
      font-weight: 400;
      font-family: IBM Plex Sans;
    }

    .input-field:focus::placeholder {
      color: transparent;
    }

    cds-button {
      white-space: nowrap;
    }

    @media screen and (max-width: 1000px) {
      .input-field {
        width: 200px;
      }
    }

    @media screen and (max-width: 500px) {
      .input-field {
        width: 100%;
      }
    }
  </style>

  <div id="action-bar-container">
    <h1>Model Catalog</h1>
    <div id="actions-container">
      <div id="search-bar-container">
        <i class="icon">
          ${searchIcon({ width: 16, height: 16, slot: "icon" })}
        </i>
        <input
          id="search-input"
          class="input-field"
          type="text"
          placeholder="Search models"
        />
      </div>
      <cds-button id="create-tune-button" href="#fine_tuning_create">
        Create new tune ${musicAddIcon({ width: 16, height: 16, slot: "icon" })}
      </cds-button>
    </div>
  </div>
`;

window.customElements.define(
  "model-catalog-action-bar",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.searchBar = this.shadow.querySelector("#search-input");
      this.debounceTimer;

      this.searchBar.addEventListener("input", (e) => {
        clearTimeout(this.debounceTimer);
        const searchTerm = e.target.value;

        this.dispatchEvent(new CustomEvent("set-loading"));

        this.debounceTimer = setTimeout(() => {
          this.dispatchEvent(
            new CustomEvent("search-input", {
              detail: searchTerm,
            })
          );
        }, 1500);
      });
    }
  }
);
