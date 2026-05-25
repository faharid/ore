#!/usr/bin/env bash
# Restore S3 remote backend (requires backend.hcl and AWS credentials)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

if [[ ! -f backend.s3.tf.bak ]]; then
  echo "backend.s3.tf.bak missing. Expected S3 backend template from repo."
  exit 1
fi

cp backend.s3.tf.bak backend.tf

BACKEND_CONFIG="${ROOT_DIR}/backend.hcl"
if [[ ! -f "${BACKEND_CONFIG}" ]]; then
  echo "Create backend.hcl from backend.hcl.example first"
  exit 1
fi

terraform init -reconfigure -backend-config="${BACKEND_CONFIG}" -input=false "$@"
echo "S3 backend active"
