/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { fixture, expect } from '@open-wc/testing';

import '../../js/pages/not-found-page.js';

describe('not-found-page', () => {
  it('works', async () => {
    const el = await fixture('<not-found-page></not-found-page>');
    expect(el).dom.to.equalSnapshot();
  });
});