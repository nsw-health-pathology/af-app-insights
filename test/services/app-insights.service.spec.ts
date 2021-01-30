import { IHttpResponse } from '@nswhp/af-core-module';
import { CorrelationContext, CorrelationContextManager } from 'applicationinsights/out/AutoCollection/CorrelationContextManager';
import Traceparent from 'applicationinsights/out/Library/Traceparent';
import Tracestate from 'applicationinsights/out/Library/Tracestate';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { } from 'mocha';
import { AppInsightsHeaders } from '../../src/models';

import { AppInsightsFactory, AppInsightsService } from '../../src/services';
import mockInsightsClientInstance from '../mock/mock-app-insights-client';
import { mockRequest, mockTraceContext } from '../mock/mock-request';

describe('AppInsightsService', () => {

  describe('properties', () => {

    it('should return inner app insights telemetry client', () => {

      const appInsightsService = new AppInsightsService(mockInsightsClientInstance, mockTraceContext, mockRequest);
      const client = appInsightsService.client;
      expect(client).to.be.equal(mockInsightsClientInstance);

    });

    it('should return generated correlation context', () => {

      const appInsightsService = new AppInsightsService(mockInsightsClientInstance, mockTraceContext, mockRequest);
      const context = appInsightsService.correlationContext;
      const expectedCorrelationContext: CorrelationContext = {
        operation: {
          name: 'GET /Jane',
          id: '5ea03e1018974a28b38e042939aa150c',
          parentId: '|5ea03e1018974a28b38e042939aa150c.????????????????.',
          traceparent: new Traceparent(mockTraceContext.traceparent || ''),
          tracestate: new Tracestate(mockTraceContext.tracestate || '')
        },
        customProperties: {
          getProperty: (_key: string) => { return ''; },
          setProperty: (_key: string, _value: string) => { return; }
        }
      };

      expect(context?.operation.name).to.be.deep.equal(expectedCorrelationContext.operation.name);
      expect(context?.operation.id).to.be.deep.equal(expectedCorrelationContext.operation.id);
      // expect(context?.operation.parentId).to.be.deep.equal(expectedCorrelationContext.operation.parentId);
      expect(context?.operation.traceparent?.parentId).to.be.deep.equal(expectedCorrelationContext.operation.traceparent?.parentId);

    });

    it('should return inner function context', () => {

      const appInsightsService = new AppInsightsService(mockInsightsClientInstance, mockTraceContext, mockRequest);
      const context = appInsightsService.functionContext;
      expect(context).to.be.equal(mockTraceContext);

    });

    it('should return function trace parent', () => {

      const appInsightsService = new AppInsightsService(mockInsightsClientInstance, mockTraceContext, mockRequest);
      const tp = appInsightsService.functionTraceParent;
      expect(tp).to.be.deep.equal(new Traceparent(mockTraceContext.traceparent || ''));

    });

    // it('should return function trace state', () => {

    //   const appInsightsService = new AppInsightsService(mockInsightsClientInstance, mockTraceContext, mockRequest);
    //   const ts = appInsightsService.functionTraceState;
    //   expect(ts).to.be.deep.equal(new Tracestate(mockTraceContext.tracestate || ''));

    // });
  });

  describe('addAppInsightsHeadersToResponse', () => {

    it('should add request-id header to response', () => {

      const appInsightsService = new AppInsightsService(mockInsightsClientInstance, mockTraceContext, mockRequest);

      const response: IHttpResponse<string> = {
        body: 'some text',
        headers: {},
        status: StatusCodes.OK
      };

      appInsightsService.addAppInsightsHeadersToResponse(response);
      expect(response.headers[AppInsightsHeaders.requestIdHeader]).to.be.equal(mockTraceContext.traceparent);

    });
  });


  describe('getHeadersForDependencyRequest', () => {

    it('should return headers with request-id in it', () => {

      const appInsightsService = new AppInsightsService(mockInsightsClientInstance, mockTraceContext, mockRequest);

      const response: IHttpResponse<string> = {
        body: 'some text',
        headers: {},
        status: StatusCodes.OK
      };

      appInsightsService.addAppInsightsHeadersToResponse(response);
      expect(response.headers[AppInsightsHeaders.requestIdHeader]).to.be.equal(mockTraceContext.traceparent);

    });
  });
});
