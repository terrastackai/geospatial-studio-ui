/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/toggle.min.js";
import "../../libs/carbon-web-components/text-input.min.js";
import "../../libs/carbon-web-components/number-input.min.js";
import "../../libs/carbon-web-components/accordion.min.js";
import "../../libs/carbon-web-components/dropdown.min.js";
import "../../libs/carbon-web-components/inline-loading.min.js";
import "../../libs/carbon-web-components/tile.min.js";
import "../../libs/carbon-web-components/checkbox.min.js";

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    .display-none {
      display: none !important;
    }

    #post-processing-form {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;
      padding-right: 1rem;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      width: 100%;
      padding-right: 1rem;
    }

    .form-section-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--cds-text-01, #f4f4f4);
      margin-bottom: 0.5rem;
    }

    .mask-url-inputs {
      display: flex;
      flex-direction: column;
      row-gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--cds-ui-03, #525252);
      width: 100%;
    }

    #generic-processor-form {
      display: flex;
      flex-direction: column;
      row-gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--cds-ui-03, #525252);
      width: 100%;
    }

    cds-toggle {
      margin-bottom: 0.5rem;
    }

    .helper-text {
      font-size: 0.75rem;
      color: var(--cds-text-02, #c6c6c6);
      margin-top: 0.25rem;
    }

    /* Custom checkbox switch styling */
    .option-card {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1rem;
      background: var(--cds-ui-01, #262626);
      border: 1px solid var(--cds-ui-03, #525252);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 0.75rem;
    }

    .option-card:hover {
      background: var(--cds-ui-02, #393939);
      border-color: var(--cds-interactive-01, #0f62fe);
      box-shadow: 0 2px 6px rgba(15, 98, 254, 0.2);
    }

    .option-card.active {
      background: var(--cds-ui-02, #393939);
      border-color: var(--cds-interactive-01, #0f62fe);
      border-width: 2px;
      padding: calc(1rem - 1px);
    }

    .option-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .option-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--cds-text-01, #f4f4f4);
      margin: 0;
    }

    .option-description {
      font-size: 0.75rem;
      color: var(--cds-text-02, #c6c6c6);
      margin: 0;
      line-height: 1.4;
    }

    /* Custom switch toggle */
    .switch-container {
      display: flex;
      align-items: center;
      margin-left: 1rem;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 48px;
      height: 24px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--cds-ui-04, #8d8d8d);
      transition: 0.3s;
      border-radius: 24px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: var(--cds-interactive-01, #0f62fe);
    }

    input:checked + .slider:before {
      transform: translateX(24px);
    }

    .slider:hover {
      box-shadow: 0 0 8px rgba(15, 98, 254, 0.4);
    }

    cds-accordion {
      margin-top: 0;
    }

    .processor-form {
      display: flex;
      flex-direction: column;
      row-gap: 1rem;
      padding: 1rem;
      padding-right: 1rem;
    }

    .json-error {
      font-size: 0.75rem;
      color: var(--cds-support-error, #ff8389);
      margin-top: 0.25rem;
      display: none;
    }

    cds-tile {
      margin-top: 1rem;
    }

    .detail-row {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
    }

    .detail-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--cds-text-02, #c6c6c6);
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .detail-value {
      font-size: 0.875rem;
      color: var(--cds-text-01, #f4f4f4);
      line-height: 1.5;
    }

    .parameters-code {
      background: var(--cds-ui-02, #393939);
      padding: 0.75rem;
      border-radius: 4px;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 0.75rem;
      line-height: 1.5;
      overflow-x: auto;
      white-space: pre;
      color: var(--cds-text-01, #f4f4f4);
      border: 1px solid var(--cds-ui-03, #525252);
    }

    .toggle-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .toggle-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem;
      background: var(--cds-ui-02, #393939);
      border-radius: 4px;
      border-left: 3px solid transparent;
      transition: border-color 0.2s ease;
    }

    .toggle-item:hover {
      border-left-color: var(--cds-interactive-01, #0f62fe);
    }

    .toggle-item cds-toggle {
      margin-bottom: 0;
    }

    .toggle-item .helper-text {
      margin-top: 0.25rem;
      margin-left: 0;
      padding-left: 0;
    }
  </style>

  <div id="post-processing-form">
    <cds-accordion>
      <cds-accordion-item title="Generic Post-processing" open>
        <div class="processor-form">
          <div class="form-section-title">Masking Options</div>
          
          <div class="option-card" id="cloud-masking-card">
            <div class="option-content">
              <div class="option-label">Cloud Masking</div>
              <div class="option-description">Mask cloud-covered areas in the output</div>
            </div>
            <div class="switch-container">
              <label class="switch">
                <input type="checkbox" id="cloud-masking-toggle">
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="option-card" id="snow-ice-masking-card">
            <div class="option-content">
              <div class="option-label">Snow and Ice Masking</div>
              <div class="option-description">Mask snow and ice-covered areas in the output</div>
            </div>
            <div class="switch-container">
              <label class="switch">
                <input type="checkbox" id="snow-ice-masking-toggle">
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="option-card" id="permanent-water-masking-card">
            <div class="option-content">
              <div class="option-label">Permanent Water Masking</div>
              <div class="option-description">Mask permanent water bodies in the output</div>
            </div>
            <div class="switch-container">
              <label class="switch">
                <input type="checkbox" id="permanent-water-masking-toggle">
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="option-card" id="ocean-masking-card">
            <div class="option-content">
              <div class="option-label">Ocean Masking</div>
              <div class="option-description">Mask ocean areas in the output</div>
            </div>
            <div class="switch-container">
              <label class="switch">
                <input type="checkbox" id="ocean-masking-toggle">
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="option-card" id="custom-mask-card">
            <div class="option-content">
              <div class="option-label">Custom Mask from URL</div>
              <div class="option-description">Apply a custom mask from a GeoJSON URL</div>
              
              <div id="mask-url-inputs" class="mask-url-inputs display-none">
                <cds-text-input
                  id="mask-url-input"
                  placeholder="https://example.com/mask.geojson"
                  label="Mask URL"
                  helper-text="URL to a GeoJSON file containing the mask geometry"
                ></cds-text-input>
                
                <cds-number-input
                  id="buffer-size-input"
                  label="Buffer size (meters)"
                  value="100"
                  step="1"
                  min="0"
                  max="10000"
                  helper-text="Buffer distance around mask features in meters"
                ></cds-number-input>
              </div>
            </div>
            <div class="switch-container">
              <label class="switch">
                <input type="checkbox" id="custom-mask-toggle">
                <span class="slider"></span>
              </label>
            </div>
          </div>

        </div>
      </cds-accordion-item>

      <cds-accordion-item title="Custom Generic Post-processing">
        <div class="processor-form">
          <div class="option-card" id="generic-processor-card">
            <div class="option-content">
              <div class="option-label">Enable Generic Processor</div>
              <div class="option-description">Configure a custom generic processor for post-processing</div>
              
              <div id="generic-processor-form" class="display-none">
                <cds-inline-loading status="active">
                  Loading processors...
                </cds-inline-loading>
                
                <cds-dropdown
                  id="processor-dropdown"
                  label="Select Processor *"
                  helper-text="Choose a generic processor from the list"
                  class="display-none"
                >
                </cds-dropdown>

                <cds-tile id="processor-details" class="display-none">
                  <div class="detail-row">
                    <div class="detail-label">Processor Name</div>
                    <div class="detail-value" id="processor-name-display"></div>
                  </div>
                  
                  <div class="detail-row">
                    <div class="detail-label">Description</div>
                    <div class="detail-value" id="processor-description-display"></div>
                  </div>
                  
                  <div class="detail-row" id="processor-parameters-display-container" class="display-none">
                    <div class="detail-label">Processor Parameters</div>
                    <div class="parameters-code" id="processor-parameters-display"></div>
                  </div>
                </cds-tile>
              </div>
            </div>
            <div class="switch-container">
              <label class="switch">
                <input type="checkbox" id="generic-processor-toggle">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </cds-accordion-item>
    </cds-accordion>
  </div>
`;

window.customElements.define(
  "post-processing-form",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.postProcessing = {};
      this.lastSelectedProcessorId = null; // Store last selected processor
    }

    render() {
      this.setDOM(template(this));

      // Get checkbox inputs
      this.cloudMaskingToggle = this.shadow.querySelector(
        "#cloud-masking-toggle"
      );
      this.snowIceMaskingToggle = this.shadow.querySelector(
        "#snow-ice-masking-toggle"
      );
      this.permanentWaterMaskingToggle = this.shadow.querySelector(
        "#permanent-water-masking-toggle"
      );
      this.oceanMaskingToggle = this.shadow.querySelector(
        "#ocean-masking-toggle"
      );
      this.customMaskToggle = this.shadow.querySelector("#custom-mask-toggle");
      this.genericProcessorToggle = this.shadow.querySelector(
        "#generic-processor-toggle"
      );
      
      // Get option cards for active state
      this.cloudMaskingCard = this.shadow.querySelector("#cloud-masking-card");
      this.snowIceMaskingCard = this.shadow.querySelector("#snow-ice-masking-card");
      this.permanentWaterMaskingCard = this.shadow.querySelector("#permanent-water-masking-card");
      this.oceanMaskingCard = this.shadow.querySelector("#ocean-masking-card");
      this.customMaskCard = this.shadow.querySelector("#custom-mask-card");
      this.genericProcessorCard = this.shadow.querySelector("#generic-processor-card");
      this.genericProcessorForm = this.shadow.querySelector(
        "#generic-processor-form"
      );

      this.maskUrlInputs = this.shadow.querySelector("#mask-url-inputs");
      this.maskUrlInput = this.shadow.querySelector("#mask-url-input");
      this.bufferSizeInput = this.shadow.querySelector("#buffer-size-input");

      // Generic processor form elements
      this.processorInlineLoading = this.shadow.querySelector(
        "cds-inline-loading"
      );
      this.processorDropdown = this.shadow.querySelector("#processor-dropdown");
      this.processorDetails = this.shadow.querySelector("#processor-details");
      this.processorNameDisplay = this.shadow.querySelector(
        "#processor-name-display"
      );
      this.processorDescriptionDisplay = this.shadow.querySelector(
        "#processor-description-display"
      );
      this.processorParametersDisplay = this.shadow.querySelector(
        "#processor-parameters-display"
      );
      this.processorParametersDisplayContainer = this.shadow.querySelector(
        "#processor-parameters-display-container"
      );

      this.genericProcessors = [];

      this.setupEventListeners();
    }

    setupEventListeners() {
      // Cloud masking
      this.cloudMaskingToggle.addEventListener("change", () => {
        this.postProcessing.cloud_masking = this.cloudMaskingToggle.checked
          ? "True"
          : "False";
        this.toggleCardActive(this.cloudMaskingCard, this.cloudMaskingToggle.checked);
        this.dispatchFormUpdated();
      });
      
      // Make card clickable (but not when clicking the switch itself)
      this.cloudMaskingCard.addEventListener("click", (e) => {
        if (!e.target.closest('.switch-container')) {
          this.cloudMaskingToggle.checked = !this.cloudMaskingToggle.checked;
          this.cloudMaskingToggle.dispatchEvent(new Event('change'));
        }
      });

      // Snow and ice masking
      this.snowIceMaskingToggle.addEventListener("change", () => {
        this.postProcessing.snow_ice_masking = this.snowIceMaskingToggle.checked
          ? "True"
          : "False";
        this.toggleCardActive(this.snowIceMaskingCard, this.snowIceMaskingToggle.checked);
        this.dispatchFormUpdated();
      });
      
      this.snowIceMaskingCard.addEventListener("click", (e) => {
        if (!e.target.closest('.switch-container')) {
          this.snowIceMaskingToggle.checked = !this.snowIceMaskingToggle.checked;
          this.snowIceMaskingToggle.dispatchEvent(new Event('change'));
        }
      });

      // Permanent water masking
      this.permanentWaterMaskingToggle.addEventListener("change", () => {
        this.postProcessing.permanent_water_masking =
          this.permanentWaterMaskingToggle.checked ? "True" : "False";
        this.toggleCardActive(this.permanentWaterMaskingCard, this.permanentWaterMaskingToggle.checked);
        this.dispatchFormUpdated();
      });
      
      this.permanentWaterMaskingCard.addEventListener("click", (e) => {
        if (!e.target.closest('.switch-container')) {
          this.permanentWaterMaskingToggle.checked = !this.permanentWaterMaskingToggle.checked;
          this.permanentWaterMaskingToggle.dispatchEvent(new Event('change'));
        }
      });

      // Ocean masking
      this.oceanMaskingToggle.addEventListener("change", () => {
        this.postProcessing.ocean_masking = this.oceanMaskingToggle.checked
          ? "True"
          : "False";
        this.toggleCardActive(this.oceanMaskingCard, this.oceanMaskingToggle.checked);
        this.dispatchFormUpdated();
      });
      
      this.oceanMaskingCard.addEventListener("click", (e) => {
        if (!e.target.closest('.switch-container')) {
          this.oceanMaskingToggle.checked = !this.oceanMaskingToggle.checked;
          this.oceanMaskingToggle.dispatchEvent(new Event('change'));
        }
      });

      // Custom mask
      this.customMaskToggle.addEventListener("change", () => {
        if (this.customMaskToggle.checked) {
          this.maskUrlInputs.classList.remove("display-none");
          this.updateMaskFromUrl();
        } else {
          this.maskUrlInputs.classList.add("display-none");
          this.postProcessing.mask_from_url = null;
        }
        this.toggleCardActive(this.customMaskCard, this.customMaskToggle.checked);
        this.dispatchFormUpdated();
      });
      
      this.customMaskCard.addEventListener("click", (e) => {
        // Don't toggle if clicking on the switch itself or inside the mask URL inputs
        if (!e.target.closest('.switch-container') &&
            !e.target.closest('.mask-url-inputs') &&
            !e.target.closest('cds-text-input') &&
            !e.target.closest('cds-number-input')) {
          this.customMaskToggle.checked = !this.customMaskToggle.checked;
          this.customMaskToggle.dispatchEvent(new Event('change'));
        }
      });

      this.maskUrlInput.addEventListener("input", () => {
        this.updateMaskFromUrl();
        this.dispatchFormUpdated();
      });

      this.bufferSizeInput.addEventListener("cds-number-input", () => {
        this.updateMaskFromUrl();
        this.dispatchFormUpdated();
      });

      // Generic processor toggle
      this.genericProcessorToggle.addEventListener("change", async () => {
        if (this.genericProcessorToggle.checked) {
          this.genericProcessorForm.classList.remove("display-none");
          await this.loadGenericProcessors();
          
          // Restore previously selected processor if it exists
          if (this.lastSelectedProcessorId) {
            this.processorDropdown.value = this.lastSelectedProcessorId;
            this.selectProcessor(this.lastSelectedProcessorId);
          }
        } else {
          this.genericProcessorForm.classList.add("display-none");
          this.postProcessing.generic_processor = null;
          // Don't clear lastSelectedProcessorId so we can restore it
        }
        this.toggleCardActive(this.genericProcessorCard, this.genericProcessorToggle.checked);
        this.dispatchFormUpdated();
      });
      
      this.genericProcessorCard.addEventListener("click", (e) => {
        // Don't toggle if clicking on the switch itself or inside the processor form
        if (!e.target.closest('.switch-container') &&
            !e.target.closest('#generic-processor-form') &&
            !e.target.closest('cds-dropdown') &&
            !e.target.closest('cds-tile') &&
            !e.target.closest('cds-inline-loading')) {
          this.genericProcessorToggle.checked = !this.genericProcessorToggle.checked;
          this.genericProcessorToggle.dispatchEvent(new Event('change'));
        }
      });

      this.processorDropdown.addEventListener("cds-dropdown-selected", () => {
        this.selectProcessor(this.processorDropdown.value);
      });
    }

    toggleCardActive(card, isActive) {
      if (isActive) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    }

    async loadGenericProcessors() {
      this.processorInlineLoading.classList.remove("display-none");
      this.processorDropdown.classList.add("display-none");

      try {
        const response = await app.backend.getGenericProcessors();

        if (response && response.results) {
          this.genericProcessors = response.results;
          this.setupProcessorDropdown();
          this.processorDropdown.classList.remove("display-none");
        } else {
          app.showMessage(
            "No generic processors found",
            "",
            "warning",
            5000
          );
        }
      } catch (error) {
        console.error("Error loading generic processors:", error);
        app.showMessage(
          "Failed to load generic processors",
          "",
          "error",
          5000
        );
      }

      this.processorInlineLoading.classList.add("display-none");
    }

    setupProcessorDropdown() {
      this.processorDropdown.innerHTML = "";

      this.genericProcessors.forEach((processor) => {
        const dropdownItem = document.createElement("cds-dropdown-item");
        dropdownItem.value = processor.id;
        dropdownItem.innerHTML = processor.name;
        this.processorDropdown.appendChild(dropdownItem);
      });
    }

    selectProcessor(processorId) {
      const processor = this.genericProcessors.find((p) => p.id === processorId);

      if (processor) {
        // Store the selected processor ID for restoration
        this.lastSelectedProcessorId = processorId;
        
        // Update post-processing config
        this.postProcessing.generic_processor = {
          name: processor.name,
          description: processor.description || null,
          processor_parameters: processor.processor_parameters || null,
        };

        // Display processor details
        this.processorNameDisplay.textContent = processor.name;
        this.processorDescriptionDisplay.textContent =
          processor.description || "No description available";

        if (processor.processor_parameters) {
          this.processorParametersDisplay.textContent = JSON.stringify(
            processor.processor_parameters,
            null,
            2
          );
          this.processorParametersDisplayContainer.classList.remove("display-none");
        } else {
          this.processorParametersDisplayContainer.classList.add("display-none");
        }

        this.processorDetails.classList.remove("display-none");
        this.dispatchFormUpdated();
      }
    }

    updateMaskFromUrl() {
      if (this.customMaskToggle.checked && this.maskUrlInput.value) {
        this.postProcessing.mask_from_url = {
          url: this.maskUrlInput.value,
          buffer_size_m: this.bufferSizeInput.value || "100",
        };
      } else {
        this.postProcessing.mask_from_url = null;
      }
    }

    setupPostProcessing(postProcessing) {
      if (!postProcessing) {
        return;
      }

      this.postProcessing = this.deepCopy(postProcessing);

      // Set toggle states based on existing values
      if (postProcessing.cloud_masking === "True") {
        this.cloudMaskingToggle.checked = true;
        this.toggleCardActive(this.cloudMaskingCard, true);
      }

      if (postProcessing.snow_ice_masking === "True") {
        this.snowIceMaskingToggle.checked = true;
        this.toggleCardActive(this.snowIceMaskingCard, true);
      }

      if (postProcessing.permanent_water_masking === "True") {
        this.permanentWaterMaskingToggle.checked = true;
        this.toggleCardActive(this.permanentWaterMaskingCard, true);
      }

      if (postProcessing.ocean_masking === "True") {
        this.oceanMaskingToggle.checked = true;
        this.toggleCardActive(this.oceanMaskingCard, true);
      }

      // Handle mask_from_url
      if (
        postProcessing.mask_from_url &&
        typeof postProcessing.mask_from_url === "object" &&
        postProcessing.mask_from_url.url
      ) {
        this.customMaskToggle.checked = true;
        this.toggleCardActive(this.customMaskCard, true);
        this.maskUrlInputs.classList.remove("display-none");
        this.maskUrlInput.value = postProcessing.mask_from_url.url;
        this.bufferSizeInput.value =
          postProcessing.mask_from_url.buffer_size_m || "100";
      }

      // Handle generic_processor
      if (
        postProcessing.generic_processor &&
        typeof postProcessing.generic_processor === "object" &&
        postProcessing.generic_processor.name
      ) {
        this.genericProcessorToggle.checked = true;
        this.toggleCardActive(this.genericProcessorCard, true);
        this.genericProcessorForm.classList.remove("display-none");
        
        // Load processors and select the matching one
        this.loadGenericProcessors().then(() => {
          const processor = this.genericProcessors.find(
            (p) => p.name === postProcessing.generic_processor.name
          );
          if (processor) {
            this.processorDropdown.value = processor.id;
            this.selectProcessor(processor.id);
          }
        });
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
      this.dispatchEvent(
        new CustomEvent("form-submitted", {
          detail: {
            post_processing: this.deepCopy(this.postProcessing),
          },
        })
      );
    }

    resetInputs() {
      this.postProcessing = {};
      this.lastSelectedProcessorId = null; // Clear stored processor
      
      // Reset all toggles
      this.cloudMaskingToggle.checked = false;
      this.toggleCardActive(this.cloudMaskingCard, false);
      
      this.snowIceMaskingToggle.checked = false;
      this.toggleCardActive(this.snowIceMaskingCard, false);
      
      this.permanentWaterMaskingToggle.checked = false;
      this.toggleCardActive(this.permanentWaterMaskingCard, false);
      
      this.oceanMaskingToggle.checked = false;
      this.toggleCardActive(this.oceanMaskingCard, false);
      
      this.customMaskToggle.checked = false;
      this.toggleCardActive(this.customMaskCard, false);
      this.maskUrlInputs.classList.add("display-none");
      
      this.genericProcessorToggle.checked = false;
      this.toggleCardActive(this.genericProcessorCard, false);
      this.genericProcessorForm.classList.add("display-none");
      this.processorDetails.classList.add("display-none");
      this.maskUrlInputs.classList.add("display-none");
      this.maskUrlInput.value = "";
      this.bufferSizeInput.value = "100";
      this.genericProcessorForm.classList.add("display-none");
      this.processorDropdown.value = "";
      this.processorDetails.classList.add("display-none");
    }

    validateInputs() {
      // If custom mask is enabled, URL must be provided
      if (this.customMaskToggle.checked && !this.maskUrlInput.value) {
        return false;
      }

      // If generic processor is enabled, name must be provided
      if (
        this.genericProcessorToggle.checked &&
        (!this.postProcessing.generic_processor ||
          !this.postProcessing.generic_processor.name)
      ) {
        return false;
      }

      return true;
    }

    dispatchFormUpdated() {
      this.dispatchEvent(new CustomEvent("form-updated"));
    }
  }
);
