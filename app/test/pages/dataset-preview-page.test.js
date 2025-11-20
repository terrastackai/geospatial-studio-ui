/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import "../../js/pages/dataset-preview-page";
describe("dataset-preview-page component", () => {
  it("should render correctly", async () => {
    const el = await fixture("<dataset-preview-page></dataset-preview-page>");

    const breadcrumbButton = el.shadowRoot.querySelector(
      "preview-breadcrumb-button"
    );
    const datasetPreview = el.shadowRoot.querySelector(".preview-wrapper");
    expect(el).to.exist;
    expect(breadcrumbButton).to.exist;
    expect(datasetPreview).to.exist;
  });
});
