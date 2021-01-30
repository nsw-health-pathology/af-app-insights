# Developer Notes

This code here is pretty much a stripped down version of Microsoft's official
[App Insights for NodeJS](https://github.com/Microsoft/ApplicationInsights-node.js/)
library. Its been stripped down to the bare essentials for getting this working with
azure functions.

From the App Insights Github page:

> Due to how Azure Functions (and other FaaS services) handle incoming requests,
> they are not seen as http requests to the Node.js runtime. For this reason,
> Request -> Dependency correlelation will not work out of the box. To enable
> tracking here, you simply need to grab the context from your Function request
> handler, and wrap your Function with that context.

As such, no unit tests are written for this code.
If a friendly developer wants to come along and write some, I'm all for it!
