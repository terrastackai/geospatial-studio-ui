/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/tile.min.js";
import "../../libs/carbon-web-components/tag.min.js";
import "../../libs/carbon-web-components/button.min.js";
import { arrowRightIcon } from "../../icons.js";
import { goToUrl } from "../../router.js";
import "../refresh-timer.js";

const template = () => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
    }

    .display-none {
      display: none;
    }

    #grid-view-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      row-gap: 1rem;
      width: 100%;
    }

    #cards-container {
      display: flex;
      column-gap: 1rem;
      row-gap: 1rem;
      flex-wrap: wrap;
      width: 100%;
    }

    cds-tile {
      position: relative;
      width: 22rem;
      aspect-ratio: 5 / 6;
      padding: 1rem 1rem 2rem;
      cursor: pointer;
    }

    cds-tile:hover {
      background: var(--cds-ui-03, #393939);
    }

    h4,
    p {
      margin: 0;
      font-size: 1rem;
      font-weight: 400;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    h4 {
      margin-bottom: 1rem;
    }

    p {
      margin-bottom: 1rem;
    }

    img {
      width: 100%;
      aspect-ratio: 3 / 2;
      margin-bottom: 1rem;
      object-fit: cover;
      background: red;
    }

    refresh-timer {
      align-self: flex-end;
    }

    .tags-container {
      display: flex;
      column-gap: 0.25rem;
      row-gap: 0.25rem;
      flex-wrap: nowrap;
      overflow: auto;
    }

    cds-tag {
      min-width: fit-content;
    }

    .tile-chevron {
      position: absolute;
      bottom: 0.5rem;
      right: 1rem;
    }

    cds-btn {
      width: fit-content;
    }

    #grid-view-container[loading] #cards-container {
      display: none;
    }

    #grid-view-container:not([loading]) cds-loading {
      display: none;
    }

    cds-loading {
      margin: 4rem 0;
    }

    @media screen and (max-width: 500px) {
      cds-tile {
        width: 100%;
        aspect-ratio: unset;
        height: fit-content;
      }

      .tags-container {
        flex-wrap: wrap;
      }
    }
  </style>

  <div id="grid-view-container">
    <refresh-timer></refresh-timer>
    <cds-loading
      active="true"
      description="Loading"
      assistive-text="Loading"
    ></cds-loading>
    <div id="cards-container"></div>
    <cds-button
      id="load-more-button"
      class="display-none"
      kind="primary"
      size="md"
    >
      Load more
    </cds-button>
  </div>
`;

window.customElements.define(
  "data-catalog-grid-view",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.datasets = [];
      this.state = { query: "", purpose: null, status: null };

      this.latestRequestID = 0;
    }

    render() {
      this.setDOM(template(this));

      this.gridViewContainer = this.shadow.querySelector(
        "#grid-view-container"
      );
      this.tileContainer = this.shadow.querySelector("#cards-container");
      this.loadMoreButton = this.shadow.querySelector("#load-more-button");
      this.refreshTimer = this.shadow.querySelector("refresh-timer");

      this.loadMoreButton.addEventListener("click", () => {
        this.loadDatasets();
      });

      this.refreshTimer.addEventListener("refresh", () => {
        this.loadDatasets(true);
      });

      this.loadDatasets();
    }

    setLoading() {
      this.gridViewContainer.setAttribute("loading", "");
      this.refreshTimer.disable();
    }

    onSearch(e) {
      this.datasets = [];
      this.tileContainer.innerHTML = "";
      this.state.query = e.detail;
      this.loadDatasets();
    }

    onFilterChange(e) {
      if (e.detail.checked) {
        this.state[e.detail.filterGroup] = e.detail.filter;
      } else {
        this.state[e.detail.filterGroup] = null;
      }

      this.datasets = [];
      this.tileContainer.innerHTML = "";
      this.loadDatasets();
    }

    async loadDatasets(refresh = false) {
      this.setLoading();
      this.loadMoreButton.classList.add("display-none");

      const requestID = ++this.latestRequestID;

      try {
        let response;

        if (refresh) {
          response = await app.backend.getDatasetsV2(
            this.datasets.length,
            0,
            this.state.query,
            this.state.purpose,
            this.state.status
          );

          this.datasets = [];
        } else {
          response = await app.backend.getDatasetsV2(
            10,
            this.datasets.length,
            this.state.query,
            this.state.purpose,
            this.state.status
          );
        }

        if (requestID != this.latestRequestID) return;

        if ("results" in response) {
          for (let result of response.results) {
            this.datasets.push(result);
          }

          if (response.total_records > this.datasets.length) {
            this.loadMoreButton.classList.remove("display-none");
          }

          this.setupTiles();
          this.refreshTimer.stopAutoRefresh();
          this.refreshTimer.startAutoRefresh();
        } else {
          app.showMessage(
            "Failed to load datasets: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        if (requestID != this.latestRequestID) return;

        console.error("Error loading datasets:", error);
        app.showMessage(
          "An error occured while loading the datasets",
          "",
          "error",
          5000
        );

        return false;
      }

      if (requestID != this.latestRequestID) return;

      this.gridViewContainer.removeAttribute("loading");
    }

    setupTiles() {
      this.tileContainer.innerHTML = "";

      this.datasets.forEach((dataset) => {
        const tileTemplate = document.createElement("template");
        tileTemplate.innerHTML = this._renderTile(dataset);
        const tileElement = tileTemplate.content.firstElementChild;

        tileElement.addEventListener("click", () => {
          goToUrl("#dataset?id=" + dataset.id);
        });

        this.tileContainer.appendChild(tileElement);
      });
    }

    _renderTile = (datasetsObject) => /* HTML */ `
      <cds-tile>
        <h4 title="${datasetsObject.dataset_name}">
          ${datasetsObject.dataset_name}
        </h4>
        <p title="${datasetsObject.description}">
          ${datasetsObject.description}
        </p>
        <img src="../../../images/map-image.png" />
        <div class="tags-container">
          <cds-tag type="gray" title="${datasetsObject.purpose}"
            >${datasetsObject.purpose}</cds-tag
          >
          <cds-tag
            type="${datasetsObject.status === "Succeeded"
              ? "green"
              : datasetsObject.status === "Pending"
              ? "grey"
              : "red"}"
            title="${datasetsObject.status}"
          >
            ${datasetsObject.status}
          </cds-tag>
          <cds-tag type="teal" title="${datasetsObject.size}"
            >${datasetsObject.size}</cds-tag
          >
        </div>
        <div class="tile-chevron">
          ${arrowRightIcon({ width: 16, height: 16, color: "#f4f4f4" })}
        </div>
      </cds-tile>
    `;
  }
);
