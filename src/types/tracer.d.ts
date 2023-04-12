import {TraceOptions} from "./trace-options";
import {Tracer} from "@opentelemetry/api/build/src/trace/tracer";

export declare class JambonzTracer {
  constructor(options: TraceOptions)
  tracer(): Tracer
}
