# Architecture Decision Records

Each ADR captures a significant infrastructure choice in ore.

## ADR-001: ECS Fargate over ECS on EC2

**Context:** SaaS apps need container orchestration without dedicating ops time to patching EC2 hosts.

**Decision:** Use ECS Fargate for all application workloads.

**Consequences:** No SSH to hosts; pay per vCPU/memory per task. Cold starts are slightly higher than warm EC2 but operational cost is lower for small teams.

## ADR-002: RDS Multi-AZ in production

**Context:** Database downtime directly impacts revenue and customer trust.

**Decision:** Enable `rds_multi_az = true` in staging/prod tfvars; single-AZ in dev for cost.

**Consequences:** Automatic failover on AZ failure (~60–120s). Roughly 2x RDS compute cost vs single-AZ.

## ADR-003: Application Load Balancer over NLB

**Context:** HTTP APIs need path-based routing, health checks, and TLS termination.

**Decision:** ALB in front of ECS tasks; NLB not used unless raw TCP/L4 requirements emerge.

**Consequences:** Lower cost than NLB for HTTP use cases; HTTP/2 and redirect rules available.

## ADR-004: CloudWatch baseline, Datadog optional

**Context:** Every stack needs logs and alarms; premium APM is optional.

**Decision:** CloudWatch Logs + SNS alarms by default. Datadog via optional log subscription to a Forwarder Lambda.

**Consequences:** No vendor lock-in for baseline observability. Datadog requires separate forwarder deployment.

## ADR-005: Secrets Manager over environment variables

**Context:** Credentials in `.env` files leak via git and CI logs.

**Decision:** Store database password and JWT secret in AWS Secrets Manager; inject into ECS task definitions.

**Consequences:** Secrets in Terraform state graph for RDS bootstrap password; rotation is manual today (see SECURITY.md).

## ADR-006: S3 + DynamoDB remote state

**Context:** Teams need locking, versioning, and shared state without Terraform Cloud lock-in.

**Decision:** Bootstrap module creates encrypted S3 bucket + DynamoDB lock table. One state key per environment.

**Consequences:** Chicken-and-egg bootstrap step documented in DEPLOYMENT.md. Terraform Cloud documented as alternative in TERRAFORM-CLOUD.md.

## ADR-007: Rolling deployment over CodeDeploy blue-green

**Context:** Zero-downtime deploys are required; full blue-green adds CodeDeploy complexity.

**Decision:** ECS rolling updates (`min healthy 50%`, `max 200%`) for v1. CodeDeploy blue-green documented as future extension.

**Consequences:** Brief capacity overlap during deploys; simpler CI pipeline. Not true blue-green traffic shifting.

## ADR-008: Per-environment Terraform state keys

**Context:** Applying dev and prod tfvars to the same state key destroys or corrupts environments.

**Decision:** State keys like `ore/dev/terraform.tfstate`, `ore/staging/...`, `ore/prod/...`.

**Consequences:** Operators must run `./scripts/init.sh dev|staging|prod` before plan/apply.
