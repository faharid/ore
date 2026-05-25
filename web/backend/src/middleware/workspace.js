export default function workspaceMiddleware(req, res, next) {
  req.workspace = req.headers['x-workspace'] || req.query.workspace || 'default';
  next();
}
