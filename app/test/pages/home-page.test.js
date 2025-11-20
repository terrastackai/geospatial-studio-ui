/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from '@open-wc/testing';

import '../../js/pages/home-page.js';

describe('home page', () => {
  it('works', async () => {
    const el = await fixture('<home-page></home-page>');
    expect(el).dom.to.equalSnapshot();
  });
});