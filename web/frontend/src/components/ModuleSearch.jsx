import { useState } from 'react';
import { MODULES } from '../design/modules.js';

export default function ModuleSearch({ onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = MODULES.filter(
    (m) =>
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        id="module-search"
        type="text"
        placeholder="Search modules (⌘K)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="ds-input"
      />
      {search && (
        <div className="mt-2 max-h-40 overflow-y-auto space-y-1 bg-ore-bg-secondary border border-ore-border rounded-ore p-1">
          {filtered.map((module) => (
            <button
              key={module.id}
              type="button"
              onClick={() => {
                onSelect(module.id);
                setSearch('');
              }}
              className="ds-nav-item"
            >
              {module.icon} {module.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-ore-label text-ore-text-tertiary px-3 py-2">No modules found</p>
          )}
        </div>
      )}
    </div>
  );
}
