#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BOOTSTRAP_DIR="${ROOT_DIR}/bootstrap"
BACKEND_CONFIG="${ROOT_DIR}/backend.hcl"

echo "==> ore Terraform init"

if [[ ! -f "${BACKEND_CONFIG}" ]]; then
  echo "backend.hcl not found. Copy backend.hcl.example to backend.hcl and set your S3 bucket."
  echo "  cp backend.hcl.example backend.hcl"
  echo ""
  echo "To create the state bucket (one-time):"
  echo "  cd bootstrap && terraform init && terraform apply -var='state_bucket_name=YOUR_UNIQUE_BUCKET'"
  exit 1
fi

if ! aws sts get-caller-identity &>/dev/null; then
  echo "AWS credentials not configured. Run: aws configure"
  exit 1
fi

cd "${ROOT_DIR}"
terraform init -backend-config="${BACKEND_CONFIG}" "$@"

echo "Done. Next: terraform plan -var-file=environments/dev.tfvars"
