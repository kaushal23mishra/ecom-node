# ADR 007: Monitoring & Observability Strategy

**Date**: 2026-02-04  
**Status**: ✅ Accepted  
**Deciders**: Development Team

---

## Context

We need visibility into the application's performance, health, and error rates in real-time. Traditional logging is reactive for debugging, but monitoring is proactive for detecting incidents before users report them. Use of RED Method (Rate, Errors, Duration) is standard.

### Requirements
- Real-time metrics collection
- Standard metrics (CPU, Memory, Event Loop)
- Application metrics (HTTP Request Duration, Error Rates)
- Exposition format compatible with Prometheus
- Dashboards for visualization

---

## Decision

We will use **Prometheus** for metrics collection and **Grafana** for visualization.

### 1. Instrumentation
**Library**: `prom-client`
**Implementation**:
- Expose `/metrics` endpoint for scraping.
- Middleware to track HTTP duration (Histogram) and counts (Counters).
- Default Node.js process metrics (GC, Memory, CPU).

### 2. Metrics Strategy (RED Method)
- **Rate**: `http_requests_total`
- **Errors**: `http_errors_total` (or filter `http_requests_total` by 5xx code)
- **Duration**: `http_request_duration_seconds`

### 3. Health Checks
- `/health`: Application status
- `/health/detailed`: Deep dependencies check
- `/health/ready` & `/health/live`: Kubernetes probes

---

## Consequences

### Positive
✅ **Visibility**: Instant insight into traffic spikes and latency.
✅ **Alerting**: Can configure alerts based on metric thresholds (e.g., >1% error rate).
✅ **Standardization**: Prometheus is the CNCF standard for cloud-native monitoring.

### Negative
⚠️ **Storage**: Requires external infrastructure (Prometheus Server) to store time-series data.
⚠️ **Security**: `/metrics` endpoint exposes internals; must be protected in production (e.g., allow-list specific IP or basic auth).

---

## References

- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
- [RED Method](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/)
