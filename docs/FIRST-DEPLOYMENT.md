# First Deployment Runbook

End-to-end: infrastructure + sample Node.js app on ECS.

**Prerequisites:** AWS CLI, Terraform >= 1.5, Docker.

## 1. Bootstrap state

```bash
cd terraform/bootstrap
terraform init && terraform apply -var="state_bucket_name=YOUR_UNIQUE_BUCKET"
```

## 2. Init Terraform (dev)

```bash
cd ..
./scripts/init.sh dev
terraform plan -var-file=environments/dev.tfvars
terraform apply -var-file=environments/dev.tfvars
```

Expected: ~15–20 min (RDS is slowest). Confirm outputs:

```bash
terraform output ecr_repository_url
terraform output ecs_cluster_name
```

## 3. Build and push sample app

From repo root:

```bash
export AWS_REGION=us-east-1
export ECR_URL="$(cd terraform && terraform output -raw ecr_repository_url)"
aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "${ECR_URL%%/*}"

docker build -t ore-app:latest .
docker tag ore-app:latest "$ECR_URL:latest"
docker push "$ECR_URL:latest"
```

## 4. Deploy to ECS

```bash
export CLUSTER="$(cd terraform && terraform output -raw ecs_cluster_name)"
export SERVICE="$(cd terraform && terraform output -raw ecs_service_name)"

aws ecs update-service \
  --cluster "$CLUSTER" \
  --service "$SERVICE" \
  --force-new-deployment \
  --region "$AWS_REGION"

aws ecs wait services-stable --cluster "$CLUSTER" --services "$SERVICE"
```

## 5. Verify health

```bash
cd terraform && ./scripts/health-check.sh
# or:
curl "$(terraform output -raw application_url)/api/health"
```

Expected: `{"status":"ok","service":"ore-example-app"}`

## 6. Watch logs

```bash
aws logs tail "/ecs/$(terraform output -raw ecs_service_name)" --follow
```

## 7. Load test (optional autoscaling)

Install [hey](https://github.com/rakyll/hey):

```bash
hey -z 2m -c 50 "$(terraform output -raw application_url)/api/health"
```

Watch ECS desired count in Console → ECS → Service → Auto Scaling.

## Common pitfalls

| Issue | Fix |
|-------|-----|
| ECR push 403 | Re-run ECR login; check deployment role or your IAM user has ECR push |
| Tasks unhealthy | Image must listen on port **3001** with `/api/health` in dev tfvars |
| Wrong state key | Use `./scripts/init.sh dev` — never mix dev/prod keys |
| RDS timeout | Normal 10+ min on first apply |

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for deep dives.
