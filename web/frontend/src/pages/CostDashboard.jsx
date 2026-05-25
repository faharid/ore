import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { environmentApi } from '../services/api';

export default function CostDashboard() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    environmentApi
      .getCostHistory()
      .then((res) => setHistory(res.data.history || []))
      .catch(console.error);
  }, []);

  const chartData = history.map((h) => ({
    time: new Date(h.timestamp).toLocaleDateString(),
    cost: h.totalMonthlyCost
  }));

  const latest = history[0];
  const monthlyAvg =
    history.length > 0
      ? history.reduce((s, h) => s + h.totalMonthlyCost, 0) / history.length
      : 0;

  return (
    <div className="ds-page p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="ds-headline">Cost history</h1>
            <p className="text-ore-body text-ore-text-secondary mt-1">
              Snapshots saved when configs are updated or applied
            </p>
          </div>
          <Link to="/" className="ds-link">
            ← Dashboard
          </Link>
        </div>

        <section className="ds-card mb-6">
          <h3 className="ds-card-title">Summary</h3>
          <div className="space-y-0">
            <div className="ds-metric-row">
              <span className="ds-metric-label">Latest snapshot</span>
              <span className="ds-metric-value text-ore-success">
                {latest ? `$${latest.totalMonthlyCost?.toFixed(2)}/mo` : '—'}
              </span>
            </div>
            <div className="ds-metric-row">
              <span className="ds-metric-label">Average (all snapshots)</span>
              <span className="ds-metric-value">${monthlyAvg.toFixed(2)}/mo</span>
            </div>
            <div className="ds-metric-row">
              <span className="ds-metric-label">Snapshots recorded</span>
              <span className="ds-metric-value">{history.length}</span>
            </div>
          </div>
        </section>

        {chartData.length > 0 ? (
          <section className="ds-card-accent">
            <h3 className="ds-card-title">Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                  <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #4b5563',
                      borderRadius: 8
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#4ade80"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        ) : (
          <p className="text-ore-body text-ore-text-tertiary">
            Save environment configs to build cost history.
          </p>
        )}
      </div>
    </div>
  );
}
