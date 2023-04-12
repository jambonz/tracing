import {Context, Span} from "@opentelemetry/api";

export interface ChildSpanContext {
  span: Span;
  context: Context
}
