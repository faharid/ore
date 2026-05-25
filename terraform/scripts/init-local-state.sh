#!/usr/bin/env bash
# Local Terraform state for development (no S3). Restore remote with init-remote-state.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

if [[ -f backend.tf ]] && grep -q 'backend "s3"' backend.tf 2>/dev/null; then
  cp backend.tf backend.s3.tf.bak
fi
if [[ -f backend.s3.tf ]]; then
  mv backend.s3.tf backend.s3.tf.bak
fi

cat > backend.tf <<'EOF'
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}
EOF

terraform init -reconfigure -input=false "$@"
echo "Local backend active (terraform.tfstate in ${ROOT_DIR})"
echo "For S3 remote state: ./scripts/init-remote-state.sh"
