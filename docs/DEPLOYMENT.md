# Deployment

## Prerequisites

- AWS CLI configured (`aws sts get-caller-identity`)
- Terraform >= 1.5
- Permissions to create VPC, ECS, RDS, ALB, IAM, Secrets Manager, etc.

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
./scripts/init.sh
cp terraform.tfvars.example terraform.tfvars   # optional overrides
terraform plan -var-file=environments/dev.tfvars
```

## Step 3: Apply

```bash
./scripts/deploy.sh dev
# or: terraform apply -var-file=environments/dev.tfvars
```

RDS creation typically takes **5–15 minutes**.

## Step 4: Push application image

After ECR is created:

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker build -t ore-dev-app .
docker tag ore-dev-app:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/ore-dev-app:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/ore-dev-app:latest
aws ecs update-service --cluster ore-dev-cluster --service ore-dev-service --force-new-deployment
```

## Step 5: Verify

```bash
./scripts/health-check.sh
terraform output application_url
```

## CI/CD

- GitLab: copy `terraform/ci-cd/gitlab-ci.yml` to repository root or include it.
- GitHub Actions: copy `terraform/ci-cd/github-actions/deploy.yml` to `.github/workflows/`.

Set secrets: `AWS_DEPLOY_ROLE_ARN`, `ECR_REGISTRY`, `ECS_CLUSTER`, `ECS_SERVICE`.

## Environments

| File | Use case |
|------|----------|
| `environments/dev.tfvars` | Low cost, single NAT, micro RDS |
| `environments/staging.tfvars` | Pre-production parity |
| `environments/prod.tfvars` | Multi-AZ, CloudFront, stricter RDS |
