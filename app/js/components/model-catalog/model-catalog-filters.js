/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/accordion.min.js";
import "../../libs/carbon-web-components/checkbox.min.js";

const template = () => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    cds-accordion {
      width: 100%;
    }

    .display-none {
      display: none;
    }
  </style>

  <cds-accordion>
    <cds-accordion-item id="type-accordion-item" title="Type" open>
      <cds-checkbox-group id="type-checkbox-group" data-value="type">
        <cds-checkbox data-value="Model">Model</cds-checkbox>
        <cds-checkbox data-value="Tune">Tune</cds-checkbox>
      </cds-checkbox-group>
    </cds-accordion-item>
    <cds-accordion-item title="Purpose" open style="display: none;">
      <cds-checkbox-group id="purpose-checkbox-group" data-value="purpose">
        <cds-checkbox data-value="Segmentation">Segmentation</cds-checkbox>
        <cds-checkbox data-value="Regression">Regression</cds-checkbox>
      </cds-checkbox-group>
    </cds-accordion-item>
    <cds-accordion-item title="Status" open>
      <cds-checkbox-group id="status-checkbox-group" data-value="status">
        <cds-checkbox data-value="Finished">Finished</cds-checkbox>
        <cds-checkbox data-value="Pending">Pending</cds-checkbox>
        <cds-checkbox data-value="Failed">Failed</cds-checkbox>
      </cds-checkbox-group>
    </cds-accordion-item>
  </cds-accordion>
`;

window.customElements.define(
  "model-catalog-filters",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.typeAccordionItem = this.shadow.querySelector(
        "#type-accordion-item"
      );

      this.typeCheckboxGroup = this.shadow.querySelector(
        "#type-checkbox-group"
      );
      this.purposeCheckboxGroup = this.shadow.querySelector(
        "#purpose-checkbox-group"
      );
      this.statusCheckboxGroup = this.shadow.querySelector(
        "#status-checkbox-group"
      );

      this.typeCheckboxGroup.addEventListener("cds-checkbox-changed", (e) => {
        this.handleCheckboxChange(e);
      });

      this.purposeCheckboxGroup.addEventListener(
        "cds-checkbox-changed",
        (e) => {
          this.handleCheckboxChange(e);
        }
      );

      this.statusCheckboxGroup.addEventListener("cds-checkbox-changed", (e) => {
        this.handleCheckboxChange(e);
      });
    }

    handleCheckboxChange(e) {
      this.dispatchEvent(
        new CustomEvent("filter-changed", {
          detail: {
            filterGroup: e.currentTarget.dataset.value,
            filter: e.target.dataset.value,
            checked: e.detail.checked,
          },
        })
      );
    }

    updateFilters(tab) {
      console.log(tab);
      if (tab === "models-and-tunes") {
        this.typeAccordionItem.classList.remove("display-none");
      } else {
        this.typeAccordionItem.classList.add("display-none");
      }
    }
  }
);
