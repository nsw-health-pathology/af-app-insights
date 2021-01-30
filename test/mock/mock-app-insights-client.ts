
import { TelemetryClient } from 'applicationinsights';
import { DependencyTelemetry, ExceptionTelemetry, MetricTelemetry } from 'applicationinsights/out/Declarations/Contracts';
import Context from 'applicationinsights/out/Library/Context';
import { anything, instance, mock, when } from 'ts-mockito';

const logDependencyCall = (_telemetry: DependencyTelemetry): void => { /* Empty */ };
const logExceptionCall = (_telemetry: ExceptionTelemetry): void => { /* Empty */ };
const logMetricCall = (_telemetry: MetricTelemetry): void => { /* Empty */ };

const mockInsightsClient = mock(TelemetryClient);

// eslint-disable-next-line @typescript-eslint/tslint/config
when(mockInsightsClient.trackDependency(anything()))
  .thenCall((telemetry: DependencyTelemetry) => { return logDependencyCall(telemetry); })
  .thenReturn();

// eslint-disable-next-line @typescript-eslint/tslint/config
when(mockInsightsClient.trackException(anything()))
  .thenCall((telemetry: ExceptionTelemetry) => { return logExceptionCall(telemetry); })
  .thenReturn();

// eslint-disable-next-line @typescript-eslint/tslint/config
when(mockInsightsClient.trackMetric(anything()))
  .thenCall((telemetry: MetricTelemetry) => { return logMetricCall(telemetry); })
  .thenReturn();

const mockInsightsClientInstance = instance(mockInsightsClient);
mockInsightsClientInstance.context = new Context();

export = mockInsightsClientInstance;
