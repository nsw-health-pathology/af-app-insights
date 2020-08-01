import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as HttpStatus from 'http-status-codes';

import { AbstractHttpDataService, IApiResponse, IHeaders } from '@nswhp/af-core-module';

import { Timer } from '../models';
import { AppInsightsService } from './app-insights.service';

/**
 * HTTP Service class for calling external API services
 */
export class AppInsightsHttpDataService extends AbstractHttpDataService {

  constructor(
    protected readonly axiosClient: AxiosInstance,
    protected readonly appInsightsService: AppInsightsService
  ) {
    super();
  }

  /** Make a HTTP call with GET HTTP method */
  public async makeHttpGetCall<K>(
    url: string,
    // tslint:disable-next-line: no-any
    queryParams: any, headers: IHeaders
  ): Promise<IApiResponse<K>> {

    const getCall = (innerUrl: string, requestConfig: AxiosRequestConfig) => this.axiosClient.get<K>(
      innerUrl,
      requestConfig
    );

    return this.axiosHttpCall(url, queryParams, headers, getCall);
  }

  /** Make a HTTP call with PUT HTTP method */
  public async makeHttpPutCall<T, K = T>(
    url: string,
    headers: IHeaders, payload: T
  ): Promise<IApiResponse<K>> {

    const putCall = (innerUrl: string, requestConfig: AxiosRequestConfig) => this.axiosClient.put<T, AxiosResponse<K>>(
      innerUrl,
      payload,
      requestConfig
    );

    return this.axiosHttpCall(url, {}, headers, putCall);
  }

  /** Make a HTTP call with POST HTTP method */
  public async makeHttpPostCall<T, K = T>(
    url: string,
    headers: IHeaders, payload: T,
    // tslint:disable-next-line: no-any
    queryParams: any = {},
  ): Promise<IApiResponse<K>> {

    const postCall = (innerUrl: string, requestConfig: AxiosRequestConfig) => this.axiosClient.post<T, AxiosResponse<K>>(
      innerUrl,
      payload,
      requestConfig
    );

    return this.axiosHttpCall(url, queryParams, headers, postCall);
  }

  /**
   * Make the http call to the external API service
   * @param url The URL of the endpoint to call
   * @param queryParams Any query Params to send
   * @param headers any HTTP Headers to send
   * @param axiosRequestCallFn The axios operation function
   */
  private async axiosHttpCall<K>(
    url: string,
    // tslint:disable-next-line: no-any
    queryParams: any, headers: IHeaders,
    axiosRequestCallFn: (url: string, requestConfig: AxiosRequestConfig) => Promise<AxiosResponse<K>>
  ): Promise<IApiResponse<K>> {

    const appInsightsHeaders = this.appInsightsService.getHeadersForDependencyRequest();

    const headersWithCorrelationContext = { ...headers, ...appInsightsHeaders };

    // https://github.com/MicrosoftDocs/azure-docs/pull/52838/files
    // Use this with 'tagOverrides' to correlate custom telemetry to the parent function invocation.
    const tagOverrides = this.appInsightsService.tagOverrides;

    const requestConfig: AxiosRequestConfig = {
      headers: headersWithCorrelationContext,
      params: queryParams
    };

    const timer = new Timer();
    const appInsightsClient = this.appInsightsService.client;

    try {

      const response = await axiosRequestCallFn(url, requestConfig);

      const apiResponse: IApiResponse<K> = {
        body: response.data,
        status: response.status,
        headers: response.headers as IHeaders
      };

      // App insights metrics
      timer.stop();
      appInsightsClient?.trackDependency({
        data: url, dependencyTypeName: 'HTTP', duration: timer.duration,
        resultCode: response.status, success: true, name: url,
        contextObjects: this.appInsightsService.correlationContext || undefined,
        tagOverrides,
        time: timer.endDate
      });

      return apiResponse;

    } catch (error) {

      const e: AxiosError = error as AxiosError;

      // App insights metrics
      timer.stop();
      appInsightsClient?.trackDependency({
        data: url, dependencyTypeName: 'HTTP', duration: timer.duration,
        resultCode: e.response && e.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false, name: url,
        contextObjects: this.appInsightsService.correlationContext || undefined,
        tagOverrides,
        time: timer.endDate
      });

      // tslint:disable-next-line: no-any
      const apiResponse: IApiResponse<any> = {
        body: e.response?.data || {},
        error: {
          name: e.name,
          message: e.message,
          data: e.response?.data || 'API Call Failed. ' + e.message
        },
        status: e.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        headers: e.response?.headers as IHeaders
      };

      return apiResponse;
    }
  }

}
