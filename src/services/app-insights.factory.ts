import * as AppInsights from 'applicationinsights';
import { TelemetryClient } from 'applicationinsights';

/**
 * Factory class for creating an App Insights client instance
 */
export class AppInsightsFactory {

  private static client: TelemetryClient | undefined;

  /**
   * Create and return a new instance of the App Insights client
   * with preset bootstrapped configuration sets
   */
  public create(): TelemetryClient | undefined {
    if (!AppInsightsFactory.client) {
      AppInsightsFactory.client = this.bootstrap();
    }

    return AppInsightsFactory.client;

  }

  /**
   * Returns a new instance of the telemetry client with default settings
   */
  public defaultClient(): TelemetryClient | undefined {
    if (!AppInsightsFactory.client) {
      try {
        AppInsightsFactory.client = new AppInsights.TelemetryClient();
      } catch (error) {
        // suppress and ignore
      }
    }

    return AppInsightsFactory.client;
  }

  /**
   * Bootstrap the App Insights instance
   */
  private bootstrap(): TelemetryClient | undefined {

    // SDK Configuration taken from https://docs.microsoft.com/en-us/azure/azure-monitor/app/nodejs#sdk-configuration
    try {
      AppInsights
        .setup() // Use process.env.APPINSIGHTS_INSTRUMENTATIONKEY to reference Api Key
        .setDistributedTracingMode(AppInsights.DistributedTracingModes.AI_AND_W3C)
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true)
        .setUseDiskRetryCaching(true)
        .setSendLiveMetrics(true)
        .start();

      return AppInsights.defaultClient;
    } catch (error) {
      // if we can't create a client we just leave it blank. Allows developers to work without an app insights instance.
      return undefined;
    }
  }

}
