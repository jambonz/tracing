const {tracer} = require('./lib/tracer');
const {Propagator} = require('./lib/propagator');
const {TraceOptions} = require('./lib/trace-options');
const {RootSpan} = require('./lib/root-span');

module.exports = {
  tracer,
  Propagator,
  TraceOptions,
  RootSpan,
};
