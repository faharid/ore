import { useState } from 'react';
import { Link } from 'react-router-dom';
import MonitorDash from '../components/MonitorDash';

export default function Monitor() {
  const [selectedEnv, setSelectedEnv] = useState('dev');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div className="ds-page">
      <header className="bg-ore-bg-secondary border-b border-ore-border p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
          <div>
            <h1 className="ds-headline">Monitoring</h1>
            <p className="text-ore-body text-ore-text-secondary mt-1">
              Infrastructure metrics and status
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap justify-end">
            <select
              value={selectedEnv}
              onChange={(e) => setSelectedEnv(e.target.value)}
              className="ds-select w-auto"
            >
              <option>dev</option>
              <option>staging</option>
              <option>prod</option>
            </select>
            <Link to="/" className="ds-btn-secondary">
              Dashboard
            </Link>
            <button type="button" onClick={handleLogout} className="ds-btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <MonitorDash env={selectedEnv} />
      </main>
    </div>
  );
}
