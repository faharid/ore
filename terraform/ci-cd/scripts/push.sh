#!/usr/bin/env bash
set -euo pipefail

ECR_REGISTRY="${ECR_REGISTRY:?Set ECR_REGISTRY}"
IMAGE_NAME="${IMAGE_NAME:-ore-app}"
IMAGE_TAG="${IMAGE_TAG:-${CI_COMMIT_SHA:-latest}}"

docker push "${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
docker push "${ECR_REGISTRY}/${IMAGE_NAME}:latest"

echo "Pushed ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
