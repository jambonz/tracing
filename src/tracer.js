const {propagation, trace} = require('@opentelemetry/api');
const {registerInstrumentations} = require('@opentelemetry/instrumentation');
const {NodeTracerProvider} = require('@opentelemetry/sdk-trace-node');
const {Resource} = require('@opentelemetry/resources');
const {SemanticResourceAttributes} = require('@opentelemetry/semantic-conventions');
const {BatchSpanProcessor} = require('@opentelemetry/sdk-trace-base');
const {JaegerExporter} = require('@opentelemetry/exporter-jaeger');
const {ZipkinExporter} = require('@opentelemetry/exporter-zipkin');
const {OTLPTraceExporter} = require('@opentelemetry/exporter-trace-otlp-http');
const {Propagator} = require('./propagator');

class JambonzTracer {

  constructor(traceOptions) {
    this.traceOptions = traceOptions;
  }

  get tracer() {
    const {serviceName, enabled, version, jaegerHost, jaegerEndpoint, zipkinUrl, collectorUrl} = this.traceOptions;
    if (enabled) {
      const provider = new NodeTracerProvider({
        resource: new Resource({
          [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
          [SemanticResourceAttributes.SERVICE_VERSION]: version,
        }),
      });
      propagation.setGlobalPropagator(new Propagator());
      let exporter;
      if (jaegerHost || jaegerEndpoint) {
        exporter = new JaegerExporter();
      } else if (zipkinUrl) {
        exporter = new ZipkinExporter({url: zipkinUrl});
      } else {
        exporter = new OTLPTraceExporter({
          url: collectorUrl,
        });
      }

      provider.addSpanProcessor(new BatchSpanProcessor(exporter, {
        // The maximum queue size. After the size is reached spans are dropped.
        maxQueueSize: 100,
        // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
        maxExportBatchSize: 10,
        // The interval between two consecutive exports
        scheduledDelayMillis: 500,
        // How long the export can run before it is cancelled
        exportTimeoutMillis: 30000,
      }));

      // Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
      provider.register();
      registerInstrumentations({
        instrumentations: [
          //new HttpInstrumentation(),
          //new ExpressInstrumentation(),
          //new PinoInstrumentation()
        ],
      });
    }

    return trace.getTracer(serviceName);
  }
}

module.exports = {
  JambonzTracer,
};

