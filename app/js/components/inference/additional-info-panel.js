/*
 * © Copyright IBM Corporation 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import asWebComponent from "../../webcomponent.js";
import { closeIcon, chevronDownIcon, chevronUpIcon } from "../../icons.js";
import "../../libs/carbon-web-components/tabs.min.js";
import { marked } from "../../libs/marked/marked.js";

// DOMPurify will be loaded dynamically
let DOMPurify = null;

// Load DOMPurify dynamically
const loadDOMPurify = async () => {
  if (!DOMPurify) {
    const module = await import("../../libs/dompurify/purify.js");
    DOMPurify = module.default || module;
  }
  return DOMPurify;
};

// Configure marked for security
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false,
});

const template = (obj) => /* HTML */ `
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :host {
      display: flex;
      flex-direction: column;
      position: fixed;
      width: 400px;
      max-height: 600px;
      background: var(--cds-field-01, #262626);
      border-radius: 0.5rem;
      box-shadow: rgba(0, 0, 0, 0.3) 0px 2px 6px 0px;
      z-index: 4;
      cursor: default;
    }

    :host(.display-none) {
      display: none;
    }

    :host(.dragging) {
      cursor: move;
      opacity: 0.9;
    }

    :host(.minimized) {
      max-height: 48px;
    }

    :host(.minimized) #panel-body {
      display: none;
    }

    #panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: var(--cds-layer-02, #393939);
      border-radius: 0.5rem 0.5rem 0 0;
      cursor: move;
      user-select: none;
    }

    #panel-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--cds-text-01, #f4f4f4);
      flex: 1;
    }

    #panel-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    button {
      background: transparent;
      border: none;
      padding: 0.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--cds-icon-01, #f4f4f4);
      transition: background-color 0.2s;
      border-radius: 0.25rem;
    }

    button:hover {
      background: var(--cds-layer-hover-02, #4c4c4c);
    }

    button:active {
      background: var(--cds-layer-active-02, #6f6f6f);
    }

    button svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    #panel-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    cds-tabs {
      background: var(--cds-layer-01, #262626);
      border-bottom: 1px solid var(--cds-border-subtle-01, #525252);
    }

    #content-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      color: var(--cds-text-01, #f4f4f4);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    #content-container::-webkit-scrollbar {
      width: 8px;
    }

    #content-container::-webkit-scrollbar-track {
      background: var(--cds-layer-01, #262626);
    }

    #content-container::-webkit-scrollbar-thumb {
      background: var(--cds-border-subtle-01, #525252);
      border-radius: 4px;
    }

    #content-container::-webkit-scrollbar-thumb:hover {
      background: var(--cds-border-strong-01, #8d8d8d);
    }

    /* Markdown content styling */
    #content-container h1,
    #content-container h2,
    #content-container h3,
    #content-container h4,
    #content-container h5,
    #content-container h6 {
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--cds-text-01, #f4f4f4);
    }

    #content-container h1 {
      font-size: 1.5rem;
    }
    #content-container h2 {
      font-size: 1.25rem;
    }
    #content-container h3 {
      font-size: 1.125rem;
    }
    #content-container h4 {
      font-size: 1rem;
    }
    #content-container h5 {
      font-size: 0.875rem;
    }
    #content-container h6 {
      font-size: 0.75rem;
    }

    #content-container p {
      margin-bottom: 0.75rem;
    }

    #content-container ul,
    #content-container ol {
      margin-left: 1.5rem;
      margin-bottom: 0.75rem;
    }

    #content-container li {
      margin-bottom: 0.25rem;
    }

    #content-container code {
      background: var(--cds-layer-02, #393939);
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.8125rem;
    }

    #content-container pre {
      background: var(--cds-layer-02, #393939);
      padding: 0.75rem;
      border-radius: 0.25rem;
      overflow-x: auto;
      margin-bottom: 0.75rem;
    }

    #content-container pre code {
      background: transparent;
      padding: 0;
    }

    #content-container a {
      color: var(--cds-link-01, #78a9ff);
      text-decoration: none;
    }

    #content-container a:hover {
      text-decoration: underline;
    }

    #content-container blockquote {
      border-left: 3px solid var(--cds-border-subtle-01, #525252);
      padding-left: 1rem;
      margin-left: 0;
      margin-bottom: 0.75rem;
      color: var(--cds-text-02, #c6c6c6);
    }

    #content-container table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0.75rem;
    }

    #content-container th,
    #content-container td {
      border: 1px solid var(--cds-border-subtle-01, #525252);
      padding: 0.5rem;
      text-align: left;
    }

    #content-container th {
      background: var(--cds-layer-02, #393939);
      font-weight: 600;
    }

    #content-container hr {
      border: none;
      border-top: 1px solid var(--cds-border-subtle-01, #525252);
      margin: 1rem 0;
    }

    #content-container img {
      max-width: 100%;
      height: auto;
      border-radius: 0.25rem;
      margin-bottom: 0.75rem;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--cds-text-02, #c6c6c6);
      font-style: italic;
    }

    .display-none {
      display: none;
    }
  </style>

  <div id="panel-header">
    <div id="panel-title">Additional Information</div>
    <div id="panel-controls">
      <button
        id="minimize-button"
        title="Minimize panel"
        aria-label="Minimize panel"
      >
        ${chevronUpIcon()}
      </button>
      <button id="close-button" title="Close panel" aria-label="Close panel">
        ${closeIcon()}
      </button>
    </div>
  </div>

  <div id="panel-body">
    <cds-tabs value="inference" id="tabs-container">
      <cds-tab id="inference-tab" value="inference"
        >Inference</cds-tab
      >
    </cds-tabs>

    <div id="content-container"></div>
  </div>
`;

window.customElements.define(
  "additional-info-panel",
  class extends asWebComponent(HTMLElement) {
    init() {
      // State
      this.inferenceInfo = null;
      this.layerInfoMap = new Map(); // Map of layerId -> layer info
      this.currentTab = "inference";
      this.isMinimized = false;
      this.isDragging = false;
      this.position = { x: 0, y: 0 };
      this.dragOffset = { x: 0, y: 0 };

      // Bind methods
      this.handleMouseDown = this.handleMouseDown.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleMinimize = this.handleMinimize.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.handleTabChange = this.handleTabChange.bind(this);
    }

    render() {
      this.setDOM(template(this));
      this.setupEventListeners();
      this.loadState();
      this.updatePosition();
    }

    disconnectedCallback() {
      this.removeEventListeners();
    }

    setupEventListeners() {
      const header = this.shadowRoot.getElementById("panel-header");
      const minimizeBtn = this.shadowRoot.getElementById("minimize-button");
      const closeBtn = this.shadowRoot.getElementById("close-button");
      const tabs = this.shadowRoot.querySelector("cds-tabs");

      header.addEventListener("mousedown", this.handleMouseDown);
      minimizeBtn.addEventListener("click", this.handleMinimize);
      closeBtn.addEventListener("click", this.handleClose);
      tabs.addEventListener("cds-tabs-selected", this.handleTabChange);
    }

    removeEventListeners() {
      document.removeEventListener("mousemove", this.handleMouseMove);
      document.removeEventListener("mouseup", this.handleMouseUp);
    }

    handleMouseDown(e) {
      // Only drag if clicking on header, not buttons
      if (e.target.closest("button")) return;

      this.isDragging = true;
      this.classList.add("dragging");

      const rect = this.getBoundingClientRect();
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      document.addEventListener("mousemove", this.handleMouseMove);
      document.addEventListener("mouseup", this.handleMouseUp);

      e.preventDefault();
    }

    handleMouseMove(e) {
      if (!this.isDragging) return;

      const x = e.clientX - this.dragOffset.x;
      const y = e.clientY - this.dragOffset.y;

      // Constrain to viewport
      const maxX = window.innerWidth - this.offsetWidth;
      const maxY = window.innerHeight - this.offsetHeight;

      this.position = {
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY)),
      };

      this.updatePosition();
    }

    handleMouseUp() {
      if (this.isDragging) {
        this.isDragging = false;
        this.classList.remove("dragging");
        this.saveState();

        document.removeEventListener("mousemove", this.handleMouseMove);
        document.removeEventListener("mouseup", this.handleMouseUp);

        this.dispatchEvent(
          new CustomEvent("position-changed", {
            detail: { position: this.position },
          })
        );
      }
    }

    handleMinimize(e) {
      e.stopPropagation();
      this.isMinimized = !this.isMinimized;

      if (this.isMinimized) {
        this.classList.add("minimized");
        this.shadowRoot.getElementById("minimize-button").innerHTML =
          chevronDownIcon();
        this.shadowRoot.getElementById("minimize-button").title =
          "Expand panel";
        this.dispatchEvent(new CustomEvent("minimize-panel"));
      } else {
        this.classList.remove("minimized");
        this.shadowRoot.getElementById("minimize-button").innerHTML =
          chevronUpIcon();
        this.shadowRoot.getElementById("minimize-button").title =
          "Minimize panel";
        this.dispatchEvent(new CustomEvent("expand-panel"));
      }

      this.saveState();
    }

    handleClose(e) {
      e.stopPropagation();
      this.classList.add("display-none");
      this.dispatchEvent(new CustomEvent("close-panel"));
      this.saveState();
    }

    handleTabChange(e) {
      console.log('Tab change event:', e);
      console.log('Event detail:', e.detail);
      
      // Extract the tab ID from the selected item
      // The ID format is "layer-tab-{layerId}" or "inference-tab"
      const tabId = e.detail?.item?.id;
      console.log('Tab ID:', tabId);
      
      if (tabId) {
        // Extract the actual tab value from the ID
        // For "layer-tab-layer-0" -> "layer-layer-0"
        // For "inference-tab" -> "inference"
        let newTab;
        if (tabId.startsWith('layer-tab-')) {
          newTab = tabId.replace('layer-tab-', '');
        } else if (tabId === 'inference-tab') {
          newTab = 'inference';
        }
        
        console.log('Extracted tab value:', newTab);
        
        if (newTab) {
          this.currentTab = newTab;
          console.log('Updated currentTab to:', this.currentTab);
          this.updateContent();
          this.dispatchEvent(
            new CustomEvent("tab-changed", {
              detail: { tab: this.currentTab },
            })
          );
        }
      } else {
        console.log('No tab ID found, currentTab remains:', this.currentTab);
      }
    }

    updatePosition() {
      console.log('updatePosition called with:', this.position);
      console.log('Window dimensions:', window.innerWidth, 'x', window.innerHeight);
      console.log('Panel dimensions:', this.offsetWidth, 'x', this.offsetHeight);
      console.log('Setting style.left to:', `${this.position.x}px`);
      console.log('Setting style.top to:', `${this.position.y}px`);
      this.style.left = `${this.position.x}px`;
      this.style.top = `${this.position.y}px`;
      console.log('Actual style.left:', this.style.left);
      console.log('Actual style.top:', this.style.top);
    }

    setInferenceInfo(info) {
      this.inferenceInfo = info;
      this.updateTabs();
      this.updateContent();
    }

    addLayerInfo(layerId, info) {
      this.layerInfoMap.set(layerId, info);
      this.updateTabs();
      // Update content after tabs are updated, as the current tab may have changed
      this.updateContent();
    }

    removeLayerInfo(layerId) {
      this.layerInfoMap.delete(layerId);
      // If current tab is the removed layer, switch to inference or first available layer
      if (this.currentTab === layerId) {
        if (this.inferenceInfo && this.inferenceInfo.content) {
          this.currentTab = "inference";
        } else if (this.layerInfoMap.size > 0) {
          this.currentTab = Array.from(this.layerInfoMap.keys())[0];
        }
      }
      this.updateTabs();
      this.updateContent();
    }

    clearAllLayerInfo() {
      this.layerInfoMap.clear();
      this.updateTabs();
      this.updateContent();
    }

    updateTabs() {
      const tabs = this.shadowRoot.querySelector("cds-tabs");
      if (!tabs) return;

      const inferenceTab = this.shadowRoot.querySelector("#inference-tab");
      if (!inferenceTab) return;

      const hasInferenceInfo = this.inferenceInfo && this.inferenceInfo.content;
      const hasLayerInfo = this.layerInfoMap.size > 0;

      // Show/hide inference tab
      if (hasInferenceInfo) {
        inferenceTab.classList.remove("display-none");
      } else {
        inferenceTab.classList.add("display-none");
      }

      // Remove all existing layer tabs
      const existingLayerTabs = this.shadowRoot.querySelectorAll('[id^="layer-tab-"]');
      existingLayerTabs.forEach(tab => tab.remove());

      // Add tabs for each layer
      this.layerInfoMap.forEach((info, layerId) => {
        const layerTab = document.createElement("cds-tab");
        layerTab.id = `layer-tab-${layerId}`;
        layerTab.setAttribute("value", `layer-${layerId}`);
        layerTab.textContent = info.title || `Layer ${layerId}`;
        tabs.appendChild(layerTab);
      });

      // Set default tab if current tab is not valid
      const validTabs = [];
      if (hasInferenceInfo) validTabs.push("inference");
      this.layerInfoMap.forEach((_, layerId) => validTabs.push(layerId));

      if (!validTabs.includes(this.currentTab) && validTabs.length > 0) {
        this.currentTab = validTabs[0];
      }

      if (validTabs.includes(this.currentTab)) {
        tabs.value = this.currentTab;
      }

      // Show tabs if there are multiple sources (inference + layers, or multiple layers)
      const totalSources = (hasInferenceInfo ? 1 : 0) + this.layerInfoMap.size;
      if (totalSources > 1) {
        tabs.style.display = "block";
      } else {
        tabs.style.display = "none";
      }
    }

    async updateContent() {
      const container = this.shadowRoot.getElementById("content-container");

      let content = "";
      if (this.currentTab === "inference" && this.inferenceInfo?.content) {
        content = this.inferenceInfo.content;
      } else if (this.currentTab) {
        // currentTab is the layerId directly (e.g., "layer-0")
        const layerInfo = this.layerInfoMap.get(this.currentTab);
        if (layerInfo?.content) {
          content = layerInfo.content;
        }
      }

      if (content) {
        const html = marked.parse(content);

        // Load DOMPurify if not already loaded
        const purify = await loadDOMPurify();

        const sanitized = purify.sanitize(html, {
          ALLOWED_TAGS: [
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "p",
            "br",
            "hr",
            "ul",
            "ol",
            "li",
            "strong",
            "em",
            "code",
            "pre",
            "a",
            "img",
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td",
            "blockquote",
          ],
          ALLOWED_ATTR: ["href", "src", "alt", "title", "class"],
        });
        container.innerHTML = sanitized;
      } else {
        container.innerHTML =
          '<div class="empty-state">No additional information available</div>';
      }
    }

    show() {
      console.log('show() called');
      console.log('Current position:', this.position);
      this.classList.remove("display-none");
      console.log('display-none class removed');

      // Wait for the browser to render the panel so we can get its dimensions
      requestAnimationFrame(() => {
        console.log('After render - offsetWidth:', this.offsetWidth, 'offsetHeight:', this.offsetHeight);
        
        // Set default position if not set
        if (this.position.x === 0 && this.position.y === 0) {
          this.position = {
            x: window.innerWidth - this.offsetWidth - 25,
            y: 150,
          };
          console.log('Position set to:', this.position);
        } else {
          console.log('Position already set:', this.position);
        }
        
        // Always update position to ensure it's applied
        this.updatePosition();
      });
    }

    hide() {
      this.classList.add("display-none");
    }

    saveState() {
      const state = {
        position: this.position,
        isMinimized: this.isMinimized,
        currentTab: this.currentTab,
        visible: !this.classList.contains("display-none"),
      };
      localStorage.setItem("additionalInfoPanelState", JSON.stringify(state));
    }

    loadState() {
      const saved = localStorage.getItem("additionalInfoPanelState");
      if (saved) {
        try {
          const state = JSON.parse(saved);
          this.position = state.position || this.position;
          this.isMinimized = state.isMinimized || false;
          this.currentTab = state.currentTab || "inference";

          if (this.isMinimized) {
            this.classList.add("minimized");
            this.shadowRoot.getElementById("minimize-button").innerHTML =
              chevronDownIcon();
          }

          this.updatePosition();
        } catch (e) {
          console.error("Failed to load panel state:", e);
        }
      }
    }
  }
);

// Made with Bob
