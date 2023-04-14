// eslint-disable-next-line no-unused-vars
const {trace, context, SpanKind, Span, Context, propagation, TraceAPI, SpanStatusCode} = require('@opentelemetry/api');

/**
 * A logger such as Pino
 * @typedef {(any)} Logger
 */


/** @class RootSpan  A utility class wrapper around a Span */
class RootSpan extends BaseSpan {

  /**
   * Creates a new RootSpan.
   *
   * @param {string} name name of the span.
   * @param {string} [traceId] A 16-byte array with at least one non-zero byte.
   * Or a UUID v4 equivalent. Leave null to generate new root traceId.
   * @param {string} [spanId] A 8-byte array with at least one non-zero byte.
   * If null and traceId exists a spanId will be generated based on traceId.
   * Otherwise, it will just simply be generated
   * @param {Map} [attributes={}] Arbitrary data to attach to the span.
   * @param {TraceAPI} tracer The tracer API instance. @see TraceAPI
   * @param {Logger} [logger] A logger based on Pino. Leave null for noop.
   * @return {RootSpan} The RootSpan instance.
   */
  constructor(name, traceId, spanId, attributes, tracer, logger) {
    const ctx = propagation.extract(context.active(), {traceId, spanId});
    const span = tracer.startSpan(name, { attributes: attributes || {}, kind: SpanKind.CONSUMER, root: false }, ctx);
    super(name, span, trace.setSpan(ctx, span), tracer, logger);
  }

  startChildSpan(name, attributes) {
    this.logger.debug({name, attributes}, 'starting child span of rootSpan');
    const span = this.tracer.startSpan(name, attributes, this._ctx);
    const ctx = trace.setSpan(this._ctx, span);
    return new ChildSpan(name, span, ctx, this.tracer, this.logger);
  }
}


/** @class ChildSpan  A utility class wrapper around a Span */
class ChildSpan extends BaseSpan {

  /**
   * Creates a new ChildSpan.
   *
   * @param {string} name name of the span.
   * @param {Span} span opentelemetry Span.
   * @param {Context} ctx opentelemetry Context.
   * @param {TraceAPI} tracer The tracer API instance.
   * @param {Logger} logger A logger based on Pino.
   * @return {ChildSpan} The ChildSpan instance.
   */
  constructor(name, span, ctx, tracer, logger) {
    super(name, span, ctx, tracer, logger);
  }

}


class BaseSpan {

  constructor(name, span, ctx, tracer, logger) {
    /** @private */ this.logger = logger;
    /** @private */ this.name = name;
    /** @private */ this.tracer = tracer;
    /** @private */ this._span = span;
    /** @private */ this._ctx = ctx;
  }

  /**
   * context.
   * @type {Context} opentelemetry Context
   */
  get context() {
    return this._ctx;
  }

  /**
   * traceId.
   * @type {string} opentelemetry SpanContext traceId
   */
  get traceId() {
    return this._span.spanContext().traceId;
  }

  /**
   * spanId.
   * @type {string} opentelemetry SpanContext spanId
   */
  get spanId() {
    return this._span.spanContext().spanId;
  }

  /**
   * traceFlags.
   * @type {TraceFlags} opentelemetry SpanContext TraceFlags
   */
  get traceFlags() {
    return this._span.spanContext().traceFlags;
  }

  /**
   * Returns B3 encoded Propagation String
   * @return {string}
   */
  getTracingPropagation(encoding) {
    // TODO: support encodings beyond b3 https://github.com/openzipkin/b3-propagation
    if (this._span && this.traceId !== '00000000000000000000000000000000') {
      return `${this.traceId}-${this.spanId}-1`;
    }
  }

  /**
   * Extracted propogation X-TraceId & X-SpanId map
   * @return {string}
   */
  getSIPTracingPropagationHeaders() {
    if (this._span && this.traceId !== '00000000000000000000000000000000') {
      return {
        'X-Trace-ID': this.traceId,
        'X-Span-ID': this.spanId,
      };
    }
    return {};
  }

  /**
   * Sets Attributes on underlying Span
   * @return {BaseSpan} Builder Pattern
   */
  setAttributes(attributes) {
    this.logger.debug({attributes}, `setting attributes for span: ${this.name}`);
    this._span.setAttributes(attributes);
    return this;
  }

  /**
   * Sets Error on underlying Span
   * @return {BaseSpan} Builder Pattern
   */
  setError(message) {
    this._span.setStatus({
      code: SpanStatusCode.ERROR,
      message,
    });
    return this;
  }

  /**
   * End Span
   * @return {BaseSpan} Builder Pattern
   */
  end() {
    if (!this.ended) {
      this.logger.debug(`ending span: ${this.name}`);
      this._span.end();
    } else {
      this.logger.info(`cannot span that has already ended: ${this.name}`);
    }
    return this;
  }

  /**
   * End Span with an error
   * @param {string} message The error message.
   * @return {BaseSpan} Builder Pattern
   */
  endWithError(message) {
    this._span.setStatus({
      code: SpanStatusCode.ERROR,
      message,
    });
    this.end();
    return this;
  }

  /**
   * Start a new ChildSpan
   * @param {string} name span name
   * @param {Map} [attributes={}] Arbitrary data to attach to the span.
   * @return {ChildSpan} new ChildSpan instance
   */
  startChildSpan(name, attributes) {
    const span = this.tracer.startSpan(name, attributes || {}, this._ctx);
    const ctx = trace.setSpan(this._ctx, span);
    return new ChildSpan(name, span, ctx, this.tracer, this.logger);
  }
}

module.exports = {
  RootSpan,
  ChildSpan,
};
