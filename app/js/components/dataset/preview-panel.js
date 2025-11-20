/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import { replaceHttpWithHttps } from "../../utils.js";
import "./georaster-preview.js";

const template = (obj) => /* HTML */ `
  <style>
    #panel-container {
      width: 100%;
      height: 100%;
      background: green;
    }
  </style>
  <div id="panel-container">
    <georaster-preview></georaster-preview>
  </div>
`;

window.customElements.define(
  "preview-panel",
  class extends asWebComponent(HTMLElement) {
    render = () => {
      this.setDOM(template(this));
      this.georasterPreview = this.shadow.querySelector("georaster-preview");
    };

    setImageAndLabelUrls = (image, label) => {
      if (image?.url?.length > 0 && label?.url?.length > 0) {
        image.url = replaceHttpWithHttps(image.url);
        label.url = replaceHttpWithHttps(label.url);
        this.georasterPreview.loadGeorasterForImageAndLabel(image, label);
      }
    };

    hideLayer = (layerId) => {
      this.georasterPreview.hideLayer(layerId);
    };

    showLayer = (layerId) => {
      this.georasterPreview.showLayer(layerId);
    };
  }
);
