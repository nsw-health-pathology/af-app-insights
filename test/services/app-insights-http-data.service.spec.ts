import { AbstractHttpDataService, AxiosHttpDataService } from '@nswhp/af-core-module';
import Axios from 'axios';
import { expect } from 'chai';
import MockAdapter from 'axios-mock-adapter';
import { StatusCodes } from 'http-status-codes';
import 'mocha';
import NodeClient from 'applicationinsights/out/Library/NodeClient';
import { mock, when, anything, instance, verify } from 'ts-mockito';
import { DependencyTelemetry, MetricTelemetry } from 'applicationinsights/out/Declarations/Contracts';
import Context from 'applicationinsights/out/Library/Context';

import { Timer } from '../../src/models';
import { AppInsightsHttpDataService, AppInsightsService } from '../../src/services';

import mockInsightsClientInstance from '../mock/mock-app-insights-client';
import { mockRequest, mockTraceContext } from '../mock/mock-request';


describe('AppInsightsHttpDataService', () => {

  describe('appInsightsHttpWrapper', () => {

    it('should track successful dependency call', async () => {

      // Setup Mock Responses
      const mockAxios = new MockAdapter(Axios);
      mockAxios.onGet('/version').reply(StatusCodes.OK, { version: '1.0.0' });

      const mockAppInsightsClient = mock(NodeClient);

      // eslint-disable-next-line @typescript-eslint/tslint/config
      when(mockAppInsightsClient.trackDependency(anything())).thenCall((telemetry: DependencyTelemetry) => {
        expect(telemetry.data).to.be.equal('/version');
        expect(telemetry.resultCode).to.be.equal(StatusCodes.OK);
        expect(telemetry.success).to.be.equal(true);
      }).thenReturn();

      const appInsightsClientInstance = instance(mockAppInsightsClient);
      appInsightsClientInstance.context = new Context();

      const appInsightsService = new AppInsightsService(appInsightsClientInstance, mockTraceContext, mockRequest);
      const axiosHttp = new AxiosHttpDataService(Axios);
      const http = new AppInsightsHttpDataService(axiosHttp, appInsightsService);

      const response = await http.makeHttpGetCall('/version', {}, {});

      // eslint-disable-next-line @typescript-eslint/tslint/config
      verify(mockAppInsightsClient.trackDependency(anything())).called();

      expect(response.status).to.be.equal(StatusCodes.OK);
      expect(response.body).to.be.deep.equal({ version: '1.0.0' });
    });

    it('should track failed dependency call', async () => {

      // Setup Mock Responses
      const mockAxios = new MockAdapter(Axios);
      mockAxios.onPost('/version').reply(StatusCodes.UNAUTHORIZED, { message: 'Missing API Key' });

      const mockAppInsightsClient = mock(NodeClient);

      // eslint-disable-next-line @typescript-eslint/tslint/config
      when(mockAppInsightsClient.trackDependency(anything())).thenCall((telemetry: DependencyTelemetry) => {
        expect(telemetry.data).to.be.equal('/version');
        expect(telemetry.resultCode).to.be.equal(StatusCodes.UNAUTHORIZED);
        expect(telemetry.success).to.be.equal(false);
      }).thenReturn();

      const appInsightsClientInstance = instance(mockAppInsightsClient);
      appInsightsClientInstance.context = new Context();

      const appInsightsService = new AppInsightsService(appInsightsClientInstance, mockTraceContext, mockRequest);
      const axiosHttp = new AxiosHttpDataService(Axios);
      const http = new AppInsightsHttpDataService(axiosHttp, appInsightsService);

      const response = await http.makeHttpPostCall('/version', {}, {});

      // eslint-disable-next-line @typescript-eslint/tslint/config
      verify(mockAppInsightsClient.trackDependency(anything())).called();

      expect(response.status).to.be.equal(StatusCodes.UNAUTHORIZED);
      expect(response.body).to.be.deep.equal({ message: 'Missing API Key' });
      expect(response.error).to.be.deep.equal({
        data: { message: 'Missing API Key' },
        message: 'Request failed with status code 401',
        name: 'Error'
      });
    });

    it('should catch and handle exceptions thrown for underlying http data service', async () => {

      const mockHttpDataService: AbstractHttpDataService = {
        makeHttpGetCall: () => { return new Promise(() => { throw new Error('Not Implemented'); }); },
        makeHttpPostCall: () => { return new Promise(() => { throw new Error('Not Implemented'); }); },
        makeHttpPutCall: () => { return new Promise(() => { throw new Error('Not Implemented'); }); }
      };

      const mockAppInsightsClient = mock(NodeClient);

      // eslint-disable-next-line @typescript-eslint/tslint/config
      when(mockAppInsightsClient.trackDependency(anything())).thenCall((telemetry: DependencyTelemetry) => {
        expect(telemetry.data).to.be.equal('/version');
        expect(telemetry.resultCode).to.be.equal(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(telemetry.success).to.be.equal(false);
      }).thenReturn();

      const appInsightsClientInstance = instance(mockAppInsightsClient);
      appInsightsClientInstance.context = new Context();

      const appInsightsService = new AppInsightsService(appInsightsClientInstance, mockTraceContext, mockRequest);
      const http = new AppInsightsHttpDataService(mockHttpDataService, appInsightsService);

      const response = await http.makeHttpPutCall('/version', {}, {});

      // eslint-disable-next-line @typescript-eslint/tslint/config
      verify(mockAppInsightsClient.trackDependency(anything())).called();

      expect(response.status).to.be.equal(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).to.be.deep.equal({});
      expect(response.error).to.be.deep.equal({
        data: 'API Call Failed. Not Implemented',
        message: 'Not Implemented',
        name: 'Error'
      });
    });


  });
});
