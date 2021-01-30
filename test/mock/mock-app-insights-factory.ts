import { TelemetryClient } from 'applicationinsights';
import { AppInsightsFactory } from '../../src/services';

import mockInsightsClientInstance from './mock-app-insights-client';

/**
 * Mocking class to initialise singleton instance for App Insights
 */
export class MockAppInsightsFactory extends AppInsightsFactory {

  /**
   * Create and return a mock singleton instance of the App Insights client
   *
   * @param insightsInstrumentationKey The app insights api key
   */
  public create(): TelemetryClient {
    return mockInsightsClientInstance;
  }
}
