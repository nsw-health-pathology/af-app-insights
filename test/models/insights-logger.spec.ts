import { BadRequestError, ConsoleLogger } from '@nswhp/af-core-module';
import { ExceptionTelemetry, MetricTelemetry } from 'applicationinsights/out/Declarations/Contracts';
import Context from 'applicationinsights/out/Library/Context';
import NodeClient from 'applicationinsights/out/Library/NodeClient';
import TelemetryClient from 'applicationinsights/out/Library/TelemetryClient';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import 'mocha';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { AppInsightsLoggingService, IInsightsLoggingServiceSettings } from '../../src/models';
import { AppInsightsService } from '../../src/services';
import mockInsightsClientInstance from '../mock/mock-app-insights-client';
import { mockRequest, mockTraceContext } from '../mock/mock-request';

describe('AppInsightsLoggingService', () => {

  describe('trackError', () => {

    it('should log error with properties', () => {

      const mockAppInsightsClient = mock(NodeClient);

      // eslint-disable-next-line @typescript-eslint/tslint/config
      when(mockAppInsightsClient.trackException(anything())).thenCall((telemetry: ExceptionTelemetry) => {
        expect(telemetry.properties?.milkState).to.be.equal('sour');
        expect(telemetry.exception.message).to.be.equal('The milks gone bad');
      }).thenReturn();

      const appInsightsClientInstance = instance(mockAppInsightsClient);
      appInsightsClientInstance.context = new Context();

      const appInsightsService = new AppInsightsService(appInsightsClientInstance, mockTraceContext, mockRequest);
      const settings: IInsightsLoggingServiceSettings = { applicationMetricPrefix: 'MockApp', applicationName: 'my-mock-app' };

      const logger = new AppInsightsLoggingService(appInsightsService, settings, ConsoleLogger);

      logger.trackError(new Error('The milks gone bad'), { milkState: 'sour' });

      // eslint-disable-next-line @typescript-eslint/tslint/config
      verify(mockAppInsightsClient.trackException(anything())).called();

    });

    it('should log extra properties for api errors', () => {

      const mockAppInsightsClient = mock(NodeClient);

      // eslint-disable-next-line @typescript-eslint/tslint/config
      when(mockAppInsightsClient.trackException(anything())).thenCall((telemetry: ExceptionTelemetry) => {
        expect(telemetry.properties?.isDownstreamError).to.be.equal(false);
        expect(telemetry.properties?.statusCode).to.be.equal(StatusCodes.BAD_REQUEST);
        expect(telemetry.properties?.type).to.be.equal('https://httpstatuses.com/400');
        expect(telemetry.properties?.title).to.be.equal('BAD REQUEST');
        expect(telemetry.properties?.additionalInformation).to.be.equal('No additional information');
      }).thenReturn();

      const appInsightsClientInstance = instance(mockAppInsightsClient);
      appInsightsClientInstance.context = new Context();

      const appInsightsService = new AppInsightsService(appInsightsClientInstance, mockTraceContext, mockRequest);
      const settings: IInsightsLoggingServiceSettings = { applicationMetricPrefix: 'MockApp', applicationName: 'my-mock-app' };

      const logger = new AppInsightsLoggingService(appInsightsService, settings, ConsoleLogger);

      logger.trackError(new BadRequestError('Missing header X-PROFILE-TOKEN'));

      // eslint-disable-next-line @typescript-eslint/tslint/config
      verify(mockAppInsightsClient.trackException(anything())).called();
    });

  });

  describe('trackMetric', () => {

    it('should track metric with properties', () => {

      const numberOfMilkCartons = 10;

      const mockAppInsightsClient = mock(NodeClient);

      // eslint-disable-next-line @typescript-eslint/tslint/config
      when(mockAppInsightsClient.trackMetric(anything())).thenCall((telemetry: MetricTelemetry) => {
        expect(telemetry.properties?.milkState).to.be.equal('sour');
        expect(telemetry.properties?.applicationName).to.be.equal('my-mock-app');
        expect(telemetry.name).to.be.equal('MockApp-NumberOfMilkCartons');
        expect(telemetry.value).to.be.equal(numberOfMilkCartons);
      }).thenReturn();

      const appInsightsClientInstance = instance(mockAppInsightsClient);
      appInsightsClientInstance.context = new Context();

      const appInsightsService = new AppInsightsService(appInsightsClientInstance, mockTraceContext, mockRequest);
      const settings: IInsightsLoggingServiceSettings = { applicationMetricPrefix: 'MockApp', applicationName: 'my-mock-app' };

      const logger = new AppInsightsLoggingService(appInsightsService, settings, ConsoleLogger);

      logger.trackMetric('NumberOfMilkCartons', { milkState: 'sour' }, numberOfMilkCartons);

      // eslint-disable-next-line @typescript-eslint/tslint/config
      verify(mockAppInsightsClient.trackMetric(anything())).called();

    });
  });

});
