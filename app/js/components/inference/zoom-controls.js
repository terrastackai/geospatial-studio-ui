/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";

const template = (obj) => /* HTML */ `
  <style>
    #zoom-controls-container {
      display: flex;
      flex-direction: column;
    }

    #zoom-in-control,
    #zoom-out-control,
    #home-control {
      margin: 0;
      padding: 1rem;
      background-color: var(--cds-layer, #363636);
      border: none;
      cursor: pointer;
    }

    #home-control {
      border-bottom: 1px solid var(--cds-layer, #454545);
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
    }

    #zoom-in-control:hover,
    #zoom-out-control:hover,
    #home-control:hover {
      background-color: var(--cds-layer-accent-01, #262626);
    }

    #zoom-in-control {
      border-bottom: 1px solid var(--cds-layer, #454545);
    }

    #zoom-out-control {
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
    }
  </style>

  <div id="zoom-controls-container">
    <button id="home-control">
      <svg
        id="zoom-icon"
        width="16"
        height="16"
        viewBox="0 0 21 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.75 10.5C4.75 9.36276 5.08723 8.25105 5.71905 7.30547C6.35087 6.35989 7.24889 5.6229 8.29957 5.18769C9.35025 4.75249 10.5064 4.63862 11.6218 4.86048C12.7372 5.08235 13.7617 5.62998 14.5659 6.43414C15.37 7.23829 15.9176 8.26284 16.1395 9.37823C16.3614 10.4936 16.2475 11.6498 15.8123 12.7004C15.3771 13.7511 14.6401 14.6491 13.6945 15.2809C12.7489 15.9128 11.6372 16.25 10.5 16.25C8.97554 16.2482 7.51402 15.6419 6.43607 14.5639C5.35811 13.486 4.75175 12.0245 4.75 10.5ZM14.8125 10.5C14.8125 9.64707 14.5596 8.81329 14.0857 8.1041C13.6118 7.39492 12.9383 6.84217 12.1503 6.51577C11.3623 6.18937 10.4952 6.10396 9.65867 6.27036C8.82213 6.43676 8.05372 6.84749 7.4506 7.4506C6.84749 8.05372 6.43676 8.82213 6.27036 9.65867C6.10396 10.4952 6.18937 11.3623 6.51577 12.1503C6.84217 12.9383 7.39492 13.6118 8.1041 14.0857C8.81329 14.5596 9.64707 14.8125 10.5 14.8125C11.6434 14.8112 12.7395 14.3565 13.548 13.548C14.3565 12.7395 14.8112 11.6434 14.8125 10.5Z"
          fill="#F4F4F4"
        />
        <path
          d="M11.9375 20.5625L11.9375 18.9951C13.6999 18.6943 15.3254 17.8538 16.5896 16.5896C17.8538 15.3254 18.6943 13.6999 18.9951 11.9375L20.5625 11.9375L20.5625 9.0625L18.9951 9.0625C18.6943 7.30012 17.8538 5.6746 16.5896 4.41039C15.3254 3.14618 13.6999 2.30566 11.9375 2.00488L11.9375 0.4375L9.0625 0.437499L9.0625 2.00488C7.30012 2.30566 5.6746 3.14618 4.41039 4.41039C3.14618 5.6746 2.30566 7.30012 2.00488 9.0625L0.4375 9.0625L0.437499 11.9375L2.00488 11.9375C2.30566 13.6999 3.14618 15.3254 4.41039 16.5896C5.6746 17.8538 7.30012 18.6943 9.0625 18.9951L9.0625 20.5625L11.9375 20.5625ZM3.3125 10.5C3.3125 9.07845 3.73404 7.68882 4.52381 6.50684C5.31359 5.32486 6.43612 4.40362 7.74946 3.85962C9.06281 3.31561 10.508 3.17327 11.9022 3.45061C13.2964 3.72794 14.5771 4.41248 15.5823 5.41767C16.5875 6.42286 17.2721 7.70355 17.5494 9.09779C17.8267 10.492 17.6844 11.9372 17.1404 13.2505C16.5964 14.5639 15.6751 15.6864 14.4932 16.4762C13.3112 17.266 11.9216 17.6875 10.5 17.6875C8.59442 17.6853 6.76751 16.9274 5.42006 15.5799C4.07262 14.2325 3.31467 12.4056 3.3125 10.5Z"
          fill="#F4F4F4"
        />
      </svg>
    </button>
    <button id="zoom-in-control">
      <svg
        id="zoom-icon"
        width="16"
        height="16"
        viewBox="0 0 21 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19.125 10.5C19.125 15.2438 15.2437 19.125 10.5 19.125C5.75625 19.125 1.875 15.2437 1.875 10.5C1.875 5.75625 5.75625 1.875 10.5 1.875C15.2438 1.875 19.125 5.75625 19.125 10.5ZM20.5625 10.5C20.5625 4.96563 16.0344 0.4375 10.5 0.4375C4.96562 0.437499 0.4375 4.96562 0.4375 10.5C0.437499 16.0344 4.96562 20.5625 10.5 20.5625C16.0344 20.5625 20.5625 16.0344 20.5625 10.5Z"
          fill="#F4F4F4"
        />
        <path
          d="M11.2187 16.25L11.2187 11.2187L16.25 11.2187L16.25 9.78125L11.2187 9.78125L11.2187 4.75L9.78125 4.75L9.78125 9.78125L4.75 9.78125L4.75 11.2187L9.78125 11.2187L9.78125 16.25L11.2187 16.25Z"
          fill="#F4F4F4"
        />
      </svg>
    </button>
    <button id="zoom-out-control">
      <svg
        id="zoom-icon"
        width="16"
        height="16"
        viewBox="0 0 21 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.17538 9.70947V11.2904L16.8249 11.2904L16.8249 9.70947L4.17538 9.70947Z"
          fill="#F4F4F4"
        />
        <path
          d="M3.38482 3.38474C2.44299 4.31494 1.6952 5.42286 1.18483 6.64427C0.674455 7.86567 0.411648 9.17625 0.411648 10.5C0.411648 11.8237 0.674455 13.1343 1.18483 14.3557C1.6952 15.5771 2.44299 16.6851 3.38482 17.6153C4.31502 18.5571 5.42295 19.3049 6.64435 19.8153C7.86575 20.3256 9.17633 20.5884 10.5001 20.5884C11.8238 20.5884 13.1344 20.3256 14.3558 19.8153C15.5772 19.3049 16.6851 18.5571 17.6153 17.6153C18.5572 16.6851 19.305 15.5771 19.8153 14.3557C20.3257 13.1343 20.5885 11.8237 20.5885 10.5C20.5885 9.17625 20.3257 7.86567 19.8153 6.64427C19.305 5.42286 18.5572 4.31494 17.6153 3.38474C16.6851 2.44291 15.5772 1.69512 14.3558 1.18475C13.1344 0.674373 11.8238 0.411566 10.5001 0.411565C9.17633 0.411564 7.86575 0.674373 6.64435 1.18475C5.42295 1.69512 4.31502 2.44291 3.38482 3.38474ZM16.5989 16.5988C15.3927 17.805 13.8558 18.6265 12.1827 18.9593C10.5097 19.2921 8.77545 19.1213 7.19944 18.4685C5.62343 17.8157 4.27639 16.7102 3.32866 15.2918C2.38093 13.8734 1.87508 12.2059 1.87508 10.5C1.87508 8.79414 2.38093 7.12658 3.32866 5.70821C4.27639 4.28983 5.62343 3.18434 7.19944 2.53154C8.77545 1.87873 10.5097 1.70793 12.1827 2.04073C13.8558 2.37353 15.3927 3.19498 16.5989 4.4012C18.2102 6.02198 19.1146 8.21456 19.1146 10.5C19.1146 12.7854 18.2102 14.978 16.5989 16.5988Z"
          fill="#F4F4F4"
        />
      </svg>
    </button>
  </div>
`;
export function getZoomAmount(altitude) {
  if (altitude > 5000) {
    return altitude / 4;
  } else {
    return altitude / 8;
  }
}

window.customElements.define(
  "zoom-controls",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      this.zoomInButton = this.shadow.getElementById("zoom-in-control");
      this.zoomOutButton = this.shadow.getElementById("zoom-out-control");
      this.homeButton = this.shadow.getElementById("home-control");

      this.zoomInButton.addEventListener("click", () => {
        this.zoomIn();
      });
      this.zoomOutButton.addEventListener("click", () => {
        this.zoomOut();
      });
      this.homeButton.addEventListener("click", () => {
        this.zoomHome();
      });
    }

    zoomIn() {
      let altitude = app.main.map.map.camera.positionCartographic.height;
      let zoomAmount = getZoomAmount(altitude);

      //Prevents zooming in past around 800 meters
      if (zoomAmount > 100) {
        app.main.map.map.camera.moveForward(zoomAmount);
      }
    }

    zoomOut() {
      let altitude = app.main.map.map.camera.positionCartographic.height;
      let zoomAmount = getZoomAmount(altitude);

      //Prevents zooming out past around 20000000 meters
      if (zoomAmount < 5000000) {
        app.main.map.map.camera.moveBackward(zoomAmount);
      }
    }

    zoomHome() {
      app.main.map.map.homeButton._element.click();
    }
  }
);
