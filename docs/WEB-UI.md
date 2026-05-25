# ore Web UI

Visual interface for managing ore infrastructure deployments. Define AWS infrastructure on a canvas, edit tfvars, run Terraform with live output, and monitor resources.

## Features

| Area | Capability |
|------|------------|
| **Canvas** | Drag-and-drop modules, dependency arrows, layout persisted per environment (`localStorage`) |
| **Configuration** | Validated forms writing `terraform/environments/*.tfvars` |
| **Terraform** | Live SSE streaming for plan / apply / destroy |
| **Cost** | Monthly estimate widget + `/costs` history (PostgreSQL) |
| **Workspaces** | Multi-workspace isolation (PostgreSQL or file fallback) |
| **Monitoring** | CloudWatch metrics dashboard |
| **Security** | JWT auth, bcrypt, helmet, rate limits, XSS sanitize, CORS |
| **API docs** | Swagger UI at `/api-docs` |
| **DevOps** | Multi-stage Docker, Kubernetes manifests (`web/k8s/`), GitHub Actions |

## Tech Stack

**Backend:** Node.js >=18, Express, PostgreSQL (`pg`), AWS SDK v3, Terraform CLI, JWT + bcryptjs

**Frontend:** React 18, Vite, React Router, React Query, Recharts, TailwindCSS

## Quick Start

### Docker Compose (recommended)

```bash
cd web
docker compose up --build
```

Open http://localhost:5173 — default login: `admin` / `admin`

### Local development

```bash
# Terminal 1 — API
cd web/backend
cp .env.example .env
npm install && npm start

# Terminal 2 — UI
cd web/frontend
npm install && npm run dev
```

| Service | URL |
|---------|-----|
| App | http://localhost:5173 |
| API | http://localhost:3001 |
| Health | http://localhost:3001/health |
| Swagger | http://localhost:3001/api-docs |

## PostgreSQL (recommended)

Docker Compose starts Postgres and sets `DATABASE_URL` on the backend.

```bash
cd web
docker compose up postgres -d

cd backend
npm run db:migrate && npm run db:seed
```

| Stored in Postgres | Still on disk |
|--------------------|---------------|
| Users, workspaces, audit log, cost snapshots | `terraform/environments/*.tfvars` |

Without `DATABASE_URL`, the backend uses `backend/data/*.json` and `USERS` / `users.json`.

## Configuration

### Backend (`.env`)

```env
PORT=3001
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://ore:ore_dev_password@localhost:5432/ore_ui
SEED_ADMIN_PASSWORD=admin
TERRAFORM_DIR=../../terraform
ENVIRONMENTS_DIR=../../terraform/environments
```

File-only auth (no Postgres):

```bash
cd web/backend
node scripts/hash-password.js yourpassword
# Set USERS or USERS_FILE in .env
```

### AWS credentials

The backend uses the default AWS chain: env vars → `~/.aws/credentials` → IAM instance role.

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

## API Endpoints

All routes except `/api/auth/login`, `/health`, and `/api/webhooks/*` require `Authorization: Bearer <token>`.

### Auth
- `POST /api/auth/login`

### Environments
- `GET /api/environments` — list
- `POST /api/environments` — create
- `GET /api/environments/:env` — read config
- `PUT /api/environments/:env` — update config
- `DELETE /api/environments/:env` — delete

### Terraform (SSE)
- `POST /api/environments/:env/plan`
- `POST /api/environments/:env/apply`
- `POST /api/environments/:env/destroy`
- `GET /api/environments/:env/outputs`

### Monitoring
- `GET /api/environments/:env/metrics`
- `GET /api/environments/:env/status`

### Cost & workspaces
- `GET /api/environments/:env/cost-estimate`
- `GET /api/environments/cost-history`
- `GET /api/workspaces`
- `POST /api/workspaces`
- `GET /api/audit` — requires PostgreSQL

### Webhooks
- `POST /api/webhooks/github` — optional `GITHUB_WEBHOOK_SECRET`

## UI Flows

### Dashboard
1. Login → select or create environment
2. Click modules on canvas → edit variables in ConfigPanel
3. **Plan Infrastructure** → review live terminal output
4. **Apply Changes** → deploy
5. Cost widget shows estimated monthly spend

### Monitor
1. Navigate to **Monitor**
2. Select environment
3. View ECS CPU/memory/tasks, RDS CPU/storage, ALB requests & 5xx (30s refresh)

## Modules (12)

`vpc`, `ecs`, `rds`, `alb`, `autoscaling`, `monitoring`, `secrets`, `iam`, `cloudfront`, `budgets`, `client_vpn`, `ssm`

## Project Layout

```
web/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── middleware/     # auth, security, rateLimit, cache, audit
│   │   ├── routes/         # auth, environments, terraform, monitoring, workspaces, webhooks, audit
│   │   └── services/       # config, terraform, aws-metrics, cost-estimator
│   ├── db/                 # migrate, seed, pool
│   └── scripts/hash-password.js
├── frontend/
│   └── src/
│       ├── pages/          # Login, Dashboard, Monitor, Costs
│       └── components/     # Canvas, ConfigPanel, Terminal, MonitorDash, ThemeToggle
├── k8s/                    # Kubernetes manifests
└── docker-compose.yml
└── README.md               # Pointer to docs/WEB-UI.md
```

## Module Configuration Fields

### VPC
- `vpc_cidr`, `single_nat_gateway`, `enable_vpc_flow_logs`

### ECS
- `container_image`, `container_port`, `ecs_cpu`, `ecs_memory`, `ecs_desired_count`

### RDS
- `rds_instance_class`, `rds_allocated_storage`, `rds_engine_version`, `rds_multi_az`, `rds_backup_retention_period`

### ALB
- `domain_name`, `enable_https`, `health_check_path`

### Autoscaling
- `ecs_min_capacity`, `ecs_max_capacity`, `ecs_scale_up_threshold`, `ecs_scale_down_threshold`

### Monitoring
- `alarm_email`, `enable_datadog_forwarder`

### Secrets
- `database_password`, `jwt_secret`

## Development

### Add a module to the UI

1. Add fields in `frontend/src/components/ConfigPanel/index.jsx` (`MODULE_FIELDS`)
2. Add module tile in `frontend/src/components/Canvas/index.jsx` (`MODULES`)
3. Add dependency edges in `frontend/src/design/modules.js` if needed

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Login fails | With Postgres: run `npm run db:seed`. Without DB: verify bcrypt hash in `USERS` |
| Terraform fails | Install Terraform >= 1.5; check `TERRAFORM_DIR` and AWS credentials |
| Metrics empty | Deploy infrastructure first; verify CloudWatch IAM permissions |
| CORS errors | Backend on `:3001`; check `vite.config.js` proxy in dev |
| Port in use | `lsof -i :3001` / `lsof -i :5173` |

## Known Limitations

1. Cost estimates are approximate — use [COST-ANALYSIS.md](./COST-ANALYSIS.md) for production planning
2. Terraform must be installed on the backend host (included in Docker image)
3. GitHub webhooks are scaffold-only — wire your CI logic as needed

## Related Docs

- [WEB-UI-VERIFICATION.md](./WEB-UI-VERIFICATION.md) — smoke tests
- [ROADMAP.md](./ROADMAP.md) — pending features
- [WEB-VIDEOS.md](./WEB-VIDEOS.md) — tutorial outline
- [../CHANGELOG.md](../CHANGELOG.md) — release history
