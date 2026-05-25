# Web UI — Verification Guide

Quick checks to confirm the Web UI is working. ~5 minutes for smoke test; ~15 minutes for full regression.

## Prerequisites

```bash
# Option A: Docker
cd web && docker compose up --build

# Option B: Native
cd web/backend && npm start
cd web/frontend && npm run dev
```

Login: `admin` / `admin` at http://localhost:5173

---

## Smoke Test (~5 min)

### 1. Health & auth

```bash
curl http://localhost:3001/health
# Expect: {"status":"ok",...}

curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
# Expect: {"token":"...","username":"admin"}
```

### 2. Canvas persistence

1. Create or select an environment
2. Drag VPC and ECS modules to new positions
3. Refresh the page (F5)
4. Modules should remain in the same positions

DevTools → Application → Local Storage → key `canvas_positions_${env}`

### 3. Validation

1. Open ECS module → set Container Port to `99999`
2. Error: "must be at most 65535"
3. Set to `3000` → error clears
4. Clear required VPC CIDR → Save blocked with validation message

### 4. Terraform SSE

1. Configure valid VPC CIDR (`10.0.0.0/16`)
2. Click **Plan Infrastructure**
3. Terminal shows incremental output with duration counter
4. Network tab: response type `text/event-stream`

### 5. Extended features

- [ ] Dependency arrows visible on canvas
- [ ] Cost widget on dashboard after selecting environment
- [ ] Swagger: http://localhost:3001/api-docs
- [ ] Monitor page loads (metrics may be empty until deploy)

---

## Regression Checklist

- [ ] Login / logout works
- [ ] Environment CRUD (create, switch, delete)
- [ ] Drag-and-drop is responsive
- [ ] Config save shows success feedback
- [ ] Terminal color-codes output (green/red/yellow/blue)
- [ ] No ANSI escape sequences visible in terminal
- [ ] Frontend build: `cd web/frontend && npm run build` (no errors)

---

## Build Verification

```bash
cd web/frontend
npm run build
# Expect: built in <5s, ~80KB gzip main bundle
```

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| Canvas not persisting | localStorage enabled; console for JS errors |
| Validation not showing | Hard refresh; try different field types |
| No terminal output | `terraform -version`; backend running on :3001 |
| SSE not streaming | nginx/proxy must not buffer (`proxy_buffering off`) |

See [WEB-UI.md](./WEB-UI.md) and [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more.
