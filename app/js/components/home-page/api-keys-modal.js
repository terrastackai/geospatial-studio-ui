/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../../webcomponent.js";
import "../../libs/carbon-web-components/modal.min.js";
import "../../libs/carbon-web-components/button.min.js";
import "../../libs/carbon-web-components/structured-list.min.js";
import "../../libs/carbon-web-components/inline-loading.min.js";
import {
  expiredIcon,
  viewIcon,
  viewOffIcon,
  trashIcon,
  copyIcon,
  apiKeyIcon,
} from "../../icons.js";

const template = (obj) => /* HTML */ `
  <style>
    cds-modal {
      background-color: #000000cc;
    }

    @media screen and (max-width: 671px) {
      cds-modal-header {
        margin-top: 3rem;
      }
    }

    cds-modal-body {
      display: flex;
      flex-direction: column;
      padding-right: 1rem;
    }

    cds-button {
      align-self: flex-end;
      margin-top: 1rem;
    }

    #icon {
      width: 2rem;
      vertical-align: middle;
    }

    #actions {
      vertical-align: middle;
    }

    #actions span {
      display: flex;
      column-gap: 1rem;
      vertical-align: middle;
    }

    button {
      margin: 0;
      padding: 0;
      background: transparent;
      border: none;
      cursor: pointer;
    }

    .display-none {
      display: none;
    }
  </style>

  <div>
    <cds-modal prevent-close-on-click-outside>
      <cds-modal-header>
        <cds-modal-close-button></cds-modal-close-button>
        <cds-modal-heading>API Keys</cds-modal-heading>
      </cds-modal-header>
      <cds-modal-body>
        <p>
          Your API key can be used to access services such as the API and SDK.
          You may have a maximum of 2 API keys at any one time.
        </p>
        <cds-inline-loading status="active">
          Loading Keys...
        </cds-inline-loading>
        <cds-button id="generate-key-button" size="sm" kind="primary">
          Generate key ${apiKeyIcon({ width: 16, height: 16, slot: "icon" })}
        </cds-button>
        <cds-structured-list>
          <cds-structured-list-head>
            <cds-structured-list-header-row>
              <cds-structured-list-header-cell
                ><!--  ICON  -->
              </cds-structured-list-header-cell>
              <cds-structured-list-header-cell>
                API key
              </cds-structured-list-header-cell>
              <cds-structured-list-header-cell>
                Expiry date
              </cds-structured-list-header-cell>
              <cds-structured-list-header-cell>
                Actions
              </cds-structured-list-header-cell>
            </cds-structured-list-header-row>
          </cds-structured-list-head>
          <cds-structured-list-body></cds-structured-list-body>
        </cds-structured-list>
      </cds-modal-body>
    </cds-modal>
  </div>
`;

window.customElements.define(
  "api-keys-modal",
  class extends asWebComponent(HTMLElement) {
    init() {
      this.APIKeys;
    }

    render() {
      this.setDOM(template(this));

      this.generateKeyButton = this.shadow.querySelector(
        "#generate-key-button"
      );

      this.structuredListBody = this.shadow.querySelector(
        "cds-structured-list-body"
      );

      this.generateKeyButton.addEventListener("click", () => {
        this.generateAPIKey();
      });
    }

    async setupAPIKeys() {
      const inlineLoading = this.shadow.querySelector("cds-inline-loading");

      inlineLoading.classList.remove("display-none");

      this.generateKeyButton.setAttribute("disabled", "");

      try {
        const response = await app.backend.getAPIKeys();

        if (response && "results" in response) {
          this.APIKeys = response.results;

          this.setupAPIKeysList();

          inlineLoading.classList.add("display-none");
          inlineLoading.status = "finished";
          inlineLoading.textContent = "API keys loaded";
        } else if (
          response &&
          response.detail.includes(
            "Provide a valid Authorization or X-Api-Key header."
          )
        ) {
          const loginWidget = document.querySelector("login-widget");
          loginWidget.doLogin();
          app.showMessage(
            "You are signed out or your token is expired!",
            "",
            "error",
            5000
          );
        } else {
          app.showMessage(
            "Failed to get API keys: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );

          inlineLoading.status = "error";
          inlineLoading.textContent = "Failed to load API keys";
        }
      } catch (error) {
        app.progress.hide();
        console.error("Error loading API keys:", error);
        app.showMessage(
          "An error occured while loading the API keys",
          "",
          "error",
          5000
        );

        inlineLoading.status = "error";
        inlineLoading.textContent = "Failed to load API keys";
      }

      this.generateKeyButton.removeAttribute("disabled");
    }

    async generateAPIKey() {
      try {
        const response = await app.backend.generateAPIKey();

        if (response && "id" in response) {
          this.APIKeys.push(response);

          this.setupAPIKeysList();

          app.showMessage(
            "API key generated successfully",
            "",
            "success",
            5000
          );
        } else if (response && response.detail.includes("You already have 2")) {
          app.showMessage(
            "Failed to generate API key: " + response.detail,
            "",
            "error",
            5000
          );
        } else if (
          response &&
          response.detail.includes(
            "Provide a valid Authorization or X-Api-Key header."
          )
        ) {
          const loginWidget = document.querySelector("login-widget");
          loginWidget.doLogin();
          app.showMessage(
            "You are signed out or your token is expired!",
            "",
            "error",
            5000
          );
        } else {
          app.showMessage(
            "Failed to generate API key: " +
              (response?.detail[0]?.msg
                ? response.detail[0].msg
                : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        app.progress.hide();
        console.error("Error generating API key:", error);
        app.showMessage(
          "An error occured while generating the API key",
          "",
          "error",
          5000
        );
      }
    }

    async deleteAPIKey(key, element) {
      try {
        const response = await app.backend.deleteAPIKey(key.id);

        if (response && response === 204) {
          element.remove();

          const index = this.APIKeys.indexOf(key);
          this.APIKeys.splice(index, 1);

          app.showMessage("API key deleted successfully", "", "success", 5000);
        } else if (response && response === "Unauthorized") {
          const loginWidget = document.querySelector("login-widget");
          loginWidget.doLogin();
          app.showMessage(
            "You are signed out or your token is expired!",
            "",
            "error",
            5000
          );
        } else {
          app.showMessage(
            "Failed to generate API key: " +
              (response ? response : "Unknown error"),
            "",
            "error",
            5000
          );
        }
      } catch (error) {
        app.progress.hide();
        console.error("Error deleting API key:", error);
        app.showMessage(
          "An error occured while deleting the API key",
          "",
          "error",
          5000
        );
      }
    }

    setupAPIKeysList() {
      this.structuredListBody.innerHTML = "";
      this.APIKeys.forEach((key) => {
        const rowTemplate = document.createElement("template");
        rowTemplate.innerHTML = this._renderAPIKeyEntry(key);
        const rowElement = rowTemplate.content.firstElementChild;

        rowElement
          .querySelector("#delete-button")
          .addEventListener("click", () => {
            this.deleteAPIKey(key, rowElement);
          });

        rowElement
          .querySelector("#copy-button")
          .addEventListener("click", () => {
            navigator.clipboard
              .writeText(key.value)
              .then(() => {
                app.showMessage("Key copied to clipboard", "", "success", 5000);
              })
              .catch((error) => {
                app.showMessage(
                  "Error copying key to clipboard",
                  "",
                  "error",
                  5000
                );
                console.log("Error copying key to clipboard: ", error);
              });
          });

        const visibilityButton = rowElement.querySelector("#visibility-button");
        const APIKeyCell = rowElement.querySelector("#api-key");

        visibilityButton.addEventListener("click", () => {
          if (APIKeyCell.innerHTML.includes("*")) {
            visibilityButton.innerHTML = viewOffIcon({
              width: 16,
              height: 16,
              color: "#f4f4f4",
            });
            APIKeyCell.innerHTML = key.value;
          } else {
            visibilityButton.innerHTML = viewIcon({
              width: 16,
              height: 16,
              color: "#f4f4f4",
            });
            APIKeyCell.innerHTML = key.value.replace(/./g, "*");
          }
        });

        this.structuredListBody.appendChild(rowElement);
      });
    }

    _renderAPIKeyEntry = (APIKey) => /* HTML */ `
      <cds-structured-list-row>
        <cds-structured-list-cell id="icon">
          ${APIKey.active != true ? expiredIcon({ height: 20, width: 20 }) : ""}
        </cds-structured-list-cell>
        <cds-structured-list-cell id="api-key">
          ${APIKey.value.replace(/./g, "*")}
        </cds-structured-list-cell>
        <cds-structured-list-cell id="date">
          ${APIKey.expires_on}
        </cds-structured-list-cell>
        <cds-structured-list-cell id="actions">
          <span>
            <button id="visibility-button">
              ${viewIcon({ width: 16, height: 16, color: "#f4f4f4" })}
            </button>
            <button id="copy-button">
              ${copyIcon({ width: 16, height: 16, color: "#f4f4f4" })}
            </button>
            <button id="delete-button">
              ${trashIcon({ width: 16, height: 16, color: "#f4f4f4" })}
            </button>
          </span>
        </cds-structured-list-cell>
      </cds-structured-list-row>
    `;
  }
);
