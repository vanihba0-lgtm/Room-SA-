import React, { useState, useEffect } from 'react';
import { Settings, X, Volume2, VolumeX, RotateCcw, Home, Compass } from 'lucide-react';
import { soundManager, AudioSettings } from '../../services/audio/soundManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnToTitle: () => void;
  onRestartChamber: () => void;
  onReplayTutorial: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onReturnToTitle,
  onRestartChamber,
  onReplayTutorial,
}) => {
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() =>
    soundManager.getSettings()
  );

  useEffect(() => {
    if (isOpen) {
      setAudioSettings(soundManager.getSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSliderChange = (key: keyof AudioSettings, val: number) => {
    const updated = { ...audioSettings, [key]: val };
    setAudioSettings(updated);
    soundManager.setSettings(updated);
  };

  const handleToggleMute = () => {
    soundManager.toggleMute();
    setAudioSettings(soundManager.getSettings());
  };

  return (
    <div
      className="modal-backdrop-generic"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="modal-card-medium" style={{ maxWidth: '480px' }}>
        <div className="modal-header-row">
          <div className="modal-title-group">
            <Settings size={20} color="var(--color-cyan-primary)" />
            <h2 id="settings-modal-title" className="modal-title-text">
              System Settings & Audio
            </h2>
          </div>
          <button
            type="button"
            className="btn-close-icon"
            onClick={() => {
              soundManager.playKeystroke();
              onClose();
            }}
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Audio Mixing Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
              Master Mute
            </span>
            <button
              type="button"
              className="btn-title-secondary"
              style={{ padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}
              onClick={handleToggleMute}
            >
              {audioSettings.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{audioSettings.muted ? 'MUTED' : 'UNMUTED'}</span>
            </button>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              <span>Master Volume</span>
              <span style={{ fontFamily: 'var(--font-family-mono)' }}>{Math.round(audioSettings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioSettings.masterVolume}
              onChange={(e) => handleSliderChange('masterVolume', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-cyan-primary)', cursor: 'pointer' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              <span>Sound Effects (SFX)</span>
              <span style={{ fontFamily: 'var(--font-family-mono)' }}>{Math.round(audioSettings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioSettings.sfxVolume}
              onChange={(e) => handleSliderChange('sfxVolume', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-amber-primary)', cursor: 'pointer' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
              <span>Chamber Ambience</span>
              <span style={{ fontFamily: 'var(--font-family-mono)' }}>{Math.round(audioSettings.ambienceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={audioSettings.ambienceVolume}
              onChange={(e) => handleSliderChange('ambienceVolume', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-cyan-primary)', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Navigation & Controls Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px' }}>
          <button
            type="button"
            className="btn-title-secondary"
            style={{ width: '100%' }}
            onClick={() => {
              soundManager.playKeystroke();
              onReplayTutorial();
              onClose();
            }}
          >
            <Compass size={15} />
            <span>REPLAY ONBOARDING TUTORIAL</span>
          </button>

          <button
            type="button"
            className="btn-title-secondary"
            style={{ width: '100%' }}
            onClick={() => {
              soundManager.playKeystroke();
              onRestartChamber();
              onClose();
            }}
          >
            <RotateCcw size={15} />
            <span>RESTART CURRENT CHAMBER</span>
          </button>

          <button
            type="button"
            className="btn-title-secondary"
            style={{ width: '100%', borderColor: 'var(--color-border-accent)' }}
            onClick={() => {
              soundManager.playKeystroke();
              onReturnToTitle();
              onClose();
            }}
          >
            <Home size={15} />
            <span>RETURN TO TITLE SCREEN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
