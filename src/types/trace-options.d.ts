export interface TraceOptions {
  serviceName: string;
  version: string;
  enabled: boolean;
  jaegerHost?: string;
  jaegerEndpoint?: string;
  zipkinUrl?: string;
  collectorUrl?: string;
}
