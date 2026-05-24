# Cost Analysis

Estimated monthly AWS costs (us-east-1, approximate). Use the [AWS Pricing Calculator](https://calculator.aws/) for your workload.

## Summary table

| Component | Dev | Staging | Prod |
|-----------|-----|---------|------|
| NAT Gateway | ~$32 (1x) | ~$32 (1x) | ~$64 (2x) |
| ECS Fargate (512/1024) | ~$15 (1 task) | ~$30 (2 tasks) | ~$45 (3 tasks) |
| RDS PostgreSQL | ~$15 (t3.micro) | ~$25 (t3.small, Multi-AZ) | ~$70 (t3.medium, Multi-AZ) |
| ALB | ~$18 | ~$18 | ~$18 |
| CloudFront | — | — | ~$5–20 (traffic dependent) |
| Secrets Manager | ~$1 | ~$1 | ~$1 |
| CloudWatch Logs | ~$1–5 | ~$2–10 | ~$5–20 |
| **Rough total** | **~$80–90/mo** | **~$110–120/mo** | **~$200–240/mo** |

## Tradeoffs modeled in tfvars

| Knob | Dev | Prod | Savings vs prod |
|------|-----|------|-----------------|
| `single_nat_gateway` | true | false | ~$32/mo |
| `rds_multi_az` | false | true | ~50% RDS compute |
| `ecs_desired_count` | 1 | 3 | ~$30/mo |
| `rds_backup_retention_period` | 7 | 30 | Snapshot storage |
| `enable_cloudfront` | false | optional | CDN + requests |

## Budget alerts

Enable AWS Budgets via Terraform:

```hcl
enable_budgets       = true
monthly_budget_limit = "200"
alarm_email          = "ops@example.com"
```

See module `terraform/modules/budgets/`.

## Cost optimization tips

1. Stop dev stack nights/weekends (`terraform destroy` or scaled-to-zero ECS).
2. Use Fargate Spot for non-critical workloads (future module extension).
3. Right-size RDS after observing `CPUUtilization` in CloudWatch.
4. Set ECR lifecycle policy (included) to prune old images.
