/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/button.min.js";
import "../../libs/carbon-web-components/accordion.min.js";
import "../../libs/carbon-web-components/inline-loading.min.js";
import "../../libs/carbon-web-components/dropdown.min.js";
import "../../libs/carbon-web-components/structured-list.min.js";
import "../../libs/carbon-web-components/number-input.min.js";
import "../../libs/carbon-web-components/pagination.min.js";
import { trashIcon } from "../../icons.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    .display-none {
      display: none;
    }

    #data-sources-form {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;
    }

    cds-button {
      width: fit-content;
    }

    cds-accordion,
    cds-accordion-item {
      width: 100%;
    }

    cds-accordion-item::part(content) {
      padding-right: 0 !important;
    }

    cds-accordion-item:nth-child(even),
    cds-accordion-item:nth-child(even) cds-pagination {
      background: var(--cds-ui-01, #262626);
    }

    cds-accordion-item:nth-child(odd),
    cds-accordion-item:nth-child(odd) cds-pagination {
      background: #2e2e2e;
    }

    .data-source-form {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;
      padding-right: 1rem;
    }

    cds-structured-list {
      width: 100%;
      margin-bottom: 1rem;
    }

    cds-structured-list-cell {
      width: 30%;
      max-width: 30%;
      vertical-align: bottom !important;
    }

    cds-structured-list-cell:last-child {
      width: 10%;
    }

    cds-number-input {
      display: inline-block;
      min-width: 10rem;
    }

    cds-text-input,
    cds-dropdown {
      width: 100%;
    }

    .band-name-dropdown {
      display: inline-block;
      max-width: 20rem;
    }
  </style>
  <div id="data-sources-form">
    <cds-inline-loading>Loading collections</cds-inline-loading>
    <cds-button id="add-data-source-button" size="sm" kind="tertiary"
      >Add data source</cds-button
    >
    <cds-accordion id="data-sources-accordion"></cds-accordion>
  </div>
`;

window.customElements.define(
  "data-sources-form",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.collections = [];
      this.dataSources = [];
    }

    render() {
      this.setDOM(template(this));

      this.addDataSourceButton = this.shadow.querySelector(
        "#add-data-source-button"
      );
      this.dataSourcesAccordion = this.shadow.querySelector(
        "#data-sources-accordion"
      );
      this.inlineLoading = this.shadow.querySelector("cds-inline-loading");

      this.addDataSourceButton.addEventListener("click", () => {
        this.addDataSource();
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      this.getCollections();
    }

    addPreScannedDataSources(preScannedDataSources) {
      Object.keys(preScannedDataSources).forEach((fileSuffix) => {
        const dataSource = { bands: [], file_suffix: fileSuffix };

        preScannedDataSources[fileSuffix].forEach((preScannedBand) => {
          const band = {
            index: preScannedBand.id,
          };

          dataSource.bands.push(band);
        });

        this.addDataSource(dataSource);
      });
    }

    addDataSource(existingDatasource = null) {
      const dataSource = {
        bands: [],
        connector: null,
        collection: null,
        file_suffix: null,
        modality_tag: null,
      };

      if (existingDatasource) {
        Object.assign(dataSource, existingDatasource);
        dataSource.bands = [];
      }

      const dataSourceTemplate = document.createElement("template");
      dataSourceTemplate.innerHTML =
        this._renderDataSourceAccordionItem(dataSource);
      const dataSourceElement = dataSourceTemplate.content.firstElementChild;

      const collectionDropdown = dataSourceElement.querySelector(
        ".collection-dropdown"
      );

      const fileSuffixInput =
        dataSourceElement.querySelector(".file-suffix-input");
      const addBandButton = dataSourceElement.querySelector(".add-band-button");
      const deleteDataSourceButton = dataSourceElement.querySelector(
        ".delete-data-source-button"
      );
      const pagination = dataSourceElement.querySelector("cds-pagination");

      this.setupCollectionDropdown(collectionDropdown);

      collectionDropdown.addEventListener("cds-dropdown-selected", () => {
        this.resetBandNames(dataSource);
        const collection = this.getCollectionById(collectionDropdown.value);
        dataSource.connector = collection.connector;
        dataSource.collection = collection.collection_name
          ? collection.collection_name
          : null;
        dataSource.modality_tag = collection.modality_tag;
        addBandButton.removeAttribute("disabled");

        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      fileSuffixInput.addEventListener("input", () => {
        dataSource.file_suffix = fileSuffixInput.value;
        dataSourceElement.setAttribute(
          "title",
          fileSuffixInput.value === ""
            ? "New data source"
            : fileSuffixInput.value
        );
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      deleteDataSourceButton.addEventListener("click", () => {
        dataSource.element.remove();

        const index = this.dataSources.findIndex((ds) => ds === dataSource);

        this.dataSources.splice(index, 1);

        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      addBandButton.addEventListener("click", () => {
        this.addBand(dataSource);
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      pagination.addEventListener("cds-pagination-changed-current", () => {
        if (!dataSource.collection && !dataSource.connector) {
          return;
        }
        this.updateBandsStructuredList(dataSource);
      });

      pagination.addEventListener("cds-page-sizes-select-changed", (e) => {
        this.updateBandsStructuredList(dataSource);
      });

      dataSource.element = dataSourceElement;

      this.dataSourcesAccordion.appendChild(dataSourceElement);

      this.dataSources.push(dataSource);

      if (existingDatasource) {
        if (existingDatasource.collection && existingDatasource.connector) {
          let collection = this.getCollectionByCollectionNameAndConnector(
            dataSource.collection,
            dataSource.connector
          );

          collectionDropdown.value = collection.id;

          addBandButton.removeAttribute("disabled");
        }

        existingDatasource.bands.forEach((band) => {
          this.addBand(dataSource, band);
        });
      }
    }

    addBand(dataSource, existingBand = null) {
      const pagination = dataSource.element.querySelector("cds-pagination");
      const collectionDropdown = dataSource.element.querySelector(
        ".collection-dropdown"
      );

      const band = {
        index: null,
        band_name: null,
        scaling_factor: 1,
      };

      if (existingBand) {
        Object.assign(band, existingBand);
      }

      const bandTemplate = document.createElement("template");
      bandTemplate.innerHTML = this._renderBandStructuredListRow(band);
      const bandElement = bandTemplate.content.firstElementChild;

      const bandIndexInput = bandElement.querySelector(".band-index-input");
      const bandNameInput = bandElement.querySelector(".band-name-dropdown");
      const bandScalingFactorInput = bandElement.querySelector(
        ".band-scaling-factor-input"
      );
      const deleteButton = bandElement.querySelector(".delete-button");

      bandIndexInput.addEventListener("cds-number-input", () => {
        band.index = bandIndexInput.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      bandNameInput.addEventListener("cds-dropdown-selected", () => {
        band.band_name = bandNameInput.value;

        //Adds RGB band if its present in the collection band
        const collection = this.getCollectionByCollectionNameAndConnector(
          dataSource.collection,
          dataSource.connector
        );

        const selectedBand = collection.bands.filter(
          (b) => b.band_name === band.band_name
        )[0];

        if ("RGB_band" in selectedBand) {
          band.RGB_band = selectedBand.RGB_band;
        } else {
          delete band.RGB_band;
        }
        //

        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      bandScalingFactorInput.addEventListener("cds-number-input", () => {
        band.scaling_factor = bandScalingFactorInput.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      deleteButton.addEventListener("click", () => {
        band.element.remove();
        const index = dataSource.bands.findIndex((b) => b === band);
        dataSource.bands.splice(index, 1);

        if (
          pagination.totalItems - 1 <
            pagination.pageSize * (pagination.page - 1) + 1 &&
          pagination.page !== 1
        ) {
          pagination.page = pagination.page - 1;
        }

        this.updateBandsStructuredList(dataSource);
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      band["element"] = bandElement;

      dataSource.bands.push(band);

      if (collectionDropdown.value != "") {
        this.updateBandsStructuredList(dataSource);
      }
    }

    getCollectionByCollectionNameAndConnector(collection_name, connector) {
      const index = this.collections.findIndex(
        (c) =>
          c.collection_name === collection_name && c.connector === connector
      );

      return this.collections[index];
    }

    updateBandsStructuredList(dataSource) {
      const pagination = dataSource.element.querySelector("cds-pagination");
      const structuredListBody = dataSource.element.querySelector(
        "cds-structured-list-body"
      );

      pagination.setAttribute("total-items", dataSource.bands.length);
      pagination.totalPages = Math.ceil(
        dataSource.bands.length / pagination.pageSize
      );

      structuredListBody.innerHTML = "";

      let start = pagination.pageSize * (pagination.page - 1);

      let itemsToDisplay = dataSource.bands.slice(
        start,
        start + pagination.pageSize
      );

      itemsToDisplay.forEach((band) => {
        this.setupBandNameDropdown(dataSource, band.element);
        structuredListBody.appendChild(band.element);
      });
    }

    resetBandNames(dataSource) {
      //Only reset if there was a previously selected data source
      if (dataSource.connector && dataSource.collection) {
        dataSource.bands.forEach((band) => {
          band.band_name = null;
          band.element.querySelector(".band-name-dropdown").value = null;
        });
      }

      this.updateBandsStructuredList(dataSource);
    }

    getCollectionById(id) {
      const index = this.collections.findIndex((c) => c.id === id);

      return this.collections[index];
    }

    setupBandNameDropdown(dataSource, bandElement) {
      const collectionDropdown = dataSource.element.querySelector(
        ".collection-dropdown"
      );
      let bandNameDropdown = bandElement.querySelector(".band-name-dropdown");

      bandNameDropdown.innerHTML = "";

      let collection;

      this.collections.forEach((c) => {
        if (c.id === collectionDropdown.value) {
          collection = c;
        }
      });

      collection.bands.forEach((band) => {
        const dropdownItem = document.createElement("cds-dropdown-item");
        dropdownItem.value = band.band_name;
        dropdownItem.setAttribute("title", `${band.description}`);
        dropdownItem.innerHTML = band.RGB_band
          ? `${band.band_name} (${band.RGB_band}) - ${band.description}`
          : `${band.band_name} - ${band.description}`;

        bandNameDropdown.appendChild(dropdownItem);
      });
    }

    setupCollectionDropdown(dropdownElement) {
      this.collections.forEach((collection) => {
        const collectionElement = document.createElement("cds-dropdown-item");
        collectionElement.value = collection.id;
        collectionElement.innerHTML = collection.collection_name
          ? `${collection.connector} - ${collection.collection_name}`
          : `${collection.connector}`;

        dropdownElement.appendChild(collectionElement);
      });
    }

    async getCollections() {
      this.inlineLoading.classList.remove("display-none");
      this.addDataSourceButton.setAttribute("disabled", "");
      try {
        const response = await app.backend.getDataSourcesV2();

        if ("results" in response) {
          this.collections = response.results;
          this.addDataSourceButton.removeAttribute("disabled", "");
        } else {
          app.showMessage(
            "Failed to load collections: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error("Error loading collections:", error);
        app.showMessage(
          "An error occured while loading the collections",
          "",
          "error",
          5000
        );
      }
      this.inlineLoading.classList.add("display-none");
    }

    validateInputs() {
      if (this.dataSources.length === 0) {
        return false;
      }

      for (let dataSource of this.dataSources) {
        if (dataSource.connector === null || dataSource.file_suffix === null) {
          return false;
        }

        if (!this.bandsAreValid(dataSource)) {
          return false;
        }
      }

      return true;
    }

    bandsAreValid(dataSource) {
      for (let band of dataSource.bands) {
        if (
          band.index === null ||
          band.band_name === null ||
          band.scaling_factor === null
        ) {
          return false;
        }
      }

      let bandIndexes = new Set();
      let bandIndexesHasDuplicates = dataSource.bands.some((band) => {
        return bandIndexes.size === bandIndexes.add(band.index).size;
      });

      if (bandIndexesHasDuplicates) {
        return false;
      }

      //Creates a set of band names. If the set increases every time a band name is added then there are no duplicates
      let bandNames = new Set();
      let bandNamesHasDuplicates = dataSource.bands.some((band) => {
        return bandNames.size === bandNames.add(band.band_name).size;
      });

      if (bandNamesHasDuplicates) {
        return false;
      }

      // if (dataSource.bands.length < 3) {
      //   return false;
      // }

      //Add validation for making sure R G B bands are present

      const collectionDropdown = dataSource.element.querySelector(
        ".collection-dropdown"
      );

      let collection = this.getCollectionById(collectionDropdown.value);

      for (let band of collection.bands) {
        if ("RGB_band" in band && !bandNames.has(band.band_name)) {
          return false;
        }
      }

      return true;
    }

    submitForm() {
      this.dispatchEvent(
        new CustomEvent("form-submitted", {
          detail: {
            data_sources: this.deepCopy(this.dataSources),
          },
        })
      );
    }

    deepCopy(obj) {
      if (typeof obj !== "object" || obj === null) {
        return obj;
      }

      const copy = Array.isArray(obj) ? [] : {};

      for (const key of Object.keys(obj)) {
        if (!(obj[key] instanceof Element)) {
          copy[key] = this.deepCopy(obj[key]);
        }
      }

      return copy;
    }

    resetInputs() {
      this.dataSources = [];
      this.dataSourcesAccordion.innerHTML = "";
      this.inlineLoading.classList.add("display-none");
    }

    _renderDataSourceAccordionItem = (dataSource) => /* HTML */ `
      <cds-accordion-item
        title="${dataSource.file_suffix || "New data source"}"
        open
      >
        <div class="data-source-form">
          <cds-button class="delete-data-source-button" kind="danger"
            >Delete ${trashIcon({ slot: "icon" })}</cds-button
          >
          <cds-dropdown class="collection-dropdown" label="Data source *">
          </cds-dropdown>
          <cds-text-input
            class="file-suffix-input"
            placeholder="File suffix"
            label="File suffix *"
            value="${dataSource.file_suffix ? dataSource.file_suffix : ""}"
          >
          </cds-text-input>
          <p class="label">Bands *</p>
          <cds-button class="add-band-button" kind="tertiary" size="sm" disabled
            >Add band</cds-button
          >
          <cds-structured-list>
            <cds-structured-list-head>
              <cds-structured-list-header-row>
                <cds-structured-list-header-cell>
                  Band ID
                </cds-structured-list-header-cell>
                <cds-structured-list-header-cell>
                  Band name
                </cds-structured-list-header-cell>
                <cds-structured-list-header-cell>
                  Scaling factor
                </cds-structured-list-header-cell>
                <cds-structured-list-header-cell>
                  Actions
                </cds-structured-list-header-cell>
              </cds-structured-list-header-row>
            </cds-structured-list-head>
            <cds-structured-list-body></cds-structured-list-body>
          </cds-structured-list>
          <cds-pagination start="0" page-size="5" total-items="0">
            <cds-select-item value="5">5</cds-select-item>
            <cds-select-item value="10">10</cds-select-item>
            <cds-select-item value="25">25</cds-select-item>
          </cds-pagination>
        </div>
      </cds-accordion-item>
    `;

    _renderBandStructuredListRow = (band) => /* HTML */ `
      <cds-structured-list-row>
        <cds-structured-list-cell>
          <cds-number-input
            class="band-index-input"
            value="${band.index}"
            step="1"
            min="0"
            max="10000"
          ></cds-number-input>
        </cds-structured-list-cell>
        <cds-structured-list-cell style="padding-bottom:1.75rem;">
          <cds-dropdown class="band-name-dropdown" value="${band.band_name}">
          </cds-dropdown>
        </cds-structured-list-cell>
        <cds-structured-list-cell>
          <cds-number-input
            class="band-scaling-factor-input"
            value="${band.scaling_factor}"
            step="1"
            min="0"
            max="10000"
          ></cds-number-input>
        </cds-structured-list-cell>
        <cds-structured-list-cell>
          <cds-button kind="danger" class="delete-button"
            >${trashIcon({ slot: "icon" })}</cds-button
          >
        </cds-structured-list-cell>
      </cds-structured-list-row>
    `;
  }
);
