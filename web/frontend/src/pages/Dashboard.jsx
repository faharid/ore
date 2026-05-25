import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { environmentApi, workspaceApi } from '../services/api';
import Canvas from '../components/Canvas';
import ConfigPanel from '../components/ConfigPanel';
import Terminal from '../components/Terminal';
import ModuleSearch from '../components/ModuleSearch';
import ConfirmModal from '../components/ConfirmModal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

function formatEnvTitle(env) {
  if (!env) return 'Infrastructure';
  return `${env.charAt(0).toUpperCase()}${env.slice(1)} Infrastructure`;
}

export default function Dashboard() {
  const [environments, setEnvironments] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [workspace, setWorkspace] = useState(
    () => localStorage.getItem('workspace') || 'default'
  );
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [newEnvName, setNewEnvName] = useState('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showNewEnv, setShowNewEnv] = useState(false);
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightModule, setHighlightModule] = useState(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalCommand, setTerminalCommand] = useState(null);
  const [costEstimate, setCostEstimate] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

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
      const envs = response.data.environments || [];
      setEnvironments(envs);
      setSelectedEnv((prev) => (prev && envs.includes(prev) ? prev : envs[0] || null));
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
      setShowNewEnv(false);
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
      setShowNewWorkspace(false);
      await loadWorkspaces();
      setWorkspace(newWorkspaceName.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
    } catch (err) {
      console.error('Failed to create workspace:', err);
    }
  };

  const closeConfirmModal = () => {
    if (modalLoading) return;
    setConfirmModal(null);
    setModalError('');
  };

  const openDeleteWorkspaceModal = () => {
    if (workspace === 'default') return;
    const ws = workspaces.find((w) => w.id === workspace);
    setModalError('');
    setConfirmModal({
      type: 'delete-workspace',
      label: ws?.name || workspace,
      slug: workspace
    });
  };

  const openDeleteEnvironmentModal = () => {
    if (!selectedEnv) return;
    setModalError('');
    setConfirmModal({
      type: 'delete-environment',
      env: selectedEnv,
      label: selectedEnv.charAt(0).toUpperCase() + selectedEnv.slice(1)
    });
  };

  const executeDeleteEnvironment = async () => {
    if (!confirmModal || confirmModal.type !== 'delete-environment') return;
    const { env } = confirmModal;
    setModalLoading(true);
    setModalError('');
    try {
      await environmentApi.delete(env);
      setSelectedNode(null);
      setShowTerminal(false);
      setCostEstimate(null);
      closeConfirmModal();
      await loadEnvironments();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Failed to delete environment';
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const executeDeleteWorkspace = async () => {
    if (!confirmModal || confirmModal.type !== 'delete-workspace') return;
    const { slug } = confirmModal;
    setModalLoading(true);
    setModalError('');
    try {
      await workspaceApi.delete(slug);
      const remaining = workspaces.filter((w) => w.id !== slug);
      const next =
        remaining.find((w) => w.id === 'default')?.id || remaining[0]?.id || 'default';
      setWorkspace(next);
      localStorage.setItem('workspace', next);
      setSelectedEnv(null);
      setSelectedNode(null);
      setShowTerminal(false);
      closeConfirmModal();
      await loadWorkspaces();
      await loadEnvironments();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Failed to delete workspace';
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const runTerminal = (action) => {
    setSelectedNode(null);
    setTerminalCommand({ action, node: 'terraform' });
    setShowTerminal(true);
  };

  const openTerminal = (action) => {
    if (!selectedEnv) return;
    if (action === 'destroy') {
      setModalError('');
      setConfirmModal({ type: 'destroy', env: selectedEnv });
      return;
    }
    runTerminal(action);
  };

  const executeDestroy = () => {
    if (!confirmModal || confirmModal.type !== 'destroy') return;
    closeConfirmModal();
    runTerminal('destroy');
  };

  const handleModalConfirm = () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'delete-workspace') executeDeleteWorkspace();
    if (confirmModal.type === 'delete-environment') executeDeleteEnvironment();
    if (confirmModal.type === 'destroy') executeDestroy();
    if (confirmModal.type === 'alert') closeConfirmModal();
  };

  useKeyboardShortcuts({
    onPlan: () => selectedEnv && openTerminal('plan'),
    onApply: () => selectedEnv && openTerminal('apply'),
    onDestroy: () => selectedEnv && openTerminal('destroy'),
    onClose: () => {
      setShowTerminal(false);
      setSelectedNode(null);
    },
    onSearch: () => document.getElementById('module-search')?.focus()
  });

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  const drawerOpen = showTerminal || !!selectedNode;

  return (
    <div className="flex h-screen bg-ore-bg-primary text-ore-text-primary overflow-hidden">
      <aside className="ds-sidebar w-[220px]">
        <div className="p-5 flex flex-col gap-6 flex-1 overflow-y-auto">
          <div>
            <h3 className="ds-sidebar-section">Workspace</h3>
            <select
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              className="ds-select"
              aria-label="Workspace"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
            {showNewWorkspace ? (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="New workspace"
                  className="ds-input text-ore-label"
                />
                <button
                  type="button"
                  onClick={handleCreateWorkspace}
                  className="ds-btn-ghost w-full text-ore-label"
                >
                  Add workspace
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewWorkspace(true)}
                className="mt-2 text-ore-label text-ore-text-tertiary hover:text-ore-accent w-full text-left"
              >
                + New workspace
              </button>
            )}
            {workspace !== 'default' && (
              <button
                type="button"
                onClick={openDeleteWorkspaceModal}
                className="ds-btn-danger w-full mt-2 text-ore-label justify-center"
              >
                <i className="ti ti-trash text-sm" aria-hidden />
                Delete workspace
              </button>
            )}
          </div>

          <div>
            <h3 className="ds-sidebar-section">Environments</h3>
            <div className="flex flex-col gap-2">
              {environments.map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => {
                    setSelectedEnv(env);
                    setSelectedNode(null);
                    setShowTerminal(false);
                  }}
                  className={selectedEnv === env ? 'ds-nav-item-active' : 'ds-nav-item'}
                >
                  {env.charAt(0).toUpperCase() + env.slice(1)}
                </button>
              ))}
            </div>
            {showNewEnv ? (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  placeholder="Environment name"
                  className="ds-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateEnvironment()}
                />
                <button
                  type="button"
                  onClick={handleCreateEnvironment}
                  className="ds-btn-primary w-full"
                >
                  Create
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewEnv(true)}
                className="mt-2 text-ore-label text-ore-text-tertiary hover:text-ore-accent w-full text-left"
              >
                + New environment
              </button>
            )}
            {selectedEnv && (
              <button
                type="button"
                onClick={openDeleteEnvironmentModal}
                className="ds-btn-danger w-full mt-2 text-ore-label justify-center"
              >
                <i className="ti ti-trash text-sm" aria-hidden />
                Delete environment
              </button>
            )}
          </div>

          <div className="flex-1" />

          <nav className="border-t border-ore-border pt-4 flex flex-col gap-3">
            <Link to="/costs" className="ds-sidebar-link">
              <i className="ti ti-chart-bar text-base" aria-hidden />
              Cost
            </Link>
            <Link to="/monitoring" className="ds-sidebar-link">
              <i className="ti ti-bell text-base" aria-hidden />
              Monitoring
            </Link>
          </nav>
        </div>

        <div className="p-5 border-t border-ore-border">
          <button type="button" onClick={handleLogout} className="ds-btn-ghost w-full">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="ds-main-header">
          <h1 className="text-base font-semibold m-0">
            {formatEnvTitle(selectedEnv)}
          </h1>
          {costEstimate && (
            <div className="ds-cost-pill">
              <p className="text-[11px] text-ore-text-secondary m-0">Monthly cost</p>
              <p className="text-base font-semibold text-ore-success m-0 tabular-nums">
                ${costEstimate.totalMonthlyCost?.toFixed(2)}
              </p>
            </div>
          )}
        </header>

        <div className="ds-toolbar">
          <ModuleSearch
            onSelect={(id) => {
              setSelectedNode(id);
              setShowTerminal(false);
              setHighlightModule(id);
              setTimeout(() => setHighlightModule(null), 2000);
            }}
          />
          <div className="flex gap-2 ml-auto flex-wrap">
            <button
              type="button"
              onClick={() => openTerminal('plan')}
              disabled={!selectedEnv}
              className="ds-btn-primary"
            >
              <i className="ti ti-player-play text-sm" aria-hidden />
              Plan
            </button>
            <button
              type="button"
              onClick={() => openTerminal('apply')}
              disabled={!selectedEnv}
              className="ds-btn-secondary"
            >
              <i className="ti ti-check text-sm" aria-hidden />
              Apply
            </button>
            <button
              type="button"
              onClick={() => openTerminal('destroy')}
              disabled={!selectedEnv}
              className="ds-btn-danger"
            >
              <i className="ti ti-trash text-sm" aria-hidden />
              Destroy
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <main className="flex-1 overflow-auto p-6 bg-ore-bg-primary">
            {selectedEnv ? (
              <div className="ds-canvas-frame h-full min-h-[600px]">
                <Canvas
                  env={selectedEnv}
                  selectedNode={selectedNode}
                  onNodeSelect={(id) => {
                    setSelectedNode(id);
                    setShowTerminal(false);
                  }}
                  highlightModule={highlightModule}
                />
              </div>
            ) : (
              <div className="ds-canvas-frame flex items-center justify-center h-full min-h-[400px]">
                <p className="text-ore-body text-ore-text-tertiary">
                  Select an environment to begin
                </p>
              </div>
            )}
          </main>

          {drawerOpen && (
            <>
              <button
                type="button"
                className="ds-drawer-backdrop lg:hidden"
                aria-label="Close panel"
                onClick={() => {
                  setShowTerminal(false);
                  setSelectedNode(null);
                }}
              />
              <aside className="ds-drawer flex flex-col z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-ore-border shrink-0">
                  <h2 className="text-ore-title font-semibold m-0">
                    {showTerminal ? 'Terraform' : 'Configuration'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTerminal(false);
                      setSelectedNode(null);
                    }}
                    className="ds-btn-ghost py-1 px-2"
                    aria-label="Close"
                  >
                    <i className="ti ti-x" aria-hidden />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col p-4">
                  {showTerminal && terminalCommand ? (
                    <Terminal
                      env={selectedEnv}
                      command={terminalCommand}
                      onClose={() => setShowTerminal(false)}
                      onApply={loadCost}
                    />
                  ) : selectedNode ? (
                    <ConfigPanel env={selectedEnv} node={selectedNode} onSave={loadCost} />
                  ) : null}
                </div>
              </aside>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmModal?.type === 'delete-workspace'}
        title="Delete workspace"
        variant="danger"
        confirmLabel="Delete workspace"
        cancelLabel="Cancel"
        loading={modalLoading}
        error={modalError}
        onConfirm={handleModalConfirm}
        onCancel={closeConfirmModal}
        requireTyping={
          confirmModal?.type === 'delete-workspace'
            ? {
                label: `Type "${confirmModal.slug}" to confirm`,
                value: confirmModal.slug,
                placeholder: confirmModal.slug
              }
            : undefined
        }
      >
        {confirmModal?.type === 'delete-workspace' && (
          <>
            <p className="m-0">
              Delete workspace <strong>{confirmModal.label}</strong>?
            </p>
            <p className="m-0 mt-3 text-ore-text-tertiary">
              All environment configs in this workspace will be removed. This cannot be undone.
            </p>
          </>
        )}
      </ConfirmModal>

      <ConfirmModal
        open={confirmModal?.type === 'delete-environment'}
        title="Delete environment"
        variant="danger"
        confirmLabel="Delete environment"
        cancelLabel="Cancel"
        loading={modalLoading}
        error={modalError}
        onConfirm={handleModalConfirm}
        onCancel={closeConfirmModal}
        requireTyping={
          confirmModal?.type === 'delete-environment'
            ? {
                label: `Type "${confirmModal.env}" to confirm`,
                value: confirmModal.env,
                placeholder: confirmModal.env
              }
            : undefined
        }
      >
        {confirmModal?.type === 'delete-environment' && (
          <>
            <p className="m-0">
              Delete environment <strong>{confirmModal.label}</strong>?
            </p>
            <p className="m-0 mt-3 text-ore-text-tertiary">
              Removes <code className="text-ore-text-secondary">{confirmModal.env}.tfvars</code>{' '}
              from this workspace. This does not destroy deployed AWS resources — use Destroy in
              the toolbar first if infrastructure is running.
            </p>
          </>
        )}
      </ConfirmModal>

      <ConfirmModal
        open={confirmModal?.type === 'destroy'}
        title="Destroy infrastructure"
        variant="danger"
        confirmLabel="Destroy"
        cancelLabel="Cancel"
        onConfirm={handleModalConfirm}
        onCancel={closeConfirmModal}
        requireTyping={
          confirmModal?.type === 'destroy'
            ? {
                label: `Type "${confirmModal.env}" to confirm`,
                value: confirmModal.env,
                placeholder: confirmModal.env
              }
            : undefined
        }
      >
        {confirmModal?.type === 'destroy' && (
          <>
            <p className="m-0">
              Destroy all infrastructure in <strong>{confirmModal.env}</strong>?
            </p>
            <p className="m-0 mt-3 text-ore-text-tertiary">
              This will run terraform destroy and remove all deployed resources. This cannot be
              undone.
            </p>
          </>
        )}
      </ConfirmModal>
    </div>
  );
}
