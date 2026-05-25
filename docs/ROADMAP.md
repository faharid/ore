# ore Web UI — Roadmap

Pending work only. Completed features are documented in [CHANGELOG.md](../CHANGELOG.md).

## High priority

| Feature | Description | Effort |
|---------|-------------|--------|
| **Unit & integration tests** | Jest (backend) + Vitest (frontend); auth, config, terraform routes | ~10h |
| **Deployment history & rollback** | Persist plan/apply records; diff summary; rollback to previous tfvars | ~8h |
| **State diff viewer** | Parse `terraform show -json` into structured create/modify/delete UI | ~3h |
| **Slack / email notifications** | Notify on apply success/failure via webhook or SES | ~2h |

## Medium priority

| Feature | Description | Effort |
|---------|-------------|--------|
| **Mobile responsiveness** | Collapsible sidebar, stacked panels, touch-friendly canvas | ~4h |
| **Load testing** | k6 scripts for API endpoints under concurrent terraform ops | ~2h |
| **Video tutorials** | Record from [WEB-VIDEOS.md](./WEB-VIDEOS.md) outline | ~8h |
| **Compliance rules** | Tag validation, change-approval workflow | ~8h |

## Low priority / Terraform stack

| Feature | Description |
|---------|-------------|
| CodeDeploy blue-green | ECS rolling deploy today |
| WAF module | Edge protection |
| Prometheus / Grafana | Alternative to CloudWatch-only monitoring |
| Multi-user RBAC | Team roles beyond single admin |
| Slack bot | `/ore plan dev` commands |

## Success metrics (targets)

| Metric | Target |
|--------|--------|
| Page load | <2s (Lighthouse) |
| API response | <500ms (non-terraform) |
| Test coverage | >80% |
| Terraform success rate | >95% |
