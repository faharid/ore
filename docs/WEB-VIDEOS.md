# ore Web UI — Video Tutorial Outline

Documented deliverable for PRD Phase 8.2 (recording optional).

## 1. Getting Started (5 min)

- Clone repository and install Node.js 18+
- Start with Docker Compose: `cd web && docker compose up --build`
- Login at http://localhost:5173 (`admin` / `admin`)
- Tour: sidebar, canvas, config panel, terminal

## 2. First Environment (7 min)

- Create workspace and environment
- Configure VPC, ECS, RDS modules
- Validation errors and save feedback
- Dependency arrows on canvas

## 3. Deploy Infrastructure (8 min)

- Run Plan — watch live SSE output in terminal
- Review color-coded plan lines
- Apply changes and verify outputs
- Open Monitor page for CloudWatch metrics

## 4. Cost Estimation (6 min)

- Cost widget on dashboard
- Cost analytics page and history
- Tradeoffs: dev vs prod tfvars

## 5. Troubleshooting (8 min)

- Terraform not installed / AWS credentials
- Rate limits and JWT configuration
- Reading stderr in terminal
- Links to [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md)
