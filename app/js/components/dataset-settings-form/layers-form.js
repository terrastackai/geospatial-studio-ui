/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "./labels-form.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    .display-none {
      display: none;
    }

    #layers-form {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;
    }

    .layer-form {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;
      padding-right: 1rem;
    }
  </style>

  <div id="layers-form">
    <cds-accordion id="layers-accordion"></cds-accordion>
  </div>
`;

window.customElements.define(
  "layers-form",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.layers = [];
    }

    render() {
      this.setDOM(template(this));

      this.layersAccordion = this.shadow.querySelector("#layers-accordion");
    }

    setupLayers(layers) {
      this.layers = this.deepCopy(layers);

      for (let layer of this.layers) {
        const layerType = Object.keys(layer.geoserver_style)[0];
        if (layerType === "segmentation" || layerType === "regression") {
          const labels = layer.geoserver_style[layerType].map((label) => {
            const formattedLabel = {
              id: label.quantity ? label.quantity : null,
              name: label.label ? label.label : "",
              color: label.color ? label.color : "#000000",
              opacity: label.opacity ? label.opacity : 1,
            };

            if ("weight" in label) {
              formattedLabel.weight = label.weight;
            }

            return formattedLabel;
          });

          this.addLayer(layer, labels);
        } else {
          this.addLayer(layer);
        }
      }
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

    submitForm() {
      for (let layer of this.layers) {
        let labelsForm = layer.element.querySelector("labels-form");
        if (labelsForm) {
          labelsForm.submitForm();
        }
      }

      this.dispatchEvent(
        new CustomEvent("form-submitted", {
          detail: {
            layers: this.deepCopy(this.layers),
          },
        })
      );
    }

    formatGeoserverPush(layer, labels) {
      for (let i = 0; i < labels.length; i++) {
        layer.geoserver_style[Object.keys(layer.geoserver_style)[0]][
          i
        ].quantity = labels[i].id;

        layer.geoserver_style[Object.keys(layer.geoserver_style)[0]][i].label =
          labels[i].name;

        layer.geoserver_style[Object.keys(layer.geoserver_style)[0]][i].color =
          labels[i].color;

        layer.geoserver_style[Object.keys(layer.geoserver_style)[0]][
          i
        ].opacity = labels[i].opacity;

        if (labels[i].weight) {
          layer.geoserver_style[Object.keys(layer.geoserver_style)[0]][
            i
          ].weight = labels[i].weight;
        }
      }

      return layer;
    }

    addLayer(layer, labels = null) {
      const layerTemplate = document.createElement("template");
      if (labels) {
        layerTemplate.innerHTML = this._renderLayerAccordionItem(layer, labels);
      } else {
        layerTemplate.innerHTML = this._renderLayerAccordionItem(layer);
      }

      const layerElement = layerTemplate.content.firstElementChild;

      this.layersAccordion.appendChild(layerElement);

      layer.element = layerElement;

      const displayNameInput = layerElement.querySelector(
        ".layer-display-name-input"
      );
      const zIndexInput = layerElement.querySelector(".layer-z-index-input");
      const layerVisibilityToggle = layerElement.querySelector(
        ".layer-visibility-toggle"
      );

      if (labels) {
        const labelsForm = layerElement.querySelector("labels-form");
        labelsForm.addExistingLabels(labels);

        labelsForm.addEventListener("form-updated", () => {
          this.dispatchEvent(new CustomEvent("form-updated"));
        });

        labelsForm.addEventListener("form-submitted", (e) => {
          this.formatGeoserverPush(layer, e.detail.label_categories);
        });
      }

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
    }

    resetInputs() {
      this.layers = [];
      this.layersAccordion.innerHTML = "";
    }

    validateInputs() {
      const labelsForms = this.shadow.querySelectorAll("labels-form");

      for (let labelsForm of labelsForms) {
        if (!labelsForm.validateInputs()) {
          return false;
        }
      }

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

    _renderLayerAccordionItem = (layer, labels = null) => /* HTML */ `
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
            size="sm"
            label-a="layer visible by default"
            label-b="layer visible by default"
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
        ${labels ? "<labels-form></labels-form>" : ""}
      </cds-accordion-item>
    `;
  }
);
