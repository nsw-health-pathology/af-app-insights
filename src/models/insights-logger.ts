import { Logger } from '@azure/functions';
import { isInstanceOfApiError, DownstreamApiError, IApiError, LoggingService } from '@nswhp/af-core-module';
import { SeverityLevel } from 'applicationinsights/out/Declarations/Contracts';

import { AppInsightsService } from '../services';
import { IProperties } from './properties';

const getApiErrorProperties = (error: IApiError) => {
  return {
    isDownstreamError: error instanceof DownstreamApiError,
    statusCode: error.statusCode,
    type: error.type,
    title: error.title,
    additionalInformation: error.additionalInformation || 'No additional information'
  };
};

/**
 * Settings configuration for the app insights enabled logging service
 */
export interface IInsightsLoggingServiceSettings {
  applicationName: string;
  applicationMetricPrefix: string;
}

/**
 * App insights enabled logging service
 */
export class AppInsightsLoggingService extends LoggingService {


  constructor(
    private readonly appInsightsService: AppInsightsService,
    private readonly settings: IInsightsLoggingServiceSettings,
    ...loggers: Logger[]
  ) {
    super(...loggers);
  }


  /**
   * TRack an error using app insights metric telemetry
   *
   * @param error The error to be thrown
   * @param customProperties custom properties to be included on the metric insights
   */
  public trackError(
    error: Error,
    customProperties: IProperties = {}
  ): void {
    super.error(error.message);

    const downstreamErrorProperties: IProperties | undefined = isInstanceOfApiError(error)
      ? getApiErrorProperties(error)
      : {};

    const properties: IProperties = {
      ...customProperties,
      ...downstreamErrorProperties,
      applicationName: this.settings.applicationName
    };

    this.appInsightsService.client?.trackException({
      exception: error, severity: SeverityLevel.Error,
      contextObjects: this.appInsightsService.correlationContext || undefined,
      tagOverrides: this.appInsightsService.tagOverrides,
      properties
    });

    throw error;
  }

  /**
   * Track a metric in app insights
   *
   * @param name the name of the metric
   * @param customProperties custom properties about the metric
   * @param value the value of the metric. defaults to 1
   */
  public trackMetric(
    name: string,
    customProperties: IProperties = {},
    value = 1
  ): void {
    const properties: IProperties = {
      ...customProperties,
      applicationName: this.settings.applicationName
    };

    // Prefix name with the application to establish context
    name = `${this.settings.applicationMetricPrefix}-${name}`;

    this.appInsightsService.client?.trackMetric({
      name, value, properties,
      contextObjects: this.appInsightsService.correlationContext || undefined,
      tagOverrides: this.appInsightsService.tagOverrides
    });
  }

}
