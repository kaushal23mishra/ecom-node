#!/bin/bash
# rollback.sh - Rollback script for Node.js application

set -e

echo "⚠️  Rolling back deployment for node-app..."

# Undo the last deployment
kubectl rollout undo deployment/node-app

# Wait for rollout
kubectl rollout status deployment/node-app --timeout=300s

echo "✅ Rollback successful!"
