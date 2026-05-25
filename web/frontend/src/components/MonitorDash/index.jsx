import { useQuery } from '@tanstack/react-query';
import { monitoringApi } from '../../services/api';

export default function MonitorDash({ env }) {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['metrics', env],
    queryFn: () => monitoringApi.getMetrics(env),
    refetchInterval: 30000
  });

  const { data: status } = useQuery({
    queryKey: ['status', env],
    queryFn: () => monitoringApi.getStatus(env),
    refetchInterval: 30000
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-ore-text-tertiary text-ore-body">
        Loading metrics…
      </div>
    );
  }

  if (error) {
    return (
      <div className="ds-alert-error">
        Failed to load metrics. Deploy infrastructure first or check AWS credentials.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {status && (
        <section className="ds-card">
          <h3 className="ds-card-title">Infrastructure Status</h3>
          <div className="space-y-0">
            <StatusRow
              label="Status"
              value={status.data.status}
              valueClass={
                status.data.status === 'deployed' ? 'text-ore-success' : 'text-ore-warning'
              }
            />
            <StatusRow label="Environment" value={status.data.environment} />
            <StatusRow label="ALB DNS" value={status.data.outputs?.albDnsName || 'N/A'} mono />
            <StatusRow
              label="Application URL"
              value={status.data.outputs?.applicationUrl || 'N/A'}
              mono
            />
          </div>
        </section>
      )}

      <section className="ds-card">
        <h3 className="ds-card-title">ECS</h3>
        {metrics?.data?.ecs ? (
          <MetricList
            items={[
              { label: 'CPU', value: metrics.data.ecs.cpu, unit: '%' },
              { label: 'Memory', value: metrics.data.ecs.memory, unit: '%' },
              metrics.data.ecs.taskCount && {
                label: 'Tasks (running / desired)',
                value: `${metrics.data.ecs.taskCount.running}/${metrics.data.ecs.taskCount.desired}`,
                unit: ''
              }
            ].filter(Boolean)}
          />
        ) : (
          <p className="ds-card-text">No data available</p>
        )}
      </section>

      <section className="ds-card">
        <h3 className="ds-card-title">RDS</h3>
        {metrics?.data?.rds ? (
          <MetricList
            items={[
              { label: 'CPU', value: metrics.data.rds.cpu, unit: '%' },
              { label: 'Free storage', value: metrics.data.rds.freeStorage, unit: ' GB' }
            ]}
          />
        ) : (
          <p className="ds-card-text">No data available</p>
        )}
      </section>

      <section className="ds-card">
        <h3 className="ds-card-title">ALB</h3>
        {metrics?.data?.alb ? (
          <MetricList
            items={[
              { label: 'Requests', value: metrics.data.alb.requestCount, unit: '' },
              { label: '5xx errors', value: metrics.data.alb.errors5xx, unit: '' },
              { label: 'Response time', value: metrics.data.alb.responseTime, unit: ' ms' }
            ]}
          />
        ) : (
          <p className="ds-card-text">No data available</p>
        )}
      </section>
    </div>
  );
}

function StatusRow({ label, value, valueClass = 'text-ore-text-primary', mono }) {
  return (
    <div className="ds-metric-row">
      <span className="ds-metric-label">{label}</span>
      <span className={`ds-metric-value ${valueClass} ${mono ? 'font-mono text-ore-mono font-normal' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function MetricList({ items }) {
  return (
    <div className="space-y-0">
      {items.map((item) => (
        <MetricRow key={item.label} label={item.label} value={item.value} unit={item.unit} />
      ))}
    </div>
  );
}

function MetricRow({ label, value, unit }) {
  const num = Number(value);
  const isPercent = unit === '%';
  let valueClass = 'text-ore-text-primary';
  if (isPercent && !isNaN(num)) {
    if (num > 85) valueClass = 'text-ore-error';
    else if (num > 70) valueClass = 'text-ore-warning';
    else valueClass = 'text-ore-success';
  }

  const display =
    value !== null && value !== undefined && !isNaN(num) && isPercent
      ? `${num.toFixed(1)}%`
      : value !== null && value !== undefined
        ? `${value}${unit}`
        : 'N/A';

  return (
    <div className="ds-metric-row">
      <span className="ds-metric-label">{label}</span>
      <span className={`ds-metric-value tabular-nums ${valueClass}`}>{display}</span>
    </div>
  );
}
