# jambonz/tracing

Centralised opentelemetry for tracing Jambonz apps

## Getting Started

Create a new JambonzTracer instance

```javascript
 const {tracer} = new JambonzTracer({
  enabled: true,
  version: "1.0.0",
  name: 'my-jambonz-app',
  jaegerEndpoint: 'http://127.0.0.0:14268/api/traces',
  logLevel: 'info'
});
```

### JambonzTracer Configuration

Configuration is provided via environment variables:

| variable           | meaning                                      | required? |
|--------------------|----------------------------------------------|-----------|
| enabled            | enable otel tracing                          | no        |
| version            | app version, usually taken from package.json | yes       |
| name               | name of otel service                         | yes       |
| jaegerEndpoint     | url for JaegerExporter                       | no        |
| zipkinEndpoint     | url for ZipkinExporter                       | no        |
| collectorEndpoint  | url for OTLPTraceExporter                    | no        |
| logLevel           | warn,info,debug or trace                     | no        |

Create a RootSpan

```javascript
   const rootSpan = new RootSpan('incoming-call', traceId, spanId, {'callerName': 'smithy'}, tracer, logger);
   //or 
   const rootSpan = RootSpan.createFromSIPHeaders('incoming-call', sipRequest, tracer, logger);
```

| variable   | meaning                                                                                                                                       | required? |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| name       | name of current span                                                                                                                          | yes       |
| traceId    | A valid trace identifier is a 16-byte array with at least one non-zero byte. Or a UUID v4 equivalent. Leave null to generate new root traceId | no        |
| spanId     | A valid trace identifier is a 8-byte array with at least one non-zero byte                                                                    | no        |
| attributes | map of attributes to assign to span                                                                                                           | no        |
| tracer     | the tracer instance                                                                                                                           | yes       |
| logger     | logger                                                                                                                                        | no        |

Create and nest ChildSpan's

```javascript
    const childSpan = rootSpan.startChildSpan('doSomeWork', {'key': '1234'});
    const childSpan2 = childSpan.startChildSpan('subWork', {'key': '2468'});
```

| variable          | meaning                                                                                                                                       | required? |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| callType          | name of current span                                                                                                                          | yes       |
| attributes        | map of attributes to assign to span                                                                                                           | yes       |

Setting Attributes

```javascript
    childSpan.setAttributes({'anotherKey': "5678"})
```

Ending a span

```javascript
    childSpan.end(); 
    //or
    childSpan.endWithError('An error ocurred');
```
