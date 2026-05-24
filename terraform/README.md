# terraform

AWS infrastructure for ore. See the [root README](../README.md) and [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).

## Layout

- `bootstrap/` — S3 + DynamoDB for remote state (apply once)
- `modules/` — VPC, ECS, RDS, ALB, IAM, secrets, monitoring, CloudFront, SSM, Client VPN
- `environments/` — `dev`, `staging`, `prod` tfvars
- `scripts/` — init, deploy, destroy, health-check
- `ci-cd/` — GitLab CI and GitHub Actions templates

## Commands

```bash
./scripts/init.sh
terraform plan -var-file=environments/dev.tfvars
./scripts/deploy.sh dev
```
