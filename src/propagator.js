const {TraceFlags, trace, isSpanContextValid, isValidTraceId, isValidSpanId} = require('@opentelemetry/api');
const {isTracingSuppressed} = require('@opentelemetry/core');

class Propagator {
  constructor() {
  }

  inject(context, carrier, setter) {
    const spanContext = trace.getSpanContext(context);
    if (!spanContext || !isSpanContextValid(spanContext) || isTracingSuppressed(context)) {
      return;
    }
    setter.set(carrier, 'traceId', spanContext.traceId);
    setter.set(carrier, 'spanId', spanContext.spanId);
  }

  extract(context, carrier) {
    let {traceId, spanId} = carrier;
    if (!traceId) {
      return context;
    }
    traceId = this.getHexValue(traceId);
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

  getHexValue(callSid) {
    return callSid.replaceAll('-', '');
  }
}

module.exports = {
  Propagator,
};
