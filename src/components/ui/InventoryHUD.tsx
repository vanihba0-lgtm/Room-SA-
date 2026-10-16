import React from 'react';
import { KeyRound, Box } from 'lucide-react';
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
  const slots = Array.from({ length: TOTAL_SLOTS }, (_, index) => items[index] ?? null);

  return (
    <section className="inventory-hud" aria-label="Player Inventory">
      <div className="inventory-header">
        <span className="inventory-label">INVENTORY</span>
        <span className="inventory-count">
          {items.length}/{TOTAL_SLOTS}
        </span>
      </div>

      <div className="inventory-slots">
        {slots.map((item, idx) => (
          <div
            key={item ? item.id : `empty_slot_${idx}`}
            className={`inventory-slot ${item ? 'slot-occupied' : 'slot-empty'}`}
            role={item ? 'button' : undefined}
            tabIndex={item ? 0 : -1}
            aria-label={item ? `${item.name}: ${item.description}` : 'Empty inventory slot'}
            onClick={() => item && onInspectItem?.(item)}
            onKeyDown={(e) => {
              if (item && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onInspectItem?.(item);
              }
            }}
          >
            {item ? (
              <div className="slot-item-content">
                <div className="item-icon-wrapper">
                  <KeyRound size={20} className="item-icon" />
                </div>
                <span className="item-name">{item.name}</span>
                <span className="item-category-tag">{item.category}</span>
              </div>
            ) : (
              <div className="slot-empty-content">
                <Box size={16} className="empty-slot-icon" />
                <span className="empty-text">EMPTY</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
