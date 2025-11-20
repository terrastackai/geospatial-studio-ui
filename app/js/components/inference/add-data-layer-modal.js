/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/modal.min.js";
import "../../libs/carbon-web-components/text-input.min.js";
import "../../libs/carbon-web-components/combo-box.min.js";
import "../../libs/carbon-web-components/accordion.min.js";
import "../../libs/carbon-web-components/slider.min.js";
import "../../libs/carbon-web-components/button.min.js";
import "../../libs/carbon-web-components/inline-loading.min.js";
import "../../libs/carbon-web-components/number-input.min.js";
import "../../libs/carbon-web-components/file-uploader.min.js";
import { addIcon2, loadingIcon, trashIcon } from "../../icons.js";
import { decodeBase64 } from "../../utils.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }

    * {
      box-sizing: border-box;
    }

    .display-none {
      display: none;
    }

    button {
      margin: 0;
      padding: 0;
      background: unset;
      border: none;
      cursor: pointer;
    }

    cds-modal {
      background-color: #000000cc;
    }

    cds-modal-body {
      display: flex;
      flex-direction: column;
      row-gap: 2rem;
      padding-right: 1rem;
    }

    section,
    .accordion-item-content {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
    }

    cds-modal-body #accordion-section {
      display: none;
    }

    cds-modal-body[regression] #accordion-section,
    cds-modal-body[segmentation] #accordion-section {
      display: flex;
    }

    cds-modal-body #rgb-section {
      display: none;
    }

    cds-modal-body[rgb] #rgb-section {
      display: flex;
    }

    h2 {
      color: var(--cds-text-02, #c6c6c6);
      font-size: 16px;
      font-weight: 400;
    }

    cds-combo-box::part(menu-body) {
      outline: 1px solid white;
    }

    .color-picker-container {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
    }

    .color-picker-container span {
      color: var(--cds-text-02, #c6c6c6);
      font-size: 12px;
      font-weight: 400;
    }

    input[type="color"] {
      display: block;
      background: var(--cds-ui-02, #393939);
      border: none;
      cursor: pointer;
    }

    .rgb-container {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
    }

    .rgb-container span {
      color: var(--cds-text-02, #c6c6c6);
      font-size: 16px;
      font-weight: 400;
    }

    .rgb-inputs-container {
      display: flex;
      column-gap: 1rem;
    }

    #add-class-button,
    .remove-legend-input-button {
      width: fit-content;
    }

    #cancel-button {
      flex: 0 1 50%;
    }

    #delete-button,
    #submit-button {
      flex: 0 1 25%;
    }

    #file-uploader-item-container {
      position: relative;
    }

    #loading-icon {
      position: absolute;
      top: 12px;
      left: 288px;
      animation: spin 1s infinite linear;
      z-index: 1;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(359deg);
      }
    }
  </style>

  <cds-modal prevent-close-on-click-outside>
    <cds-modal-header>
      <cds-modal-close-button></cds-modal-close-button>
      <cds-modal-heading>Add layer</cds-modal-heading>
    </cds-modal-header>
    <cds-modal-body>
      <section id="layer-group-section">
        <h2>Layer group</h2>
        <cds-inline-loading status="active">
          Loading inferences ...
        </cds-inline-loading>
        <cds-combo-box
          label-text="Inference"
          id="inference-input"
          helper-text="Select the inference this layer should belong to"
          value="create new layer group"
          disabled
        >
          <cds-combo-box-item value="create new layer group"
            >Create new layer group</cds-combo-box-item
          >
        </cds-combo-box>
        <cds-text-input
          id="location-input"
          label="Location"
          placeholder="e.g. Hursley"
        ></cds-text-input>
        <cds-text-input
          id="layer-group-title-input"
          label="Layer group title"
          helper-text="Add a descriptive title for this layer group"
        ></cds-text-input>
      </section>
      <section id="layer-info-section">
        <h2>Layer</h2>
        <cds-text-input
          id="layer-uri-input"
          label="Layer URI"
          helper-text="Enter the web address of the layer you want to upload or drop your file in the box below to generate a link"
        ></cds-text-input>
        <cds-file-uploader id="layer-file-uploader">
          <cds-file-uploader-drop-container>
            Drag and drop your layer file here to generate a URI
          </cds-file-uploader-drop-container>
          <div id="file-uploader-item-container" class="display-none">
            ${loadingIcon({ width: 16, height: 16, id: "loading-icon" })}
            <cds-file-uploader-item> </cds-file-uploader-item>
          </div>
        </cds-file-uploader>

        <cds-text-input
          id="layer-name-input"
          label="Layer name"
          helper-text="Add a descriptive name for this layer"
        ></cds-text-input>
        <cds-combo-box title-text="Layer task" id="layer-task-input">
          <cds-combo-box-item value="regression">Regression</cds-combo-box-item>
          <cds-combo-box-item value="segmentation"
            >Segmentation</cds-combo-box-item
          >
          <cds-combo-box-item value="rgb">RGB</cds-combo-box-item>
          <cds-combo-box-item value="point">Point</cds-combo-box-item>
        </cds-combo-box>
      </section>
      <section id="accordion-section">
        <cds-accordion></cds-accordion>
        <cds-button id="add-class-button" kind="secondary" size="sm">
          Add class ${addIcon2({ width: 16, height: 16, slot: "icon" })}
        </cds-button>
      </section>
      <section id="rgb-section">
        <div class="rgb-container">
          <span>Red</span>
          <div class="rgb-inputs-container">
            <cds-number-input
              id="red-min-input"
              label="min"
              value="0"
              step="1"
              min="-10000"
              max="10000"
            ></cds-number-input>
            <cds-number-input
              id="red-max-input"
              label="max"
              value="0"
              step="1"
              min="-10000"
              max="10000"
            ></cds-number-input>
          </div>
        </div>
        <div class="rgb-container">
          <span>Green</span>
          <div class="rgb-inputs-container">
            <cds-number-input
              id="green-min-input"
              label="min"
              value="0"
              step="1"
              min="-10000"
              max="10000"
            ></cds-number-input>
            <cds-number-input
              id="green-max-input"
              label="max"
              value="0"
              step="1"
              min="-10000"
              max="10000"
            ></cds-number-input>
          </div>
        </div>
        <div class="rgb-container">
          <span>Blue</span>
          <div class="rgb-inputs-container">
            <cds-number-input
              id="blue-min-input"
              label="min"
              value="0"
              step="1"
              min="-10000"
              max="10000"
            ></cds-number-input>
            <cds-number-input
              id="blue-max-input"
              label="max"
              value="0"
              step="1"
              min="-10000"
              max="10000"
            ></cds-number-input>
          </div>
        </div>
      </section>
    </cds-modal-body>
    <cds-modal-footer>
      <cds-modal-footer-button
        id="cancel-button"
        kind="secondary"
        data-modal-close
      >
        Cancel
      </cds-modal-footer-button>
      <cds-modal-footer-button id="create-layer-button" kind="primary" disabled>
        Create layer
      </cds-modal-footer-button>
    </cds-modal-footer>
  </cds-modal>
`;

window.customElements.define(
  "add-data-layer-modal",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.legendItems = [];
      this.inferences = [];
      this.count = 0;
      this.legendElements = {};
    }

    render() {
      this.setDOM(template(this));

      this.modal = this.shadow.querySelector("cds-modal");
      this.modalBody = this.shadow.querySelector("cds-modal-body");
      this.inlineLoading = this.shadow.querySelector("cds-inline-loading");
      this.inferenceInput = this.shadow.querySelector("#inference-input");
      this.locationInput = this.shadow.querySelector("#location-input");
      this.layerGroupTitleInput = this.shadow.querySelector(
        "#layer-group-title-input"
      );
      this.layerURIInput = this.shadow.querySelector("#layer-uri-input");
      this.layerFileUploader = this.shadow.querySelector(
        "#layer-file-uploader"
      );
      this.layerFileUploaderDropContainer = this.shadow.querySelector(
        "cds-file-uploader-drop-container"
      );
      this.layerFileUploaderItemContainer = this.shadow.querySelector(
        "#file-uploader-item-container"
      );
      this.layerFileUploadLoadingIcon =
        this.shadow.querySelector("#loading-icon");
      this.layerFileUploaderItem = this.shadow.querySelector(
        "cds-file-uploader-item"
      );
      this.layerNameInput = this.shadow.querySelector("#layer-name-input");
      this.layerTaskInput = this.shadow.querySelector("#layer-task-input");
      this.accordion = this.shadow.querySelector("cds-accordion");
      this.addClassButton = this.shadow.querySelector("#add-class-button");
      this.redMinInput = this.shadow.querySelector("#red-min-input");
      this.redMaxInput = this.shadow.querySelector("#red-max-input");
      this.greenMinInput = this.shadow.querySelector("#green-min-input");
      this.greenMaxInput = this.shadow.querySelector("#green-max-input");
      this.blueMinInput = this.shadow.querySelector("#blue-min-input");
      this.blueMaxInput = this.shadow.querySelector("#blue-max-input");
      this.createLayerButton = this.shadow.querySelector(
        "#create-layer-button"
      );

      this.layerFileUploader.addEventListener(
        "cds-file-uploader-drop-container-changed",
        (e) => {
          const file = e.detail.addedFiles[0];
          this.layerFileUploaderItem.innerHTML = file.name;
          this.layerFileUploaderDropContainer.classList.add("display-none");
          this.layerFileUploaderItemContainer.classList.remove("display-none");

          this.getPresignedLink(file);
        }
      );

      this.layerFileUploaderItem.addEventListener(
        "cds-file-uploader-item-deleted",
        () => {
          this.layerFileUploaderItemContainer.classList.add("display-none");
          this.layerFileUploaderDropContainer.classList.remove("display-none");
        }
      );

      this.locationInput.addEventListener("input", () => {
        this.handleCreateLayerButton();
      });

      this.inferenceInput.addEventListener("cds-combo-box-selected", () => {
        if (this.inferenceInput.value != "create new layer group") {
          const inference = this.inferences.filter(
            (i) => this.inferenceInput.value === i.id
          )[0];

          this.locationInput.value = inference.location;
          this.layerGroupTitleInput.value = inference.description;

          this.locationInput.setAttribute("disabled", "");
          this.layerGroupTitleInput.setAttribute("disabled", "");
        } else {
          this.locationInput.removeAttribute("disabled");
          this.layerGroupTitleInput.removeAttribute("disabled");
        }
        this.handleCreateLayerButton();
      });

      this.layerGroupTitleInput.addEventListener("input", () => {
        this.handleCreateLayerButton();
      });

      this.layerURIInput.addEventListener("input", () => {
        this.handleCreateLayerButton();
      });

      this.layerNameInput.addEventListener("input", () => {
        this.handleCreateLayerButton();
      });

      this.layerTaskInput.addEventListener("cds-combo-box-selected", () => {
        this.modalBody.removeAttribute("regression");
        this.modalBody.removeAttribute("segmentation");
        this.modalBody.removeAttribute("rgb");
        this.modalBody.removeAttribute("point");

        if (this.layerTaskInput.value != "") {
          this.modalBody.setAttribute(this.layerTaskInput.value, "");
        }

        this.handleCreateLayerButton();
      });

      this.addClassButton.addEventListener("click", () => {
        this.addLegendInput();
      });

      this.redMinInput.addEventListener("cds-number-input", () => {
        this.handleCreateLayerButton();
      });

      this.redMaxInput.addEventListener("cds-number-input", () => {
        this.handleCreateLayerButton();
      });

      this.greenMinInput.addEventListener("cds-number-input", () => {
        this.handleCreateLayerButton();
      });

      this.greenMaxInput.addEventListener("cds-number-input", () => {
        this.handleCreateLayerButton();
      });

      this.blueMinInput.addEventListener("cds-number-input", () => {
        this.handleCreateLayerButton();
      });

      this.blueMaxInput.addEventListener("cds-number-input", () => {
        this.handleCreateLayerButton();
      });

      this.createLayerButton.addEventListener("click", () => {
        this.createLayer();
      });

      this.getInferences();
      this.addLegendInput();
      this.addLegendInput();
      this.handleCreateLayerButton();
    }

    async getInferences() {
      this.inlineLoading.status = "active";
      this.inlineLoading.textContent = "Loading inferences ...";
      this.inferenceInput.setAttribute("disabled", "");
      try {
        const idToken = localStorage.getItem("id_token");

        if (idToken) {
          const payload = idToken.split(".")[1];
          const decodedPayload = decodeBase64(payload);
          const parsedPayload = JSON.parse(decodedPayload);
          this.userEmail = parsedPayload.email;
        }
        const response = await app.backend.getInferencesV2(
          25,
          0,
          this.userEmail,
          null
        );

        this.inferences = response.results ? response.results : response;

        this.setupInferenceInput();
      } catch (error) {
        this.inlineLoading.status = "error";
        this.inferenceInput.removeAttribute("disabled");
        this.inlineLoading.textContent =
          "There was an error loading the inferences";
        throw error;
      }
    }

    show() {
      this.modal.setAttribute("open", "");
    }

    hide() {
      this.modal.removeAttribute("open");
    }

    setupInferenceInput() {
      this.clearInferenceInput();

      this.inferences.forEach((inference) => {
        const comboBoxItemTemplate = document.createElement("template");
        comboBoxItemTemplate.innerHTML =
          this._renderInferenceComboBoxItem(inference);
        const comboBoxItemElement =
          comboBoxItemTemplate.content.firstElementChild;
        this.inferenceInput.appendChild(comboBoxItemElement);
      });

      this.inlineLoading.status = "finished";
      this.inlineLoading.textContent = "Inferences loaded";
      this.inferenceInput.removeAttribute("disabled");
    }

    clearInferenceInput() {
      [...this.inferenceInput.children].forEach((element) => {
        if (element.value != "create new layer group") {
          element.remove();
        }
      });
    }

    addLegendInput() {
      const legendInputTemplate = document.createElement("template");
      legendInputTemplate.innerHTML = this._renderLegendInput(++this.count);
      const legendInputElement = legendInputTemplate.content.firstElementChild;
      this.accordion.appendChild(legendInputElement);

      legendInputElement
        .querySelector(".opacity-slider")
        .addEventListener("cds-slider-changed", () => {
          this.handleCreateLayerButton();
        });

      legendInputElement
        .querySelector(".quantity-input")
        .addEventListener("cds-number-input", () => {
          this.handleCreateLayerButton();
        });

      legendInputElement
        .querySelector(".color-input")
        .addEventListener("input", () => {
          this.handleCreateLayerButton();
        });

      legendInputElement
        .querySelector(".label-input")
        .addEventListener("input", () => {
          this.handleCreateLayerButton();
        });

      this.legendElements[this.count] = legendInputElement;

      legendInputElement
        .querySelector(".remove-legend-input-button")
        .addEventListener("click", () => {
          delete this.legendElements[legendInputElement.dataset.count];

          legendInputElement.remove();

          if (this.accordion.children.length === 1) {
            this.accordion.firstChild
              .querySelector(".remove-legend-input-button")
              .setAttribute("disabled", "");
          }

          this.handleCreateLayerButton();
        });

      if (this.accordion.children.length > 1) {
        if (
          this.shadow.querySelector(".remove-legend-input-button[disabled]")
        ) {
          this.shadow
            .querySelector(".remove-legend-input-button[disabled]")
            .removeAttribute("disabled");
        }
      }

      this.handleCreateLayerButton();
    }

    handleCreateLayerButton() {
      let baseValidation =
        this.inferenceInput.value &&
        this.inlineLoading.status != "active" &&
        this.locationInput.value &&
        this.layerGroupTitleInput.value &&
        this.layerURIInput.value &&
        this.layerNameInput.value &&
        this.layerTaskInput.value;

      let rgbValidation =
        this.redMinInput.value &&
        this.redMaxInput.value &&
        this.greenMinInput.value &&
        this.greenMaxInput.value &&
        this.blueMinInput.value &&
        this.blueMaxInput.value;

      if (!baseValidation) {
        this.createLayerButton.setAttribute("disabled", "");
        return;
      }

      if (this.layerTaskInput.value === "rgb" && !rgbValidation) {
        this.createLayerButton.setAttribute("disabled", "");
        return;
      }

      if (
        (this.layerTaskInput.value === "regression" ||
          this.layerTaskInput.value === "segmentation") &&
        !this.validateLegendElements()
      ) {
        this.createLayerButton.setAttribute("disabled", "");
        return;
      }

      this.createLayerButton.removeAttribute("disabled");
    }

    validateLegendElements() {
      for (let i = 0; i < Object.values(this.legendElements).length; i++) {
        let legendElement = Object.values(this.legendElements)[i];

        if (!legendElement.querySelector(".label-input").value) {
          return false;
        }

        if (legendElement.querySelector(".quantity-input").value === "") {
          return false;
        }
      }

      return true;
    }

    async uploadFile(links, file) {
      try {
        let response = await app.backend.uploadFile(links.upload_url, file);

        if (response === 200) {
          this.layerURIInput.value = links.download_url;
          this.layerFileUploadLoadingIcon.classList.add("display-none");
          this.layerFileUploaderItem.state = "edit";
        } else {
          app.showMessage(
            "Error uploading file: Error " + response,
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        app.showMessage(
          "An error occured while upload the file",
          "",
          "error",
          5000
        );
      }
    }

    async getPresignedLink(file) {
      this.layerFileUploadLoadingIcon.classList.remove("display-none");
      this.layerFileUploaderItem.state = "";
      try {
        let response = await app.backend.generatePresignedLink(file.name);

        if ("upload_url" in response) {
          this.uploadFile(response, file);
        } else {
          app.showMessage(
            "Failed to generate presigned link: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        console.error("Error generating presigned link:", error);
        app.showMessage(
          "An error occured while generating your presigned link",
          "",
          "error",
          5000
        );
      }
    }

    getLayerPayload() {
      let payload = {
        requestType: "addlayer",
        location: this.locationInput.value,
        description: this.layerGroupTitleInput.value,
        layers: [
          {
            layer_source: this.layerURIInput.value,
            layer_name: this.layerNameInput.value,
            layer_type: this.layerTaskInput.value,
          },
        ],
      };

      if (this.inferenceInput.value != "create new layer group") {
        payload["group_id"] = this.inferenceInput.value;
      }

      let layer_style;

      if (this.layerTaskInput.value === "regression") {
        layer_style = {
          name: "Regression Style",
          description: "Regression Style",
          classes: [],
        };
      }

      if (this.layerTaskInput.value === "segmentation") {
        layer_style = {
          name: "Segmentation Style",
          description: "Segmentation Style",
          classes: [],
        };
      }

      if (this.layerTaskInput.value === "rgb") {
        layer_style = {
          name: "RGB Style",
          description: "RGB Style",
        };
      }

      if (this.layerTaskInput.value === "point") {
        layer_style = {
          name: "Point Style",
          description: "Point Style",
          classes: [],
        };
      }

      if (
        this.layerTaskInput.value === "regression" ||
        this.layerTaskInput.value === "segmentation"
      ) {
        Object.values(this.legendElements).forEach((legendElement) => {
          let legendClass = {
            color: legendElement.querySelector(".color-input").value,
            opacity: legendElement.querySelector(".opacity-slider").value,
            label: legendElement.querySelector(".label-input").value,
            quantity: legendElement.querySelector(".quantity-input").value,
          };

          layer_style.classes.push(legendClass);
        });
      }

      if (this.layerTaskInput.value === "rgb") {
        layer_style["classes"] = [
          {
            minValue: this.redMinInput.value,
            maxValue: this.redMaxInput.value,
            channel: 1,
            label: "RedChannel",
          },
          {
            minValue: this.greenMinInput.value,
            maxValue: this.greenMaxInput.value,
            channel: 2,
            label: "GreenChannel",
          },
          {
            minValue: this.blueMinInput.value,
            maxValue: this.blueMaxInput.value,
            channel: 3,
            label: "BlueChannel",
          },
        ];
      }

      payload.layers[0]["layer_style"] = layer_style;

      return payload;
    }

    async createLayer() {
      const payload = this.getLayerPayload();

      try {
        let response = await app.backend.createLayers(payload);

        console.log(response);

        this.resetModal();
      } catch (error) {
        console.error("Error creating layer:", error);
        app.showMessage(
          "An error occured while creating the layer",
          "",
          "error",
          5000
        );
      }
    }

    resetModal() {
      this.legendItems = [];
      this.count = 0;
      this.legendElements = 0;
      this.locationInput.value = "";
      this.inferenceInput.value = "create new layer group";
      this.layerGroupTitleInput.value = "";
      this.layerURIInput.value = "";
      this.layerNameInput.value = "";
      this.layerTaskInput._handleUserInitiatedClearInput();
      this.layerTaskInput.value = "";
      this.redMinInput.value = 0;
      this.redMaxInput.value = 0;
      this.greenMinInput.value = 0;
      this.greenMaxInput.value = 0;
      this.blueMinInput.value = 0;
      this.blueMaxInput.value = 0;
      this.accordion.innerHTML = "";
      this.locationInput.removeAttribute("disabled");
      this.layerGroupTitleInput.removeAttribute("disabled");
      this.handleCreateLayerButton();
    }

    _renderLegendInput = (count) => /* HTML */ `
      <cds-accordion-item
        title-text="${"Class " + count}"
        open
        data-count="${count}"
      >
        <div class="accordion-item-content">
          <cds-slider
            class="opacity-slider"
            label-text="Opacity"
            max="1"
            min="0"
            step="0.1"
            value="1"
          >
            <cds-slider-input aria-label="Slider value" type="number">
            </cds-slider-input>
          </cds-slider>
          <cds-number-input
            class="quantity-input"
            label="Quantity"
            value="0"
            step="1"
            min="-10000"
            max="10000"
          ></cds-number-input>
          <div class="color-picker-container">
            <span>Color</span>
            <input class="color-input" type="color" />
          </div>
          <cds-text-input class="label-input" label="Label"></cds-text-input>
          <cds-button
            class="remove-legend-input-button"
            kind="danger-tertiary"
            size="sm"
            >Remove
            ${trashIcon({ width: 16, height: 16, slot: "icon" })}</cds-button
          >
        </div>
      </cds-accordion-item>
    `;

    _renderInferenceComboBoxItem = (inference) => /* HTML */ `
      <cds-combo-box-item
        value="${inference.id}"
        title-text="${inference.description}"
        >${inference.description}</cds-combo-box-item
      >
    `;
  }
);
