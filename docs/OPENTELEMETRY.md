# OpenTelemetry plan

OpenTelemetry is the future distributed tracing layer for ALI STORE.

Target trace flow:

Browser interaction
→ frontend request
→ Spring API
→ database/external supplier
→ response

Adopt W3C trace context across the boundary and correlate frontend errors/performance with backend traces.

The browser instrumentation path is intentionally deferred from the critical path because current OpenTelemetry JavaScript documentation describes browser client instrumentation as experimental. Start with backend/server-side tracing, then add browser tracing after the trace-context model is defined.
