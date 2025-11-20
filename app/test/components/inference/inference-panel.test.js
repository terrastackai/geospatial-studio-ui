/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { expect, fixture } from "@open-wc/testing";
import "../../../js/components/inference/inference-panel";
import {
  _renderComboBoxItem,
  returnValidatedQueryFields,
} from "../../../js/components/inference/inference-panel";

describe("Inference Panel Component", () => {
  it("checks that _renderComboBoxItem function returns a valid combo box item component", async () => {
    const item = {
      name: "test",
    };
    const el = await fixture(_renderComboBoxItem(item));
    expect(el).to.exist;
  });
  it("checks that inference panel component is mounted on the DOM", async () => {
    const el = await fixture("<inference-panel></inference-panel>");
    expect(el).to.exist;
  });
  it("checks that inference panel component default child nodes exist", async () => {
    const el = await fixture("<inference-panel></inference-panel>");
    const inferencePanelContainer = el.shadowRoot.querySelector(
      "#run_inference_panel_container"
    );
    const inferencePanelBody = el.shadowRoot.querySelector(
      "#run_inference_panel_body"
    );
    expect(inferencePanelContainer).to.exist;
    expect(inferencePanelBody).to.exist;
  });
  it("checks that inference panel body child nodes exist", async () => {
    const el = await fixture("<inference-panel></inference-panel>");
    const inferencePanelBody = el.shadowRoot.querySelector(
      "#run_inference_panel_body"
    );
    expect(inferencePanelBody.hasChildNodes()).to.equal(true);
  });
  it("checks that run-query, run-upload and run-link button are rendered", async () => {
    const el = await fixture("<inference-panel></inference-panel>");
    const runQueryBtn = el.shadowRoot.getElementById("run-query-button");
    const runUploadBtn = el.shadowRoot.getElementById("run-query-button");
    const runLinkBtn = el.shadowRoot.getElementById("run-query-button");

    expect(runQueryBtn).to.exist;
    expect(runUploadBtn).to.exist;
    expect(runLinkBtn).to.exist;
  });
  it("should dispatch the correct event when file_upload_button_container is clicked", async () => {
    const el = await fixture("<inference-panel></inference-panel>");
    const fileUploadButtonContainer = el.shadowRoot.getElementById(
      "file_upload_button_container"
    );

    let changeEventDetected = false;
    fileUploadButtonContainer.addEventListener("change", () => {
      changeEventDetected = true;
    });

    const changeEvent = new Event("change");
    fileUploadButtonContainer.dispatchEvent(changeEvent);
    expect(changeEventDetected).to.be.true;
  });
  it("checks that validatedQueryFields function returns validatedQueryFields values", async () => {
    let titleValue = "valid";
    let inferenceTaskValue = "valid";
    let startDateValue = "sample-start-date-value";
    let endDateValue = "sample-end-date-value";

    expect(
      returnValidatedQueryFields(
        titleValue,
        inferenceTaskValue,
        startDateValue,
        endDateValue
      )
    ).to.equal("sample-end-date-value");
  });
  it("checks that validatedQueryFields function returns the falsy value if it's not a valid queryField value", async () => {
    let titleValue = "valid";
    let inferenceTaskValue = null;
    let startDateValue = "sample-start-date-value";
    let endDateValue = "sample-end-date-value";

    expect(
      returnValidatedQueryFields(
        titleValue,
        inferenceTaskValue,
        startDateValue,
        endDateValue
      )
    ).to.equal(null);
  });
});

