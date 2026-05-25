import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(username, password);
      localStorage.setItem('authToken', response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ds-page flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="ds-card-accent p-8">
          <h1 className="ds-display text-center mb-8">ore</h1>

          {error && <div className="ds-alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="ds-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="ds-input"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="ds-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ds-input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="ds-btn-primary w-full">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-ore-label text-ore-text-tertiary mt-6 text-center">
            Demo credentials: admin/admin
          </p>
        </div>
      </div>
    </div>
  );
}
