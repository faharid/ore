#!/usr/bin/env bash
set -euo pipefail

ENV="${1:-dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VAR_FILE="${ROOT_DIR}/environments/${ENV}.tfvars"

if [[ ! -f "${VAR_FILE}" ]]; then
  echo "Unknown environment: ${ENV}"
  exit 1
fi

echo "WARNING: This will destroy all infrastructure for environment: ${ENV}"
read -r -p "Type the environment name to confirm: " CONFIRM

if [[ "${CONFIRM}" != "${ENV}" ]]; then
  echo "Aborted."
  exit 1
fi

cd "${ROOT_DIR}"
terraform destroy -var-file="${VAR_FILE}"
