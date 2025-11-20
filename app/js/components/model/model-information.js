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
  "model-information",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.model;
      this.catalogGroup;
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

    setupInformation(model, catalogGroup) {
      this.model = model;
      this.catalogGroup = catalogGroup;

      this.setupTags();
      this.descriptionContainer.innerHTML = this.model.description;
      this.specificationsContainer.innerHTML = this._renderSpecifications(
        this.model
      );
    }

    setupTags() {
      let tags = [];

      tags.push({
        name: this.catalogGroup,
        color:
          this.catalogGroup === "tune"
            ? "purple"
            : this.catalogGroup === "model"
            ? "cyan"
            : "teal",
      });

      tags.push({
        name: this.model.active ? "active" : "inactive",
        color: this.model.active ? "green" : "red",
      });

      if (this.catalogGroup != "base_model") {
        tags.push({
          name: this.model.status,
          color: this.getStatusColor(this.model.status),
        });
      }

      this.tagsContainer.innerHTML = "";

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

    _renderSpecifications = (model) => /* HTML */ `
      <p>
        <span class="spec-title">ID:</span>
        <span class="spec-value">${model.id}</span>
      </p>
      <p>
        <span class="spec-title">Created:</span>
        <span class="spec-value"
          >${formatdataSetDateString(model.created_at)}</span
        >
      </p>
      <p>
        <span class="spec-title">Updated:</span>
        <span class="spec-value"
          >${formatdataSetDateString(model.updated_at)}</span
        >
      </p>
      <p>
        <span class="spec-title">Owner:</span>
        <span class="spec-value">${model.created_by}</span>
      </p>
      <p>
        <span class="spec-title">Active:</span>
        <span class="spec-value">${model.active}</span>
      </p>
      <p>
        <span class="spec-title">Status:</span>
        <span class="spec-value"
          >${this.catalogGroup === "base_model"
            ? "Finished"
            : model.status}</span
        >
      </p>
    `;

    getStatusColor(status) {
      switch (status) {
        case "Succeeded":
        case "Finished":
        case "COMPLETED":
          return "green";
        case "Failed":
          return "red";
        default:
          return "grey";
      }
    }
  }
);
