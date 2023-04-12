class TraceOptions {
  constructor(serviceName, enabled, jaegerHost, jaegerEndpoint, zipkinUrl, collectorUrl) {
    this._enabled = enabled;
    this._jaegerHost = jaegerHost;
    this._jaegerEndpoint = jaegerEndpoint;
    this._zipkinUrl = zipkinUrl;
    this._collectorUrl = collectorUrl;
  }

  get enabled() {
    return this._enabled;
  }

  get jaegerHost() {
    return this._jaegerHost;
  }

  get jaegerEndpoint() {
    return this._jaegerEndpoint;
  }

  get zipkinUrl() {
    return this._zipkinUrl;
  }

  get collectUrl() {
    return this._collectUrl;
  }
}

module.exports = {
  TraceOptions
};
