import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { environmentApi, workspaceApi } from '../services/api';
import Canvas from '../components/Canvas';
import ConfigPanel from '../components/ConfigPanel';
import Terminal from '../components/Terminal';
import ModuleSearch from '../components/ModuleSearch';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function Dashboard() {
  const [environments, setEnvironments] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [workspace, setWorkspace] = useState(
    () => localStorage.getItem('workspace') || 'default'
  );
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [newEnvName, setNewEnvName] = useState('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightModule, setHighlightModule] = useState(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalCommand, setTerminalCommand] = useState(null);
  const [costEstimate, setCostEstimate] = useState(null);

  const loadCost = useCallback(async () => {
    if (!selectedEnv) {
      setCostEstimate(null);
      return;
    }
    try {
      const res = await environmentApi.getCostEstimate(selectedEnv);
      setCostEstimate(res.data);
    } catch {
      setCostEstimate(null);
    }
  }, [selectedEnv]);

  const loadEnvironments = async () => {
    try {
      const response = await environmentApi.list();
      setEnvironments(response.data.environments);
      if (!selectedEnv && response.data.environments.length > 0) {
        setSelectedEnv(response.data.environments[0]);
      }
    } catch (err) {
      console.error('Failed to load environments:', err);
    }
  };

  const loadWorkspaces = async () => {
    try {
      const res = await workspaceApi.list();
      setWorkspaces(res.data.workspaces || []);
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    }
  };

  useEffect(() => {
    localStorage.setItem('workspace', workspace);
    loadEnvironments();
    loadWorkspaces();
  }, [workspace]);

  useEffect(() => {
    loadCost();
  }, [loadCost]);

  const handleCreateEnvironment = async () => {
    if (!newEnvName.trim()) return;
    try {
      await environmentApi.create(newEnvName);
      setNewEnvName('');
      loadEnvironments();
      setSelectedEnv(newEnvName);
    } catch (err) {
      console.error('Failed to create environment:', err);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    try {
      await workspaceApi.create(newWorkspaceName);
      setNewWorkspaceName('');
      loadWorkspaces();
      setWorkspace(newWorkspaceName.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
    } catch (err) {
      console.error('Failed to create workspace:', err);
    }
  };

  const openTerminal = (action) => {
    if (action === 'destroy') {
      const ok = window.confirm(
        `Destroy all infrastructure in "${selectedEnv}"?\n\nThis cannot be undone. Type the environment name mentally before confirming.`
      );
      if (!ok) return;
      const confirmName = window.prompt(
        `Type "${selectedEnv}" to confirm destroy:`
      );
      if (confirmName !== selectedEnv) return;
    }
    setTerminalCommand({ action, node: 'terraform' });
    setShowTerminal(true);
  };

  useKeyboardShortcuts({
    onPlan: () => selectedEnv && openTerminal('plan'),
    onApply: () => selectedEnv && openTerminal('apply'),
    onDestroy: () => selectedEnv && openTerminal('destroy'),
    onClose: () => setShowTerminal(false),
    onSearch: () => document.getElementById('module-search')?.focus()
  });

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-ore-bg-primary text-ore-text-primary">
      <aside className="ds-sidebar w-64 overflow-hidden">
        <div className="p-4 border-b border-ore-border flex justify-between items-center">
          <h1 className="ds-headline">ore</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <label className="ds-label">Workspace</label>
          <select
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            className="ds-select mb-2"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="New workspace"
            className="ds-input mb-2 text-ore-label"
          />
          <button type="button" onClick={handleCreateWorkspace} className="ds-btn-secondary w-full mb-4">
            Add workspace
          </button>

          <h2 className="ds-headline mb-3">Environments</h2>
          <div className="space-y-1 mb-4">
            {environments.map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => setSelectedEnv(env)}
                className={selectedEnv === env ? 'ds-nav-item-active' : 'ds-nav-item'}
              >
                {env}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={newEnvName}
            onChange={(e) => setNewEnvName(e.target.value)}
            placeholder="New environment"
            className="ds-input mb-2"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateEnvironment()}
          />
          <button type="button" onClick={handleCreateEnvironment} className="ds-btn-primary w-full">
            Create environment
          </button>

          <nav className="mt-6 space-y-2 text-ore-body">
            <Link to="/monitor" className="ds-link block">
              Monitor →
            </Link>
            <Link to="/costs" className="ds-link block">
              Cost analytics →
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-ore-border">
          <button type="button" onClick={handleLogout} className="ds-btn-secondary w-full">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-ore-bg-secondary border-b border-ore-border p-4 flex justify-between items-start gap-4">
          <div>
            <p className="text-ore-body text-ore-text-secondary">
              {selectedEnv ? `${workspace} / ${selectedEnv}` : 'Select an environment'}
            </p>
            <p className="text-ore-label text-ore-text-tertiary mt-1">
              ⌘P Plan · ⌘⇧A Apply · ⌘⇧D Destroy · Esc Close · ⌘K Search
            </p>
          </div>
          {costEstimate && (
            <div className="ds-cost-pill">
              <p className="ds-label mb-0">Est. monthly</p>
              <p className="text-ore-headline text-ore-success font-bold tabular-nums">
                ${costEstimate.totalMonthlyCost?.toFixed(2)}
              </p>
              <p className="text-ore-label text-ore-text-tertiary mt-1">
                Yearly ${costEstimate.totalYearlyCost?.toFixed(2)}
              </p>
            </div>
          )}
        </header>

        <div className="flex-1 flex overflow-hidden gap-4 p-4">
          <div className="flex-1 ds-card-accent overflow-hidden flex flex-col p-0">
            <div className="p-3 border-b border-ore-border">
              <ModuleSearch
                onSelect={(id) => {
                  setSelectedNode(id);
                  setHighlightModule(id);
                  setTimeout(() => setHighlightModule(null), 2000);
                }}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              {selectedEnv ? (
                <Canvas
                  env={selectedEnv}
                  selectedNode={selectedNode}
                  onNodeSelect={setSelectedNode}
                  highlightModule={highlightModule}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-ore-text-tertiary text-ore-body">
                  Select an environment to begin
                </div>
              )}
            </div>
          </div>

          <div className="w-96 ds-card-accent overflow-hidden flex flex-col p-0">
            {showTerminal && terminalCommand ? (
              <Terminal
                env={selectedEnv}
                command={terminalCommand}
                onClose={() => setShowTerminal(false)}
                onApply={loadCost}
              />
            ) : selectedNode ? (
              <ConfigPanel env={selectedEnv} node={selectedNode} onSave={loadCost} />
            ) : (
              <div className="flex flex-col h-full p-6">
                <h3 className="ds-headline mb-2">Infrastructure actions</h3>
                <p className="ds-card-text mb-6">
                  Select a module on the canvas to configure, or run Terraform against this
                  environment.
                </p>
                <div className="space-y-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => openTerminal('plan')}
                    className="ds-btn-primary w-full"
                  >
                    Plan Infrastructure
                  </button>
                  <button
                    type="button"
                    onClick={() => openTerminal('apply')}
                    className="ds-btn-secondary w-full"
                  >
                    Apply Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => openTerminal('destroy')}
                    className="ds-btn-danger w-full"
                  >
                    Destroy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
