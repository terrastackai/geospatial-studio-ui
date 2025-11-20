/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/tile.min.js";
import "../../libs/carbon-web-components/tag.min.js";
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

    refresh-timer {
      align-self: flex-end;
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
      aspect-ratio: 2 / 1;
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
      margin-bottom: 2rem;
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

    #grid-view-container[loading] #cards-container,
    #grid-view-container[loading] #load-more-button {
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
  "model-catalog-grid-view",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.state = {
        query: "",
        purpose: [],
        status: [],
        tab: "models-and-tunes",
        type: [],
      };

      this.catalog = [];

      this.latestRequestID = 0;
    }

    render() {
      this.setDOM(template(this));

      this.gridViewContainer = this.shadow.querySelector(
        "#grid-view-container"
      );
      this.cardsContainer = this.shadow.querySelector("#cards-container");
      this.loadMoreButton = this.shadow.querySelector("#load-more-button");
      this.refreshTimer = this.shadow.querySelector("refresh-timer");

      this.loadMoreButton.addEventListener("click", () => {
        this.loadData();
      });

      this.refreshTimer.addEventListener("refresh", () => {
        this.cardsContainer.innerHTML = "";
        this.loadData(true);
      });

      this.loadData();
    }

    setLoading() {
      this.gridViewContainer.setAttribute("loading", "");
      this.refreshTimer.disable();
    }

    onSearch(e) {
      this.catalog = [];
      this.cardsContainer.innerHTML = "";
      this.state.query = e.detail;
      this.loadData();
    }

    onFilterChange(e) {
      if (e.detail.checked) {
        this.state[e.detail.filterGroup].push(e.detail.filter);
      } else {
        let index = this.state[e.detail.filterGroup].indexOf(e.detail.filter);

        if (index != -1) {
          this.state[e.detail.filterGroup].splice(index, 1);
        }
      }

      this.catalog = [];
      this.cardsContainer.innerHTML = "";
      this.loadData();
    }

    onTabChange(e) {
      this.state.tab = e;

      this.catalog = [];
      this.cardsContainer.innerHTML = "";
      this.loadData();
    }

    setupTile(item) {
      const tileTemplate = document.createElement("template");
      tileTemplate.innerHTML = this._renderTile(item);
      const tileElement = tileTemplate.content.firstElementChild;

      tileElement.addEventListener("click", () => {
        goToUrl(
          "#model?id=" +
            item.id +
            "&model_type=" +
            (item.model_type || "Base_Model")
        );
      });

      this.cardsContainer.appendChild(tileElement);
    }

    loadData(refresh = false) {
      this.setLoading();

      if (this.state.tab === "models-and-tunes") {
        this.loadModelsAndTunes(refresh);
      } else {
        this.loadBaseModels(refresh);
      }
    }

    async loadModelsAndTunes(refresh) {
      const requestID = ++this.latestRequestID;

      try {
        let response;

        if (refresh) {
          response = await app.backend.getModelsAndTunes(
            this.catalog.length,
            0,
            this.state.query,
            this.state.purpose,
            this.state.status,
            this.state.type.length === 1 ? this.state.type : null
          );

          this.catalog = [];
        } else {
          response = await app.backend.getModelsAndTunes(
            10,
            this.catalog.length,
            this.state.query,
            this.state.purpose,
            this.state.status,
            this.state.type.length === 1 ? this.state.type : null
          );
        }

        if (requestID != this.latestRequestID) return;

        if ("results" in response) {
          for (let result of response.results) {
            this.catalog.push(result);

            this.setupTile(result);
          }

          if (response.total_records > this.catalog.length) {
            this.loadMoreButton.classList.remove("display-none");
          } else {
            this.loadMoreButton.classList.add("display-none");
          }

          this.refreshTimer.stopAutoRefresh();
          this.refreshTimer.startAutoRefresh();
        } else {
          app.showMessage(
            "Failed to load models and tunes: " +
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

        console.error("Error loading models and tunes:", error);
        app.showMessage(
          "An error occured while loading the models and tunes",
          "",
          "error",
          5000
        );

        return false;
      }

      if (requestID != this.latestRequestID) return;
      this.gridViewContainer.removeAttribute("loading");
    }

    async loadBaseModels(refresh) {
      const requestID = ++this.latestRequestID;

      try {
        let response;

        if (refresh) {
          response = await app.backend.getBaseModels(
            this.catalog.length,
            0,
            null,
            this.state.query,
            this.state.purpose,
            this.state.status
          );

          this.catalog = [];
        } else {
          response = await app.backend.getBaseModels(
            10,
            this.catalog.length,
            null,
            this.state.query,
            this.state.purpose,
            this.state.status
          );
        }

        if (requestID != this.latestRequestID) return;

        if ("results" in response) {
          for (let result of response.results) {
            this.catalog.push(result);

            this.setupTile(result);
          }

          if (response.total_records > this.catalog.length) {
            this.loadMoreButton.classList.remove("display-none");
          } else {
            this.loadMoreButton.classList.add("display-none");
          }

          this.refreshTimer.stopAutoRefresh();
          this.refreshTimer.startAutoRefresh();
        } else {
          app.showMessage(
            "Failed to load base models: " +
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

        console.error("Error loading base models:", error);
        app.showMessage(
          "An error occured while loading the base models",
          "",
          "error",
          5000
        );

        return false;
      }

      if (requestID != this.latestRequestID) return;
      this.gridViewContainer.removeAttribute("loading");
    }

    _renderTile = (model) => /* HTML */ `
      <cds-tile>
        <h4 title="${model.name}">${model.name}</h4>
        <p title="${model.description}">${model.description}</p>
        <div class="tags-container">
          <cds-tag
            type="${model.model_type === "Tune"
              ? "purple"
              : model.model_type === "Model"
              ? "cyan"
              : "teal"}"
            title="${model.model_type ? model.model_type : "Base Model"}"
            >${model.model_type ? model.model_type : "Base Model"}</cds-tag
          >
          <cds-tag
            ${!model.status ? "style='display: none;'" : ""}
            type="${this.getStatusColor(model.status)}"
            title="${model.status.charAt(0).toUpperCase() +
            model.status.slice(1).toLowerCase()}"
          >
            ${(
              model.status.charAt(0).toUpperCase() +
              model.status.slice(1).toLowerCase()
            ).replace("_", " ")}
          </cds-tag>
          <cds-tag
            type="${model.active_ || model.active ? "green" : "grey"}"
            title="${model.active_ ? "active" : "inactive"}"
            >${model.active_ || model.active ? "active" : "inactive"}</cds-tag
          >
        </div>
        <div class="tile-chevron">
          ${arrowRightIcon({ width: 16, height: 16, color: "#f4f4f4" })}
        </div>
      </cds-tile>
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
