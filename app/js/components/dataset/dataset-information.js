/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/tag.min.js";
import "../../libs/carbon-web-components/link.min.js";
import { formatdataSetDateString } from "../../utils.js";

const template = () => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    #information-container {
      display: flex;
      flex-direction: column;
      row-gap: 2rem;
      flex-wrap: wrap;
      width: 100%;
    }

    #tags-container {
      display: flex;
      column-gap: 0.5rem;
      row-gap: 0.25rem;
      flex-wrap: nowrap;
      width: 100%;
      overflow: auto;
    }

    cds-tag {
      margin: 0;
      min-width: fit-content;
    }

    #columns-container {
      display: flex;
      column-gap: 2rem;
      row-gap: 2rem;
      width: 100%;
    }

    #description-container {
      flex-grow: 1;
      padding: 2rem;
      min-width: 20rem;
      background: var(--cds-ui-01, #262626);
      font-weight: 400;
      font-size: 0.875rem;
      color: var(--cds-text-01, #f4f4f4);
    }

    #specifications-container {
      display: flex;
      column-gap: 2rem;
      row-gap: 1rem;
      flex-wrap: wrap;
      min-width: 42rem;
      padding: 2rem;
      background: var(--cds-ui-01, #262626);
    }

    #specifications-container p {
      font-size: 0.875rem;
      width: calc(50% - 1rem);
      margin: 0;
    }

    .spec-title {
      color: var(--cds-text-02, #c6c6c6);
    }

    .spec-value {
    }

    @media screen and (max-width: 1200px) {
      #columns-container {
        flex-wrap: wrap;
      }

      #specifications-container {
        min-width: unset;
      }
    }

    @media screen and (max-width: 750px) {
      #specifications-container p {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
    }
  </style>

  <div id="information-container">
    <div id="tags-container"></div>
    <div id="columns-container">
      <div id="description-container"></div>
      <div id="specifications-container"></div>
    </div>
  </div>
`;

window.customElements.define(
  "dataset-information",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.datasetObject;
    }

    render() {
      this.setDOM(template(this));

      this.tagsContainer = this.shadow.querySelector("#tags-container");
      this.descriptionContainer = this.shadow.querySelector(
        "#description-container"
      );
      this.specificationsContainer = this.shadow.querySelector(
        "#specifications-container"
      );
    }

    setupInformation(datasetObject) {
      console.log(datasetObject);
      this.datasetObject = datasetObject;

      this.setupTags();
      this.descriptionContainer.innerHTML = this.datasetObject.description;
      this.specificationsContainer.innerHTML = this._renderSpecifications();
    }

    setupTags() {
      this.tagsContainer.innerHTML = "";
      const tags = [
        { name: this.datasetObject.purpose, color: "gray" },
        {
          name: this.datasetObject.status,
          color: `${
            this.datasetsObject.status === "Succeeded"
              ? "green"
              : this.datasetsObject.status === "Onboarding"
              ? "orange"
              : this.datasetsObject.status === "Pending"
              ? "grey"
              : "red"
          }`,
        },
        { name: this.datasetObject.size, color: "teal" },
      ];

      tags.forEach((tag) => {
        const tagTemplate = document.createElement("template");
        tagTemplate.innerHTML = this._renderTag(tag);
        const tagElement = tagTemplate.content.firstElementChild;

        this.tagsContainer.appendChild(tagElement);
      });
    }

    _renderTag = (tag) => /* HTML */ `
      <cds-tag type="${tag.color}" title="${tag.name}">${tag.name}</cds-tag>
    `;

    _renderSpecifications = () => /* HTML */ `
      <p>
        <span class="spec-title">ID:</span>
        <span class="spec-value">${this.datasetObject.id}</span>
      </p>
      <p>
        <span class="spec-title">Purpose:</span>
        <span class="spec-value">${this.datasetObject.purpose}</span>
      </p>
      <p>
        <span class="spec-title">Uploaded:</span>
        <span class="spec-value"
          >${formatdataSetDateString(this.datasetObject.created_at)}</span
        >
      </p>
      <p>
        <span class="spec-title">Size:</span>
        <span class="spec-value">${this.datasetObject.size}</span>
      </p>
      <p>
        <span class="spec-title">Creator:</span>
        <span class="spec-value">${this.datasetObject.created_by}</span>
      </p>
      <p>
        <span class="spec-title">Status:</span>
        <span class="spec-value">${this.datasetObject.status}</span>
      </p>
      <p>
        <span class="spec-title">Data sources:</span>
        <span class="spec-value"
          >${this.datasetObject.data_sources.length}</span
        >
      </p>
      <p>
        <span class="spec-title">Label categories:</span>
        <span class="spec-value"
          >${this.datasetObject.label_categories.length}</span
        >
      </p>
      <p>
        <span class="spec-title">Label suffix:</span>
        <span class="spec-value">${this.datasetObject.label_suffix}</span>
      </p>
    `;
  }
);
