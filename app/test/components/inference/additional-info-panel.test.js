/*
 * © Copyright IBM Corporation 2025
 * SPDX-License-Identifier: Apache-2.0
 */

import { expect, fixture, html } from "@open-wc/testing";
import "../../../js/components/inference/additional-info-panel.js";

// Note: marked and dompurify are imported within the component from libs folder

describe("additional-info-panel", () => {
  let element;

  beforeEach(async () => {
    element = await fixture(html`<additional-info-panel></additional-info-panel>`);
  });

  it("should render the component", () => {
    expect(element).to.exist;
    expect(element.shadowRoot).to.exist;
  });

  it("should have a header with title", () => {
    const header = element.shadowRoot.querySelector("#panel-header");
    const title = element.shadowRoot.querySelector("#title");
    expect(header).to.exist;
    expect(title).to.exist;
    expect(title.textContent).to.equal("Additional Information");
  });

  it("should have minimize and close buttons", () => {
    const minimizeBtn = element.shadowRoot.querySelector("#minimize-button");
    const closeBtn = element.shadowRoot.querySelector("#close-button");
    expect(minimizeBtn).to.exist;
    expect(closeBtn).to.exist;
  });

  it("should have tabs for inference and layer info", () => {
    const tabs = element.shadowRoot.querySelector("cds-tabs");
    const inferenceTab = element.shadowRoot.querySelector("#inference-tab");
    const layerTab = element.shadowRoot.querySelector("#layer-tab");
    expect(tabs).to.exist;
    expect(inferenceTab).to.exist;
    expect(layerTab).to.exist;
  });

  it("should have a content container", () => {
    const container = element.shadowRoot.querySelector("#content-container");
    expect(container).to.exist;
  });

  it("should show empty state by default", () => {
    const emptyState = element.shadowRoot.querySelector(".empty-state");
    expect(emptyState).to.exist;
    expect(emptyState.textContent).to.include("No additional information");
  });

  describe("setInferenceInfo", () => {
    it("should set inference information", () => {
      element.setInferenceInfo({
        title: "Test Inference",
        content: "# Test Content\n\nThis is a test."
      });
      expect(element.inferenceInfo).to.exist;
      expect(element.inferenceInfo.title).to.equal("Test Inference");
      expect(element.inferenceInfo.content).to.include("Test Content");
    });

    it("should show inference tab when inference info is set", () => {
      element.setInferenceInfo({
        title: "Test",
        content: "Content"
      });
      const inferenceTab = element.shadowRoot.querySelector("#inference-tab");
      expect(inferenceTab.classList.contains("display-none")).to.be.false;
    });

    it("should render markdown content", () => {
      element.setInferenceInfo({
        title: "Test",
        content: "# Heading\n\n**Bold text**"
      });
      const container = element.shadowRoot.querySelector("#content-container");
      expect(container.innerHTML).to.include("<h1");
      expect(container.innerHTML).to.include("<strong");
    });
  });

  describe("setLayerInfo", () => {
    it("should set layer information", () => {
      element.setLayerInfo({
        title: "Test Layer",
        content: "## Layer Info\n\nLayer details here."
      });
      expect(element.layerInfo).to.exist;
      expect(element.layerInfo.title).to.equal("Test Layer");
    });

    it("should show layer tab when layer info is set", () => {
      element.setLayerInfo({
        title: "Test",
        content: "Content"
      });
      const layerTab = element.shadowRoot.querySelector("#layer-tab");
      expect(layerTab.classList.contains("display-none")).to.be.false;
    });
  });

  describe("minimize functionality", () => {
    it("should toggle minimized state", () => {
      const minimizeBtn = element.shadowRoot.querySelector("#minimize-button");
      expect(element.isMinimized).to.be.false;
      
      minimizeBtn.click();
      expect(element.isMinimized).to.be.true;
      expect(element.classList.contains("minimized")).to.be.true;
      
      minimizeBtn.click();
      expect(element.isMinimized).to.be.false;
      expect(element.classList.contains("minimized")).to.be.false;
    });

    it("should emit minimize-panel event", (done) => {
      element.addEventListener("minimize-panel", () => {
        done();
      });
      const minimizeBtn = element.shadowRoot.querySelector("#minimize-button");
      minimizeBtn.click();
    });

    it("should emit expand-panel event", (done) => {
      element.isMinimized = true;
      element.addEventListener("expand-panel", () => {
        done();
      });
      const minimizeBtn = element.shadowRoot.querySelector("#minimize-button");
      minimizeBtn.click();
    });
  });

  describe("close functionality", () => {
    it("should hide panel when close button is clicked", () => {
      element.show();
      const closeBtn = element.shadowRoot.querySelector("#close-button");
      closeBtn.click();
      expect(element.classList.contains("display-none")).to.be.true;
    });

    it("should emit close-panel event", (done) => {
      element.addEventListener("close-panel", () => {
        done();
      });
      const closeBtn = element.shadowRoot.querySelector("#close-button");
      closeBtn.click();
    });
  });

  describe("show/hide methods", () => {
    it("should show panel", () => {
      element.hide();
      expect(element.classList.contains("display-none")).to.be.true;
      
      element.show();
      expect(element.classList.contains("display-none")).to.be.false;
    });

    it("should hide panel", () => {
      element.show();
      expect(element.classList.contains("display-none")).to.be.false;
      
      element.hide();
      expect(element.classList.contains("display-none")).to.be.true;
    });
  });

  describe("drag functionality", () => {
    it("should update position on drag", () => {
      const header = element.shadowRoot.querySelector("#panel-header");
      const initialX = element.position.x;
      const initialY = element.position.y;
      
      // Simulate mousedown
      const mousedownEvent = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 100,
        bubbles: true
      });
      header.dispatchEvent(mousedownEvent);
      
      expect(element.isDragging).to.be.true;
      
      // Simulate mousemove
      const mousemoveEvent = new MouseEvent("mousemove", {
        clientX: 200,
        clientY: 200,
        bubbles: true
      });
      document.dispatchEvent(mousemoveEvent);
      
      // Position should have changed
      expect(element.position.x).to.not.equal(initialX);
      expect(element.position.y).to.not.equal(initialY);
      
      // Simulate mouseup
      const mouseupEvent = new MouseEvent("mouseup", {
        bubbles: true
      });
      document.dispatchEvent(mouseupEvent);
      
      expect(element.isDragging).to.be.false;
    });

    it("should emit position-changed event on drag end", (done) => {
      element.addEventListener("position-changed", (e) => {
        expect(e.detail.position).to.exist;
        done();
      });
      
      const header = element.shadowRoot.querySelector("#panel-header");
      header.dispatchEvent(new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 100,
        bubbles: true
      }));
      
      document.dispatchEvent(new MouseEvent("mousemove", {
        clientX: 200,
        clientY: 200,
        bubbles: true
      }));
      
      document.dispatchEvent(new MouseEvent("mouseup", {
        bubbles: true
      }));
    });
  });

  describe("state persistence", () => {
    it("should save state to localStorage", () => {
      element.position = { x: 100, y: 200 };
      element.isMinimized = true;
      element.saveState();
      
      const saved = localStorage.getItem("additionalInfoPanelState");
      expect(saved).to.exist;
      
      const state = JSON.parse(saved);
      expect(state.position.x).to.equal(100);
      expect(state.position.y).to.equal(200);
      expect(state.isMinimized).to.be.true;
    });

    it("should load state from localStorage", () => {
      const testState = {
        position: { x: 150, y: 250 },
        isMinimized: true,
        currentTab: "layer",
        visible: true
      };
      localStorage.setItem("additionalInfoPanelState", JSON.stringify(testState));
      
      element.loadState();
      
      expect(element.position.x).to.equal(150);
      expect(element.position.y).to.equal(250);
      expect(element.isMinimized).to.be.true;
    });
  });

  describe("markdown rendering", () => {
    it("should render headers", () => {
      element.setInferenceInfo({
        title: "Test",
        content: "# H1\n## H2\n### H3"
      });
      const container = element.shadowRoot.querySelector("#content-container");
      expect(container.innerHTML).to.include("<h1");
      expect(container.innerHTML).to.include("<h2");
      expect(container.innerHTML).to.include("<h3");
    });

    it("should render lists", () => {
      element.setInferenceInfo({
        title: "Test",
        content: "- Item 1\n- Item 2\n\n1. First\n2. Second"
      });
      const container = element.shadowRoot.querySelector("#content-container");
      expect(container.innerHTML).to.include("<ul");
      expect(container.innerHTML).to.include("<ol");
      expect(container.innerHTML).to.include("<li");
    });

    it("should render code blocks", () => {
      element.setInferenceInfo({
        title: "Test",
        content: "```python\nprint('hello')\n```"
      });
      const container = element.shadowRoot.querySelector("#content-container");
      expect(container.innerHTML).to.include("<pre");
      expect(container.innerHTML).to.include("<code");
    });

    it("should render tables", () => {
      element.setInferenceInfo({
        title: "Test",
        content: "| Col1 | Col2 |\n|------|------|\n| A | B |"
      });
      const container = element.shadowRoot.querySelector("#content-container");
      expect(container.innerHTML).to.include("<table");
      expect(container.innerHTML).to.include("<th");
      expect(container.innerHTML).to.include("<td");
    });

    it("should sanitize HTML to prevent XSS", () => {
      element.setInferenceInfo({
        title: "Test",
        content: "<script>alert('xss')</script>\n# Safe Content"
      });
      const container = element.shadowRoot.querySelector("#content-container");
      expect(container.innerHTML).to.not.include("<script");
      expect(container.innerHTML).to.include("<h1");
    });
  });
});

// Made with Bob
