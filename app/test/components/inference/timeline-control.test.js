/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";
import "../../../js/components/inference/timeline-control.js";
import { handleTimelineControl } from "../../../js/components/inference/timeline-control.js";

describe("timeline-control", () => {
  let playIcon, pauseIcon, clockViewModel;

  beforeEach(() => {
    // Mock elements
    playIcon = {
      classList: {
        toggle: function (className) {
          this[className] = !this[className];
        },
        "display-none": true,
      },
    };
    pauseIcon = {
      classList: {
        toggle: function (className) {
          this[className] = !this[className];
        },
        "display-none": false,
      },
    };
    clockViewModel = { shouldAnimate: false };
  });

  it("displays button with play-icon initially", async () => {
    const el = await fixture("<timeline-control><timeline-control/>");
    const button = el.shadowRoot.querySelector("button");
    const playIcon = el.shadowRoot.querySelector("#play-icon");
    expect(button).to.not.be.null;
    expect(button.id).to.equal("timeline-control");
    expect(playIcon.id).to.not.be.null;
    expect(playIcon.id).to.equal("play-icon");
  });

  it("toggles play state and icons on button click", () => {
    // Initial state
    expect(playIcon.classList["display-none"]).to.be.true;
    expect(pauseIcon.classList["display-none"]).to.be.false;
    // Call the handleTimelineControl function
    handleTimelineControl(playIcon, pauseIcon, clockViewModel);
    expect(playIcon.classList["display-none"]).to.be.false;
    expect(pauseIcon.classList["display-none"]).to.be.true;
    // Call the handleTimelineControl function again
    handleTimelineControl(playIcon, pauseIcon, clockViewModel);
    expect(playIcon.classList["display-none"]).to.be.true;
    expect(pauseIcon.classList["display-none"]).to.be.false;
  });
});
