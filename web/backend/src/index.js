import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.js';
import environmentRoutes from './routes/environments.js';
import terraformRoutes from './routes/terraform.js';
import monitoringRoutes from './routes/monitoring.js';
import workspaceRoutes from './routes/workspaces.js';
import webhookRoutes from './routes/webhooks.js';
import auditRoutes from './routes/audit.js';
import authMiddleware from './middleware/auth.js';
import workspaceMiddleware from './middleware/workspace.js';
import { sanitizeInput } from './middleware/sanitize.js';
import { loginLimiter, apiLimiter, terraformLimiter } from './middleware/rateLimit.js';
import { setupSecurity } from './middleware/security.js';
import { cacheMiddleware } from './middleware/cache.js';
import { requestLogger } from './middleware/logging.js';
import { auditMiddleware } from './middleware/audit.js';
import { specs } from './swagger.js';
import { validateJwtSecret } from './services/auth-users.js';
import { runMigrations } from '../db/migrate.js';
import { runSeed } from '../db/seed.js';
import { checkDatabaseHealth } from '../db/pool.js';

dotenv.config();

try {
  validateJwtSecret();
} catch (err) {
  if (process.env.NODE_ENV === 'production') {
    console.error(err.message);
    process.exit(1);
  }
  console.warn('JWT warning:', err.message);
}

const app = express();
const PORT = process.env.PORT || 3001;

setupSecurity(app);
app.use(requestLogger);
app.use(express.json());
app.use(sanitizeInput);

app.get('/health', async (req, res) => {
  const db = await checkDatabaseHealth();
  res.json({
    status: db.ok || db.mode === 'file' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: db
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/webhooks', webhookRoutes);

app.use('/api/auth', loginLimiter, authRoutes);

app.use('/api/workspaces', authMiddleware, apiLimiter, workspaceRoutes);

app.use('/api/audit', authMiddleware, apiLimiter, auditRoutes);

app.use(
  '/api/environments',
  authMiddleware,
  apiLimiter,
  workspaceMiddleware,
  auditMiddleware,
  cacheMiddleware,
  environmentRoutes
);

app.use(
  '/api/environments',
  authMiddleware,
  terraformLimiter,
  workspaceMiddleware,
  terraformRoutes
);

app.use(
  '/api/environments',
  authMiddleware,
  apiLimiter,
  workspaceMiddleware,
  cacheMiddleware,
  monitoringRoutes
);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

async function start() {
  try {
    const migrated = await runMigrations();
    if (migrated) {
      await runSeed();
    }
  } catch (err) {
    console.error('Database init failed:', err.message);
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`ore backend running on http://localhost:${PORT}`);
    console.log(`API docs: http://localhost:${PORT}/api-docs`);
    console.log(
      process.env.DATABASE_URL
        ? 'Storage: PostgreSQL'
        : 'Storage: file-based (set DATABASE_URL for Postgres)'
    );
  });
}

start();
