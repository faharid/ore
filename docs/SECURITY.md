# Security

## Network isolation

- RDS runs in **private subnets** with no public accessibility.
- ECS tasks have no public IPs; ingress only from the ALB security group.
- Security groups follow least-privilege: ALB → ECS → RDS on required ports only.

## Encryption

- RDS storage encryption enabled by default.
- S3 state bucket uses SSE-S3 and versioning.
- ECR images scanned on push; repository encryption enabled.
- TLS on ALB when `domain_name` or `certificate_arn` is set (HTTP redirects to HTTPS).

## Secrets

- Database password and JWT secret stored in **AWS Secrets Manager** (auto-generated if not provided).
- Do not commit `terraform.tfvars` with secrets; use CI/CD secret stores.
- Optional **Vault** paths documented in `modules/secrets/vault-integration.tf`.

## IAM

- **Task execution role**: pull images, write logs, read configured secrets.
- **Task role**: SSM messages for ECS Exec / Session Manager patterns.
- **Deployment role**: ECR push and ECS service updates for CI/CD (scope to your account).

## Private access

- **SSM VPC endpoints** (default on): Session Manager without a bastion host.
- **Client VPN** (optional): set `enable_client_vpn` and `client_vpn_certificate_arn`.

## Operational checklist

- [ ] Confirm SNS alarm email subscription
- [ ] Enable CloudTrail at account level (not in this module)
- [ ] Restrict deployment role trust to CI OIDC provider
- [ ] Rotate Secrets Manager values on schedule
- [ ] Set `rds_deletion_protection = true` in production
