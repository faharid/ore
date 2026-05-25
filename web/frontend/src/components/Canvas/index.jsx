import { useState, useEffect } from 'react';
import {
  MODULES,
  MODULE_DEPENDENCIES,
  MODULE_SIZE,
  MODULE_LABEL_OFFSET
} from '../../design/modules.js';

const DEFAULT_POSITIONS = {
  vpc: { x: 80, y: 80 },
  ecs: { x: 280, y: 160 },
  rds: { x: 280, y: 280 },
  alb: { x: 80, y: 200 },
  autoscaling: { x: 480, y: 160 },
  monitoring: { x: 480, y: 280 },
  secrets: { x: 80, y: 360 },
  iam: { x: 280, y: 400 },
  cloudfront: { x: 480, y: 80 },
  budgets: { x: 680, y: 280 },
  client_vpn: { x: 680, y: 160 },
  ssm: { x: 680, y: 400 }
};

const CENTER = MODULE_SIZE / 2;

export default function Canvas({ env, selectedNode, onNodeSelect, highlightModule }) {
  const [positions, setPositions] = useState(DEFAULT_POSITIONS);
  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    if (!env) return;
    const storageKey = `canvas_positions_${env}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setPositions(JSON.parse(saved));
      } catch {
        setPositions(DEFAULT_POSITIONS);
      }
    } else {
      setPositions(DEFAULT_POSITIONS);
    }
  }, [env]);

  useEffect(() => {
    if (!env) return;
    localStorage.setItem(`canvas_positions_${env}`, JSON.stringify(positions));
  }, [positions, env]);

  const getModuleCenter = (moduleId) => {
    const pos = positions[moduleId] || DEFAULT_POSITIONS[moduleId];
    return { x: pos.x + CENTER, y: pos.y + CENTER };
  };

  const renderDependencyLines = () => {
    const lines = [];
    MODULES.forEach((module) => {
      const deps = MODULE_DEPENDENCIES[module.id] || [];
      const to = getModuleCenter(module.id);
      deps.forEach((depId) => {
        const from = getModuleCenter(depId);
        lines.push(
          <line
            key={`${depId}-${module.id}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#9ca3af"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.3"
          />
        );
      });
    });
    return lines;
  };

  const handleMouseDown = (moduleId, e) => {
    e.stopPropagation();
    setDragging(moduleId);
    onNodeSelect(moduleId);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPositions((prev) => ({
      ...prev,
      [dragging]: {
        x: Math.max(0, e.clientX - rect.left - CENTER),
        y: Math.max(0, e.clientY - rect.top - CENTER)
      }
    }));
  };

  return (
    <div
      className="ds-canvas"
      onMouseMove={handleMouseMove}
      onMouseUp={() => setDragging(null)}
      onMouseLeave={() => setDragging(null)}
    >
      <svg className="absolute inset-0 pointer-events-none" style={{ minWidth: 900, minHeight: 520 }}>
        <pattern id="ore-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#374151" strokeWidth="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#ore-grid)" opacity="0.4" />
        {renderDependencyLines()}
      </svg>

      <div className="absolute inset-0" style={{ minWidth: 900, minHeight: 520 }}>
        {MODULES.map((module) => {
          const pos = positions[module.id] || DEFAULT_POSITIONS[module.id];
          const isSelected = selectedNode === module.id;
          const isHighlighted = highlightModule === module.id;

          return (
            <div
              key={module.id}
              className="absolute"
              style={{
                left: pos.x,
                top: pos.y,
                width: MODULE_SIZE,
                paddingBottom: MODULE_LABEL_OFFSET
              }}
              onMouseDown={(e) => handleMouseDown(module.id, e)}
            >
              <div
                className={`ds-module ${module.dsClass} ${
                  isSelected ? 'ds-module-selected' : ''
                } ${isHighlighted ? 'ds-module-highlighted' : ''}`}
              >
                <span className="ds-module-icon" aria-hidden>
                  {module.icon}
                </span>
                <span className="ds-module-label">{module.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-4 ds-card z-20 max-w-sm p-3 text-ore-label text-ore-text-secondary">
        Drag to rearrange. Dashed lines show dependencies. Click to configure.
      </div>
    </div>
  );
}
