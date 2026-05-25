import { query } from '../pool.js';

export async function insertCostSnapshot(entry) {
  const { rows } = await query(
    `INSERT INTO cost_snapshots (
      workspace_slug, env_name, total_monthly_cost, total_yearly_cost,
      breakdown, currency, region, note
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      entry.workspace || 'default',
      entry.env,
      entry.totalMonthlyCost,
      entry.totalYearlyCost,
      JSON.stringify(entry.breakdown || {}),
      entry.currency || 'USD',
      entry.region || null,
      entry.note || null
    ]
  );
  return mapRow(rows[0]);
}

export async function listCostHistory({ limit = 500 } = {}) {
  const { rows } = await query(
    `SELECT * FROM cost_snapshots ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map(mapRow);
}

function mapRow(row) {
  if (!row) return null;
  return {
    env: row.env_name,
    workspace: row.workspace_slug,
    timestamp: row.created_at,
    totalMonthlyCost: Number(row.total_monthly_cost),
    totalYearlyCost: Number(row.total_yearly_cost),
    breakdown: row.breakdown,
    currency: row.currency,
    region: row.region,
    note: row.note
  };
}

// Prune old rows (keep last N)
export async function pruneCostHistory(keep = 500) {
  await query(
    `DELETE FROM cost_snapshots WHERE id NOT IN (
      SELECT id FROM cost_snapshots ORDER BY created_at DESC LIMIT $1
    )`,
    [keep]
  );
}
