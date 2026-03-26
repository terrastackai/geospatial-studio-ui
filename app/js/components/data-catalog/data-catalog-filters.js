/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/accordion.min.js";
import "../../libs/carbon-web-components/checkbox.min.js";
import "../../libs/carbon-web-components/date-picker.min.js";

const template = () => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    cds-accordion {
      width: 100%;
    }

    cds-date-picker {
      display: flex;
      flex-direction: column;
    }
  </style>

  <cds-accordion>
    <cds-accordion-item title="Purpose" open>
      <cds-checkbox-group id="purpose-checkbox-group" data-value="purpose">
        <cds-checkbox data-value="Segmentation">Segmentation</cds-checkbox>
        <cds-checkbox data-value="Regression">Regression</cds-checkbox>
      </cds-checkbox-group>
    </cds-accordion-item>
    <cds-accordion-item title="Status" open>
      <cds-checkbox-group id="status-checkbox-group" data-value="status">
        <cds-checkbox data-value="Succeeded">Succeeded</cds-checkbox>
        <cds-checkbox data-value="Onboarding">Onboarding</cds-checkbox>
        <cds-checkbox data-value="Pending">Pending</cds-checkbox>
        <cds-checkbox data-value="Failed">Failed</cds-checkbox>
      </cds-checkbox-group>
    </cds-accordion-item>
    <!--<cds-accordion-item title="Temporal Coverage" open>
      <cds-checkbox-group>
        <cds-date-picker date-format="Y-m-d">
          <cds-date-picker-input
            id="start-date"
            kind="from"
            label-text="From"
            placeholder="Y-m-d"
          >
          </cds-date-picker-input>
          <cds-date-picker-input
            id="end-date"
            kind="to"
            label-text="To"
            placeholder="Y-m-d"
          >
          </cds-date-picker-input>
        </cds-date-picker>
      </cds-checkbox-group>
    </cds-accordion-item>-->
  </cds-accordion>
`;

window.customElements.define(
  "data-catalog-filters",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.purposeCheckboxGroup = this.shadow.querySelector(
        "#purpose-checkbox-group"
      );
      this.statusCheckboxGroup = this.shadow.querySelector(
        "#status-checkbox-group"
      );

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
      const checkboxes = e.currentTarget.querySelectorAll("cds-checkbox");

      checkboxes.forEach((checkbox) => {
        if (checkbox != e.target) {
          checkbox.checked = false;
        }
      });

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
  }
);
