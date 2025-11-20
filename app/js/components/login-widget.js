/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import "../libs/carbon-web-components/button.min.js";
import "../libs/carbon-web-components/modal.min.js";
import { goToUrl } from "../router.js";
import { genNonce, decodeBase64, isNotEmpty } from "../utils.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
    }

    .container {
      display: flex;
      flex-direction: column;
      border: 1px solid grey;
      padding: 5em;
    }
  </style>

  <cds-modal prevent-close-on-click-outside>
    <cds-modal-header>Please log in to continue</cds-modal-header>
    <cds-modal-body>
      If you experience difficulties please ensure your browser is not blocking
      popups
      <br />
      <br />
      <br />
      <br />
      <div id="error"></div>
    </cds-modal-body>
    <cds-modal-footer>
      <cds-modal-footer-button id="login" kind="primary"
        >Login</cds-modal-footer-button
      >
    </cds-modal-footer>
  </cds-modal>
`;

window.customElements.define(
  "login-widget",
  class extends asWebComponent(HTMLElement) {
    completeLoginCallback() {
      if (window.location.hash.includes("access_token")) {
        const params = new URLSearchParams(window.location.hash.substring(1));
        // print out all params
        // for (const [key, value] of params) {
        //     console.log(key + ": " + value)
        // }
        window.localStorage.access_token = params.get("access_token");
        window.localStorage.id_token = params.get("id_token");
        if (params.has("state")) {
          const state = JSON.parse(params.get("state"));
          if (state.returnPage) {
            requestIdleCallback(() => {
              goToUrl("#" + state.returnPage);
            });
          } else {
            requestIdleCallback(() => {
              goToUrl("/");
            });
          }
        }
        this.loginCompleted();
      } else {
        throw new Error("access_token not found in url params");
      }
    }

    render() {
      this.setDOM(template(this));
      this.error = this.shadow.querySelector("#error");
      this.loginButton = this.shadow.querySelector("#login");
      this.modal = this.shadow.querySelector("cds-modal");

      this.modal.addEventListener("cds-modal-beingclosed", (e) => {
        e.preventDefault();
      });

      this.loginButton.addEventListener("click", () => {
        this.onLoginButtonClick();
      });

      window.addEventListener("login-required", () => {
        this.show();
      });
    }

    hide() {
      this.modal.open = false;
    }

    show() {
      this.modal.open = true;
    }

    logout() {
      if (app.env.geostudio.useAuthSideCar === "true") {
        window.location.href = "/oauth2/start";
      } else if (app.env.geostudio.useAuthSideCar === "false") {
        if (isNotEmpty(app.env.geostudio.studioApiKey)) {
          return;
        }
        window.localStorage.removeItem("access_token");
        window.localStorage.removeItem("id_token");
        this.userInfo = null;
        window.location.replace("/");
      } else {
        console.error(
          "Unkwon app.env.geostudio.useAuthSideCar: " +
            app.env.geostudio.useAuthSideCar
        );
      }
    }

    hasValidAccessToken() {
      if (app.env.geostudio.useAuthSideCar === "false") {
        if (isNotEmpty(app.env.geostudio.studioApiKey)) {
          return true;
        }
        const accessToken = window.localStorage.access_token;
        if (accessToken) {
          //todo validate expiry and signature
          const payload = accessToken.split(".")[1];
          const decodedPayload = decodeBase64(payload);
          const parsedPayload = JSON.parse(decodedPayload);
          //console.log("access token", parsedPayload);
          const expiryTimeStamp = parsedPayload.exp;
          const currentTimeStamp = Date.now() / 1000;
          if (currentTimeStamp >= expiryTimeStamp) {
            console.log("token expired");
            return false;
          }
          return true;
        } else {
          return false;
        }
      } else if (app.env.geostudio.useAuthSideCar === "true") {
        return true;
      } else {
        console.error(
          "Unkwon app.env.geostudio.useAuthSideCar: " +
            app.env.geostudio.useAuthSideCar
        );
      }
    }

    doLogin(state = {}) {
      console.log("doing login...");
      if (app.env.geostudio.useAuthSideCar === "true") {
        window.location.href = "/oauth2/start";
      } else if (app.env.geostudio.useAuthSideCar === "false") {
        if (isNotEmpty(app.env.geostudio.studioApiKey)) {
          return;
        }
        const authUrl = app.env.verify.authUrl;
        const clientId = app.env.verify.clientId;
        const scope = app.env.verify.scope;
        const response_type = app.env.verify.response_type;
        const nonce = btoa(genNonce());
        const redirect_uri = window.location.origin;
        const prompt = app.env.verify.prompt;
        const login_hint = app.env.verify.login_hint;
        const stateStr = JSON.stringify(state);

        const url = `${authUrl}?client_id=${clientId}&scope=${scope}&response_type=${response_type}&nonce=${nonce}&redirect_uri=${redirect_uri}&prompt=${prompt}&login_hint=${login_hint}&state=${stateStr}`;

        window.location.replace(url);
      } else {
        console.error(
          "Unkwon app.env.geostudio.useAuthSideCar: " +
            app.env.geostudio.useAuthSideCar
        );
      }
    }

    async getUserInfo() {
      if (this.userInfo) {
        return this.userInfo;
      }

      // we may be logged in but we loaded a page that doesnt require login, so havent retrieved the user info yet
      if (window.localStorage.getItem("token")) {
        try {
          await this.init();
          this.userInfo = await this.appID.getUserInfo(
            window.localStorage.getItem("token")
          );
          return this.userInfo;
        } catch (e) {
          return null;
        }
      }
    }

    async attemptSilentLogin() {
      window.dispatchEvent(new CustomEvent("show-loading"));
      try {
        await this.initAppId();

        if (!window.localStorage.getItem("token")) {
          this.show();
        } else {
          // check if the token is still valid
          try {
            this.userInfo = await this.appID.getUserInfo(
              window.localStorage.getItem("token")
            );
            // console.log(this.userInfo)
            this.hide();
            this.loginCompleted();
          } catch (e) {
            window.localStorage.removeItem("access_token");
            window.localStorage.removeItem("scope");
            this.userInfo = null;
            // console.error(e)
            console.log("token no longer valid");
            this.show();
          }
        }
      } catch (e) {
        this.error.textContent = e;
        console.error(e);
      } finally {
        window.dispatchEvent(new CustomEvent("hide-loading"));
      }
    }

    hasScope(scope) {
      const scopeString = window.localStorage.getItem("scope") || "";
      const scopes = scopeString.split(" ");
      if (Array.isArray(scope)) {
        for (let s of scope) {
          if (scopes.includes(s)) {
            return true;
          }
        }
        return false;
      }
      return scopes.includes(scope);
    }

    async onLoginButtonClick() {
      try {
        await this.init();
        const tokens = await this.appID.signin();
        this.userInfo = await this.appID.getUserInfo(tokens.accessToken);
        window.localStorage.setItem("token", tokens.accessToken);
        window.localStorage.setItem("scope", tokens.accessTokenPayload.scope);

        let decodeIDToken = tokens.idTokenPayload;
        // console.log({tokens})
        // console.log({decodeIDToken})
        // console.log({userinfo: this.userInfo})

        this.hide();
        this.loginCompleted();
      } catch (e) {
        this.error.textContent = e;
        console.error(e);
        this.show();
      }
    }

    loginCompleted() {
      this.dispatchEvent(new CustomEvent("login-success", { bubbles: true }));
    }
  }
);
