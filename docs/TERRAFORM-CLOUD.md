# Terraform Cloud

Alternative to self-managed S3 backend for teams wanting VCS-driven runs and UI.

## Workspace strategy

| Workspace | VCS branch | Variables |
|-----------|------------|-----------|
| `ore-dev` | `develop` | `environment=dev` |
| `ore-staging` | `staging` | `environment=staging` |
| `ore-prod` | `main` | `environment=prod` |

Each workspace holds **isolated state** — equivalent to separate S3 keys.

## Setup

1. Create organization on [app.terraform.io](https://app.terraform.io)
2. Connect GitHub/GitLab repository
3. Copy [`terraform/backend.tfcloud.example`](../terraform/backend.tfcloud.example) settings into `backend.tf` or use CLI:

```bash
terraform login
terraform init
```

4. Set workspace variables (sensitive): `database_password`, `jwt_secret` as env vars — not in VCS

## Speculative plans on PR

Enable **Automatic speculative plans** in workspace settings. Each PR gets `terraform plan` output in Terraform Cloud UI.

## vs S3 backend

| Feature | S3 + DynamoDB | Terraform Cloud |
|---------|---------------|-----------------|
| Cost | Pennies | Free tier / paid |
| PR plans | DIY (GitHub Actions) | Built-in |
| State locking | DynamoDB | Included |
| Run history | S3 versioning | UI audit log |

See [DEPLOYMENT.md](DEPLOYMENT.md) for S3 bootstrap path.
