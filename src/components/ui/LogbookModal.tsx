import React, { useState } from 'react';
import { BookOpen, X, FileText } from 'lucide-react';
import { ALL_LOGBOOK_ENTRIES } from '../../game/progression/logbook';
import { soundManager } from '../../services/audio/soundManager';
import './logbook.css';

interface LogbookModalProps {
  isOpen: boolean;
  discoveredLogIds: readonly string[];
  currentChamberId: string;
  onClose: () => void;
}

export const LogbookModal: React.FC<LogbookModalProps> = ({
  isOpen,
  discoveredLogIds,
  currentChamberId,
  onClose,
}) => {
  const [chamberFilter, setChamberFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filters = [
    { id: 'all', label: 'All Evidence' },
    { id: 'chamber_101', label: 'Chamber 1' },
    { id: 'chamber_102', label: 'Chamber 2' },
    { id: 'chamber_103', label: 'Chamber 3' },
    { id: 'chamber_104', label: 'Chamber 4' },
    { id: 'chamber_105', label: 'Chamber 5' },
  ];

  // Discoverable logs: logs from the current room or explicitly in discoveredLogIds
  const logs = Object.values(ALL_LOGBOOK_ENTRIES).filter((entry) => {
    // Show if discovered or in current room or prior room
    const isDiscovered =
      discoveredLogIds.includes(entry.id) ||
      entry.chamberId === currentChamberId ||
      entry.chamberId === 'chamber_101';
    if (!isDiscovered) return false;
    if (chamberFilter === 'all') return true;
    return entry.chamberId === chamberFilter;
  });

  const getAuthorClass = (author: string) => {
    switch (author) {
      case 'Diagnostic System':
        return 'author-diagnostic';
      case 'Investigator Log':
        return 'author-investigator';
      case 'Maintenance Advisory':
        return 'author-maintenance';
      case 'The Architect':
        return 'author-architect';
      default:
        return 'author-investigator';
    }
  };

  return (
    <div
      className="modal-backdrop-generic"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logbook-modal-title"
    >
      <div className="logbook-modal-card">
        <div className="modal-header-row">
          <div className="modal-title-group">
            <BookOpen size={20} color="var(--color-cyan-primary)" />
            <h2 id="logbook-modal-title" className="modal-title-text">
              Investigator Dossier & Telemetry Archive
            </h2>
          </div>
          <button
            type="button"
            className="btn-close-icon"
            onClick={() => {
              soundManager.playKeystroke();
              onClose();
            }}
            aria-label="Close logbook"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter bar */}
        <div className="logbook-filter-bar">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`btn-filter-pill ${chamberFilter === f.id ? 'active' : ''}`}
              onClick={() => {
                soundManager.playKeystroke();
                setChamberFilter(f.id);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Scrollable list of logs */}
        <div className="logbook-entries-scroll">
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--color-text-muted)' }}>
              <FileText size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p>No telemetry logs discovered for this sector yet.</p>
            </div>
          ) : (
            logs.map((entry) => (
              <article key={entry.id} className="log-entry-item">
                <div className="log-entry-header">
                  <div className="log-entry-meta">
                    <span className={`author-pill ${getAuthorClass(entry.author)}`}>
                      {entry.author}
                    </span>
                    <span className="log-timestamp">{entry.timestamp}</span>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-2xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>
                    [{entry.tag}]
                  </span>
                </div>
                <h4 className="log-title">{entry.title}</h4>
                <p className="log-body">{entry.content}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
