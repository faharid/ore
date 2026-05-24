# Disaster Recovery

## RDS backups

Configured in `modules/rds`:

- Automated backups with `backup_retention_period` (7 dev / 30 prod by default).
- Backup window: `03:00-04:00` UTC (configurable).
- `copy_tags_to_snapshot = true` for snapshot organization.
- Final snapshot on destroy unless `skip_final_snapshot = true` (dev only).

## Recovery procedures

### Restore from snapshot

1. Identify snapshot in AWS Console or CLI:
   ```bash
   aws rds describe-db-snapshots --db-instance-id ore-prod-postgres
   ```
2. Restore to a new instance (Console: **Restore snapshot**).
3. Update Secrets Manager password if a new master user/password is used.
4. Update ECS task environment / secrets and redeploy.

### Regional failure

This stack is **single-region**. For DR across regions:

- Replicate RDS snapshots to a secondary region (AWS Backup or manual copy).
- Maintain Terraform state per region.
- Document DNS failover (Route 53) to a standby ALB/ECS stack.

## RTO / RPO targets (guidance)

| Tier | RPO | RTO |
|------|-----|-----|
| Dev | 24h | Best effort |
| Prod | 1h (backup frequency) | 1–4h (runbook + restore) |

Adjust backup retention and Multi-AZ to match your compliance requirements.

## State recovery

Terraform state lives in S3 with versioning enabled (bootstrap module). To recover a corrupted state file, restore a previous object version from S3.
