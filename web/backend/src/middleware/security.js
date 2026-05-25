import helmet from 'helmet';
import cors from 'cors';

export function setupSecurity(app) {
  app.use(
    helmet({
      contentSecurityPolicy: false
    })
  );

  const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.use(
    cors({
      origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace']
    })
  );

  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        return next();
      }
      if (req.path === '/health') return next();
      return res.redirect(307, `https://${req.get('host')}${req.url}`);
    });
  }
}
