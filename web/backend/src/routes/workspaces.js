import express from 'express';
import * as workspaceService from '../services/workspace.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const workspaces = await workspaceService.listWorkspaces();
    res.json({ workspaces });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Workspace name required' });
    }
    const workspace = await workspaceService.createWorkspace(name.trim());
    res.status(201).json(workspace);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
});

export default router;
