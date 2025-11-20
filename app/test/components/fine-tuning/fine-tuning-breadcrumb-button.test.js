/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import "../../../js/components/fine-tuning/fine-tuning-breadcrumb-button";

describe("fine-tuning-breadcrumb-button", () => {
  it("should render the breadcrumb button component  with a link and an Icon", async () => {
    const el = await fixture(
      "<fine-tuning-breadcrumb-button></fine-tuning-breadcrumb-button>"
    );
    const breadcrumb = el.shadowRoot.querySelector("bx-breadcrumb");
    const breadcrumbLink = el.shadowRoot.querySelector("bx-breadcrumb-link");
    const breadcrumbIcon = breadcrumbLink.querySelector(".breadcrumb-icon");

    expect(breadcrumb).to.exist;
    expect(breadcrumbLink).to.exist;
    expect(breadcrumbIcon).to.exist;
  });
  it("should have correct text and attributes", async () => {
    const el = await fixture(
      "<fine-tuning-breadcrumb-button></fine-tuning-breadcrumb-button>"
    );
    const breadcrumbLink = el.shadowRoot.querySelector("bx-breadcrumb-link");
    const breadcrumbText = breadcrumbLink.querySelector(".breadcrumb-text");

    expect(breadcrumbLink).to.have.attribute("href", "/#");
    expect(breadcrumbText).to.have.text("Homepage");
  });
});
