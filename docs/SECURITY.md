# Security

## Audit checklist

### Network

- [ ] RDS in private subnets (`publicly_accessible = false`)
- [ ] ECS tasks have no public IP
- [ ] SG chain: Internet → ALB (80/443) → ECS (app port) → RDS (5432)
- [ ] Optional VPC flow logs (`enable_vpc_flow_logs = true`)
- [ ] Optional Client VPN or SSM endpoints for admin access

**Traffic flow:**

```
Internet → ALB (public subnets) → ECS (private) → RDS (private)
Secrets Manager ← ECS task execution role (API)
```

### Encryption

| Data | At rest | In transit |
|------|---------|------------|
| RDS | AES-256 (storage_encrypted) | TLS optional app-side |
| ECR images | AES-256 | TLS (HTTPS) |
| Secrets Manager | AWS KMS default | TLS |
| Terraform state (S3) | SSE-S3 | TLS-only bucket policy |
| ALB ↔ client | — | TLS when ACM cert configured |

### Access (IAM)

- [ ] ECS task execution role: minimal ECR + logs + secrets read
- [ ] ECS task role: SSM for Exec only
- [ ] Deployment role: OIDC trust (no account-root in prod)
- [ ] No long-lived keys in CI after OIDC setup ([CI-OIDC.md](CI-OIDC.md))

### Compliance & logging

- [ ] CloudTrail enabled at **AWS account** level (not in this module)
- [ ] Secrets Manager CloudTrail data events for secret access
- [ ] CloudWatch log retention set (30 days default on ECS logs)
- [ ] SNS alarm on 5xx and RDS storage

### Known gaps (honest)

| Gap | Mitigation |
|-----|------------|
| No WAF on ALB/CloudFront | Add `aws_wafv2_web_acl` module extension |
| No automatic secret rotation | Manual rotation runbook in DISASTER-RECOVERY.md |
| Vault integration stub only | Use Secrets Manager; see `vault-integration.tf` |
| RDS password in Terraform graph | Accept for v1 or migrate to RDS managed password |
| Deployment role local assume (dev) | Disable `enable_local_assume_role` in prod |

### Pre-production review

1. Set `rds_deletion_protection = true`
2. Set `enable_local_assume_role = false`; configure OIDC
3. Confirm `alarm_email` SNS subscription
4. Run `./scripts/health-check.sh` over HTTPS once cert validated
5. Review `terraform plan` for public resources

See also [DECISIONS.md](DECISIONS.md) and [COST-ANALYSIS.md](COST-ANALYSIS.md).
