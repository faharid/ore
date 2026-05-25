# Changelog

All notable changes to **ore** (Terraform stack + Web UI) are documented here.

## [Web UI 2.0] - 2026-05-24

### Added
- **Real SSE streaming** — live terraform plan/apply/destroy output via `streamTerraform`
- **Dependency visualization** — SVG arrows on canvas showing module relationships
- **Cost estimation** — monthly breakdown widget + cost history page (PostgreSQL)
- **PostgreSQL** — users, workspaces, audit log, cost snapshots (`DATABASE_URL`)
- **Security** — helmet, rate limits, XSS sanitize, CORS hardening, JWT secret validation
- **Workspaces** — multi-workspace isolation with file fallback
- **Audit log** — mutation tracking (PostgreSQL)
- **GitHub webhooks** — PR scaffold endpoint
- **Swagger** — OpenAPI docs at `/api-docs`
- **UX** — theme toggle, keyboard shortcuts (⌘P plan, ⌘⇧A apply), module search
- **DevOps** — multi-stage Dockerfiles, nginx SSE proxy, k8s manifests, GitHub Actions CI
- **Performance** — code splitting, response cache, winston structured logging
- **ANSI stripping** — clean terminal output
- **Init race lock** — `initLocks` Map prevents concurrent `terraform init`
- **HCL parser** — improved tfvars parsing (lists, nested objects)
- **Debounced save** — 500ms debounce in ConfigPanel

### Changed
- Auth uses `USERS_FILE` / PostgreSQL instead of plaintext `.env` passwords
- Graceful empty outputs when no terraform outputs exist yet

---

## [Web UI 1.1] - 2026-05-24

### Added
- **Canvas position persistence** — per-environment layout in `localStorage`
- **Input validation** — ports, CIDR, email, password strength, required fields
- **Terminal enhancements** — color-coded output, duration counter, spinner, copy
- **Terraform service** — install detection, helpful error messages, auto-init
- **SSE event types** — info, warn, error, success on terraform routes

### Fixed
- Modules no longer reset position on refresh
- Invalid config blocked before backend submission

---

## [Web UI MVP] - 2026-05-23

Initial release:
- React + Vite frontend, Node.js + Express backend
- 12 infrastructure modules, drag-and-drop canvas
- Configuration panel, terminal, monitoring dashboard
- JWT authentication, Docker Compose setup

---

## [Terraform Stack 1.0] - prior

- 12 reusable modules (VPC, ECS, RDS, ALB, autoscaling, monitoring, secrets, IAM, CloudFront, budgets, client VPN, SSM)
- Remote S3 state bootstrap, dev/staging/prod tfvars
- GitHub Actions + GitLab CI with OIDC deploy role
- Sample Node.js app for ECS walkthrough
