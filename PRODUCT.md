# Product Definition: ore Web UI

## Register
**product** — Tool/Dashboard. Design serves the product's function, not the reverse.

## Users
- **Primary:** Infrastructure engineers, DevOps professionals, cloud architects
- **Workflow:** Deploy and manage multi-service AWS infrastructure (VPC, ECS, RDS, ALB, monitoring)
- **Context:** Working at a terminal or dashboard; making infrastructure decisions; monitoring live deployments; iterating configurations quickly
- **Technical depth:** Comfortable with Terraform, AWS services, networking concepts, command-line tools

## Product Purpose
ore transforms infrastructure-as-code from a CLI-only tool into a visual, interactive system:
1. **Define visually** — drag-and-drop canvas with dependency arrows
2. **Configure intuitively** — validated forms synced to tfvars
3. **Deploy with confidence** — live SSE output for plan/apply/destroy
4. **Monitor continuously** — CloudWatch metrics, cost estimation, status dashboard
5. **Iterate rapidly** — workspaces, environments, audit trail (PostgreSQL)

## Brand Tone
- **Precision over decoration.** Every element has a purpose
- **Clarity under pressure.** Error messages are actionable
- **Technical authenticity.** Respect the user's expertise
- **Low friction.** Power users accomplish tasks quickly
- **Confidence building.** Show progress and state before destructive ops

## Strategic Principles

1. **Information hierarchy** — state first, actions second
2. **Visual relationships** — canvas edges convey infrastructure dependencies
3. **Validation prevents damage** — invalid configs never save
4. **Progressive disclosure** — simple defaults, deep inspection for power users
5. **Streaming is trust** — live terraform output, not buffered
6. **Cost awareness** — estimated $/month alongside resource choices
7. **Safety over speed** — explicit confirmation for destroy/delete

## Scope

**In scope (shipped):**
- Visual infrastructure design, deployment orchestration, live monitoring
- Cost estimation, multi-environment and workspace management
- JWT auth, security middleware, Swagger API docs
- Docker, Kubernetes manifests, CI workflows

**Out of scope / roadmap:** [docs/ROADMAP.md](./docs/ROADMAP.md)
- Deployment history & rollback
- Automated test suite
- Mobile layout, Slack bot, RBAC

## Success Metrics
- Deployment time reduced vs. CLI-only workflow
- Configuration errors caught before terraform execution
- Zero data loss from invalid operations
- User confidence in infrastructure changes

## Technology Stack
- **Frontend:** React 18, Vite, TailwindCSS, Recharts
- **Backend:** Node.js Express, PostgreSQL, AWS SDK v3
- **State:** S3 (terraform state), localStorage (canvas layout), PostgreSQL (app data)
- **Streaming:** Server-Sent Events (SSE)
- **Auth:** JWT, bcryptjs

## Constraints
- Terraform must be installed on backend server
- AWS credentials not required for UI itself; AWS creds needed for deploy/metrics
- Cost estimation is approximate

---

**Last updated:** 2026-05-24
