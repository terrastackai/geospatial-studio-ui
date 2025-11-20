/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { pauseIcon, playIcon } from "../../icons.js";
import asWebComponent from "../../webcomponent.js";

const template = (obj) => /* HTML */ `
  <style>
    #timeline-control-container {
      padding: 0.5rem;
      background-color: #262626cc;
      backdrop-filter: blur(10px);
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
    }

    #timeline-control {
      width: 3rem;
      height: 3rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: transparent;
      border-radius: 50px;
      border: none;
      cursor: pointer;
    }

    #timeline-control:hover {
      background-color: #6f6f6f88;
    }

    #play-icon,
    #pause-icon {
      color: var(--cds-ui-05, #f4f4f4);
    }

    .display-none {
      display: none;
    }
  </style>
  <div id="timeline-control-container">
    <button id="timeline-control">
      ${playIcon({ width: 20, height: 20, id: "play-icon" })}
      ${pauseIcon({
        width: 20,
        height: 20,
        id: "pause-icon",
        class: "display-none",
      })}
    </button>
  </div>
`;

export function handleTimelineControl(playIcon, pauseIcon, clockViewModel) {}

window.customElements.define(
  "timeline-control",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      const timelineControl = this.shadow.getElementById("timeline-control");
      this.playIcon = this.shadow.getElementById("play-icon");
      this.pauseIcon = this.shadow.getElementById("pause-icon");

      timelineControl.addEventListener("click", () => {
        this.handleTimelineControl();
      });
    }

    handleTimelineControl() {
      this.playIcon.classList.toggle("display-none");
      this.pauseIcon.classList.toggle("display-none");
      app.main.map.map.clockViewModel.shouldAnimate =
        !app.main.map.map.clockViewModel.shouldAnimate;
    }
  }
);
