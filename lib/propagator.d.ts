import {Context, TextMapSetter} from "@opentelemetry/api";

export declare class Propagator {
  constructor();

  inject(context: Context, carrier: unknown, setter: TextMapSetter): void;

  extract(context: Context, carrier: unknown): Context;

  fields(): string[];
}
