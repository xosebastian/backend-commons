export async function setupOpenTelemetryIfEnabled() {
  if (process.env.OTEL_ENABLED !== 'true') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { NodeSDK } = require('@opentelemetry/sdk-node');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');
    const sdk = new NodeSDK({ traceExporter: new TraceExporter() });
    await sdk.start();
    return sdk;
  } catch (err) {
    console.error('OpenTelemetry setup failed', err);
  }
}
