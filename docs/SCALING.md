# Scaling

## ECS horizontal scaling

Auto-scaling is configured in `modules/autoscaling`:

- **CPU target tracking** at `ecs_scale_up_threshold` (default 70%).
- **Memory target tracking** at 80%.

Adjust in tfvars:

```hcl
ecs_desired_count = 3
ecs_min_capacity  = 1
ecs_max_capacity  = 20
ecs_scale_up_threshold = 70
```

## Vertical scaling (ECS tasks)

```hcl
ecs_cpu    = 1024
ecs_memory = 2048
```

Apply triggers a new task definition revision and rolling deployment.

## RDS scaling

**Vertical:** change `rds_instance_class` and apply (brief downtime unless using blue/green).

**Read replicas:** extend `modules/rds` with `aws_db_instance` replica resources for read-heavy workloads.

**Storage:** `allocated_storage` and `max_allocated_storage` support autoscaling storage on GP3.

## CloudFront / ALB

- CloudFront reduces origin load for cacheable assets.
- ALB scales automatically; add more ECS tasks for compute-bound traffic.

## Cost vs scale (dev)

```hcl
single_nat_gateway = true
ecs_desired_count  = 1
rds_instance_class = "db.t3.micro"
```
