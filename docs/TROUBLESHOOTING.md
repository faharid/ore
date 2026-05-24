# Troubleshooting

Scenario-based fixes with reproduction steps.

---

## ECS tasks constantly restarting

**Symptoms:** Service never stabilizes; `runningCount` < `desiredCount`.

**Diagnose:**

```bash
aws ecs describe-services --cluster CLUSTER --services SERVICE \
  --query 'services[0].events[0:5]'
aws logs tail /ecs/SERVICE_NAME --since 30m
```

**Common causes:**

1. **Health check mismatch** — ALB checks `/api/health` on port 3001 but container listens elsewhere.
   - Fix: align `container_port`, `health_check_path` in tfvars with app.

2. **OOM kill** — Memory limit too low.
   - CloudWatch Logs snippet: `OutOfMemoryError` or exit code 137.
   - Fix: increase `ecs_memory` in tfvars.

3. **Secrets permission** — Task execution role cannot read Secrets Manager.
   - Fix: verify `secrets_arns` on IAM module includes all secret ARNs.

---

## RDS connection pool exhaustion

**Symptoms:** App logs `too many connections`; intermittent 500s under load.

**Diagnose:**

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name DatabaseConnections \
  --dimensions Name=DBInstanceIdentifier,Value=INSTANCE_ID \
  --start-time $(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 300 --statistics Maximum
```

**Fix (short term):** Scale down ECS tasks or increase `max_connections` in RDS parameter group.

**Fix (production):** Add PgBouncer sidecar or ElastiCache — documented as future module in CONTRIBUTING.md.

---

## ALB returns 502 Bad Gateway

**Symptoms:** `curl` ALB URL returns 502; targets unhealthy.

**Diagnose:**

```bash
TG_ARN=$(aws elbv2 describe-target-groups --names ore-dev-tg --query 'TargetGroups[0].TargetGroupArn' -o text)
aws elbv2 describe-target-health --target-group-arn "$TG_ARN"
```

**Common causes:**

1. **Security group** — ALB SG cannot reach ECS SG on container port.
2. **App not listening** — Task running but wrong port.
3. **Health check path** — Returns non-2xx.

**Fix:** Match SG rules in `modules/vpc/security-groups.tf`; verify container binds `0.0.0.0`.

---

## Deployment takes 15+ minutes

**Symptoms:** `aws ecs wait services-stable` times out.

**Explanation:** ECS drains old tasks (`deregistration_delay` 30s on target group) + new task health check grace (`health_check_grace_period` 60s) + image pull on cold start.

**Mitigate:** Pre-warm ECR image; reduce grace period only if health endpoint is fast.

---

## CloudFront 502 to origin

**Symptoms:** CloudFront URL fails; ALB direct URL works.

**Cause:** Origin protocol `https-only` but ALB has no TLS cert.

**Fix:** Set `origin_protocol_policy = "http-only"` (automatic when ALB has no cert) or enable `domain_name` + ACM validation.

---

## `terraform init` / state errors

See [DEPLOYMENT.md](DEPLOYMENT.md). Ensure unique state key per environment:

```
ore/dev/terraform.tfstate
ore/prod/terraform.tfstate
```

---

## SNS alarms not received

Confirm subscription: AWS sends confirmation email to `alarm_email`. Click link before alarms fire.

---

## IAM deployment role trust fails in CI

Configure OIDC — [CI-OIDC.md](CI-OIDC.md). Ensure `allowed_oidc_subjects` matches your repo ref.
