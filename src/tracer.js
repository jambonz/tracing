const api = require('@opentelemetry/api');
const {NodeTracerProvider} = require('@opentelemetry/sdk-trace-node');
const {Resource} = require('@opentelemetry/resources');
const {SemanticResourceAttributes} = require('@opentelemetry/semantic-conventions');
const {BatchSpanProcessor} = require('@opentelemetry/sdk-trace-base');
const {JaegerExporter} = require('@opentelemetry/exporter-jaeger');
const {ZipkinExporter} = require('@opentelemetry/exporter-zipkin');
const {OTLPTraceExporter} = require('@opentelemetry/exporter-trace-otlp-http');
const {Propagator} = require('./propagator');
// eslint-disable-next-line no-unused-vars
const {trace, diag, DiagConsoleLogger, DiagLogLevel, TracerAPI} = api;

class JambonzTracer {

  /**
   * Creates a new JambonzTracer.
   *
   * @param {Object} traceOptions - The configuration object
   * @param {string} traceOptions.name - The name of the tracer.
   * @param {boolean} [traceOptions.enabled] - Enable tracing.
   * @param {string} traceOptions.version - App version.
   * @param {string} [traceOptions.jaegerHost] - Jaeger host.
   * @param {string} [traceOptions.jaegerEndpoint] - Jaeger endpoint.
   * @param {string} [traceOptions.zipkinUrl] - Zipkin url.
   * @param {string} [traceOptions.collectorUrl] - collectorUrl url.
   * @param {string} [traceOptions.logLevel] - Log level.
   * @return {JambonzTracer} The RootSpan instance.
   */
  constructor(traceOptions) {
    this._traceOptions = traceOptions;
    this._tracer = this.buildTracer();
  }

  buildTracer() {
    const {
      name,
      enabled,
      version,
      jaegerHost,
      jaegerEndpoint,
      zipkinUrl,
      collectorUrl,
      logLevel,
    } = this._traceOptions;
    if (enabled) {
      const provider = new NodeTracerProvider({
        resource: new Resource({
          [SemanticResourceAttributes.SERVICE_NAME]: name,
          [SemanticResourceAttributes.SERVICE_VERSION]: version,
        }),
      });
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

      const logger = new DiagConsoleLogger();
      switch (logLevel || 'warn') {
        case 'info':
          diag.setLogger(logger, DiagLogLevel.INFO);
          break;
        case 'debug':
          diag.setLogger(logger, DiagLogLevel.DEBUG);
          break;
        case 'trace':
          diag.setLogger(logger, DiagLogLevel.VERBOSE);
          break;
        default:
          diag.setLogger(logger, DiagLogLevel.WARN);
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
      provider.register({
        propagator: new Propagator(),
      });
      // registerInstrumentations({
      //   instrumentations: [
      //     //new HttpInstrumentation(),
      //     //new ExpressInstrumentation(),
      //     //new PinoInstrumentation()
      //   ],
      // });
    }

    return trace.getTracer(name);
  }

  /**
   * tracer.
   * @type {TracerAPI} opentelemetry TracerAPI
   */
  get tracer() {
    return this._tracer;
  }

  /**
   * name of tracer.
   * @type {string}
   */
  get name() {
    return this._traceOptions.serviceName;
  }

  /**
   * enabled.
   * @type {boolean}
   */
  get enabled() {
    return this._traceOptions.enabled;
  }
}

module.exports = {
  JambonzTracer,
};

