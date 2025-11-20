/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import "../components/breadcrumb-button.js";
import "../components/model-catalog/model-catalog-action-bar.js";
import "../components/model-catalog/model-catalog-filters.js";
import "../components/model-catalog/model-catalog-content-switcher.js";
import "../components/model-catalog/model-catalog-grid-view.js";
import "../components/model-catalog/model-catalog-list-view.js";
import "../libs/carbon-web-components/tabs.min.js";

const template = () => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }

    .display-none {
      display: none;
    }

    * {
      box-sizing: border-box;
    }

    .earth-bg {
      position: fixed;
      width: 100vw;
      height: calc(100vh - 3rem);
      object-fit: cover;
      top: 3rem;
      left: 0;
    }

    .page-content {
      display: flex;
      flex-direction: column;
      row-gap: 2rem;
      color: var(--cds-text-01, #f4f4f4);
      margin: 2rem 4rem 4rem;
      width: calc(100vw - 8rem);
      z-index: 1;
    }

    #catalog-columns {
      display: flex;
      column-gap: 4rem;
      row-gap: 2rem;
    }

    model-catalog-filters {
      min-width: 12rem;
    }

    #model-content {
      display: flex;
      flex-direction: column;
      row-gap: 2rem;
      flex-grow: 1;
      overflow: hidden;
    }

    @media screen and (max-width: 700px) {
      #catalog-columns {
        flex-direction: column;
      }
    }
  </style>

  <img
    fetchpriority="high"
    class="earth-bg"
    src="/images/Geospatial_Earth_5.jpg"
  />
  <div class="page-content">
    <breadcrumb-button
      breadcrumb-href=""
      breadcrumb-text="Homepage"
    ></breadcrumb-button>
    <model-catalog-action-bar></model-catalog-action-bar>
    <div id="catalog-columns">
      <model-catalog-filters></model-catalog-filters>
      <div id="model-content">
        <model-catalog-content-switcher></model-catalog-content-switcher>
        <cds-tabs value="models-and-tunes">
          <cds-tab
            value="models-and-tunes"
            target="panel-models-and-tunes"
            aria-labelledby="models-and-tunes-tab"
          >
            Models & Tunes
          </cds-tab>
          <cds-tab
            value="base-models"
            target="panel-base-models"
            aria-labelledby="base-models-tab"
          >
            Base Models
          </cds-tab>
        </cds-tabs>
        <model-catalog-grid-view></model-catalog-grid-view>
        <model-catalog-list-view class="display-none"></model-catalog-list-view>
      </div>
    </div>
  </div>
`;

window.customElements.define(
  "model-catalog-page",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.actionBar = this.shadow.querySelector("model-catalog-action-bar");

      this.contentSwitcher = this.shadow.querySelector(
        "model-catalog-content-switcher"
      );

      this.gridView = this.shadow.querySelector("model-catalog-grid-view");
      this.listView = this.shadow.querySelector("model-catalog-list-view");
      this.tabs = this.shadow.querySelector("cds-tabs");
      this.filters = this.shadow.querySelector("model-catalog-filters");

      this.tabs.addEventListener("cds-tabs-selected", (e) => {
        this.gridView.onTabChange(this.tabs.value);
        this.listView.onTabChange(this.tabs.value);
        this.filters.updateFilters(this.tabs.value);
      });

      this.actionBar.addEventListener("set-loading", () => {
        this.gridView.setLoading();
        this.listView.setLoading();
      });

      this.actionBar.addEventListener("search-input", (e) => {
        this.gridView.onSearch(e);
        this.listView.onSearch(e);
      });

      this.contentSwitcher.addEventListener("contentSwitched", (e) => {
        this.gridView.classList.toggle("display-none");
        this.listView.classList.toggle("display-none");
      });

      this.filters.addEventListener("filter-changed", (e) => {
        this.gridView.onFilterChange(e);
        this.listView.onFilterChange(e);
      });
    }
  }
);
