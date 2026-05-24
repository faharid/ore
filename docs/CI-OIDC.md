# CI/CD OIDC Setup

Configure GitHub Actions or GitLab CI to assume the ore deployment role without long-lived AWS keys.

## 1. Create OIDC provider (GitHub)

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03fa02195ae5486e8b1
```

Note the provider ARN: `arn:aws:iam::ACCOUNT:oidc-provider/token.actions.githubusercontent.com`

## 2. Configure Terraform variables

In `terraform.tfvars` or per-environment tfvars:

```hcl
github_oidc_provider_arn = "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
allowed_oidc_subjects = [
  "repo:faharid/ore:ref:refs/heads/main",
  "repo:faharid/ore:pull_request"
]
```

Apply Terraform to update the deployment role trust policy.

## 3. GitHub Actions secret

Set repository secret:

- `AWS_DEPLOY_ROLE_ARN` = output `deployment_role_arn` from `terraform output`

The workflow in [`.github/workflows/terraform.yml`](../.github/workflows/terraform.yml) uses `aws-actions/configure-aws-credentials` with OIDC.

## GitLab CI

Create GitLab OIDC provider similarly, then set:

```hcl
gitlab_oidc_provider_arn = "arn:aws:iam::ACCOUNT:oidc-provider/gitlab.com"
allowed_oidc_subjects    = ["project_path:faharid/ore:ref_type:branch:ref:main"]
```

## Local development fallback

For manual deploys from a workstation (dev only):

```hcl
enable_local_assume_role = true
```

Requires MFA when assuming the deployment role. Prefer SSO or a dedicated dev IAM user with narrower permissions in production accounts.

## Required deployment permissions

The deployment role can:

- Push images to the ore ECR repository
- Update the ECS service and register task definitions
- Pass ECS task execution/task roles

See [`terraform/modules/iam/deployment-role.tf`](../terraform/modules/iam/deployment-role.tf) and [`terraform/deployment_iam.tf`](../terraform/deployment_iam.tf).
