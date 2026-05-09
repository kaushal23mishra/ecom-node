# Operations Guide

This document covers security, monitoring, performance, and deployment aspects of the **node_dhi** application.

---

## 🛡️ Security Strategy

The application is hardened using multi-layered security controls.

### 1. HTTP Security
- **Helmet.js**: Sets security-related HTTP headers (CSP, HSTS, etc.).
- **CORS**: Restricted to allowed origins only.
- **XSS Protection**: Inputs are sanitized against Cross-Site Scripting.
- **NoSQL Injection**: Restricted characters in MongoDB queries.

### 2. Traffic Protection
- **Rate Limiting**: Throttles requests per IP to prevent Brute-force and DDoS.
- **Size Limits**: Restricted request payload size to prevent memory exhaustion.

---

## 📊 Observability (Monitoring & Logging)

### 1. Structured Logging
- **Winston Logger**: Logs are written in JSON format for easy ingestion by ELK/Splunk.
- **Traceability**: Every request has a `requestId` (Correlation ID) using `AsyncLocalStorage`.
- **Rotation**: Logs rotate daily and are purged after 14 days to save disk space.

### 2. Monitoring & Metrics
- **Prometheus**: Metrics are exposed at `/metrics` (RED method: Requests, Errors, Duration).
- **Health Checks**:
  - `/health`: Basic Liveness probe.
  - `/health/ready`: Readiness probe (DB status).
  - `/health/detailed`: System metrics (Memory, Latency).

---

## ⚡ Performance & Scalability

- **Response Compression**: Gzip compression is enabled via `compression`.
- **Clustering**: Supports Node.js `cluster` mode for multi-core utilization.
- **Caching**: **Redis** is used for caching expensive queries and job queues.
- **Statelessness**: The API is fully stateless, allowing horizontal scaling behind a Load Balancer.

---

## 🏗️ DevOps & Deployment

### CI/CD Pipeline
We use **GitHub Actions** for:
1. **Validation**: Linting, Formatting, Unit Tests.
2. **Security**: Dependency auditing and container scanning.
3. **Deployment**: Automated delivery to staging/production.

### Infrastructure
- **Containerization**: Use the provided `Dockerfile` and `docker-compose.yml`.
- **Orchestration**: Kubernetes manifests are available in `/k8s`.
- **IaC**: Terraform plans for AWS (VPC, EKS) are located in `/terraform`.
