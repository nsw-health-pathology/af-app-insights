import { HttpRequest, TraceContext } from '@azure/functions';
import Traceparent from 'applicationinsights/out/Library/Traceparent';
import Tracestate from 'applicationinsights/out/Library/Tracestate';
import { expect } from 'chai';
import 'mocha';

import { HttpRequestParser } from '../../src/models';

describe('HttpRequestParser', () => {

  describe('parseHeaders', () => {

    it('should generate the model for the Api Error payload', async () => {

      const req: HttpRequest = {
        headers: { Authorization: 'Bearer abc123' },
        method: 'GET',
        params: { name: 'Jane' },
        query: { name: 'Smith' },
        url: 'https://api.com/Jane?name=Smith',
        body: {}
      };

      const traceContext: TraceContext = {
        traceparent: new Traceparent('00-5ea03e1018974a28b38e042939aa150c-0a223745ca844f3a-01').toString(),
        tracestate: new Tracestate().toString(),
        attributes: {}
      };

      const parser = new HttpRequestParser(req, traceContext);
      expect(parser.getOperationId({})).to.be.equal('5ea03e1018974a28b38e042939aa150c');
      expect(parser.getOperationName({})).to.be.equal('GET /Jane');
      expect(parser.getUrl()).to.be.equal('https://api.com/Jane?name=Smith');

      expect(parser.getTraceparent().parentId).to.be.equal('|5ea03e1018974a28b38e042939aa150c.0a223745ca844f3a.');

    });
  });

});
