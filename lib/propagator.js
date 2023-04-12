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
    const callSid = this.getCallSidFromCarrier(carrier);
    if (!callSid) {
      return context;
    }
    const traceId = this.getHexValue(callSid);
    const spanId = traceId.substring(0, 16);
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

  getCallSidFromCarrier(carrier) {
    const {callSid, locals} = carrier;
    if (callSid) {
      return callSid;
    } else if (locals) {
      return locals.callSid;
    }
    return null;
  }

  getHexValue(callSid) {
    return callSid.replaceAll('-', '');
  }
}

module.exports = {
  Propagator,
};
