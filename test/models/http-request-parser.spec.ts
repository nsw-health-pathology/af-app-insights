import { expect } from 'chai';
import 'mocha';

import { HttpRequestParser } from '../../src/models/internal';
import { mockRequest, mockTraceContext } from '../mock/mock-request';

describe('HttpRequestParser', () => {

  describe('parseHeaders', () => {

    it('should generate the model for the Api Error payload', () => {

      const parser = new HttpRequestParser(mockRequest, mockTraceContext);
      expect(parser.getOperationId({})).to.be.equal('5ea03e1018974a28b38e042939aa150c');
      expect(parser.getOperationName({})).to.be.equal('GET /Jane');
      expect(parser.getUrl()).to.be.equal('https://api.com/Jane?name=Smith');

      expect(parser.getTraceparent().parentId).to.be.equal('|5ea03e1018974a28b38e042939aa150c.0a223745ca844f3a.');

    });
  });

});
