/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import "../libs/carbon-web-components/tabs.min.js";
import "../libs/carbon-web-components/text-input.min.js";
import "../libs/carbon-web-components/dropdown.min.js";
import "../libs/carbon-web-components/button.min.js";
import "../libs/carbon-web-components/accordion.min.js";
import "../libs/carbon-web-components/structured-list.min.js";
import "../libs/carbon-web-components/number-input.min.js";
import "../libs/carbon-web-components/pagination.min.js";
import { trashIcon } from "../icons.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    .display-none {
      display: none;
    }

    .dataset-settings-container {
      width: 100%;
    }

    [role="tabpanel"] {
      width: 100%;
    }

    section {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;
      padding-top: 1rem;
    }

    cds-button,
    cds-toggle {
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

    .data-source-form,
    .layer-form {
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

    input[type="color"] {
      width: 100%;
      height: 40px;
      margin-bottom: 0.25rem;
      background: var(--cds-field-01, #f4f4f4);
      border: none;
      border-bottom: 0.0625rem solid var(--cds-ui-04, #8d8d8d);
      border-radius: 0;
      cursor: pointer;
    }

    #labels-structured-list cds-structured-list-cell:nth-child(3) {
      max-width: 40px;
      width: 5%;
    }

    #labels-structured-list cds-structured-list-cell:nth-child(6) {
      max-width: 48px;
      width: 5%;
    }
  </style>

  <div id="dataset-settings-container">
    <cds-tabs>
      <cds-tab
        value="data-sources"
        target="panel-data-sources"
        aria-labelledby="data-sources-tab"
      >
        Data sources
      </cds-tab>
      <cds-tab
        value="labels"
        target="panel-labels"
        aria-labelledby="labels-tab"
      >
        Labels
      </cds-tab>
      <cds-tab
        id="layers-tab"
        value="layers"
        target="panel-layers"
        aria-labelledby="layers-tab"
        class="display-none"
      >
        Layers
      </cds-tab>
    </cds-tabs>
    <div
      id="panel-data-sources"
      role="tabpanel"
      aria-labelledby="data-sources-tab"
    >
      <section>
        <cds-button id="add-data-source-button" kind="tertiary" size="sm"
          >Add data source</cds-button
        >
        <cds-accordion id="data-sources-accordion"></cds-accordion>
      </section>
    </div>
    <div id="panel-labels" role="tabpanel" aria-labelledby="labels-tab" hidden>
      <section>
        <cds-toggle
          id="label-weights-toggle"
          size="small"
          checked-text="enable label weight"
          unchecked-text="enable label weight"
        ></cds-toggle>
        <cds-button id="add-label-button" kind="tertiary" size="sm"
          >Add label</cds-button
        >
        <cds-structured-list>
          <cds-structured-list-head>
            <cds-structured-list-header-row>
              <cds-structured-list-header-cell>
                Label ID
              </cds-structured-list-header-cell>
              <cds-structured-list-header-cell>
                Label name
              </cds-structured-list-header-cell>
              <cds-structured-list-header-cell>
                Color
              </cds-structured-list-header-cell>
              <cds-structured-list-header-cell>
                Opacity
              </cds-structured-list-header-cell>
              <cds-structured-list-header-cell
                id="label-weights-header-cell"
                class="display-none"
              >
                Weight
              </cds-structured-list-header-cell>
              <cds-structured-list-header-cell>
                Actions
              </cds-structured-list-header-cell>
            </cds-structured-list-header-row>
          </cds-structured-list-head>
          <cds-structured-list-body
            id="labels-structured-list"
          ></cds-structured-list-body>
        </cds-structured-list>
        <cds-pagination
          id="labels-pagination"
          start="0"
          page-size="5"
          total-items="0"
        >
          <cds-select-item value="5">5</cds-select-item>
          <cds-select-item value="10">10</cds-select-item>
          <cds-select-item value="25">25</cds-select-item>
        </cds-pagination>
      </section>
    </div>
    <div id="panel-layers" role="tabpanel" aria-labelledby="layers-tab" hidden>
      <section>
        <cds-accordion id="layers-accordion"></cds-accordion>
      </section>
    </div>
  </div>
`;

window.customElements.define(
  "dataset-settings-form",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.collections = [];
      this.dataSources = [];
      this.labels = [];
      this.layers = [];
    }

    render() {
      this.setDOM(template(this));

      this.layersTab = this.shadow.querySelector("#layers-tab");
      this.addDataSourceButton = this.shadow.querySelector(
        "#add-data-source-button"
      );
      this.layersAccordion = this.shadow.querySelector("#layers-accordion");
      this.dataSourcesAccordion = this.shadow.querySelector(
        "#data-sources-accordion"
      );
      this.labelWeightsToggle = this.shadow.querySelector(
        "#label-weights-toggle"
      );
      this.addLabelsButton = this.shadow.querySelector("#add-label-button");
      this.labelsStructuredListBody = this.shadow.querySelector(
        "#labels-structured-list"
      );
      this.labelsPagination = this.shadow.querySelector("#labels-pagination");
      this.labelWeightsHeaderCell = this.shadow.querySelector(
        "#label-weights-header-cell"
      );
      this.tabsComponent = this.shadow.querySelector("cds-tabs");

      this.addDataSourceButton.addEventListener("click", () => {
        this.addDataSource();
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      this.labelWeightsToggle.addEventListener("cds-toggle-changed", () => {
        this.handleWeightInputs();
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      this.addLabelsButton.addEventListener("click", () => {
        this.addLabel();
        this.handleWeightInputs();
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      this.labelsPagination.addEventListener(
        "cds-pagination-changed-current",
        (e) => {
          if (this.labels.length === 0) {
            return;
          }
          this.updateLabelsStructuredList();
        }
      );

      this.labelsPagination.addEventListener(
        "cds-page-sizes-select-changed",
        (e) => {
          this.updateLabelsStructuredList();
        }
      );

      this.tabsComponent.addEventListener("cds-tabs-selected", (e) => {
        this.handleTabChange(e.detail.item.target);
      });

      this.getCollections();
    }

    handleTabChange(targetPanelId) {
      const panels = this.shadow.querySelectorAll('[role="tabpanel"]');
      panels.forEach((panel) => panel.setAttribute("hidden", ""));

      this.showTabPanel(targetPanelId);
    }

    showTabPanel(panelId) {
      let panel = this.shadow.querySelector(`#${panelId}`);
      if (panel) {
        panel.removeAttribute("hidden");
      }
    }

    setupDataSources(dataSources) {
      dataSources.forEach((dataSource) => {
        this.addDataSource(dataSource);
      });
    }

    setupLabels(labels) {
      labels.forEach((label) => {
        this.addLabel(label);
      });
    }

    setupLayers(layers) {
      this.layers = this.deepCopy(layers);
      this.layersTab.classList.remove("display-none");

      for (let layer of this.layers) {
        this.addLayer(layer);
      }
    }

    addLayer(layer) {
      const layerTemplate = document.createElement("template");
      layerTemplate.innerHTML = this._renderLayerAccordionItem(layer);
      const layerElement = layerTemplate.content.firstElementChild;

      const displayNameInput = layerElement.querySelector(
        ".layer-display-name-input"
      );
      const zIndexInput = layerElement.querySelector(".layer-z-index-input");
      const layerVisibilityToggle = layerElement.querySelector(
        ".layer-visibility-toggle"
      );

      if ("rgb" in layer.geoserver_style) {
        const RGBMaxValueInput = layerElement.querySelector(
          ".rgb-max-value-input"
        );

        RGBMaxValueInput.addEventListener("cds-number-input", () => {
          layer.geoserver_style.rgb.forEach((entry) => {
            entry.maxValue = RGBMaxValueInput.value;
          });
          this.dispatchEvent(new CustomEvent("form-updated"));
        });
      }

      displayNameInput.addEventListener("input", () => {
        layerElement.setAttribute("label", displayNameInput.value);
        layer.display_name = displayNameInput.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      zIndexInput.addEventListener("cds-number-input", () => {
        layer.z_index = zIndexInput.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      layerVisibilityToggle.addEventListener("cds-toggle-changed", () => {
        layer.visible_by_default = layerVisibilityToggle.checked;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      this.layersAccordion.appendChild(layerElement);
    }

    addDataSource(prePopulatedDataSource = null) {
      const dataSource = {
        bands: [],
        connector: null,
        collection: null,
        file_suffix: null,
        modality_tag: null,
      };

      if (prePopulatedDataSource) {
        Object.assign(dataSource, prePopulatedDataSource);
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
        dataSource.connector = collection.data_connector;
        dataSource.collection = collection.collection_id
          ? collection.collection_id
          : null;
        dataSource.modality_tag = collection.data_connector_config.modality_tag;
        addBandButton.removeAttribute("disabled");

        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      fileSuffixInput.addEventListener("input", () => {
        dataSource.file_suffix = fileSuffixInput.value;
        dataSourceElement.setAttribute(
          "label",
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
        this.updateBandsStructuredList(dataSource);
      });

      pagination.addEventListener("cds-page-sizes-select-changed", (e) => {
        this.updateBandsStructuredList(dataSource);
      });

      dataSource.element = dataSourceElement;

      this.dataSourcesAccordion.appendChild(dataSourceElement);

      this.dataSources.push(dataSource);

      if (prePopulatedDataSource) {
        console.log(prePopulatedDataSource);
        let collection = this.getCollectionByCollectionNameAndConnector(
          dataSource.collection,
          dataSource.connector
        );

        collectionDropdown.value = collection.id;

        addBandButton.removeAttribute("disabled");

        prePopulatedDataSource.bands.forEach((band) =>
          this.addBand(dataSource, band)
        );
      }
    }

    addBand(dataSource, prePopulatedBand = null) {
      const pagination = dataSource.element.querySelector("cds-pagination");
      const collectionDropdown = dataSource.element.querySelector(
        ".collection-dropdown"
      );

      const band = {
        index: null,
        band_name: null,
        scaling_factor: 1,
      };

      if (prePopulatedBand) {
        Object.assign(band, prePopulatedBand);
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

    addLabel(prePopulatedLabel) {
      const label = {
        id: null,
        name: "",
        color: "#000000",
        opacity: 1,
        weight: null,
      };

      if (prePopulatedLabel) {
        Object.assign(label, prePopulatedLabel);
      }

      const labelTemplate = document.createElement("template");
      labelTemplate.innerHTML = this._renderLabelStructuredListRow(label);
      const labelElement = labelTemplate.content.firstElementChild;

      const labelIdInput = labelElement.querySelector(".label-id-input");
      const labelNameInput = labelElement.querySelector(".label-name-input");
      const colorPicker = labelElement.querySelector(".color-picker");
      const labelOpacityInput = labelElement.querySelector(
        ".label-opacity-input"
      );
      const labelWeightInput = labelElement.querySelector(
        ".label-weight-input"
      );

      const deleteButton = labelElement.querySelector(".delete-button");

      labelIdInput.addEventListener("cds-number-input", () => {
        label.id = labelIdInput.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      labelNameInput.addEventListener("input", () => {
        label.name = labelNameInput.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      colorPicker.addEventListener("input", () => {
        label.color = colorPicker.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      labelOpacityInput.addEventListener("cds-number-input", () => {
        label.opacity = labelOpacityInput.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      labelWeightInput.addEventListener("cds-number-input", () => {
        label.weight = labelWeightInput.value;
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      deleteButton.addEventListener("click", () => {
        label.element.remove();
        const index = this.labels.findIndex((l) => l === label);
        this.labels.splice(index, 1);

        if (
          this.labelsPagination.totalItems - 1 <
            this.labelsPagination.pageSize * (this.labelsPagination.page - 1) +
              1 &&
          this.labelsPagination.page !== 1
        ) {
          this.labelsPagination.page = this.labelsPagination.page - 1;
        }

        this.updateLabelsStructuredList();
        this.dispatchEvent(new CustomEvent("form-updated"));
      });

      label["element"] = labelElement;

      this.labels.push(label);

      if (prePopulatedLabel && label.weight) {
        this.labelWeightsToggle.checked = true;
      }

      this.handleWeightInputs();

      this.updateLabelsStructuredList();
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

    updateLabelsStructuredList() {
      this.labelsPagination.setAttribute("total-items", this.labels.length);
      this.labelsPagination.totalPages = Math.ceil(
        this.labels.length / this.labelsPagination.pageSize
      );

      this.labelsStructuredListBody.innerHTML = "";

      let start =
        this.labelsPagination.pageSize * (this.labelsPagination.page - 1);

      let itemsToDisplay = this.labels.slice(
        start,
        start + this.labelsPagination.pageSize
      );

      itemsToDisplay.forEach((label) => {
        this.labelsStructuredListBody.appendChild(label.element);
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

    setupCollectionDropdown(dropdownElement) {
      this.collections.forEach((collection) => {
        const collectionElement = document.createElement("cds-dropdown-item");
        collectionElement.value = collection.id;
        collectionElement.innerHTML = collection.collection_id
          ? `${collection.data_connector} - ${collection.collection_id}`
          : `${collection.data_connector}`;

        dropdownElement.appendChild(collectionElement);
      });
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

      collection.data_connector_config.bands.forEach((band) => {
        const dropdownItem = document.createElement("cds-dropdown-item");
        dropdownItem.value = band.band_name;
        dropdownItem.setAttribute("title", `${band.description}`);
        dropdownItem.innerHTML = band.RGB_band
          ? `${band.band_name} (${band.RGB_band}) - ${band.description}`
          : `${band.band_name} - ${band.description}`;

        bandNameDropdown.appendChild(dropdownItem);
      });
    }

    validateInputs() {
      if (this.layers.length > 0) {
        return (
          this.dataSourcesAreValid() &&
          this.labelsAreValid() &&
          this.layersAreValid()
        );
      } else {
        return this.dataSourcesAreValid() && this.labelsAreValid();
      }
    }

    layersAreValid() {
      for (let layer of this.layers) {
        if (layer.display_name === "" || layer.z_index === null) {
          return false;
        }

        if (
          "rgb" in layer.geoserver_style &&
          !layer.geoserver_style.rgb[0].maxValue
        ) {
          return false;
        }
      }

      return true;
    }

    dataSourcesAreValid() {
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

      for (let band of collection.data_connector_config.bands) {
        if ("RGB_band" in band && !bandNames.has(band.band_name)) {
          return false;
        }
      }

      return true;
    }

    labelsAreValid() {
      let labelWeightsTotal = 0;

      for (let label of this.labels) {
        labelWeightsTotal += Number(label.weight);
        if (
          label.id === null ||
          label.name === "" ||
          (this.labelWeightsToggle.checked && label.weight === null)
        ) {
          return false;
        }
      }

      if (
        this.labelWeightsToggle.checked &&
        this.labels.length > 0 &&
        labelWeightsTotal != 1
      ) {
        return false;
      }

      let labelIds = new Set();
      let hasDuplicates = this.labels.some((label) => {
        return labelIds.size === labelIds.add(label.id).size;
      });

      if (hasDuplicates) {
        return false;
      }

      return true;
    }

    async getCollections() {
      try {
        const response = await app.backend.getDataSourcesV2();

        if ("results" in response) {
          this.collections = response.results;
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
    }

    getCollectionById(id) {
      const index = this.collections.findIndex((c) => c.id === id);

      return this.collections[index];
    }

    getCollectionByCollectionNameAndConnector(collection_name, connector) {
      const index = this.collections.findIndex(
        (c) =>
          c.data_connector_config.collection_name === collection_name &&
          c.data_connector_config.connector === connector
      );

      return this.collections[index];
    }

    handleWeightInputs() {
      if (this.labelWeightsToggle.checked) {
        this.labelWeightsHeaderCell.classList.remove("display-none");
      } else {
        this.labelWeightsHeaderCell.classList.add("display-none");
      }

      this.labels.forEach((label) => {
        const labelWeightInput =
          label.element.querySelector(".label-weight-cell");

        if (this.labelWeightsToggle.checked) {
          labelWeightInput.classList.remove("display-none");
        } else {
          labelWeightInput.classList.add("display-none");
        }
      });
    }

    resetForm() {
      this.dataSources = [];
      this.dataSourcesAccordion.innerHTML = "";
      this.labelWeightsToggle.checked = false;
      this.labels = [];
      this.layers = [];
      this.layersAccordion.innerHTML = "";
      this.updateLabelsStructuredList();
    }

    submitForm() {
      this.dispatchEvent(
        new CustomEvent("form-submitted", {
          detail: {
            label_categories: this.deepCopy(this.labels),
            data_sources: this.deepCopy(this.dataSources),
            layers: this.deepCopy(this.layers),
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

    _renderLayerAccordionItem = (layer) => /* HTML */ `
      <cds-accordion-item
        title="${layer.display_name ? layer.display_name : "Un-titled layer"}"
      >
        <div class="layer-form">
          <cds-text-input
            class="layer-display-name-input"
            placeholder="Display name"
            label="Display name *"
            value="${layer.display_name ? layer.display_name : null}"
          >
          </cds-text-input>
          <cds-number-input
            label="z index"
            class="layer-z-index-input"
            value="${layer.z_index}"
            step="1"
            min="0"
            max="10000"
          ></cds-number-input>
          <cds-toggle
            class="layer-visibility-toggle"
            size="small"
            checked-text="layer visible by default"
            unchecked-text="layer visible by default"
            checked="${layer.visible_by_default
              ? layer.visible_by_default
              : true}"
          ></cds-toggle>
          ${!("rgb" in layer.geoserver_style)
            ? ""
            : /* HTML */ `<cds-number-input
                label="RGB max value"
                class="rgb-max-value-input"
                value="${layer.geoserver_style.rgb?.[0]?.maxValue
                  ? layer.geoserver_style.rgb[0].maxValue
                  : 255}"
                step="1"
                min="-10000"
                max="10000"
              ></cds-number-input>`}
        </div>
      </cds-accordion-item>
    `;

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

    _renderLabelStructuredListRow = (label) => /* HTML */ `
      <cds-structured-list-row>
        <cds-structured-list-cell>
          <cds-number-input
            class="label-id-input"
            step="1"
            value="${label.id}"
            min="0"
            max="10000"
          ></cds-number-input>
        </cds-structured-list-cell>
        <cds-structured-list-cell>
          <cds-text-input
            class="label-name-input"
            value="${label.name}"
          ></cds-text-input>
        </cds-structured-list-cell>
        <cds-structured-list-cell>
          <input class="color-picker" type="color" value="${label.color}" />
        </cds-structured-list-cell>
        <cds-structured-list-cell>
          <cds-number-input
            class="label-opacity-input"
            value="${label.opacity}"
            step="0.01"
            max="1"
            min="0"
          ></cds-number-input>
        </cds-structured-list-cell>
        <cds-structured-list-cell class="label-weight-cell">
          <cds-number-input
            class="label-weight-input"
            value="${label.weight}"
            step="0.01"
            max="1"
            min="0"
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
