const {
  // eslint-disable-next-line no-unused-vars
  TextMapSetter, Context,
  TraceFlags,
  trace,
  isSpanContextValid,
  isValidTraceId,
  isValidSpanId,
} = require('@opentelemetry/api');
const {isTracingSuppressed} = require('@opentelemetry/core');

/**
 * The Carrier of properties
 * @typedef {(any)} Carrier
 */


/** @class Propagator  Simple TraceID & SpanID Propagator*/
class Propagator {

  /**
   * Creates a new Propagator.
   * @return {Propagator} The Propagator instance.
   */
  constructor() {
  }

  /**
   * Injects the trace information into the given Carrier.
   * @param {Context} context The otel Context
   * @param {Carrier} carrier The output carrier object to inject into
   * @param {TextMapSetter} setter used to set key/value pairs on the carrier
   * @return {void} The Propagator instance.
   */
  inject(context, carrier, setter) {
    const spanContext = trace.getSpanContext(context);
    if (!spanContext || !isSpanContextValid(spanContext) || isTracingSuppressed(context)) {
      return;
    }
    setter.set(carrier, 'traceId', spanContext.traceId);
    setter.set(carrier, 'spanId', spanContext.spanId);
  }

  /**
   * Extracts the trace information from the given Carrier and returns a new SpanContext.
   * @param {Context} context The otel Context
   * @param {Carrier} carrier The input carrier object to extract from
   * @return {Context} The new or existing immutable context.
   */
  extract(context, carrier) {
    let {traceId, spanId} = carrier;
    if (!traceId) {
      return context;
    }
    traceId = traceId.replaceAll('-', '');
    spanId = spanId || traceId.substring(0, 16);
    if (!isValidTraceId(traceId) || !isValidSpanId(spanId)) {
      return context;
    }
    return trace.setSpanContext(context, {
      traceId,
      spanId,
      isRemote: true,
      traceFlags: TraceFlags.SAMPLED,
    });
  }

  fields() {
    return ['traceId', 'spanId'];
  }
}

module.exports = {
  Propagator,
};
