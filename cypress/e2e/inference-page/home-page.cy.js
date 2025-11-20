/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


/// <reference types="cypress" />
import "../../../app/js/pages/home-page";

describe("Color Bar component test", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Visit home", () => {
    cy.visit("/");
  });

  it("mounts home page on the DOM", () => {
    cy.mount < "home-page" > `<home-page></home-page>`;
    cy.get("home-page").shadow().contains("h1", "Welcome!");
  });
});
