/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import "../../js/pages/fine-tuning-page";
describe("fine-tuning-page", () => {
  it("should render correctly", async () => {
    const el = await fixture("<fine-tuning-page></fine-tuning-page>");
    const breadcrumbButton = el.shadowRoot.querySelector("breadcrumb-button");
    const fineTuningTable = el.shadowRoot.querySelector("fine-tuning-table");
    expect(el).to.exist;
    expect(breadcrumbButton).to.exist;
    expect(fineTuningTable).to.exist;
  });
});
