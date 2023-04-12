import {Context, Span, TraceFlags} from "@opentelemetry/api";
import {Tracer} from "@opentelemetry/api/build/src/trace/tracer";
import {ChildSpanContext} from "./span-context";

export declare class RootSpan {
  private _span: Span
  private _ctx: Context
  private tracer: Tracer

  constructor(callType: string, attributes: any, req: any);

  context(): Context;

  traceId(): string;

  spanId(): string;

  traceFlags(): TraceFlags;

  getTracingPropagation(encoding: string): string;

  setAttributes(attrs: any): void;

  end(): void

  startChildSpan(name: string, attributes: any): ChildSpanContext;
}
