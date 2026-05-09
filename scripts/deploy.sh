#!/bin/bash
# deploy.sh - Deployment script for Node.js application

set -e

ENV=$1
TAG=${2:-latest}

if [ -z "$ENV" ]; then
  echo "Usage: ./deploy.sh [environment] [tag]"
  exit 1
fi

echo "🚀 Deploying version $TAG to $ENV environment..."

# 1. Pull latest manifests
# 2. Update image tag in deployment.yml (using sed or kustomize)
# Example using sed:
# sed -i "s|image: node-dhi:.*|image: node-dhi:$TAG|g" k8s/deployment.yml

# 3. Apply manifests
kubectl apply -f k8s/configmap.yml
# Note: Secrets should be managed securely (e.g. sealed secrets, vault, or manual apply)
# kubectl apply -f k8s/secret.yml 

kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/service.yml
kubectl apply -f k8s/hpa.yml
kubectl apply -f k8s/ingress.yml

# 4. Wait for rollout
kubectl rollout status deployment/node-app --timeout=300s

echo "✅ Deployment successful!"
