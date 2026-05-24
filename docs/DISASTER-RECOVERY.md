# Disaster Recovery

Step-by-step recovery procedures with expected timing.

## RDS Multi-AZ failover

**Scenario:** Primary AZ failure.

**Expected RTO:** 60–120 seconds (AWS-managed).

**Steps:**

1. CloudWatch alarm `ore-prod-rds-*` may fire.
2. Verify in RDS Console → instance status `available`, AZ changed.
3. ECS tasks reconnect automatically (same endpoint hostname).
4. No Terraform action required.

**Validate (non-prod drill):** Reboot RDS with failover option in Console.

---

## Point-in-time recovery (PITR)

**Scenario:** Bad migration deleted data; need restore to 2 hours ago.

**Prerequisites:** `backup_retention_period > 0` (7 dev / 30 prod).

**Steps:**

1. Note target time (UTC): e.g. `2026-05-23T14:00:00Z`
2. RDS Console → **Restore to point in time** → new instance identifier `ore-prod-postgres-restored`
3. Update Secrets Manager password if new master credentials generated
4. Update ECS task env / apply Terraform to point `DATABASE_HOST` at restored endpoint
5. `aws ecs update-service --force-new-deployment`

**Expected RTO:** 20–40 minutes depending on storage size.

```bash
aws rds describe-db-snapshots --db-instance-id ore-prod-postgres
```

---

## ECS cluster at capacity

**Scenario:** Traffic spike; CPU alarm fires.

**Automatic:** Auto-scaling adds tasks (target tracking 70% CPU).

**Manual override:**

```bash
aws ecs update-service --cluster CLUSTER --service SERVICE --desired-count 5
```

Note: Terraform ignores `desired_count` changes on service (`lifecycle ignore_changes`).

---

## Compromised secret rotation

**Scenario:** JWT secret leaked.

**Steps:**

1. Generate new secret in Secrets Manager Console or update via Terraform `jwt_secret`
2. `terraform apply -var-file=environments/prod.tfvars`
3. Force ECS deployment to pick up new secret version:

```bash
aws ecs update-service --cluster CLUSTER --service SERVICE --force-new-deployment
```

**Expected downtime:** None if rolling deploy succeeds.

---

## Terraform state corruption

**Scenario:** Bad merge corrupted `terraform.tfstate`.

**Steps:**

1. S3 Console → state bucket → **Versions** → restore previous version
2. `terraform plan` to reconcile drift

Bootstrap bucket has versioning enabled ([`terraform/bootstrap/main.tf`](../terraform/bootstrap/main.tf)).

---

## Regional disaster

This stack is **single-region**. For region loss:

1. Restore latest RDS snapshot to secondary region
2. Apply Terraform in secondary region with separate state key (`ore/prod/eu-west-1/terraform.tfstate`)
3. Update DNS (Route 53) to new ALB/CloudFront

See [examples/multi-region](../examples/multi-region/README.md).
