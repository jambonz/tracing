export interface TraceOptions {
  serviceName: string;
  enabled: boolean;
  jaegerHost?: string;
  jaegerEndpoint?: string;
  zipkinUrl?: string;
  collectorUrl?: string;
}
