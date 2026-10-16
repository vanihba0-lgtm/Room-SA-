import React, { useState, useEffect } from 'react';
import { KeyRound, ChevronUp, ChevronDown, Package } from 'lucide-react';
import { InventoryItem } from '../../game/types';
import './inventory.css';

interface InventoryHUDProps {
  items: readonly InventoryItem[];
  onInspectItem?: (item: InventoryItem) => void;
}

const TOTAL_SLOTS = 3;

export const InventoryHUD: React.FC<InventoryHUDProps> = ({
  items,
  onInspectItem,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle inventory on 'I' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyI' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        setIsExpanded((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section
      className={`inventory-hud ${isExpanded ? 'is-expanded' : 'is-compact'}`}
      aria-label="Player Inventory"
    >
      {/* Compact strip bar */}
      <div className="inventory-bar">
        <button
          type="button"
          className="inventory-summary-btn"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-label={isExpanded ? 'Collapse inventory panel' : 'Expand inventory panel'}
        >
          <Package size={14} className="inventory-summary-icon" />
          <span className="inventory-label">INVENTORY</span>
          <span className="inventory-count">
            {items.length}/{TOTAL_SLOTS}
          </span>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {/* Quick-access item chips in compact mode */}
        <div className="inventory-chips">
          {items.length === 0 ? (
            <span className="inventory-empty-hint">Empty [Press I to view]</span>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="inventory-item-chip"
                onClick={() => onInspectItem?.(item)}
                aria-label={`Inspect ${item.name}: ${item.description}`}
                title={`Click to inspect ${item.name}`}
              >
                <KeyRound size={13} className="item-chip-icon" />
                <span className="item-chip-name">{item.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Expanded detailed drawer */}
      {isExpanded && items.length > 0 && (
        <div className="inventory-drawer">
          {items.map((item) => (
            <div
              key={item.id}
              className="inventory-drawer-card"
              role="button"
              tabIndex={0}
              onClick={() => onInspectItem?.(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onInspectItem?.(item);
                }
              }}
            >
              <div className="drawer-card-header">
                <KeyRound size={16} className="item-chip-icon" />
                <span className="drawer-item-title">{item.name}</span>
                <span className="drawer-item-tag">{item.category}</span>
              </div>
              <p className="drawer-item-desc">{item.description}</p>
              <span className="drawer-inspect-prompt">Click to inspect</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
