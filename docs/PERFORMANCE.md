# Performance Benchmarks

Template for measuring ore deployments. Run after [FIRST-DEPLOYMENT.md](FIRST-DEPLOYMENT.md).

## ECS task cold start

Measure time from `update-service --force-new-deployment` to healthy target:

```bash
START=$(date +%s)
aws ecs update-service --cluster CLUSTER --service SERVICE --force-new-deployment
aws ecs wait services-stable --cluster CLUSTER --services SERVICE
echo "$(( $(date +%s) - START )) seconds"
```

**Typical range:** 60–180s (image pull + health checks).

Record in your run:

| Run | Image cached | Duration |
|-----|--------------|----------|
| 1 | no | ___ s |
| 2 | yes | ___ s |

## ALB latency

```bash
hey -n 1000 -c 10 "$(terraform output -raw application_url)/api/health"
```

Capture from output:

- Average latency
- p99 latency
- Requests/sec

CloudWatch metric: `TargetResponseTime` on ALB.

## RDS under load

While running `hey` against app endpoints that hit DB:

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=INSTANCE \
  --start-time ... --end-time ... \
  --period 60 --statistics Average
```

## Results placeholder

| Metric | Dev | Prod |
|--------|-----|------|
| ALB p99 (ms) | — | — |
| ECS cold start (s) | — | — |
| RDS CPU at 50 rps | — | — |

Fill after deploying to your account. CI does not run live benchmarks.
