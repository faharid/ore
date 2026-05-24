# Deployment

## Prerequisites

- AWS CLI configured (`aws sts get-caller-identity`)
- Terraform >= 1.5
- Permissions to create VPC, ECS, RDS, ALB, IAM, Secrets Manager, etc.

## State per environment (important)

Each environment **must** use its own state key. Never apply `dev.tfvars` and `prod.tfvars` against the same backend key.

| Environment | State key example |
|-------------|-------------------|
| dev | `ore/dev/terraform.tfstate` |
| staging | `ore/staging/terraform.tfstate` |
| prod | `ore/prod/terraform.tfstate` |

```bash
./scripts/init.sh dev      # writes backend.hcl with ore/dev/...
./scripts/init.sh prod     # re-init with ore/prod/...
```

Alternative: [Terraform Cloud workspaces](TERRAFORM-CLOUD.md) or Terraform CLI workspaces.

## Step 0: Bootstrap remote state

```bash
cd terraform/bootstrap
terraform init
terraform apply -var="state_bucket_name=YOUR_UNIQUE_BUCKET_NAME"
```

Note the outputs: `state_bucket_name`, `dynamodb_table_name`.

## Step 1: Configure backend

```bash
cd ../
cp backend.hcl.example backend.hcl
# Edit bucket, region, dynamodb_table to match bootstrap outputs
```

## Step 2: Initialize and plan

```bash
./scripts/init.sh dev
terraform plan -var-file=environments/dev.tfvars
```

## Step 3: Apply

```bash
./scripts/deploy.sh dev
```

RDS creation typically takes **5–15 minutes**.

## Step 4: Deploy application

See [FIRST-DEPLOYMENT.md](FIRST-DEPLOYMENT.md) for build/push to ECR and ECS rollout.

## Step 5: Verify

```bash
./scripts/health-check.sh
terraform output application_url
```

## CI/CD

Active pipelines at repo root:

- [`.github/workflows/terraform.yml`](../.github/workflows/terraform.yml)
- [`.gitlab-ci.yml`](../.gitlab-ci.yml)

Configure OIDC: [CI-OIDC.md](CI-OIDC.md). Set `AWS_DEPLOY_ROLE_ARN`, `ECS_CLUSTER`, `ECS_SERVICE`, `ECR_REGISTRY`.

## Environments

| File | Use case |
|------|----------|
| `environments/dev.tfvars` | Low cost, single NAT, micro RDS, local IAM assume |
| `environments/staging.tfvars` | Pre-production parity |
| `environments/prod.tfvars` | Multi-AZ, stricter RDS; configure OIDC before apply |
