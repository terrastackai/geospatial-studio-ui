/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import "../components/home-page/action-card.js";
import "../components/home-page/secondary-card.js";
import "../components/home-page/api-keys-modal.js";
import { goToUrl } from "../router.js";
import { decodeBase64 } from "../utils.js";

const template = () => /* HTML */ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }

    * {
      box-sizing: border-box;
    }

    .earth-bg {
      position: fixed;
      width: 100vw;
      height: calc(100vh - 3rem);
      object-fit: cover;
      top: 3rem;
      left: 0;
    }
    .page-content {
      color: var(--cds-text-01);
      margin: 2rem 4rem 4rem;
      width: calc(100vw - 8rem);
      z-index: 1;
    }

    .page-heading {
      max-width: 99rem;
      width: 100%;
      flex: 0 0 auto;
      margin-top: 3rem;
      margin-bottom: 5rem;
      color: var(--cds-text-primary, white);
      font-size: 1.75rem;
      line-height: 1.2142857143;
      font-weight: 400;
    }

    .secondary-actions-container {
      display: flex;
      column-gap: 6rem;
      row-gap: 2rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }

    .primary-actions-container {
      display: flex;
      column-gap: 1rem;
      row-gap: 1rem;
      flex-wrap: wrap;
    }
  </style>

  <img
    fetchpriority="high"
    class="earth-bg"
    src="/images/Geospatial_Earth_5.jpg"
  />
  <div class="page-content">
    <api-keys-modal></api-keys-modal>
    <h1 class="page-heading">Welcome!</h1>

    <section class="secondary-actions-container">
      <secondary-card
        id="api-key-card"
        image-src="../../../images/api.svg"
        header-text="Manage your API keys"
        body-text="Manage your API keys to access the studio services"
      ></secondary-card>
      <secondary-card
        id="documentation-card"
        image-src="../../../images/documentation.svg"
        header-text="Documentation"
        body-text="Access SDKs, model cards, and developer resources"
      ></secondary-card>
      <secondary-card
        id="feedback-card"
        image-src="../../../images/User--feedback.svg"
        header-text="Feedback"
        body-text="Manage your feedback submissions and check for status"
      ></secondary-card>
    </section>
    <section class="primary-actions-container">
      <action-card
        id="data-factory"
        primary
        title="Prepare data"
        description="Refine datasets for tuning and labeling"
        action-text="Open Data Factory"
      >
        <svg
          slot="icon"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9 15H5V17H9V15Z" fill="#0F62FE" />
          <path d="M15 15H11V17H15V15Z" fill="#0F62FE" />
          <path d="M9 11H5V13H9V11Z" fill="#0F62FE" />
          <path d="M15 19H11V21H15V19Z" fill="#0F62FE" />
          <path d="M21 11H17V13H21V11Z" fill="#0F62FE" />
          <path d="M21 19H17V21H21V19Z" fill="#0F62FE" />
          <path
            d="M24 0H2C1.46977 0.000661548 0.961447 0.211588 0.586517 0.586517C0.211588 0.961447 0.000661548 1.46977 0 2V24C0.000661548 24.5302 0.211588 25.0386 0.586517 25.4135C0.961447 25.7884 1.46977 25.9993 2 26H24C24.5302 25.9993 25.0386 25.7884 25.4135 25.4135C25.7884 25.0386 25.9993 24.5302 26 24V2C25.9993 1.46977 25.7884 0.961447 25.4135 0.586517C25.0386 0.211588 24.5302 0.000661548 24 0ZM24 2V6H2V2H24ZM2 24V8H24V24H2Z"
            fill="#0F62FE"
          />
        </svg>
      </action-card>
      <action-card
        id="fine-tuning"
        primary
        title="Customize a model"
        description="Tune and edit foundation models to your data"
        action-text="Start fine-tuning"
      >
        <svg
          slot="icon"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            width="32"
            height="32"
            fill="white"
            fill-opacity="0.0"
            style="mix-blend-mode:multiply"
          />
          <path
            d="M20 28V23.9C22.3 23.4 24 21.4 24 19C24 16.6 22.3 14.6 20 14.1V0H18V14.1C15.7 14.6 14 16.6 14 19C14 21.4 15.7 23.4 18 23.9V28H20ZM16 19C16 17.3 17.3 16 19 16C20.7 16 22 17.3 22 19C22 20.7 20.7 22 19 22C17.3 22 16 20.7 16 19Z"
            fill="url(#paint0_linear_3868_4390)"
          />
          <path
            d="M4 0V4.1C1.7 4.6 0 6.6 0 9C0 11.4 1.7 13.4 4 13.9V28H6V13.9C8.3 13.4 10 11.4 10 9C10 6.6 8.3 4.6 6 4.1V0H4ZM8 9C8 10.7 6.7 12 5 12C3.3 12 2 10.7 2 9C2 7.3 3.3 6 5 6C6.7 6 8 7.3 8 9Z"
            fill="url(#paint1_linear_3868_4390)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_3868_4390"
              x1="24"
              y1="0"
              x2="7"
              y2="28"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#2667F5" />
              <stop offset="1" stop-color="#08BDBA" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_3868_4390"
              x1="24"
              y1="0"
              x2="7"
              y2="28"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#2667F5" />
              <stop offset="1" stop-color="#08BDBA" />
            </linearGradient>
          </defs>
        </svg>
      </action-card>

      <action-card
        id="inference"
        primary
        title="Use models for prediction"
        description="Use existing tuned models for pre-defined tasks"
        action-text="Open Inference Lab"
      >
        <svg
          slot="icon"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            width="32"
            height="32"
            fill="white"
            fill-opacity="0.0"
            style="mix-blend-mode:multiply"
          />
          <path
            d="M20 0V3H8V0H0V8H8V5H15.0234C14.3624 5.86066 14.0028 6.91481 14 8V16C13.999 16.7953 13.6826 17.5578 13.1202 18.1202C12.5578 18.6826 11.7953 18.999 11 19H8V16H0V24H8V21H11C12.3256 20.9984 13.5964 20.471 14.5337 19.5337C15.471 18.5964 15.9984 17.3256 16 16V8C15.9998 7.60621 16.0771 7.21623 16.2276 6.85234C16.3781 6.48845 16.5988 6.15776 16.8771 5.87918C17.1554 5.60059 17.4859 5.37956 17.8497 5.22871C18.2134 5.07786 18.6033 5.00014 18.9971 5H20V8H28V0H20ZM6 6H2V2H6V6ZM6 22H2V18H6V22ZM26 6H22V2H26V6Z"
            fill="url(#paint0_linear_3594_20673)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_3594_20673"
              x1="28"
              y1="-1.18216e-06"
              x2="-6"
              y2="31"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#BB8EFF" />
              <stop offset="1" stop-color="#2667F5" />
            </linearGradient>
          </defs>
        </svg>
      </action-card>
    </section>
  </div>
`;

window.customElements.define(
  "home-page",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));

      const loginWidget = document.querySelector("login-widget");

      this.apiKeyCard = this.shadow.querySelector("#api-key-card");
      this.apiKeysModalContainer = this.shadow.querySelector("api-keys-modal");
      this.apiKeysModal =
        this.apiKeysModalContainer.shadow.querySelector("cds-modal");

      this.apiKeyCard.addEventListener("click", () => {
        if (loginWidget.hasValidAccessToken()) {
          this.apiKeysModalContainer.setupAPIKeys();
          this.apiKeysModal.setAttribute("open", "");
        } else {
          loginWidget.doLogin();
          throw new Error("You are signed out or your token is expired!");
        }
      });

      this.geoDN = this.shadow.querySelector("#fine-tuning");
      this.geoDN.addEventListener("open", () => {
        if (app.env.geostudio.disableFT === "true") {
          app.showMessage("Fine-tuning coming soon!", "", "info", 5000);
          return;
        }
        goToUrl("#model_catalog");
      });

      this.exploreEarthView = this.shadow.querySelector("#inference");
      this.exploreEarthView.addEventListener("open", () => {
        goToUrl("#inference");
      });

      this.documentation = this.shadow.querySelector("#data-factory");
      this.documentation.addEventListener("click", () => {
        if (app.env.geostudio.disableDF === "true") {
          app.showMessage("Dataset factory coming soon!", "", "info", 5000);
          return;
        }
        goToUrl("#data_catalog");
      });

      this.documentation = this.shadow.querySelector("#documentation-card");
      this.documentation.addEventListener("click", () => {
        window.open("/docs/", "_blank").focus();
      });

      this.feedback = this.shadow.querySelector("#feedback-card");

      if (
        app.env.geostudio.disableFeedback === "true" ||
        app.env.geostudio.disableFeedback === ""
      ) {
        this.feedback.style.display = "none";
      } else {
        this.feedback.addEventListener("click", () => {
          goToUrl("#feedback");
        });
      }

      this.welcomeMessage = this.shadow.querySelector(".page-heading");

      if (app.env.geostudio.linkGeodn) {
        this.openGeoVizAction = this.shadow.querySelector("#open-geo-viz");
        this.openGeoVizAction.addEventListener("open", () => {
          if (loginWidget.hasValidAccessToken()) {
            window.open(app.env.geostudio.linkGeodn, "_blank").focus();
          } else {
            loginWidget.doLogin();
            throw new Error("You are signed out or your token is expired!");
          }
        });
      }

      const idToken = localStorage.getItem("id_token");
      if (idToken) {
        const payload = idToken.split(".")[1];
        const decodedPayload = decodeBase64(payload);
        const parsedPayload = JSON.parse(decodedPayload);
        const userName = parsedPayload.displayName;
        this.welcomeMessage.textContent = `Welcome ${userName}!`;
      }

      window.addEventListener("user-logged-in", (event) => {
        const userName = event.detail.userName;
        this.welcomeMessage.textContent = `Welcome ${userName}!`;
      });
    }
  }
);
