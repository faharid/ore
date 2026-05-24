#!/usr/bin/env bash
set -euo pipefail

ENV="${1:-dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_CONFIG="${ROOT_DIR}/backend.hcl"
BACKEND_EXAMPLE="${ROOT_DIR}/backend.hcl.example"

echo "==> ore Terraform init (environment: ${ENV})"

if [[ ! -f "${BACKEND_CONFIG}" ]]; then
  if [[ -f "${BACKEND_EXAMPLE}" ]]; then
    echo "Creating backend.hcl from example with key ore/${ENV}/terraform.tfstate"
    sed "s|ore/dev/terraform.tfstate|ore/${ENV}/terraform.tfstate|" "${BACKEND_EXAMPLE}" > "${BACKEND_CONFIG}"
  else
    echo "backend.hcl not found. Copy backend.hcl.example to backend.hcl"
    exit 1
  fi
fi

if ! aws sts get-caller-identity &>/dev/null; then
  echo "AWS credentials not configured. Run: aws configure"
  exit 1
fi

cd "${ROOT_DIR}"
terraform init -backend-config="${BACKEND_CONFIG}" "${@:2}"

echo "Done. State key should be ore/${ENV}/terraform.tfstate"
echo "Next: terraform plan -var-file=environments/${ENV}.tfvars"
