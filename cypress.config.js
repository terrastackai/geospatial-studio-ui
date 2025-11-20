/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:9090",
    supportFile: "cypress/support/e2e.js",
    setupNodeEvents(on, config) {
    },
  },
  
  experimentalWebKitSupport: true,
});
