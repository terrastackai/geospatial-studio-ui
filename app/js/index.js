/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import "./components/error-handler.js";
import "./components/app-backend.js";
import "./components/app-progressbar.js";
import "./components/user-profile.js";
import "./components/feedback/feedback-modal.js";
import "./components/feedback/feedback-button.js";
import "./onPageLoad.js";
import { setupPageLoad } from "./onPageLoad.js";
import { Workspace } from "./persistence/workspace.js";
import { IndexedDbPersistenceService } from "./persistence/indexedDbPersistenceService.js";
import { isNotEmpty } from "./utils.js"

class App {
  constructor() {
    this.error = document.getElementsByTagName("error-handler")[0];
    this.progress = document.getElementsByTagName("app-progressbar")[0];
    // this.main = document.getElementsByTagName("main")[0];
    this.backend = document.getElementsByTagName("app-backend")[0];
    this.feedbackModal = document.querySelector("feedback-modal");

    this.workspace = new Workspace(
      new IndexedDbPersistenceService({ key: "workspace" })
    );
  }

  showMessage(title, subtitle, type = "info", timeout = null) {
    const notification = document.createElement("cds-toast-notification");
    notification.kind = type;
    notification.title = title;
    notification.subtitle = subtitle;
    notification.className = "toast-message";
    notification.style.position = "fixed";
    document.body.appendChild(notification);
    if (timeout) {
      setTimeout(() => {
        notification.remove();
      }, timeout);
    }
  }
}

// polyfill requestIdleCallback as safari does not yet support it
window.requestIdleCallback =
  window.requestIdleCallback ||
  function (cb) {
    var start = Date.now();
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };

const originalFetch = window.fetch;

const loginWidget = document.querySelector("login-widget");

window.fetch = async (...args) => {
  let init = args[1] || {};
  if (!init.redirect) {
    init = { ...init, redirect: 'manual' };
  }

  if (Array.isArray(init.headers)) {
      init.headers = new Headers(init.headers);
  } else {
      init.headers = new Headers(init.headers || {});
  }
  
  if (init.headers.get('auth') === 'needed') {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      init.headers.set("Authorization", "Bearer " + accessToken);
    } else if (isNotEmpty(app.env.geostudio.studioApiKey)) {
      init.headers.set("X-API-Key", app.env.geostudio.studioApiKey);
    }
    init.headers.delete('auth');
  }

  return originalFetch.apply(this, [args[0], init]).then(response => {
    if (response.status === 401 || response.status === 302 || response.type === 'opaqueredirect') {
      loginWidget.doLogin();
      return;
    }
    return response;
  });
};

window.onload = async () => {
  window.app = new App();
  window.app.env = await (await fetch("/env.json")).json();
  app.progress.hide();
  app.backend.doSetup();
  setupPageLoad();
  if (app.env.geostudio.disableFT === "true") {
    document.querySelector("#tuning-nav-link").style.display = "none";
  }
  if (app.env.geostudio.disableDF === "true") {
    document.querySelector("#dataset-factory-nav-link").style.display = "none";
  }
  if (app.env.geostudio.disableFeedback === "true" || app.env.geostudio.disableFeedback === "") {
    document.querySelector("feedback-button").style.display = "none";
  }
};
