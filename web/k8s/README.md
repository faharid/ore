# ore Web UI on Kubernetes

## Prerequisites

- kubectl configured
- Images built and pushed (or loaded locally): `ore-backend`, `ore-frontend`

## Deploy

```bash
kubectl create namespace ore
kubectl apply -f secrets.yaml -n ore
# Optional: set secrets.database-url to postgresql://ore:<postgres-password>@ore-postgres:5432/ore_ui
kubectl apply -f postgres-deployment.yaml -n ore
kubectl apply -f backend-deployment.yaml -n ore
kubectl apply -f frontend-deployment.yaml -n ore
kubectl get pods -n ore
```

Mount Terraform source via ConfigMap or PVC on the backend deployment for plan/apply.
