# Multi-Region Deployment Pattern

Deploy independent ore stacks per region with **separate state keys** — not one global state.

## State keys

```
ore/prod/us-east-1/terraform.tfstate
ore/prod/eu-west-1/terraform.tfstate
```

## Backend config examples

**us-east-1** (`backend.hcl`):

```hcl
bucket = "your-ore-state-bucket"
key    = "ore/prod/us-east-1/terraform.tfstate"
region = "us-east-1"
```

**eu-west-1** (separate checkout or `-backend-config`):

```hcl
key    = "ore/prod/eu-west-1/terraform.tfstate"
region = "eu-west-1"
```

## Apply

```bash
./scripts/init.sh prod
terraform apply -var-file=environments/prod.tfvars -var="aws_region=us-east-1"
```

Repeat in eu-west-1 with different backend key and `aws_region=eu-west-1`.

## DNS / traffic

- Route 53 latency-based or geolocation records to each region's ALB/CloudFront
- RDS is **not** cross-region replicated by default — use snapshot copy or Aurora Global Database for DR

## Cost note

Doubling regions roughly doubles NAT, ECS, RDS, ALB costs. See [COST-ANALYSIS.md](../docs/COST-ANALYSIS.md).
