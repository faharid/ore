import { useState, useEffect } from 'react';
import {
  MODULES,
  MODULE_DEPENDENCIES,
  MODULE_CARD_WIDTH,
  MODULE_CARD_HEIGHT,
  MODULE_LABEL_OFFSET
} from '../../design/modules.js';

const DEFAULT_POSITIONS = {
  vpc: { x: 48, y: 48 },
  alb: { x: 220, y: 48 },
  ecs: { x: 392, y: 48 },
  rds: { x: 564, y: 48 },
  secrets: { x: 48, y: 200 },
  monitoring: { x: 220, y: 200 },
  iam: { x: 392, y: 200 },
  autoscaling: { x: 564, y: 200 },
  cloudfront: { x: 48, y: 352 },
  budgets: { x: 220, y: 352 },
  client_vpn: { x: 392, y: 352 },
  ssm: { x: 564, y: 352 }
};

const CENTER_X = MODULE_CARD_WIDTH / 2;
const CENTER_Y = MODULE_CARD_HEIGHT / 2;

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
    return { x: pos.x + CENTER_X, y: pos.y + CENTER_Y };
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
            stroke="#4EFFA0"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.2"
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
        x: Math.max(0, e.clientX - rect.left - CENTER_X),
        y: Math.max(0, e.clientY - rect.top - CENTER_Y)
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
      <svg
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        preserveAspectRatio="none"
        style={{ minWidth: 900, minHeight: 520 }}
      >
        <defs>
          <pattern id="ore-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4EFFA0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ore-grid)" />
      </svg>

      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ minWidth: 900, minHeight: 520 }}
      >
        {renderDependencyLines()}
      </svg>

      <div className="relative z-10" style={{ minWidth: 900, minHeight: 520 }}>
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
                width: MODULE_CARD_WIDTH,
                paddingBottom: MODULE_LABEL_OFFSET
              }}
              onMouseDown={(e) => handleMouseDown(module.id, e)}
            >
              <div
                className={`ds-module-card ${
                  isSelected ? 'ds-module-card-selected' : ''
                } ${isHighlighted ? 'ds-module-card-highlighted' : ''}`}
              >
                <i className={`ti ${module.icon} ds-module-icon`} aria-hidden />
                <p className="ds-module-title">{module.label}</p>
                <p className="ds-module-subtitle">{module.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-6 z-20 text-[11px] text-ore-text-muted">
        Click to configure. Drag to rearrange.
      </div>
    </div>
  );
}
