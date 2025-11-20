/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import asWebComponent from "../webcomponent.js";
import { userIcon } from "../icons.js";
import { decodeBase64 } from "../utils.js";

const template = (obj) => /* HTML */ `
  <style>
    :host {
      display: flex;
      position: relative;
    }

    .profile-button {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background-color: #1192e8;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #000;
      letter-spacing: -0.26px;
      font-size: 0.75rem;
      line-height: 1rem;
    }

    .menu-bar-button {
      all: unset;
      width: 49px;
      height: 49px;
      cursor: pointer;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .menu-bar-button:hover {
      background-color: #262626;
    }

    .menu-bar-button:focus {
      outline: 2px solid #ffffff;
      outline-offset: -2px;
      background-color: #262626;
    }

    .popup {
      position: absolute;
      height: 250px;
      width: 250px;
      background-color: #262626;
      top: 100%;
      right: 0;
      box-shadow: 0 2px 6px var(--cds-shadow, rgba(0, 0, 0, 0.3));
      display: flex;
      flex-direction: column;
    }

    .flex-spacer {
      flex-grow: 1;
    }

    #name {
      padding: 1rem;
      color: white;
      font-size: 1.25rem;
    }

    #email {
      padding: 1rem;
      color: white;
      font-size: 1rem;
    }
  </style>
  <button class="menu-bar-button">
    <!-- <div class="profile-button"> -->
    <div class="profile-button" id="user-initials"></div>
  </button>

  <div class="popup" style="display: none">
    <!--  <div class="user-info-container"> -->
    <!--    <div class="profile-button" id="user-initials-popup"> </div> -->
    <div id="name"></div>
    <div id="email"></div>
    <!-- </div> -->

    <div class="flex-spacer"></div>
    <cds-button id="log-out-btn" kind="secondary">Log out</cds-button>
    <cds-button id="log-in-btn" kind="secondary">Login</cds-button>
  </div>
`;

window.customElements.define(
  "user-profile",
  class extends asWebComponent(HTMLElement) {
    render() {
      this.setDOM(template(this));
      this.popup = this.shadow.querySelector(".popup");
      this.menuBarBtn = this.shadow.querySelector(".menu-bar-button");
      this.logOutButton = this.shadow.querySelector("#log-out-btn");
      this.logInButton = this.shadow.querySelector("#log-in-btn");
      this.userName = this.shadow.querySelector("#name");
      this.loginWidget = document.querySelector("login-widget");
      this.userEmail = this.shadow.querySelector("#email");

      this.renderUserInitials();

      this.menuBarBtn.addEventListener("click", async () => {
        this.popup.style.display = "";
        const idToken = localStorage.getItem("id_token");
        this.userInitials = this.shadow.getElementById("user-initials");
        if (idToken) {
          const payload = idToken.split(".")[1];
          const decodedPayload = decodeBase64(payload);
          const parsedPayload = JSON.parse(decodedPayload);

          const userName = parsedPayload.displayName;
          this.userName.textContent = userName;

          const userEmail = parsedPayload.email;
          this.userEmail.textContent = userEmail;
        }
      });

      this.menuBarBtn.addEventListener("focusout", ({ relatedTarget }) => {
        if (!this.shadow.contains(relatedTarget)) {
          this.popup.style.display = "none";
        }
      });

      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        this.logInButton.style.display = "none";
      } else {
        this.logOutButton.style.display = "none";
      }
      this.loginWidget.addEventListener("login-success", () => {
        this.render();
      });

      this.logOutButton.addEventListener("click", () => {
        this.loginWidget.logout();
        this.popup.style.display = "none";
      });

      this.logInButton.addEventListener("click", () => {
        this.loginWidget.doLogin();
        this.popup.style.display = "none";
      });
    }

    renderUserInitials() {
      const idToken = localStorage.getItem("id_token");
      this.userInitials = this.shadow.getElementById("user-initials");
      if (idToken) {
        const payload = idToken.split(".")[1];
        const decodedPayload = decodeBase64(payload);
        const parsedPayload = JSON.parse(decodedPayload);

        const userName = parsedPayload.displayName;
        this.userName.textContent = userName;
        const nameInitials = userName.split(" ");
        let initials = "";
        if (nameInitials[0]) {
          initials += nameInitials[0][0];
        }
        if (nameInitials.length >= 2) {
          initials += nameInitials.at(-1)[0];
        }

        if (initials) {
          this.userInitials.innerHTML = initials.toUpperCase();
        } else {
          this.userInitials.innerHTML = userIcon({ width: 16, height: 16 });
        }
      } else {
        this.userInitials.innerHTML = userIcon({ width: 16, height: 16 });
      }
    }

    renderUserInfo(userInfo) {
      this.userName.innerHTML = userInfo.name;
      this.userEmail.innerHTML = userInfo.email;
    }
  }
);
