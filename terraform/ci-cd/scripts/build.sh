#!/usr/bin/env bash
set -euo pipefail

# Build and tag application Docker image for ECR.
# Set ECR_REGISTRY, IMAGE_NAME, and optionally DOCKERFILE path.

ECR_REGISTRY="${ECR_REGISTRY:?Set ECR_REGISTRY (e.g. 123456789012.dkr.ecr.us-east-1.amazonaws.com)}"
IMAGE_NAME="${IMAGE_NAME:-ore-app}"
IMAGE_TAG="${IMAGE_TAG:-${CI_COMMIT_SHA:-latest}}"
DOCKERFILE="${DOCKERFILE:-Dockerfile}"

if [[ ! -f "${DOCKERFILE}" ]]; then
  echo "No ${DOCKERFILE} in repo root — skipping image build (infrastructure-only repo)."
  exit 0
fi

aws ecr get-login-password --region "${AWS_DEFAULT_REGION:-us-east-1}" \
  | docker login --username AWS --password-stdin "${ECR_REGISTRY%%/*}"

docker build -t "${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}" -f "${DOCKERFILE}" .
docker tag "${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}" "${ECR_REGISTRY}/${IMAGE_NAME}:latest"

echo "Built ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
