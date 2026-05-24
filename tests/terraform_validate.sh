#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Terraform validate (bootstrap)"
cd "${ROOT}/terraform/bootstrap"
terraform init -backend=false
terraform validate

echo "==> Terraform validate (root)"
cd "${ROOT}/terraform"
terraform init -backend=false
terraform validate

echo "All validation checks passed."
