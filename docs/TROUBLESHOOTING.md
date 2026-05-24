# Troubleshooting

## `terraform init` fails

- Run `aws sts get-caller-identity` to verify credentials.
- Ensure `backend.hcl` exists and bucket/table from bootstrap are correct.
- For local testing without S3: `terraform init -backend=false`

## `terraform apply` hangs on RDS

Normal: first RDS instance creation often takes **5–15 minutes**.

## ECS tasks not starting

1. CloudWatch Logs → log group `/ecs/<service-name>`
2. Common causes:
   - ECR image missing or wrong tag
   - Secrets Manager ARN permissions on task execution role
   - Health check failing (port/path mismatch with container)

```bash
aws ecs describe-services --cluster CLUSTER --services SERVICE
aws logs tail /ecs/ore-dev-service --follow
```

## ALB returns 502/503

- Target group unhealthy: check health check path/port vs container.
- Security group: ALB SG must reach ECS SG on container port.

## Database connection errors

- Verify ECS security group is allowed on RDS SG (port 5432).
- Use RDS endpoint from `terraform output rds_address` (sensitive).
- Password is in Secrets Manager, not plain environment variables.

## ACM / HTTPS certificate pending

- DNS validation records must be added to your DNS zone.
- Until validated, use HTTP-only (`domain_name = ""`) for dev.

## CloudFront 502 to origin

- Origin must be reachable; if ALB is HTTP-only, set CloudFront origin protocol to `http-only` (adjust `modules/cloudfront` for dev).

## SNS alarms not received

- Confirm email subscription on the SNS topic (check inbox for AWS confirmation link).

## Destroy blocked

- Set `rds_deletion_protection = false` and `skip_final_snapshot = true` for dev before destroy.
- Empty S3 state bucket versioning if delete_bucket fails.
