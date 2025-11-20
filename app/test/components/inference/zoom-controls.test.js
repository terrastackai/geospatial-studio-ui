/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from "@open-wc/testing";

import "../../../js/components/inference/zoom-controls.js";
import { getZoomAmount } from "../../../js/components/inference/zoom-controls.js";

describe("zoom-controls", () => {
  it("should correctly calculate zoom amount based on different altitudes", () => {
    //altitude > 5000
    let altitude = 10000;
    let expectedZoomAmount = altitude / 4;
    expect(getZoomAmount(altitude)).to.equal(expectedZoomAmount);
    //altitude < 5000
    altitude = 3000;
    expectedZoomAmount = altitude / 8;
    expect(getZoomAmount(altitude)).to.equal(expectedZoomAmount);
  });
});
