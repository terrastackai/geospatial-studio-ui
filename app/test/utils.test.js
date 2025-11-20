/*
* © Copyright IBM Corporation 2025
* SPDX-License-Identifier: Apache-2.0
*/


import { expect } from '@open-wc/testing';
import {formatDateTimeStringUTC} from '../js/utils.js';

describe('Utils', () => {
    it.only('formatDateTimeStringUTC', () => {
      const formattedDate = formatDateTimeStringUTC("2020-01-01")
      expect(formattedDate).to.equal("2020/01/01, 00:00:00")
    });
  });