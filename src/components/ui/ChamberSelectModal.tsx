import React from 'react';
import { Grid, X, Lock, CheckCircle, Play } from 'lucide-react';
import { CAMPAIGN_CHAMBERS } from '../../game/progression/campaign';
import { soundManager } from '../../services/audio/soundManager';
import './chamberSelect.css';

interface ChamberSelectModalProps {
  isOpen: boolean;
  unlockedChamberIds: readonly string[];
  completedChamberIds: readonly string[];
  currentChamberId: string;
  onSelectChamber: (chamberId: string) => void;
  onClose: () => void;
}

export const ChamberSelectModal: React.FC<ChamberSelectModalProps> = ({
  isOpen,
  unlockedChamberIds,
  completedChamberIds,
  currentChamberId,
  onSelectChamber,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop-generic"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chamber-select-title"
    >
      <div className="modal-card-medium" style={{ maxWidth: '780px' }}>
        <div className="modal-header-row">
          <div className="modal-title-group">
            <Grid size={20} color="var(--color-cyan-primary)" />
            <h2 id="chamber-select-title" className="modal-title-text">
              Simulation Sector Select (5 Total Chambers)
            </h2>
          </div>
          <button
            type="button"
            className="btn-close-icon"
            onClick={() => {
              soundManager.playKeystroke();
              onClose();
            }}
            aria-label="Close sector selection"
          >
            <X size={18} />
          </button>
        </div>

        <div className="chamber-select-grid">
          {CAMPAIGN_CHAMBERS.map((chamber) => {
            const isCompleted = completedChamberIds.includes(chamber.id);
            const isUnlocked = unlockedChamberIds.includes(chamber.id) || isCompleted;
            const isCurrent = currentChamberId === chamber.id;

            return (
              <div
                key={chamber.id}
                className={`chamber-card ${
                  isCompleted ? 'completed' : isUnlocked ? 'available' : 'locked'
                }`}
                onClick={() => {
                  if (isUnlocked) {
                    soundManager.playKeystroke();
                    onSelectChamber(chamber.id);
                  }
                }}
                role="button"
                tabIndex={isUnlocked ? 0 : -1}
                aria-disabled={!isUnlocked}
              >
                <div>
                  <div className="chamber-card-header">
                    <span className="chamber-number-tag">SECTOR {chamber.number}</span>
                    {isCompleted ? (
                      <span className="chamber-status-badge status-completed">
                        <CheckCircle size={10} style={{ display: 'inline', marginRight: '3px' }} />
                        CLEARED
                      </span>
                    ) : isUnlocked ? (
                      <span className="chamber-status-badge status-available">
                        {isCurrent ? 'ACTIVE' : 'READY'}
                      </span>
                    ) : (
                      <span className="chamber-status-badge status-locked">
                        <Lock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                        LOCKED
                      </span>
                    )}
                  </div>

                  <h4 className="chamber-title-text">{chamber.name}</h4>
                  <div className="chamber-subtitle-text">{chamber.subtitle}</div>
                  <p style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    {chamber.description}
                  </p>
                </div>

                <div>
                  <div className="chamber-concept-box">
                    <span>Key Axiom: </span>{chamber.coreConcept}
                  </div>

                  {isUnlocked && (
                    <button
                      type="button"
                      className="btn-title-primary"
                      style={{
                        width: '100%',
                        padding: '6px 12px',
                        fontSize: 'var(--font-size-2xs)',
                        marginTop: '8px',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playKeystroke();
                        onSelectChamber(chamber.id);
                      }}
                    >
                      <Play size={12} />
                      <span>{isCompleted ? 'REPLAY SECTOR' : 'ENTER SECTOR'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
