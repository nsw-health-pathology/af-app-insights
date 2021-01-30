import { HttpRequest, TraceContext } from '@azure/functions';
import Traceparent from 'applicationinsights/out/Library/Traceparent';
import Tracestate from 'applicationinsights/out/Library/Tracestate';

export const mockTraceContext: TraceContext = {
  traceparent: new Traceparent('00-5ea03e1018974a28b38e042939aa150c-0a223745ca844f3a-01').toString(),
  tracestate: new Tracestate().toString(),
  attributes: {}
};

export const mockRequest: HttpRequest = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  headers: { Authorization: 'Bearer abc123' },
  method: 'GET',
  params: { name: 'Jane' },
  query: { name: 'Smith' },
  url: 'https://api.com/Jane?name=Smith',
  body: {}
};
