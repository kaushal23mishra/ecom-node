# ADR 009: Scalability Strategy

## Status
Proposed

## Context
As the application grows, it needs to handle increased load (more users, more data, more concurrent requests). The previous architecture relied on in-memory caching and lacked asynchronous processing, which limited horizontal scaling.

## Decision
We will implement the following strategies to ensure the application is "10/10 Scalable":

1.  **Horizontal Scaling**:
    - The application is stateless and can run multiple instances behind a load balancer (Nginx/K8s Service).
    - Use `cluster` mode for multi-core utilization on a single node.
    - Leverage Kubernetes Horizontal Pod Autoscaler (HPA) for automatic scaling based on demand.

2.  **Distributed Caching**:
    - Replace/Augment local in-memory cache with **Redis**.
    - Ensures all application nodes share the same cache state.

3.  **Asynchronous Processing (Task Queues)**:
    - Use **BullMQ** with Redis for offloading long-running or resource-intensive tasks (e.g., sending emails, generating reports, image processing).
    - Separate Workers from the main API process to prevent blocking the event loop.

4.  **Database Scalability**:
    - Implement connection pooling.
    - Plan for MongoDB Sharding or Read Replicas as data volume grows.

5.  **API Gateway**:
    - Use an Ingress Controller (Nginx) to handle SSL termination, rate limiting, and request routing.

## Consequences

### Positive
- **High Availability**: Multiple pods ensure no single point of failure at the app level.
- **Improved Performance**: Heavy tasks don't block user requests.
- **Predictable Cost**: Scale up only when needed; scale down during low traffic.

### Negative
- **Infrastructure Dependency**: Requires a managed Redis service or self-hosted Redis.
- **Debugging Complexity**: Distributed systems are harder to debug (requires proper tracing/correlation IDs, which we have implemented).
