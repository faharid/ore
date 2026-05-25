# Documentation Index

**Last updated:** 2026-05-24

Central index for all ore documentation. Web UI docs live under `docs/` at the repository root.

---

## Start here

| Doc | Purpose | Time |
|-----|---------|------|
| [README.md](./README.md) | Project overview, quick start, architecture | 10 min |
| [docs/WEB-UI.md](./docs/WEB-UI.md) | Web UI setup, API, configuration | 15 min |
| [docs/WEB-UI-VERIFICATION.md](./docs/WEB-UI-VERIFICATION.md) | Smoke tests and regression checklist | 5–15 min |
| [CHANGELOG.md](./CHANGELOG.md) | Release history | 5 min |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Pending features only | 5 min |

---

## Product & design

| Doc | Contents |
|-----|----------|
| [PRODUCT.md](./PRODUCT.md) | Product definition, users, principles |
| [DESIGN.md](./DESIGN.md) | Visual design system (if present) |

---

## Terraform & AWS

| Doc | Contents |
|-----|----------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | AWS components and data flow |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | Architecture decision records |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Infrastructure deployment |
| [docs/FIRST-DEPLOYMENT.md](./docs/FIRST-DEPLOYMENT.md) | Deploy sample app to ECS |
| [docs/COST-ANALYSIS.md](./docs/COST-ANALYSIS.md) | Dev / staging / prod cost estimates |
| [docs/SECURITY.md](./docs/SECURITY.md) | Security audit checklist |
| [docs/DISASTER-RECOVERY.md](./docs/DISASTER-RECOVERY.md) | Failover, PITR, secret rotation |
| [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | Scenario-based fixes |
| [docs/CI-OIDC.md](./docs/CI-OIDC.md) | GitHub / GitLab OIDC |
| [terraform/README.md](./terraform/README.md) | Terraform module usage |

---

## Web UI — operations

| Doc | Contents |
|-----|----------|
| [web/k8s/README.md](./web/k8s/README.md) | Kubernetes deployment |
| [docs/WEB-VIDEOS.md](./docs/WEB-VIDEOS.md) | Video tutorial outline |

---

## Contributing

| Doc | Contents |
|-----|----------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Module additions, PR checklist, CI |

---

## Repository layout

```
ore/
├── README.md
├── CHANGELOG.md
├── DOCUMENTATION_INDEX.md      ← this file
├── PRODUCT.md
├── CONTRIBUTING.md
├── docs/
│   ├── WEB-UI.md               ← unified Web UI guide
│   ├── WEB-UI-VERIFICATION.md
│   ├── ROADMAP.md
│   └── …                       ← Terraform / AWS guides
├── web/                        ← Web UI source code
│   ├── backend/
│   ├── frontend/
│   ├── k8s/
│   └── README.md               ← pointer to docs/WEB-UI.md
└── terraform/                  ← IaC modules
```
