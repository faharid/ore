#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HEALTH_PATH="${HEALTH_PATH:-/}"
TIMEOUT="${TIMEOUT:-30}"

cd "${ROOT_DIR}"

URL="$(terraform output -raw application_url 2>/dev/null || true)"
if [[ -z "${URL}" ]]; then
  ALB="$(terraform output -raw alb_dns_name 2>/dev/null || true)"
  URL="http://${ALB}${HEALTH_PATH}"
else
  URL="${URL%/}${HEALTH_PATH}"
fi

if [[ -z "${URL}" || "${URL}" == "http://" ]]; then
  echo "Could not resolve application URL from terraform outputs."
  exit 1
fi

echo "Checking: ${URL}"
HTTP_CODE="$(curl -sS -o /dev/null -w "%{http_code}" --max-time "${TIMEOUT}" "${URL}" || echo "000")"

if [[ "${HTTP_CODE}" =~ ^2 ]]; then
  echo "OK (${HTTP_CODE})"
  exit 0
fi

echo "FAIL (HTTP ${HTTP_CODE})"
exit 1
