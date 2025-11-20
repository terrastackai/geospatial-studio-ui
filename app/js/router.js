/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import "./pages/home-page.js";
import "./pages/inference-page.js";
import "./pages/not-found-page.js";
import "./components/login-widget.js";
import "./pages/fine-tuning-create-page.js";
import "./pages/model-catalog-page.js";
import "./pages/data-catalog-page.js";
import "./pages/model-page.js";
import "./pages/dataset-page.js";
import "./pages/feedback-page.js";
import { isNotEmpty } from "./utils.js";

const routes = {
  "": {
    element: "home-page",
    authenticated: false,
  },
  feedback: {
    element: "feedback-page",
    authenticated: true,
  },
  inference: {
    element: "inference-page",
    authenticated: true,
  },
  fine_tuning_create: {
    element: "fine-tuning-create-page",
    authenticated: true,
  },
  model_catalog: {
    element: "model-catalog-page",
    authenticated: true,
  },
  data_catalog: {
    element: "data-catalog-page",
    authenticated: true,
  },
  dataset: {
    element: "dataset-page",
    authenticated: true,
  },
  model: {
    element: "model-page",
  },
};

export function goToUrl(url, search = "") {
  if (app.env.geostudio.disableFT === "true" && url.indexOf("#tune") !== -1) {
    url = "";
    search = "";
  }
  // if (app.env.geostudio.disableDF === "true" && url.indexOf("#datasetfactory") !== -1) {
  //   url = "";
  //   search = "";
  // }
  if (
    app.env.geostudio.disableFeeback === "true" &&
    url.indexOf("#feedback") !== -1
  ) {
    url = "";
    search = "";
  }

  history.pushState({}, "", url + search);
  let page = url.replaceAll("#", "");
  if (page === "/") {
    page = "";
  }

  let routeInfo;
  if (routes[page]) {
    routeInfo = routes[page];
  } else if (routes[page.split("?")[0]]) {
    routeInfo = routes[page.split("?")[0]];
  } else {
    routeInfo = { element: "not-found-page" };
  }

  if (routeInfo.authenticated && app.env.geostudio.useAuthSideCar === "false") {
    if (isNotEmpty(app.env.geostudio.studioApiKey)) {
      renderPage(routeInfo.element);
      return;
    }
    const loginWidget = document.querySelector("login-widget");

    if (loginWidget.hasValidAccessToken()) {
      renderPage(routeInfo.element);
    } else {
      loginWidget.doLogin({ returnPage: page });
    }
  } else {
    renderPage(routeInfo.element);
  }
}

export function setPageFromLocationBar() {
  if (window.location.hash.includes("access_token")) {
    const loginWidget = document.querySelector("login-widget");
    loginWidget.completeLoginCallback();
  } else {
    goToUrl(window.location.hash, window.location.search);
  }
}

function renderPage(route) {
  if (!route) {
    return;
  }

  const contentElement = route;

  setMenuItemActive(contentElement);

  const main = document.querySelector("main");

  main.innerHTML = "";
  const pageContent = document.createElement(contentElement);
  main.appendChild(pageContent);
  window.app.main = pageContent;
}

function setMenuItemActive(menuItem) {
  document.querySelectorAll("bx-side-nav-link[active]").forEach((link) => {
    link.removeAttribute("active");
  });

  const menuItemElement = document.querySelector(
    `bx-side-nav-link[page=${menuItem}]`
  );

  if (menuItemElement) {
    menuItemElement.setAttribute("active", "");
  }
}

window.addEventListener("popstate", () => {
  setPageFromLocationBar();
});
