/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import "../components/breadcrumb-button.js";
import "../components/data-catalog/data-catalog-action-bar.js";
import "../components/data-catalog/data-catalog-filters.js";
import "../components/data-catalog/data-catalog-content-switcher.js";
import "../components/data-catalog/data-catalog-grid-view.js";
import "../components/data-catalog/data-catalog-list-view.js";
import "../components/data-catalog/onboarding-modal/dataset-onboarding-modal.js";

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

    data-catalog-filters {
      min-width: 12rem;
    }

    #data-content {
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
    <dataset-onboarding-modal></dataset-onboarding-modal>
    <data-catalog-action-bar></data-catalog-action-bar>
    <div id="catalog-columns">
      <data-catalog-filters></data-catalog-filters>
      <div id="data-content">
        <data-catalog-content-switcher></data-catalog-content-switcher>
        <data-catalog-grid-view></data-catalog-grid-view>
        <data-catalog-list-view class="display-none"></data-catalog-list-view>
      </div>
    </div>
  </div>
`;

window.customElements.define(
  "data-catalog-page",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.datasetOnboardingModal = this.shadow.querySelector(
        "dataset-onboarding-modal"
      );
      this.actionBar = this.shadow.querySelector("data-catalog-action-bar");
      this.contentSwitcher = this.shadow.querySelector(
        "data-catalog-content-switcher"
      );
      this.gridView = this.shadow.querySelector("data-catalog-grid-view");
      this.listView = this.shadow.querySelector("data-catalog-list-view");
      this.filters = this.shadow.querySelector("data-catalog-filters");

      this.datasetOnboardingModal.addEventListener("modal-submitted", () => {
        this.listView.loadDatasets();
        this.gridView.datasets = [];
        this.gridView.loadDatasets();
        this.datasetOnboardingModal.closeModal();
      });

      this.actionBar.addEventListener("add-data-button-click", () => {
        this.datasetOnboardingModal.openModal();
      });

      this.contentSwitcher.addEventListener("content-switched", (e) => {
        this.gridView.classList.toggle("display-none");
        this.listView.classList.toggle("display-none");
      });

      this.actionBar.addEventListener("set-loading", () => {
        this.gridView.setLoading();
        this.listView.setLoading();
      });

      this.actionBar.addEventListener("search-input", (e) => {
        this.listView.onSearch(e);
        this.gridView.onSearch(e);
      });

      this.filters.addEventListener("filter-changed", (e) => {
        this.listView.onFilterChange(e);
        this.gridView.onFilterChange(e);
      });
    }
  }
);
