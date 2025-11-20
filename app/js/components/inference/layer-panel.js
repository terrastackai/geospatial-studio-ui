/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import {
  viewIcon,
  viewOffIcon,
  splitScreenBlankIcon,
  splitScreenLeftIcon,
  splitScreenRightIcon,
  baseMapLayer,
  defaultLayerIcon,
  osmLayerIcon,
  opacityIcon,
  closeIcon,
  addIcon2,
  trashIcon,
  chevronDownIcon,
} from "../../icons.js";
import "../../libs/carbon-web-components/button.min.js";
import "../../libs/carbon-web-components/slider.min.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    :host {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    button {
      padding: 0;
      background: unset;
      border: none;
      line-height: 0;
      cursor: pointer;
    }

    span {
      line-height: 0;
    }

    .display-none {
      display: none;
    }

    #layer-panel-container {
      display: flex;
      flex-direction: column;
      width: 300px;
      background-color: var(--cds-field-01, #262626);
      box-shadow: rgba(0, 0, 0, 0.3) 0px 2px 6px 0px;
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
    }

    #panel-header {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 0.75rem;
    }

    #title {
      margin: 0;
      color: var(--cds-text-primary, #f4f4f4);
      font-size: 20px;
      font-weight: 400;
      line-height: 28px;
      letter-spacing: 0;
    }

    #layers-container {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      max-height: 375px;
      overflow: auto;
      border-bottom: 1px solid var(--cds-field-04, #6f6f6f);
      background: linear-gradient(
        to right,
        var(--cds-field-01, #262626) 60%,
        var(--cds-field-02, #393939)
      );
    }

    .layer-container {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .layer-content {
      display: flex;
      align-items: center;
      column-gap: 0.5rem;
      width: 100%;
      padding: 0.75rem;
      border-top: 1px solid var(--cds-field-04, #6f6f6f);
    }

    .layer-name {
      margin: 0;
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--cds-text-primary, #f4f4f4);
      font-size: 16px;
      font-weight: 400;
      line-height: 22px;
    }

    .layer-container:not([data-collapsible])
      .layer-content
      .layer-collapse-chevron {
      visibility: hidden;
    }

    .layer-container:has(.layer-visibility-toggle[opaque]) .layer-content {
      opacity: 0.5;
    }

    .layer-container:has(.layer-visibility-toggle[opaque])
      .layer-content
      .split-screen-toggle
      svg {
      background-color: var(--cds-field-01, #262626);
    }

    .layer-container:has(.layer-visibility-toggle[opaque]) .legends-container {
      opacity: 0.5;
      pointer-events: none;
    }

    .chevron-down {
      transform: rotate(180deg);
      transform-origin: center;
    }

    .legends-container {
      width: 100%;
      overflow: hidden;
    }

    .legend-container {
      display: flex;
      align-items: center;
      column-gap: 0.5rem;
      width: 100%;
      padding: 0.5rem 0.75rem 0.5rem 2.25rem;
      border-top: 1px dashed var(--cds-field-04, #6f6f6f);
    }

    .legend-color-block {
      position: relative;
      width: 16px;
      height: 16px;
      border-radius: 2px;
    }

    .legend-color-block::before {
      content: "";
      position: absolute;
      left: 50%;
      width: 1px;
      top: -1rem;
      bottom: 100%;
      background: var(--cds-field-04, #6f6f6f);
      transform: translateX(-50%);
    }

    .legend-color-block:first-child::before {
      top: -0.5rem;
    }

    .legend-container:not(:last-child) .legend-color-block::after {
      content: "";
      position: absolute;
      left: 50%;
      width: 1px;
      top: 100%;
      bottom: -1rem;
      background: var(--cds-field-04, #6f6f6f);
      transform: translateX(-50%);
    }

    .legend-name {
      margin: 0;
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--cds-text-secondary, #c6c6c6);
      font-size: 14px;
      font-weight: 400;
      line-height: 18px;
    }

    .layer-visibility-toggle svg,
    .legend-visibility-toggle svg {
      color: var(--cds-icon-primary, #f4f4f4);
    }

    .layer-visibility-toggle[opaque] .view-icon {
      display: none;
    }

    .layer-visibility-toggle:not([opaque]) .hide-icon {
      display: none;
    }

    .overflow-menu-container {
      position: fixed;
      display: flex;
      flex-direction: column;
      width: 300px;
      background-color: var(--cds-field-01, #262626);
      border-top-right-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
    }

    #overflow-header {
      position: relative;
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 0.5rem 2rem 1rem;
    }

    #overflow-title {
      display: flex;
      align-items: center;
      margin: 0;
      color: var(--cds-text-primary, #f4f4f4);
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      letter-spacing: 0.16px;
    }

    .overflow-close-button {
      position: absolute;
      top: calc(50% - 0.25rem);
      right: 0.25rem;
      transform: translate(-50%, -50%);
      background-color: var(--cds-field-01, #262626);
      color: var(--cds-text-primary, #f4f4f4);
    }

    #overflow-body {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
      padding: 0 2rem 2rem;
      max-height: 300px;
      overflow: auto;
    }

    cds-slider div[role="presentation"] {
      min-width: 0;
    }

    cds-checkbox {
      position: relative;
    }

    cds-checkbox::after {
      content: attr(data-label);
      position: absolute;
      top: 50%;
      left: 2rem;
      transform: translateY(-50%);
      color: var(--cds-text-secondary, #525252);
      font-size: 0.75rem;
      font-weight: 400;
      letter-spacing: 0.32px;
      line-height: 1rem;
    }

    .min-max-inputs-container {
      display: flex;
      column-gap: 1rem;
      width: 100%;
    }

    .overflow-menu-toggle,
    #panel-close-button,
    .layer-collapse-chevron {
      color: var(--cds-text-primary, #f4f4f4);
    }
  </style>

  <div id="layer-panel-container">
    <div id="panel-header">
      <h2 id="title">Layers</h2>
      <button id="panel-close-button" title="Close layers panel">
        ${closeIcon({ width: 16, height: 16 })}
      </button>
    </div>
    <div id="layers-container"></div>
  </div>
  <cds-button
    id="add-layer-button"
    kind="secondary"
    disabled
    title="comming soon"
  >
    Add data/layer ${addIcon2({ width: 16, height: 16, slot: "icon" })}
  </cds-button>
`;

window.customElements.define(
  "layer-panel",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.layers = [];

      this.basemap = {
        name: "Base map",
        ui: {
          icon: baseMapLayer({
            class: "layer-icon",
            height: 16,
            width: 16,
            title: "Base map",
          }),
          visible: true,
          opacity: 1,
        },
      };

      this.osmLayer = {
        name: "3D buildings",
        ui: {
          icon: osmLayerIcon({
            class: "layer-icon",
            height: 16,
            width: 16,
            title: "3D buildings",
          }),
          visibility: false,
          opacity: 0,
        },
      };

      this.compareLayerLeftName;

      this.compareLayerRightName;

      this.userCreatedLayers;
    }

    render() {
      this.setDOM(template(this));

      this.layersContainer = this.shadow.querySelector("#layers-container");
      this.addLayersButton = this.shadow.querySelector("#add-layer-button");
      this.closeButton = this.shadow.querySelector("#panel-close-button");

      this.addLayersButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("add-layer"));
      });

      this.closeButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("close-panel"));
      });
    }

    setUserCreatedLayers(userCreatedLayers) {
      this.userCreatedLayers = userCreatedLayers;
    }

    setMapLayers = (layers) => {
      this.layers = layers || [];

      this.layers.forEach((layer) => {
        layer.ui.compare = "none";
      });

      this.setupLayers();
    };

    setupLayers() {
      this.layersContainer.innerHTML = "";

      this.layers.forEach((layer) => {
        this.setupLayer(layer);
      });

      if (Cesium.Ion.defaultAccessToken) {
        this.setupLayer(this.osmLayer);
      }

      this.setupLayer(this.basemap);
    }

    resetCompareLayers() {
      this.compareLayerRightName = null;
      this.compareLayerLeftName = null;
    }

    setupOverflowMenu(layerElement, layer) {
      if (this.layersContainer.querySelector("[expanded]")) {
        this.removeOverflowMenu(
          this.layersContainer.querySelector("[expanded]")
        );
      }

      let xCoord = this.layersContainer.getBoundingClientRect().right + 5;
      let yCoord = layerElement.getBoundingClientRect().top;

      let y;
      let x;

      if (yCoord + 350 < window.innerHeight) {
        y = "top:" + yCoord + "px;";
      } else {
        yCoord =
          window.innerHeight - layerElement.getBoundingClientRect().bottom;
        y = "bottom:" + yCoord + "px;";
      }

      x = "left:" + xCoord + "px;";

      const overflowTemplate = document.createElement("template");

      overflowTemplate.innerHTML = this._renderOverflowMenu(y, x, layer);

      const overflowMenu = overflowTemplate.content.firstElementChild;

      overflowMenu
        .querySelector(".overflow-close-button")
        .addEventListener("click", () => {
          this.removeOverflowMenu(layerElement);
        });

      overflowMenu
        .querySelector("#delete-button")
        .addEventListener("click", () => {
          if (this.userCreatedLayers) {
            this.dispatchEvent(
              new CustomEvent("delete-layer", {
                detail: layer,
              })
            );
          }
        });

      //=== Setup layer opacity slider ===
      const opacitySlider = overflowMenu.querySelector(".opacity-slider");
      opacitySlider.addEventListener("cds-slider-changed", () => {
        if (opacitySlider.value >= 0 && opacitySlider.value <= 1) {
          if (opacitySlider.value === 0) {
            app.main.map.hideLayer(layer.name);
          } else {
            app.main.map.showLayer(layer.name, opacitySlider.value);
          }

          layer.ui.opacity = opacitySlider.value;

          const visibilityToggle = layerElement.querySelector(
            ".layer-visibility-toggle"
          );

          if (layer.ui.opacity === 0) {
            visibilityToggle.setAttribute("opaque", "");
          } else {
            visibilityToggle.removeAttribute("opaque");
          }
        }
      });

      layerElement.appendChild(overflowMenu);

      layerElement.setAttribute("expanded", "");
    }

    removeOverflowMenu(layerElement) {
      layerElement.removeAttribute("expanded");
      layerElement.querySelector(".overflow-menu-container").remove();
    }

    vectorLegendEntries = (layer) => {
      let legendEntries = [];
      const hexColorRegex = /^#([0-9a-fA-F]{3}){1,2}$/;
      const colorInterpolationRegex =
        /Interpolate\(([^']+?),([\s\S]*?),'color'\)/;
      const symbolizers = layer.legend.Legend[0].rules.flatMap(
        (rule) => rule["symbolizers"] || []
      );
      symbolizers.forEach((sym) => {
        const [symName, symValue] = Object.entries(sym)[0];
        if (symValue["graphics"] && Array.isArray(symValue["graphics"])) {
          const graphicsObject = symValue["graphics"].flatMap((item) =>
            typeof item === "object" && item !== null ? item : []
          );
          Object.assign(symValue, ...graphicsObject);
          delete symValue["graphics"];
        }
        Object.entries(symValue).forEach(([key, value]) => {
          const matchHexColorRegex = value.match(hexColorRegex);
          const matchColorInterpolationRegex = value.match(
            colorInterpolationRegex
          );
          if (matchHexColorRegex) {
            legendEntries.push({
              label: `${symName}-${key}`,
              quantity: "0",
              color: value,
              opacity: "1.0",
            });
          } else if (matchColorInterpolationRegex) {
            const propertyName = matchColorInterpolationRegex[1];
            const propertyValuesString = matchColorInterpolationRegex[2];
            const propertyValues = propertyValuesString.split(/','/);
            for (let i = 0; i < propertyValues.length; i += 2) {
              if (i + 1 < propertyValues.length) {
                const quantity = propertyValues[i].replace(/'/g, "");
                const hex = propertyValues[i + 1].replace(/'/g, "");
                legendEntries.push({
                  label: `${symName}-${key}-${propertyName}-${quantity}`,
                  quantity: quantity,
                  color: hex,
                  opacity: "1.0",
                });
              }
            }
          } else {
            // console.log("No match")
          }
        });
      });
      return legendEntries;
    };

    setupLayer(layer) {
      let legendEntries = [];

      let hasVisibleLegend =
        layer.legend?.Legend[0]?.rules[0]?.symbolizers[0]?.Raster?.colormap?.entries.filter(
          (entry) => entry.label
        )[0];

      const isVector = layer?.legend?.Legend[0]?.rules?.some(
        (rule) =>
          rule.filter &&
          rule?.symbolizers?.some((sym) => sym.Polygon || sym.Point || sym.Line)
      );

      if (hasVisibleLegend) {
        legendEntries =
          layer.legend.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries.filter(
            (entry) => entry.label
          );
      } else if (isVector) {
        legendEntries = this.vectorLegendEntries(layer);
        hasVisibleLegend = legendEntries[0];
      }

      const template = document.createElement("template");

      template.innerHTML = this._renderLayerContainer(layer, hasVisibleLegend);

      const layerElement = template.content.firstElementChild;

      //=== Attach Overflow Menu Event Listener ===
      const overflowMenuToggle = layerElement.querySelector(
        ".overflow-menu-toggle"
      );
      overflowMenuToggle.addEventListener("click", () => {
        if (layerElement.hasAttribute("expanded")) {
          this.removeOverflowMenu(layerElement);
        } else {
          this.setupOverflowMenu(layerElement, layer);
        }
      });

      //=== Attach Compare Event Listener ===
      if (layer.ui.compare) {
        const compareSwitch = layerElement.querySelector(
          ".split-screen-toggle"
        );

        compareSwitch.addEventListener("click", () => {
          if (
            layer.name != this.compareLayerRightName &&
            layer.name != this.compareLayerLeftName
          ) {
            !this.compareLayerRightName
              ? (this.compareLayerRightName = layer.name)
              : (this.compareLayerLeftName = layer.name);
          } else if (layer.name === this.compareLayerRightName) {
            this.compareLayerRightName = null;
          } else if (this.compareLayerLeftName === this.compareLayerLeftName) {
            this.compareLayerLeftName = null;
          }

          app.main.map.toggleCompareLayers(
            this.compareLayerRightName,
            this.compareLayerLeftName
          );

          this.setupLayers();
        });
      }

      //=== Attach Visibility Event Listener ===

      const visibilityToggle = layerElement.querySelector(
        ".layer-visibility-toggle"
      );

      if (layer.ui.opacity === 0) {
        visibilityToggle.setAttribute("opaque", "");
      }

      visibilityToggle.addEventListener("click", () => {
        if (layer.ui.opacity > 0) {
          layer.ui.opacity = 0;
          visibilityToggle.setAttribute("opaque", "");

          if (layer.name === "Base map") {
            app.main.map.hideBaseMap();
          } else if (layer.name === "3D buildings") {
            app.main.map.hideOSMLayer();
          } else {
            app.main.map.hideLayer(layer.name);
          }

          //If layer is shown in split screen view remove it
          if (layer.name === this.compareLayerRightName) {
            this.compareLayerRightName = null;
            app.main.map.toggleCompareLayers(
              this.compareLayerRightName,
              this.compareLayerLeftName
            );
          }

          if (layer.name === this.compareLayerLeftName) {
            this.compareLayerLeftName = null;
            app.main.map.toggleCompareLayers(
              this.compareLayerRightName,
              this.compareLayerLeftName
            );
          }
        } else {
          layer.ui.opacity = 1;
          visibilityToggle.removeAttribute("opaque");

          const layerOpacity = layer.name === "weather" ? 0.5 : 1;

          if (layer.name === "Base map") {
            app.main.map.showBaseMap();
          } else if (layer.name === "3D buildings") {
            app.main.map.showOSMLayer();
          } else {
            app.main.map.showLayer(layer.name, layerOpacity);
          }
        }

        this.setupLayers();
      });

      //=== Setup Legend ===

      if (hasVisibleLegend) {
        const layerLegendsContainer =
          layerElement.querySelector(".legends-container");

        this.setupLegends(legendEntries, layerLegendsContainer);

        //=== Attach Collapse Button Event Listener ===

        const collapseChevron = layerElement.querySelector(
          ".layer-collapse-chevron"
        );

        collapseChevron.addEventListener("click", () => {
          collapseChevron.classList.toggle("chevron-down");
          layerLegendsContainer.classList.toggle("display-none");
        });
      }

      this.layersContainer.appendChild(layerElement);
    }

    setupLegends(legendEntries, legendsContainer) {
      legendEntries.forEach((legendEntry) => {
        const template = document.createElement("template");

        template.innerHTML = this._renderLegendContainer(legendEntry);

        const legendElement = template.content.firstElementChild;

        legendsContainer.appendChild(legendElement);
      });
    }

    _renderLayerContainer = (layer, legendEntries) => /* HTML */ `
      <div class="layer-container" ${legendEntries ? "data-collapsible" : ""}>
        <div class="layer-content">
          <span class="layer-icon">
            ${layer.ui.icon
              ? layer.ui.icon
              : defaultLayerIcon({ width: 16, height: 16 })}</span
          >
          <button class="layer-collapse-chevron">
            ${chevronDownIcon({ width: 16, height: 16 })}
          </button>
          <h3 class="layer-name" title="${layer.name}">${layer.name}</h3>
          <button
            class="split-screen-toggle"
            title="Compare layers in split screen view"
            ${layer.name === "Base map" ||
            layer.name === "3D buildings" ||
            layer.ui.opacity === 0
              ? "style='visibility:hidden;'"
              : ""}
          >
            ${this.compareLayerRightName === layer.name
              ? splitScreenRightIcon()
              : this.compareLayerLeftName === layer.name
              ? splitScreenLeftIcon()
              : splitScreenBlankIcon()}
          </button>
          <button
            class="layer-visibility-toggle"
            ${layer.name === "Base map" && this.layers.length === 0
              ? "style='visibility:hidden;'"
              : ""}
          >
            ${viewIcon({
              height: 16,
              width: 16,
              title: "Hide layer",
              class: "view-icon",
            })}
            ${viewOffIcon({
              height: 16,
              width: 16,
              title: "Show layer",
              class: "hide-icon",
            })}
          </button>
          <button
            class="overflow-menu-toggle"
            ${layer.name === "Base map" || layer.name === "3D buildings"
              ? "style='visibility:hidden;'"
              : ""}
          >
            ${opacityIcon({ width: 16, height: 16 })}
          </button>
        </div>
        <div class="legends-container display-none"></div>
      </div>
    `;

    _renderLegendContainer = (legend) => /* HTML */ `
      <div class="legend-container">
        <span
          class="legend-color-block"
          style="background: ${legend.color};"
        ></span>
        <h4 class="legend-name" title="${legend.label}">${legend.label}</h4>
        <!--
            <button class="overflow-menu-toggle">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5C8.55228 5 9 4.55228 9 4C9 3.44772 8.55228 3 8 3C7.44772 3 7 3.44772 7 4C7 4.55228 7.44772 5 8 5Z" fill="#F4F4F4"/>
                    <path d="M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z" fill="#F4F4F4"/>
                    <path d="M8 13C8.55228 13 9 12.5523 9 12C9 11.4477 8.55228 11 8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13Z" fill="#F4F4F4"/>
                </svg>
            </button>
            -->
      </div>
    `;

    _renderOverflowMenu = (y, x, layer) => /* HTML */ `
      <div class="overflow-menu-container" style="${y}; ${x};">
        <div id="overflow-header">
          <h4 id="overflow-title">Layer options</h4>
          <cds-button id="delete-button" kind="danger-ghost" size="sm" disabled>
            Delete ${trashIcon({ width: 16, height: 16, slot: "icon" })}
          </cds-button>
          <button
            class="overflow-close-button"
            title="Close layer options panel"
          >
            ${closeIcon({ width: 16, height: 16 })}
          </button>
        </div>
        <div id="overflow-body">
          <cds-slider
            class="opacity-slider"
            label="Opacity"
            max="1"
            min="0"
            step="0.01"
            value="${layer.ui.opacity}"
          >
            <cds-slider-input
              aria-label="Slider value"
              type="number"
            ></cds-slider-input>
          </cds-slider>
        </div>
      </div>
    `;
  }
);
