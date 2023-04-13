const {trace, context, SpanKind, propagation} = require('@opentelemetry/api');
const {SpanStatusCode} = require('@opentelemetry/api/build/src/trace/status');

class RootSpan {

  constructor(callType, req, logger) {
    this.logger = logger;
    this.name = callType;
    this.tracer = req.srf.locals.otel.tracer;
    const ctx = propagation.extract(context.active(), req);
    this._span = this.tracer.startSpan(callType, {
      kind: SpanKind.CONSUMER,
      attributes: this.getSpanAttributes(req),
      root: false,
    }, ctx);
    this._ctx = trace.setSpan(ctx, this._span);
  }

  getSpanAttributes(req) {
    const {sip, callSid, linkedSpanId} = req;
    if (callSid) {
      const {callId} = sip;
      return {
        linkedSpanId,
        callId,
        callSid,
      };
    } else {
      const {locals} = req;
      const {callSid} = req.locals;
      return {
        callSid,
        accountSid: req.get('X-Account-Sid'),
        applicationSid: locals.application_sid,
        callId: req.get('Call-ID'),
        externalCallId: req.get('X-CID'),
      };
    }
  }

  get context() {
    return this._ctx;
  }

  get traceId() {
    return this._span.spanContext().traceId;
  }

  get spanId() {
    return this._span.spanContext().spanId;
  }

  get traceFlags() {
    return this._span.spanContext().traceFlags;
  }

  getTracingPropagation(encoding) {
    // TODO: support encodings beyond b3 https://github.com/openzipkin/b3-propagation
    if (this._span && this.traceId !== '00000000000000000000000000000000') {
      return `${this.traceId}-${this.spanId}-1`;
    }
  }

  setAttributes(attributes) {
    this.logger.debug({attributes}, `setting attributes for span: ${this.name}`);
    this._span.setAttributes(attributes);
  }

  end() {
    if (!this.ended) {
      this.logger.debug(`ending span: ${this.name}`);
      this._span.end();
    } else {
      this.logger.info(`cannot span that has already ended: ${this.name}`);
    }
  }

  startChildSpan(name, attributes) {
    this.logger.debug({name, attributes}, 'starting child span of rootSpan');
    const span = this.tracer.startSpan(name, attributes, this._ctx);
    const ctx = trace.setSpan(this._ctx, span);
    return new ChildSpan(name, span, ctx, this.logger, this.tracer);
  }
}

class ChildSpan {

  constructor(name, span, ctx, logger, tracer) {
    this.logger = logger;
    this.name = name;
    this.tracer = tracer;
    this._span = span;
    this._ctx = ctx;
  }

  get context() {
    return this._ctx;
  }

  get traceId() {
    return this._span.spanContext().traceId;
  }

  get spanId() {
    return this._span.spanContext().spanId;
  }

  get traceFlags() {
    return this._span.spanContext().traceFlags;
  }

  getTracingPropagation(encoding) {
    // TODO: support encodings beyond b3 https://github.com/openzipkin/b3-propagation
    if (this._span && this.traceId !== '00000000000000000000000000000000') {
      return `${this.traceId}-${this.spanId}-1`;
    }
  }

  setAttributes(attrs) {
    this._span.setAttributes(attrs);
  }

  end() {
    if (!this.ended) {
      this.logger.debug(`ending span: ${this.name}`);
      this._span.end();
    } else {
      this.logger.info(`cannot span that has already ended: ${this.name}`);
    }
  }

  endWithError(message) {
    this._span.setStatus({
      code: SpanStatusCode.ERROR,
      message
    });
    this.end();
  }

  startChildSpan(name, attributes) {
    this.logger.debug({name, attributes}, 'starting child span');
    const span = this.tracer.startSpan(name, attributes || {}, this._ctx);
    const ctx = trace.setSpan(this._ctx, span);
    return new ChildSpan(name, span, ctx, this.tracer);
  }

}

module.exports = {
  RootSpan,
  ChildSpan
};
