/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import { closeIcon, locationIcon } from "../../icons.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .display-none {
      display: none;
    }

    #info-box {
      position: fixed;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    #close-button {
      position: absolute;
      top: 0;
      right: 0;
      margin: 0;
      padding: 0.75rem;
      background: unset;
      border: none;
      color: var(--cds-ui-05, #f4f4f4);
      cursor: pointer;
    }

    #layer-info-container {
      max-height: 15rem;
      overflow: auto;
    }

    #layer-info-container section {
      display: flex;
      flex-direction: column;
      row-gap: 0.25rem;
      width: 260px;
      padding: 0.75rem;
      background-color: var(--cds-ui-01, #262626);
      border-bottom: 1px solid var(--cds-ui-04, #6f6f6f);
    }

    #layer-info-container section h3 {
      margin: 0 0 0.5rem 0;
      color: var(--cds-text-01, #f4f4f4);
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      letter-spacing: 0.16px;
    }

    .property-container {
      display: flex;
      justify-content: space-between;
    }

    .property-container p,
    #coordinates p {
      margin: 0;
      color: var(--cds-text-02, #c6c6c6);
      font-size: 14px;
      font-weight: 400;
      line-height: 1rem;
      letter-spacing: 0.32px;
    }

    #coordinates-container {
      display: flex;
      column-gap: 0.5rem;
      width: 260px;
      padding: 0.75rem;
      background-color: var(--cds-ui-02, #393939);
    }

    #coordinates-container svg {
      color: var(--cds-ui-05, #f4f4f4);
    }

    #coordinates {
      display: flex;
      flex-direction: column;
      row-gap: 0.25rem;
    }

    #loading-skeleton {
      position: relative;
      padding: 0;
      border: none;
      background-color: var(--cds-ui-01, #262626);
      box-shadow: none;
      pointer-events: none;
      width: 100%;
      height: 56px;
    }

    #loading-skeleton::before {
      position: absolute;
      animation: 3s ease-in-out skeleton infinite;
      background: var(--cds-ui-04, #6f6f6f);
      block-size: 100%;
      content: "";
      inline-size: 100%;
      will-change: transform-origin, transform, opacity;
    }

    @keyframes skeleton {
      0% {
        opacity: 0.3;
        transform: scaleX(0);
        transform-origin: left;
      }
      20% {
        opacity: 1;
        transform: scaleX(1);
        transform-origin: left;
      }
      28% {
        transform: scaleX(1);
        transform-origin: right;
      }
      51% {
        transform: scaleX(0);
        transform-origin: right;
      }
      58% {
        transform: scaleX(0);
        transform-origin: right;
      }
      82% {
        transform: scaleX(1);
        transform-origin: right;
      }
      83% {
        transform: scaleX(1);
        transform-origin: left;
      }
      96% {
        transform: scaleX(0);
        transform-origin: left;
      }
      100% {
        opacity: 0.3;
        transform: scaleX(0);
        transform-origin: left;
      }
    }
  </style>

  <div id="info-box" class="display-none">
    <button id="close-button">${closeIcon({ width: 16, height: 16 })}</button>
    <div id="loading-skeleton"></div>
    <div id="layer-info-container"></div>
    <div id="coordinates-container">
      ${locationIcon({ width: 16, height: 16 })}
      <div id="coordinates">
        <p id="latitude-label"></p>
        <p id="longitude-label"></p>
      </div>
    </div>
  </div>
`;

window.customElements.define(
  "info-box",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.currentPosition = { x: 0, y: 0 };

      this.infoBox = this.shadow.querySelector("#info-box");
      this.closeButton = this.shadow.querySelector("#close-button");
      this.loadingSkeleton = this.shadow.querySelector("#loading-skeleton");
      this.layerInfoContainer = this.shadow.querySelector(
        "#layer-info-container"
      );
      this.latitudeLabel = this.shadow.querySelector("#latitude-label");
      this.longitudeLabel = this.shadow.querySelector("#longitude-label");

      this.closeButton.addEventListener("click", () => {
        this.hideInfoBox();
      });

      window.addEventListener("pointerdown", (e) => {
        this.currentPosition.x = e.pageX;
        this.currentPosition.y = e.pageY;
      });
    }

    setInfoBoxPosition() {
      if (
        this.currentPosition.y + this.infoBox.offsetHeight <
        window.innerHeight
      ) {
        this.infoBox.style.top = this.currentPosition.y + "px";
      } else {
        this.infoBox.style.top =
          this.currentPosition.y - this.infoBox.offsetHeight + "px";
      }

      if (
        this.currentPosition.x + this.infoBox.offsetWidth <
        window.innerWidth
      ) {
        this.infoBox.style.left = this.currentPosition.x + "px";
      } else {
        this.infoBox.style.left =
          this.currentPosition.x - this.infoBox.offsetWidth + "px";
      }
    }

    showInfoBox() {
      this.infoBox.classList.remove("display-none");
    }

    hideInfoBox() {
      this.infoBox.classList.add("display-none");
    }

    setupInfoBox(coordinates, layers, loading) {
      this.layerInfoContainer.innerHTML = "";

      this.showInfoBox();

      this.latitudeLabel.innerHTML =
        "Latitude: " + Number(coordinates.latitude).toFixed(6);
      this.longitudeLabel.innerHTML =
        "Longitude: " + Number(coordinates.longitude).toFixed(6);

      layers.forEach((layer) => {
        this.layerInfoContainer.innerHTML +=
          this._renderLayerInfoSection(layer);
      });

      if (loading) {
        this.layerInfoContainer.classList.add("display-none");
        this.loadingSkeleton.classList.remove("display-none");
      } else {
        this.loadingSkeleton.classList.add("display-none");
        this.layerInfoContainer.classList.remove("display-none");
      }

      this.setInfoBoxPosition();
    }

    formatNumberValue(value) {
      if (isNaN(value) || value == null) {
        return value;
      }

      value = Number(value);

      if (Number.isInteger(value)) {
        return value;
      }

      return value.toFixed(3);
    }

    _renderLayerInfoSection = (layer) => /* HTML */ `
      <section>
        <h3>${layer.name}</h3>
        ${Object.keys(layer.properties)
          .map(
            (propertyKey) => /* HTML */ `
              <div class="property-container">
                <p class="property-label">
                  ${propertyKey === "GRAY_INDEX" ? "Value:" : propertyKey + ":"}
                </p>
                <p class="property-value">
                  ${this.formatNumberValue(layer.properties[propertyKey])}
                </p>
              </div>
            `
          )
          .join("\n")}
      </section>
    `;
  }
);
