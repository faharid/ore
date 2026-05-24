# Problems ore Solves

Real scenarios this stack addresses — and how.

## 1. "We rebuild VPC + ECS for every project"

**Problem:** Copy-paste Terraform from old repos; security groups drift; no standard module layout.

**Solution:** Reusable modules under `terraform/modules/` with environment tfvars (`dev`, `staging`, `prod`).

## 2. "Deploys cause downtime"

**Problem:** Single-instance deploys take the app offline.

**Solution:** ECS rolling deployments behind an ALB with health checks. Tasks register only when `/api/health` passes.

**Limitation:** Rolling deploy, not CodeDeploy blue-green (see [DECISIONS.md](DECISIONS.md)).

## 3. "Database failover is manual"

**Problem:** Self-managed Postgres requires runbooks and human intervention.

**Solution:** RDS Multi-AZ in staging/prod — AWS promotes standby on primary failure.

## 4. "Secrets leaked in git"

**Problem:** `.env` files and tfvars with passwords committed to VCS.

**Solution:** Secrets Manager + auto-generated passwords; `terraform.tfvars` gitignored.

## 5. "No alerts until customers complain"

**Problem:** Silent CPU spikes, 5xx errors, disk full.

**Solution:** CloudWatch alarms on ECS CPU/memory, ALB 5xx, RDS CPU/storage → SNS email.

## 6. "Database exposed to the internet"

**Problem:** Misconfigured security groups or public RDS.

**Solution:** RDS in private subnets; SG chain ALB → ECS → RDS on port 5432 only.

## 7. "CI uses long-lived AWS keys"

**Problem:** Static access keys in GitHub secrets rotate poorly and over-privilege pipelines.

**Solution:** OIDC trust on deployment IAM role ([CI-OIDC.md](CI-OIDC.md)).

## 8. "Dev costs look like prod"

**Problem:** Same stack size in dev burns budget.

**Solution:** `dev.tfvars`: single NAT, `db.t3.micro`, 1 ECS task, 7-day backups.
