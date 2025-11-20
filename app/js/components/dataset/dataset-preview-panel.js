/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/dropdown.min.js";
import { forwardIcon, mapIcon, viewIcon, viewOffIcon } from "../../icons.js";
import { replaceHttpWithHttps } from "../../utils.js";
import "./georaster-preview.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    #preview-panel-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 2rem;
      background: var(--cds-ui-01, #262626);
    }

    #dropdowns-container {
      display: flex;
      justify-content: space-between;
      column-gap: 1rem;
      row-gap: 1rem;
      flex-wrap: wrap;
      width: 100%;
      margin-bottom: 1rem;
    }

    cds-dropdown {
      min-width: 8rem;
    }

    #preview-panel-columns {
      display: flex;
      width: 100%;
      height: 24rem;
    }

    aside {
      position: relative;
      width: 2rem;
      height: 100%;
      overflow: auto;
    }

    aside[expanded] {
      min-width: 14rem;
    }

    #expand-button {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      margin: 0;
      padding: 0.5rem;
      background: unset;
      border: none;
      color: var(--cds-ui-05, #f4f4f4);
      cursor: pointer;
    }

    #expand-button:hover {
      background: #ffffff11;
    }

    aside[expanded] #expand-button {
      transform: rotate(180deg);
    }

    #aside-content {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
      padding: 2rem 1rem 2rem 0;
    }

    aside:not([expanded]) #aside-content {
      display: none;
    }

    #aside-content h2 {
      margin: 0;
      font-weight: 400;
    }

    #aside-content hr {
      width: 100%;
      height: 1px;
      background: var(--cds-ui-04, #6f6f6f);
      border: none;
    }

    /*=== Layer item styles ===*/

    .layer-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      column-gap: 0.5rem;
      width: calc(100% - 0.5rem);
      padding: 0.25rem 0.5rem 0.25rem 0;
    }

    .not-visible {
      opacity: 0.4;
    }

    .layer-color-block {
      width: 1.5rem;
      aspect-ratio: 1 / 1;
      background: blue;
      border-radius: 4px;
    }

    .layer-name {
      flex-grow: 1;
      margin: 0;
      padding: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.16px;
      line-height: normal;
      color: var(--cds-text-01, #f4f4f4);
    }

    .visibility-toggle {
      display: flex;
      margin: 0;
      padding: 0;
      border: none;
      background: unset;
      cursor: pointer;
    }

    georaster-preview {
      width: 100%;
      overflow: hidden;
    }

    #preview-panel-container[no-data] #dropdowns-container,
    #preview-panel-container[no-data] #preview-panel-columns,
    #preview-panel-container[no-data] #pagination-container {
      display: none;
    }

    #preview-panel-container:not([no-data]) #no-data-state {
      display: none;
    }

    #no-data-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 300px;
      max-height: 250px;
      color: var(--cds-button-secondary);
    }
  </style>
  <div id="preview-panel-container">
    <div id="no-data-state">
      ${mapIcon({ width: 60, height: 60 })}
      <h4>No Preview Data found!</h4>
    </div>
    <div id="dropdowns-container">
      <cds-dropdown id="file-dropdown" title-text="File" value="">
      </cds-dropdown>
      <cds-dropdown id="band-dropdown" title-text="Band" value="" disabled>
      </cds-dropdown>
    </div>
    <div id="preview-panel-columns">
      <aside expanded>
        <button id="expand-button">
          ${forwardIcon({ width: 16, height: 16 })}
        </button>
        <div id="aside-content">
          <h2>Layers</h2>
          <hr />
          <div id="layer-items-container"></div>
        </div>
      </aside>
      <georaster-preview></georaster-preview>
    </div>
    <div id="pagination-container"><cds-pagination page-size-input-disabled page-size="1" items-per-page-text=""></cds-pagniation></div>
  </div>
`;

window.customElements.define(
  "dataset-preview-panel",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.images = [];
      this.labels = [];
      this.bands = [];
    }

    render() {
      this.setDOM(template(this));

      this.previewPanelContainer = this.shadow.querySelector(
        "#preview-panel-container"
      );
      this.fileDropdown = this.shadow.querySelector("#file-dropdown");
      this.bandDropdown = this.shadow.querySelector("#band-dropdown");
      this.aside = this.shadow.querySelector("aside");
      this.asideExpandButton = this.shadow.querySelector("#expand-button");
      this.layerItemsContainer = this.shadow.querySelector(
        "#layer-items-container"
      );
      this.georasterPreview = this.shadow.querySelector("georaster-preview");
      this.pagination = this.shadow.querySelector("cds-pagination");

      this.asideExpandButton.addEventListener("click", () => {
        this.aside.toggleAttribute("expanded");
      });

      this.pagination.addEventListener(
        "cds-pagination-changed-current",
        (e) => {
          if (this.labels.length === 0 || !this.labels) {
            return;
          }

          const index = this.pagination.pageSize * (this.pagination.page - 1);

          this.moveToPreviewAtIndex(index);
        }
      );

      this.fileDropdown.addEventListener("cds-dropdown-selected", () => {
        const image = this.images.filter(
          (i) => i.name === this.fileDropdown.value
        )[0];

        this.pagination.page = this.images.indexOf(image) + 1;
      });
    }

    setData(data) {
      this.bands = data.bands;
      this.images = data.images;
      this.labels = data.labels;

      this.pagination.totalPages = this.labels.length;
      this.pagination.setAttribute("total-items", `${this.labels.length}`);

      this.populateBandDropdown();
      this.populateFileDropdown();
      this.populateLayersSidePanel();
      this.setImageAndLabelUrls(this.images[0], this.labels[0]);

      this.previewPanelContainer.removeAttribute("no-data");
    }

    showEmptyState() {
      this.previewPanelContainer.setAttribute("no-data", "");
    }

    populateBandDropdown() {
      this.bandDropdown.innerHTML = "";

      if (!this.bands) return;

      this.bands.forEach((band) => {
        const dropdownItemElement = document.createElement("cds-dropdown-item");
        this.bandDropdown.appendChild(dropdownItemElement);

        dropdownItemElement.value = band.id;
        dropdownItemElement.innerHTML = band.label;
        dropdownItemElement.setAttribute("disabled", "");
      });

      this.bandDropdown.value = this.bands[0].id;
    }

    populateFileDropdown() {
      this.fileDropdown.innerHTML = "";

      this.images.forEach((image) => {
        const dropdownItemElement = document.createElement("cds-dropdown-item");
        this.fileDropdown.appendChild(dropdownItemElement);

        dropdownItemElement.value = image.name;
        dropdownItemElement.innerHTML = image.name;
      });

      this.fileDropdown.value = this.images[0].name;
    }

    populateLayersSidePanel() {
      const index = this.pagination.pageSize * (this.pagination.page - 1);

      let layers = [this.labels[index], this.images[index]];

      this.layerItemsContainer.innerHTML = "";

      layers.forEach((layer) => {
        const template = document.createElement("template");
        template.innerHTML = this._renderLayerItem(layer);
        const layerElement = template.content.firstElementChild;

        //=== Add Visibility Toggle Event Listener ===//
        layerElement
          .querySelector(".visibility-toggle")
          .addEventListener("click", () => {
            if (layer.opacity === 1) {
              layer.opacity = 0;
              this.georasterPreview.hideLayer(layer.id);
            } else {
              layer.opacity = 1;
              this.georasterPreview.showLayer(layer.id);
            }

            this.populateLayersSidePanel();
          });

        this.layerItemsContainer.appendChild(layerElement);
      });
    }

    moveToPreviewAtIndex(index) {
      this.setImageAndLabelUrls(this.images[index], this.labels[index]);

      if (this.images?.length > 0) {
        this.fileDropdown.value = this.images[index].name;
        this.populateLayersSidePanel();
      }
    }

    setImageAndLabelUrls(image, label) {
      if (image?.url?.length > 0 && label?.url?.length > 0) {
        image.url = replaceHttpWithHttps(image.url);
        label.url = replaceHttpWithHttps(label.url);
        this.georasterPreview.loadGeorasterForImageAndLabel(image, label);
      }
    }

    _renderLayerItem = (layer) => /* HTML */ `
      <div class="layer-container ${layer.opacity === 1 ? "" : "not-visible"}">
        <span class="layer-color-block"></span>
        <h4 class="layer-name" title="${layer.name} - ${layer.type}">
          ${layer.name} - ${layer.type}
        </h4>
        <button class="visibility-toggle">
          ${layer.opacity === 1
            ? viewIcon({
                height: 16,
                width: 16,
                title: "Hide layer",
                color: "#f4f4f4",
              })
            : viewOffIcon({
                height: 16,
                width: 16,
                title: "Hide layer",
                color: "#f4f4f4",
              })}
        </button>
      </div>
    `;
  }
);
