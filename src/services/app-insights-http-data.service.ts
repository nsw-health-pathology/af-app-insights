import { AbstractHttpDataService, IApiResponse, IHeaders, IQueryParams } from '@nswhp/af-core-module';
import { StatusCodes } from 'http-status-codes';

import { Timer } from '../models';
import { AppInsightsService } from './app-insights.service';

/**
 * HTTP Service class for calling external API services
 */
export class AppInsightsHttpDataService extends AbstractHttpDataService {

  constructor(
    protected readonly httpClient: AbstractHttpDataService,
    protected readonly appInsightsService: AppInsightsService
  ) {
    super();
  }

  /** Make a HTTP call with GET HTTP method */
  public async makeHttpGetCall<K>(
    url: string,
    headers: IHeaders = {},
    queryParams: IQueryParams = {},
    timeout = 0,
    retries = 0
  ): Promise<IApiResponse<K>> {

    const appInsightsHeaders = this.appInsightsService.getHeadersForDependencyRequest();
    const headersWithCorrelationContext = { ...headers, ...appInsightsHeaders };

    const promiseApiCall = this.httpClient.makeHttpGetCall<K>(
      url,
      headersWithCorrelationContext,
      queryParams,
      timeout,
      retries
    );

    return this.appInsightsHttpWrapper(url, promiseApiCall);
  }

  /** Make a HTTP call with PUT HTTP method */
  public async makeHttpPutCall<T, K = T>(
    url: string,
    payload: T,
    headers: IHeaders = {},
    timeout = 0,
    retries = 0
  ): Promise<IApiResponse<K>> {

    const appInsightsHeaders = this.appInsightsService.getHeadersForDependencyRequest();
    const headersWithCorrelationContext = { ...headers, ...appInsightsHeaders };

    const promiseApiCall = this.httpClient.makeHttpPutCall<T, K>(
      url,
      payload,
      headersWithCorrelationContext,
      timeout,
      retries
    );

    return this.appInsightsHttpWrapper(url, promiseApiCall);
  }

  /** Make a HTTP call with POST HTTP method */
  public async makeHttpPostCall<T, K = T>(
    url: string,
    payload: T,
    headers: IHeaders = {},
    queryParams: IQueryParams = {},
    timeout = 0,
    retries = 0
  ): Promise<IApiResponse<K>> {

    const appInsightsHeaders = this.appInsightsService.getHeadersForDependencyRequest();
    const headersWithCorrelationContext = { ...headers, ...appInsightsHeaders };

    const promiseApiCall = this.httpClient.makeHttpPostCall<T, K>(
      url,
      payload,
      headersWithCorrelationContext,
      queryParams,
      timeout,
      retries
    );

    return this.appInsightsHttpWrapper(url, promiseApiCall);
  }

  /**
   * Make the http call to the external API service
   *
   * @param url The URL of the endpoint to call
   * @param queryParams Any query Params to send
   * @param headers any HTTP Headers to send
   * @param timeout The number of milliseconds that an API request should wait before timing out.
   * @param retries The number of times to retry the operation, if a timeout is received.
   * @param promiseApiCall The axios operation function
   */
  private async appInsightsHttpWrapper<K>(
    url: string,
    promiseApiCall: Promise<IApiResponse<K>>
  ): Promise<IApiResponse<K>> {

    // https://github.com/MicrosoftDocs/azure-docs/pull/52838/files
    // Use this with 'tagOverrides' to correlate custom telemetry to the parent function invocation.
    const tagOverrides = this.appInsightsService.tagOverrides;

    const timer = new Timer();
    const appInsightsClient = this.appInsightsService.client;

    try {

      const apiResponse = await promiseApiCall;

      const isSuccess = apiResponse.status >= StatusCodes.OK && apiResponse.status < StatusCodes.BAD_REQUEST;

      // App insights metrics
      timer.stop();

      appInsightsClient?.trackDependency({
        data: url, dependencyTypeName: 'HTTP', duration: timer.duration,
        resultCode: apiResponse.status, success: isSuccess, name: url,
        contextObjects: this.appInsightsService.correlationContext || undefined,
        tagOverrides,
        time: timer.endDate
      });

      return apiResponse;

    } catch (error) {

      // For the most part, I don't expect this code to be called since the
      // base Axios HTTP Data Service (which I guess is the expected underlying
      // data service) should handle its own exceptions and return a 500 response
      // error in the event of a fatal error.
      //
      // But in the interest of allowing other underlying HTTP Data services
      // and in the event that something unforeseen blows up, this catch
      // will at least track that the HTTP call failed

      const e = error as Error;

      // App insights metrics
      timer.stop();

      appInsightsClient?.trackDependency({
        data: url, dependencyTypeName: 'HTTP', duration: timer.duration,
        resultCode: StatusCodes.INTERNAL_SERVER_ERROR, success: false, name: url,
        contextObjects: this.appInsightsService.correlationContext || undefined,
        tagOverrides,
        time: timer.endDate
      });

      const apiResponse: IApiResponse<unknown> = {
        body: {},
        error: {
          name: e.name,
          message: e.message,
          data: `API Call Failed. ${e.message}`
        },
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        headers: {} as IHeaders
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return apiResponse as IApiResponse<any>;
    }
  }

}
