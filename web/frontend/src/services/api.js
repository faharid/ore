import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };
  const token = localStorage.getItem('authToken');
  if (token) headers.Authorization = `Bearer ${token}`;
  const workspace = localStorage.getItem('workspace') || 'default';
  headers['X-Workspace'] = workspace;
  return headers;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Workspace'] = localStorage.getItem('workspace') || 'default';
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password })
};

export const workspaceApi = {
  list: () => api.get('/workspaces'),
  create: (name) => api.post('/workspaces', { name })
};

export const environmentApi = {
  list: () => api.get('/environments'),
  get: (env) => api.get(`/environments/${env}`),
  create: (env, config) => api.post('/environments', { env, config }),
  update: (env, updates) => api.put(`/environments/${env}`, updates),
  delete: (env) => api.delete(`/environments/${env}`),
  getCostEstimate: (env) => api.get(`/environments/${env}/cost-estimate`),
  getCostHistory: () => api.get('/environments/cost-history')
};

const MAX_SSE_LINES = 1000;

export async function streamTerraformCommand(env, action, { autoApprove = false, onEvent, signal }) {
  const urls = {
    plan: `/api/environments/${env}/plan`,
    apply: `/api/environments/${env}/apply`,
    destroy: `/api/environments/${env}/destroy`
  };
  const url = urls[action];
  if (!url) throw new Error(`Unknown action: ${action}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ autoApprove }),
    signal
  });

  if (!response.ok) {
    const text = await response.text();
    let message = text;
    try {
      message = JSON.parse(text).message || JSON.parse(text).error || text;
    } catch {
      /* use raw text */
    }
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let lineCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';

    for (const part of parts) {
      const lines = part.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6));
          lineCount++;
          if (lineCount <= MAX_SSE_LINES) {
            onEvent(event);
          }
        } catch {
          /* skip malformed */
        }
      }
    }
  }
}

export const terraformApi = {
  getOutputs: (env) => api.get(`/environments/${env}/outputs`),
  getPlan: (env) => api.get(`/environments/${env}/plan`)
};

export const monitoringApi = {
  getMetrics: (env) => api.get(`/environments/${env}/metrics`),
  getStatus: (env) => api.get(`/environments/${env}/status`)
};

export default api;
