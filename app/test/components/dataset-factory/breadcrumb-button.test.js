/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import "../../../js/components/data-set-factory/breadcrumb-button";

describe("Breadcrumb Button Component", () => {
  it("should render the breadcrumb button component", async () => {
    const el = await fixture("<breadcrumb-button></breadcrumb-button>");
    const shadowRoot = el.shadowRoot;

    const breadcrumb = shadowRoot.querySelector("bx-breadcrumb");
    const breadcrumbLink = shadowRoot.querySelector("bx-breadcrumb-link");
    const breadcrumbIcon = breadcrumbLink.querySelector(".breadcrumb-icon");
    const breadcrumbText = breadcrumbLink.querySelector(".breadcrumb-text");

    expect(breadcrumb).to.exist;
    expect(breadcrumbLink).to.exist;
    expect(breadcrumbIcon).to.exist;
    expect(breadcrumbText).to.exist;
  });

  it("should have correct text and attributes", async () => {
    const el = await fixture("<breadcrumb-button></breadcrumb-button>");
    const shadowRoot = el.shadowRoot;

    const breadcrumbLink = shadowRoot.querySelector("bx-breadcrumb-link");
    const breadcrumbText = breadcrumbLink.querySelector(".breadcrumb-text");

    expect(breadcrumbLink).to.have.attribute("href", "/#");
    expect(breadcrumbText).to.have.text("Homepage");
  });
});
