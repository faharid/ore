#!/usr/bin/env bash
set -euo pipefail

ECS_CLUSTER="${ECS_CLUSTER:?Set ECS_CLUSTER}"
ECS_SERVICE="${ECS_SERVICE:?Set ECS_SERVICE}"
AWS_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

echo "==> Forcing new ECS deployment: ${ECS_CLUSTER}/${ECS_SERVICE}"
aws ecs update-service \
  --cluster "${ECS_CLUSTER}" \
  --service "${ECS_SERVICE}" \
  --force-new-deployment \
  --region "${AWS_REGION}" \
  --output text

aws ecs wait services-stable \
  --cluster "${ECS_CLUSTER}" \
  --services "${ECS_SERVICE}" \
  --region "${AWS_REGION}"

echo "Deployment stable."
