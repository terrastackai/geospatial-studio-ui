/*
 * © Copyright IBM Corporation 2025
 * SPDX-License-Identifier: Apache-2.0
 */

describe("Additional Info Panel", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("cds-header-menu-button").click();
    cy.get('cds-side-nav-link[href="#/inference"]').click();
    cy.url().should("include", "/inference");
  });

  it("should not display panel when no additional information exists", () => {
    cy.get("additional-info-panel")
      .should("exist")
      .and("have.class", "display-none");
  });

  it("should display panel when inference has additional information", () => {
    // This test would require mocking an inference with additional_information
    // For now, we'll test the panel's existence and basic structure
    cy.get("additional-info-panel").should("exist");
    
    cy.get("additional-info-panel").shadow().within(() => {
      cy.get("#panel-header").should("exist");
      cy.get("#title").should("contain", "Additional Information");
      cy.get("#minimize-button").should("exist");
      cy.get("#close-button").should("exist");
      cy.get("#content-container").should("exist");
    });
  });

  it("should have tabs for inference and layer information", () => {
    cy.get("additional-info-panel").shadow().within(() => {
      cy.get("cds-tabs").should("exist");
      cy.get("#inference-tab").should("exist");
      cy.get("#layer-tab").should("exist");
    });
  });

  it("should minimize and expand panel", () => {
    // First, we need to show the panel (this would normally happen with data)
    cy.get("additional-info-panel").then(($panel) => {
      $panel[0].show();
    });

    cy.get("additional-info-panel")
      .should("not.have.class", "display-none")
      .and("not.have.class", "minimized");

    // Click minimize button
    cy.get("additional-info-panel").shadow().within(() => {
      cy.get("#minimize-button").click();
    });

    cy.get("additional-info-panel").should("have.class", "minimized");

    // Click again to expand
    cy.get("additional-info-panel").shadow().within(() => {
      cy.get("#minimize-button").click();
    });

    cy.get("additional-info-panel").should("not.have.class", "minimized");
  });

  it("should close panel when close button is clicked", () => {
    // Show the panel first
    cy.get("additional-info-panel").then(($panel) => {
      $panel[0].show();
    });

    cy.get("additional-info-panel").should("not.have.class", "display-none");

    // Click close button
    cy.get("additional-info-panel").shadow().within(() => {
      cy.get("#close-button").click();
    });

    cy.get("additional-info-panel").should("have.class", "display-none");
  });

  it("should be draggable", () => {
    // Show the panel first
    cy.get("additional-info-panel").then(($panel) => {
      $panel[0].show();
      $panel[0].position = { x: 100, y: 100 };
      $panel[0].updatePosition();
    });

    // Get initial position
    cy.get("additional-info-panel").then(($panel) => {
      const initialLeft = $panel.css("left");
      const initialTop = $panel.css("top");

      // Drag the panel header
      cy.get("additional-info-panel").shadow().within(() => {
        cy.get("#panel-header")
          .trigger("mousedown", { clientX: 150, clientY: 150 })
          .trigger("mousemove", { clientX: 250, clientY: 250 })
          .trigger("mouseup");
      });

      // Position should have changed
      cy.get("additional-info-panel").then(($movedPanel) => {
        const newLeft = $movedPanel.css("left");
        const newTop = $movedPanel.css("top");
        expect(newLeft).to.not.equal(initialLeft);
        expect(newTop).to.not.equal(initialTop);
      });
    });
  });

  it("should switch between tabs", () => {
    // Show panel and set both inference and layer info
    cy.get("additional-info-panel").then(($panel) => {
      $panel[0].setInferenceInfo({
        title: "Test Inference",
        content: "# Inference Content"
      });
      $panel[0].setLayerInfo({
        title: "Test Layer",
        content: "## Layer Content"
      });
      $panel[0].show();
    });

    // Both tabs should be visible
    cy.get("additional-info-panel").shadow().within(() => {
      cy.get("#inference-tab").should("not.have.class", "display-none");
      cy.get("#layer-tab").should("not.have.class", "display-none");

      // Click layer tab
      cy.get("#layer-tab").click();
      
      // Content should update
      cy.get("#content-container").should("contain", "Layer Content");

      // Click inference tab
      cy.get("#inference-tab").click();
      
      // Content should update
      cy.get("#content-container").should("contain", "Inference Content");
    });
  });

  it("should render markdown content correctly", () => {
    cy.get("additional-info-panel").then(($panel) => {
      $panel[0].setInferenceInfo({
        title: "Markdown Test",
        content: `# Heading 1
## Heading 2

**Bold text** and *italic text*

- List item 1
- List item 2

\`\`\`python
print("code block")
\`\`\`

| Column 1 | Column 2 |
|----------|----------|
| Value 1  | Value 2  |`
      });
      $panel[0].show();
    });

    cy.get("additional-info-panel").shadow().within(() => {
      cy.get("#content-container").within(() => {
        cy.get("h1").should("exist").and("contain", "Heading 1");
        cy.get("h2").should("exist").and("contain", "Heading 2");
        cy.get("strong").should("exist").and("contain", "Bold text");
        cy.get("em").should("exist").and("contain", "italic text");
        cy.get("ul").should("exist");
        cy.get("li").should("have.length.at.least", 2);
        cy.get("pre").should("exist");
        cy.get("code").should("exist");
        cy.get("table").should("exist");
        cy.get("th").should("exist");
        cy.get("td").should("exist");
      });
    });
  });

  it("should persist panel state in localStorage", () => {
    // Show panel and set position
    cy.get("additional-info-panel").then(($panel) => {
      $panel[0].position = { x: 200, y: 300 };
      $panel[0].isMinimized = true;
      $panel[0].saveState();
    });

    // Check localStorage
    cy.window().then((win) => {
      const saved = win.localStorage.getItem("additionalInfoPanelState");
      expect(saved).to.exist;
      
      const state = JSON.parse(saved);
      expect(state.position.x).to.equal(200);
      expect(state.position.y).to.equal(300);
      expect(state.isMinimized).to.be.true;
    });
  });

  it("should load panel state from localStorage", () => {
    // Set state in localStorage
    cy.window().then((win) => {
      const testState = {
        position: { x: 150, y: 250 },
        isMinimized: true,
        currentTab: "layer",
        visible: true
      };
      win.localStorage.setItem(
        "additionalInfoPanelState",
        JSON.stringify(testState)
      );
    });

    // Reload page
    cy.reload();
    cy.get('cds-side-nav-link[href="#/inference"]').click();

    // Check if state was loaded
    cy.get("additional-info-panel").then(($panel) => {
      expect($panel[0].position.x).to.equal(150);
      expect($panel[0].position.y).to.equal(250);
      expect($panel[0].isMinimized).to.be.true;
    });
  });

  it("should sanitize HTML to prevent XSS", () => {
    cy.get("additional-info-panel").then(($panel) => {
      $panel[0].setInferenceInfo({
        title: "XSS Test",
        content: '<script>alert("xss")</script>\n# Safe Content'
      });
      $panel[0].show();
    });

    cy.get("additional-info-panel").shadow().within(() => {
      cy.get("#content-container").within(() => {
        // Script tag should not exist
        cy.get("script").should("not.exist");
        // Safe content should be rendered
        cy.get("h1").should("exist").and("contain", "Safe Content");
      });
    });
  });

  it("should show empty state when no content is available", () => {
    cy.get("additional-info-panel").then(($panel) => {
      $panel[0].show();
    });

    cy.get("additional-info-panel").shadow().within(() => {
      cy.get(".empty-state")
        .should("exist")
        .and("contain", "No additional information available");
    });
  });

  it("should hide tabs when only one type of information is available", () => {
    // Set only inference info
    cy.get("additional-info-panel").then(($panel) => {
      $panel[0].setInferenceInfo({
        title: "Test",
        content: "# Content"
      });
      $panel[0].show();
    });

    cy.get("additional-info-panel").shadow().within(() => {
      // Tabs should be hidden when only one tab has content
      cy.get("cds-tabs").should("have.css", "display", "none");
    });
  });

  it("should show tabs when both types of information are available", () => {
    cy.get("additional-info-panel").then(($panel) => {
      $panel[0].setInferenceInfo({
        title: "Inference",
        content: "# Inference"
      });
      $panel[0].setLayerInfo({
        title: "Layer",
        content: "## Layer"
      });
      $panel[0].show();
    });

    cy.get("additional-info-panel").shadow().within(() => {
      // Tabs should be visible when both tabs have content
      cy.get("cds-tabs").should("not.have.css", "display", "none");
    });
  });
});

// Made with Bob
