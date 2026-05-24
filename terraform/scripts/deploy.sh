#!/usr/bin/env bash
set -euo pipefail

ENV="${1:-dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VAR_FILE="${ROOT_DIR}/environments/${ENV}.tfvars"

if [[ ! -f "${VAR_FILE}" ]]; then
  echo "Unknown environment: ${ENV}"
  echo "Usage: $0 [dev|staging|prod]"
  exit 1
fi

cd "${ROOT_DIR}"

echo "==> Planning (${ENV})"
terraform plan -var-file="${VAR_FILE}" -out="tfplan-${ENV}"

echo "==> Apply (${ENV})"
terraform apply "tfplan-${ENV}"

echo "==> Outputs"
terraform output
