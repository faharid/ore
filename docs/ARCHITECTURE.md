# Architecture

ore deploys a production-oriented AWS stack for containerized SaaS applications.

## Components

| Layer | Service | Purpose |
|-------|---------|---------|
| Edge | CloudFront (optional) | CDN, TLS, caching |
| Edge | ALB | HTTP/HTTPS load balancing, health checks |
| Compute | ECS Fargate | Application containers, auto-scaling |
| Data | RDS PostgreSQL | Managed relational database, Multi-AZ |
| Secrets | Secrets Manager | Credentials and API keys |
| Network | VPC | Public/private subnets, NAT gateways |
| Access | SSM endpoints / Client VPN | Private admin access without public RDS |
| Observability | CloudWatch + SNS | Logs, metrics, alarms |

## Traffic flow

1. Users hit CloudFront (optional) or the ALB directly.
2. ALB forwards to ECS tasks in private subnets.
3. Tasks read secrets from Secrets Manager at startup.
4. Tasks connect to RDS PostgreSQL on port 5432 (security group restricted to ECS).
5. Container logs ship to CloudWatch Logs; optional Datadog forwarder subscription.

## State management

- **Bootstrap** (`terraform/bootstrap/`): S3 bucket + DynamoDB table for remote state (apply once per account/region).
- **Root** (`terraform/`): All application infrastructure modules.

## Module dependencies

```
vpc → alb, rds, ecs, ssm, client_vpn
secrets → iam, rds, ecs
iam → ecs
alb → ecs
ecs → autoscaling, monitoring
```

## High availability

- Multi-AZ subnets across two availability zones.
- RDS Multi-AZ in staging/prod (configurable in tfvars).
- ECS tasks spread across private subnets.
- ALB health checks remove unhealthy targets.

See [DEPLOYMENT.md](DEPLOYMENT.md) for provisioning steps.
