import { useState } from 'react';
import { MODULES } from '../design/modules.js';

export default function ModuleSearch({ onSelect, className = '' }) {
  const [search, setSearch] = useState('');

  const filtered = MODULES.filter(
    (m) =>
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.subtitle?.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      <input
        id="module-search"
        type="text"
        placeholder="Search modules (⌘K)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="ds-input max-w-[300px]"
      />
      {search && (
        <div className="absolute top-full left-0 mt-2 w-[300px] max-h-48 overflow-y-auto z-30 bg-ore-bg-secondary border border-ore-border rounded-md p-1 shadow-lg">
          {filtered.map((module) => (
            <button
              key={module.id}
              type="button"
              onClick={() => {
                onSelect(module.id);
                setSearch('');
              }}
              className="ds-nav-item flex items-center gap-2"
            >
              <i className={`ti ${module.icon} text-ore-accent`} aria-hidden />
              <span>
                {module.label}
                <span className="text-ore-text-tertiary ml-1">· {module.subtitle}</span>
              </span>
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
