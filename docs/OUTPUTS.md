# Terraform Outputs Reference

Example values after `terraform apply -var-file=environments/dev.tfvars` (fictitious).

## Application access

| Output | Example | How to use |
|--------|---------|------------|
| `application_url` | `http://ore-dev-alb-123.us-east-1.elb.amazonaws.com` | Open in browser or `curl` health check |
| `alb_dns_name` | `ore-dev-alb-123.us-east-1.elb.amazonaws.com` | DNS CNAME target if using external DNS |

```bash
curl "$(terraform output -raw application_url)/api/health"
```

## ECS / ECR

| Output | Example | How to use |
|--------|---------|------------|
| `ecs_cluster_name` | `ore-dev-cluster` | `aws ecs list-services --cluster ...` |
| `ecs_service_name` | `ore-dev-service` | CI deploy script `ECS_SERVICE` |
| `ecr_repository_url` | `123456789012.dkr.ecr.us-east-1.amazonaws.com/ore-dev-app` | Docker push target |

**Deployment role:** `deployment_role_arn` — CI assumes this via OIDC ([CI-OIDC.md](CI-OIDC.md)). Permissions: ECR push, ECS update, PassRole for task roles.

## Database

| Output | Sensitive | How to use |
|--------|-----------|------------|
| `rds_address` | yes | App connects via `DATABASE_HOST` (injected in task def) |
| `rds_endpoint` | yes | Full host:port string |
| `database_password_secret_arn` | yes | Secrets Manager; ECS reads at task start |

## Observability

| Output | Example |
|--------|---------|
| `sns_alarm_topic_arn` | Confirm email subscription in inbox |

## Optional

| Output | When set |
|--------|----------|
| `cloudfront_domain_name` | `enable_cloudfront = true` |
| `client_vpn_endpoint_dns` | `enable_client_vpn = true` + cert |

## Task IAM permissions (summary)

- **Task execution role:** ECR pull, CloudWatch Logs write, Secrets Manager read.
- **Task role:** SSM messages (ECS Exec when enabled).
- **Deployment role:** ECR push, ECS service update (CI only).

See [`terraform/modules/iam/`](../terraform/modules/iam/).
