import {TraceOptions} from "./trace-options";
import {Tracer} from "@opentelemetry/api/build/src/trace/tracer";

declare function tracer(options: TraceOptions): Tracer

export = tracer;
