/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from '@open-wc/testing';
import "../../js/libs/leaflet/leaflet.js"
import "../../js/libs/leaflet-geosearch/geosearch.umd.js"

import '../../js/pages/inference-page.js';

describe('inference page', () => {
  it('works', async () => {
    const el = await fixture('<inference-page></inference-page>');
    expect(el).dom.to.equalSnapshot();
  });

  it('has history defined', async () => {
    const el = await fixture('<inference-page></inference-page>');
    expect(el.history).to.be.an( "array" ).that.is.empty
    // expect(el.history).to.have.length.above(0);
  });
});
