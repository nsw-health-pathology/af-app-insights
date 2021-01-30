import { HttpRequest, TraceContext } from '@azure/functions';
import { TelemetryClient } from 'applicationinsights';
import {
  CorrelationContext,
  CorrelationContextManager, PrivateCustomProperties
} from 'applicationinsights/out/AutoCollection/CorrelationContextManager';
import Traceparent from 'applicationinsights/out/Library/Traceparent';
import Tracestate from 'applicationinsights/out/Library/Tracestate';

import { IHeaders, IHttpResponse } from '@nswhp/af-core-module';

import { AppInsightsHeaders } from '../models';
import { CorrelationIdManager, HttpRequestParser, ITags } from '../models/internal';

/**
 * Service wrapper for Azure App Insights
 */
export class AppInsightsService {

  private readonly _correlationContext: CorrelationContext | null;

  constructor(
    private readonly _client: TelemetryClient | undefined,
    private readonly _functionContext: TraceContext | undefined,
    request: HttpRequest
  ) {
    this._correlationContext = this.initialiseCorrelationContext(request);
  }

  get client(): TelemetryClient | undefined { return this._client; }
  get correlationContext(): CorrelationContext | null { return this._correlationContext; }
  get functionContext(): TraceContext | undefined { return this._functionContext; }

  get functionTraceParent(): Traceparent | undefined {
    if (!this.functionContext?.traceparent) { return undefined; }
    return new Traceparent(this.functionContext.traceparent);
  }

  get functionTraceState(): Tracestate | undefined {
    if (!this.functionContext?.tracestate) { return undefined; }
    return new Tracestate(this.functionContext.tracestate);
  }

  get tagOverrides(): ITags | undefined {
    const operationIdTag = this.correlationContext?.operation.id;
    const tagOverrides = operationIdTag ? { 'ai.operation.id': operationIdTag } : undefined;
    return tagOverrides;
  }

  /**
   * Add app insights headers to http response
   *
   * @param response the http response
   */
  public addAppInsightsHeadersToResponse(response: IHttpResponse<unknown>): void {
    // Add app insights headers to response
    const appInsightsHeaders: IHeaders = {};
    appInsightsHeaders[AppInsightsHeaders.requestIdHeader] = this.functionTraceParent?.toString() || '';
    response.headers = { ...response.headers, ...appInsightsHeaders };
  }

  /**
   * Taken from Core App Insights NodeJS SDK
   */
  public getHeadersForDependencyRequest(): IHeaders {

    const currentContext = this.correlationContext;

    if (!currentContext || !currentContext.operation) { return {}; }

    const headers: IHeaders = {};

    // TODO: Clean this up a bit

    let uniqueRequestId: string;
    let uniqueTraceparent: string | undefined;
    if (currentContext.operation.traceparent && Traceparent.isValidTraceId(currentContext.operation.traceparent.traceId)) {
      currentContext.operation.traceparent.updateSpanId();
      uniqueRequestId = currentContext.operation.traceparent.getBackCompatRequestId();
    } else {
      // Start an operation now so that we can include the w3c headers in the outgoing request
      const traceparent = new Traceparent();
      uniqueTraceparent = traceparent.toString();
      uniqueRequestId = traceparent.getBackCompatRequestId();
    }

    headers[AppInsightsHeaders.requestIdHeader] = uniqueRequestId;
    headers[AppInsightsHeaders.parentIdHeader] = currentContext.operation.id;
    headers[AppInsightsHeaders.rootIdHeader] = uniqueRequestId;

    // Set W3C headers, if available
    if (uniqueTraceparent || currentContext.operation.traceparent) {
      headers[AppInsightsHeaders.traceparentHeader] = uniqueTraceparent || currentContext?.operation?.traceparent?.toString() || '';
    } else if (CorrelationIdManager.w3cEnabled) {
      // should never get here since we set uniqueTraceparent above for the w3cEnabled scenario
      const traceparent = new Traceparent().toString();
      headers[AppInsightsHeaders.traceparentHeader] = traceparent;
    }

    if (currentContext?.operation?.tracestate) {
      const tracestate = currentContext.operation.tracestate.toString();
      if (tracestate) {
        headers[AppInsightsHeaders.traceStateHeader] = tracestate;
      }
    }

    if (currentContext?.customProperties) {
      const correlationContextHeader = (<PrivateCustomProperties>currentContext.customProperties).serializeToHeader();
      if (correlationContextHeader) {
        headers[AppInsightsHeaders.correlationContextHeader] = correlationContextHeader;
      }
    }

    return headers;
  }

  /**
   * Create an initialised App Insights Correlation Context using the inbound request
   * to fetch HTTP headers
   *
   * @param req The inbound HTTP Request
   */
  private initialiseCorrelationContext(req: HttpRequest): CorrelationContext | null {
    // If function context trace exists, preference that before trying
    // to parse headers because otherwise we will generate new traceparent
    // if no header exists which will not match function context trace parent
    if (this.client === undefined) {
      return null;
    }

    const requestParser = new HttpRequestParser(req, this._functionContext);

    const ctx = CorrelationContextManager.generateContextObject(
      requestParser.getOperationId(this.client.context.tags),
      requestParser.getRequestId(),
      requestParser.getOperationName(this.client.context.tags),
      requestParser.getCorrelationContextHeader(),
      requestParser.getTraceparent(),
      requestParser.getTracestate()
    );

    if (ctx) {
      this.client.context.keys.operationId = ctx.operation.id;
      this.client.context.keys.operationName = ctx.operation.name;
      this.client.context.keys.operationParentId = ctx.operation.parentId;

      this.client.context.tags = requestParser.getRequestTags(this.client.context.tags);
    }

    return ctx;
  }

}
