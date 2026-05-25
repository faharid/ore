import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MonitorDash from '../components/MonitorDash';
import { environmentApi } from '../services/api';

export default function Monitor() {
  const [environments, setEnvironments] = useState([]);
  const [selectedEnv, setSelectedEnv] = useState(null);
  const workspace = localStorage.getItem('workspace') || 'default';

  useEffect(() => {
    environmentApi
      .list()
      .then((res) => {
        const envs = res.data.environments || [];
        setEnvironments(envs);
        if (envs.length > 0) {
          setSelectedEnv((prev) => (prev && envs.includes(prev) ? prev : envs[0]));
        } else {
          setSelectedEnv(null);
        }
      })
      .catch((err) => console.error('Failed to load environments:', err));
  }, [workspace]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div className="ds-page">
      <header className="ds-main-header">
        <div>
          <h1 className="text-base font-semibold m-0">Monitoring</h1>
          <p className="text-ore-body text-ore-text-secondary mt-1 m-0">
            Infrastructure metrics and status
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap justify-end">
          <select
            value={selectedEnv || ''}
            onChange={(e) => setSelectedEnv(e.target.value)}
            className="ds-select w-auto min-w-[140px]"
            disabled={environments.length === 0}
          >
            {environments.length === 0 ? (
              <option value="">No environments</option>
            ) : (
              environments.map((env) => (
                <option key={env} value={env}>
                  {env}
                </option>
              ))
            )}
          </select>
          <Link to="/" className="ds-btn-secondary">
            Dashboard
          </Link>
          <button type="button" onClick={handleLogout} className="ds-btn-ghost">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {selectedEnv ? (
          <MonitorDash env={selectedEnv} />
        ) : (
          <div className="ds-card p-6 text-ore-body text-ore-text-tertiary">
            No environments in workspace &quot;{workspace}&quot;. Create one from the dashboard.
          </div>
        )}
      </main>
    </div>
  );
}
