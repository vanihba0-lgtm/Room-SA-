import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  X,
  Send,
  Sparkles,
  Check,
  Bot,
  AlertCircle,
  Wifi,
  WifiOff,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  WorldRule,
  RuleProposal,
  AIInterpretationResponse,
} from '../../game/types';
import { CHAMBER_101_SOLUTION_PROPOSAL } from '../../game/rules/registry';
import { parseTerminalInput } from '../../game/rules/validator';
import { useGameState } from '../../hooks/useGameState';
import { interpretRuleWithAI, checkBackendHealth } from '../../services/ai/client';
import {
  playKeystrokeSound,
  playSuccessChime,
  playDoorLockedSound,
} from '../../services/audio/sound';
import './terminal.css';

interface TerminalModalProps {
  isOpen: boolean;
  rules: Readonly<Record<string, WorldRule>>;
  logs: readonly string[];
  onClose: () => void;
  onSubmitProposal: (proposal: RuleProposal) => void;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({
  isOpen,
  rules,
  logs,
  onClose,
  onSubmitProposal,
}) => {
  const { state } = useGameState();
  const [cliInput, setCliInput] = useState('');
  const [nlInput, setNlInput] = useState('');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [aiResult, setAiResult] = useState<AIInterpretationResponse | null>(null);
  const [backendStatus, setBackendStatus] = useState<{
    online: boolean;
    aiConfigured: boolean;
    provider?: string;
  } | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);
  const cliInputRef = useRef<HTMLInputElement>(null);

  const rule01 = rules['RULE_01'];
  const isRuleRewritten = rule01?.predicateKey === 'RULE_BRASS_KEY_ALLOWED';

  useEffect(() => {
    let isSubscribed = true;
    if (isOpen) {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      if (typeof logEndRef.current?.scrollIntoView === 'function') {
        logEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      checkBackendHealth().then((status) => {
        if (isSubscribed) {
          setBackendStatus(status);
        }
      });
    }
    return () => {
      isSubscribed = false;
    };
  }, [isOpen, logs]);

  // Keyboard navigation inside Terminal Modal (Escape to close, E to execute quick override)
  useEffect(() => {
    if (!isOpen) return;

    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.code === 'KeyE') {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          e.stopPropagation();
          if (!isRuleRewritten) {
            handleExecuteQuickOverride();
          } else {
            onClose();
          }
        }
      }
    };

    window.addEventListener('keydown', handleModalKeyDown);
    return () => window.removeEventListener('keydown', handleModalKeyDown);
  }, [isOpen, isRuleRewritten, onClose]);

  if (!isOpen) return null;

  // Natural language interpretation via backend AI proxy
  const handleInterpretRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nlInput.trim() || isInterpreting) return;

    playKeystrokeSound();
    setIsInterpreting(true);
    setAiResult(null);

    const currentRulesList = Object.values(rules).map((r) => ({
      id: r.id,
      statement: r.statement,
    }));

    try {
      const result = await interpretRuleWithAI({
        naturalLanguageInput: nlInput.trim(),
        currentRules: currentRulesList,
      });

      setAiResult(result);

      if (result.status === 'success') {
        playSuccessChime();
      } else {
        playDoorLockedSound();
      }
    } catch {
      setAiResult({
        status: 'offline',
        message:
          'Backend proxy request failed. You can use deterministic offline commands like OVERRIDE RULE_01 BRASS.',
        providerName: 'offline-fallback',
      });
      playDoorLockedSound();
    } finally {
      setIsInterpreting(false);
    }
  };

  // Authorize & apply proposal from AI preview
  const handleApplyProposal = () => {
    if (!aiResult?.proposal) return;
    playKeystrokeSound();
    onSubmitProposal(aiResult.proposal);
    setAiResult(null);
    setNlInput('');
  };

  // Command-line submission
  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    playKeystrokeSound();
    const parseResult = parseTerminalInput(state, cliInput);
    if (parseResult.proposal) {
      onSubmitProposal(parseResult.proposal);
    } else {
      onSubmitProposal({
        targetRuleId: 'RULE_01',
        proposedStatement: cliInput,
        newPredicateKey: 'RULE_UNKNOWN_INPUT',
        rawInputText: cliInput,
      });
    }
    setCliInput('');
  };

  const handleExecuteQuickOverride = () => {
    playKeystrokeSound();
    onSubmitProposal(CHAMBER_101_SOLUTION_PROPOSAL);
  };

  return (
    <div
      className="terminal-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terminal-title"
    >
      <div className="terminal-window">
        {/* Terminal Header */}
        <header className="terminal-window-header">
          <div className="terminal-title-group">
            <TerminalIcon size={16} className="terminal-header-icon" />
            <h2 id="terminal-title" className="terminal-title">
              CHAMBER 101 // LOGIC OVERRIDE CONSOLE
            </h2>
          </div>

          <div className="terminal-header-meta">
            {backendStatus?.online ? (
              <span className="badge-backend badge-online">
                <Wifi size={12} />
                <span>AI PROXY: {backendStatus.provider || 'ONLINE'}</span>
              </span>
            ) : (
              <span className="badge-backend badge-offline">
                <WifiOff size={12} />
                <span>AI PROXY: OFFLINE (FALLBACK ACTIVE)</span>
              </span>
            )}

            <button
              type="button"
              className="terminal-close-btn"
              onClick={onClose}
              aria-label="Close terminal"
            >
              <X size={16} />
              <span className="close-key-hint">ESC</span>
            </button>
          </div>
        </header>

        {/* CRT Display Content */}
        <div className="terminal-screen">
          <div className="crt-scanlines" aria-hidden="true" />

          {/* Active Rules Monitor Section */}
          <section className="terminal-rules-monitor" aria-label="Governing Rules Monitor">
            <div className="section-tag">
              <span className="tag-bracket">[</span>
              <span>ACTIVE WORLD RULES</span>
              <span className="tag-bracket">]</span>
            </div>

            <div className="rules-list">
              {Object.values(rules).map((rule) => {
                const isDeceptive = rule.isDeceptive;
                return (
                  <div
                    key={rule.id}
                    className={`rule-card ${isDeceptive ? 'rule-deceptive' : 'rule-stable'}`}
                  >
                    <div className="rule-header-row">
                      <span className="rule-id">{rule.id}</span>
                      <span
                        className={`rule-status-badge ${
                          isDeceptive ? 'badge-deceptive' : 'badge-stable'
                        }`}
                      >
                        {isDeceptive ? 'DECEPTIVE CONSTRAINT' : 'STABLE / REWRITTEN'}
                      </span>
                    </div>
                    <p className="rule-statement">"{rule.statement}"</p>
                    <div className="rule-meta">
                      <span>PREDICATE: {rule.predicateKey}</span>
                      {isDeceptive && (
                        <span className="rule-warning">
                          // WARNING: Contradicts physical evidence in chamber.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ======================================================== */}
          {/* Natural Language AI Assistant Input Section              */}
          {/* ======================================================== */}
          <section className="nl-assistant-section" aria-label="Natural Language Rule Interpreter">
            <div className="section-tag">
              <span className="tag-bracket">[</span>
              <Bot size={13} className="nl-tag-icon" />
              <span>NATURAL LANGUAGE REWRITE ASSISTANT</span>
              <span className="tag-bracket">]</span>
            </div>

            <form className="nl-input-form" onSubmit={handleInterpretRequest}>
              <div className="nl-input-wrapper">
                <input
                  type="text"
                  className="nl-prompt-input"
                  value={nlInput}
                  onChange={(e) => setNlInput(e.target.value)}
                  placeholder='e.g. "Allow this brass key to unlock the blast door" or "Make brass work like copper"'
                  aria-label="Describe desired rule change in natural language"
                  spellCheck={false}
                  disabled={isInterpreting}
                />
                <button
                  type="submit"
                  className="btn-interpret-action"
                  disabled={!nlInput.trim() || isInterpreting}
                  aria-label="Interpret natural language request"
                >
                  {isInterpreting ? (
                    <>
                      <Loader2 size={14} className="spin-icon" />
                      <span>INTERPRETING...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>INTERPRET REQUEST</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Proposal Preview & Validation State Display */}
            {aiResult && (
              <div
                className={`ai-proposal-preview-box preview-${aiResult.status}`}
                role="region"
                aria-label="AI Interpretation Proposal Result"
              >
                <div className="preview-header">
                  <div className="preview-status-tag">
                    {aiResult.status === 'success' ? (
                      <>
                        <CheckCircle2 size={16} className="text-emerald" />
                        <span>STRUCTURED PROPOSAL GENERATED // VALID SCHEMA</span>
                      </>
                    ) : aiResult.status === 'rejected' ? (
                      <>
                        <AlertCircle size={16} className="text-red" />
                        <span>PROPOSAL REJECTED // CONSTRAINT VIOLATION</span>
                      </>
                    ) : aiResult.status === 'offline' ? (
                      <>
                        <WifiOff size={16} className="text-amber" />
                        <span>BACKEND PROXY OFFLINE // FALLBACK READY</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-red" />
                        <span>PROVIDER ERROR</span>
                      </>
                    )}
                  </div>
                  <span className="preview-provider-name">
                    SOURCE: {aiResult.providerName || 'AI CORE'}
                  </span>
                </div>

                <p className="preview-message">{aiResult.message}</p>

                {aiResult.proposal && (
                  <div className="preview-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">TARGET RULE</span>
                      <span className="detail-value">{aiResult.proposal.targetRuleId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">OPERATION</span>
                      <span className="detail-value">{aiResult.proposal.operation || 'OVERRIDE_PREDICATE'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">PREDICATE</span>
                      <span className="detail-value">{aiResult.proposal.newPredicateKey}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">CONFIDENCE</span>
                      <span className="detail-value">
                        {Math.round((aiResult.proposal.confidence ?? 1.0) * 100)}%
                      </span>
                    </div>
                    {aiResult.proposal.explanation && (
                      <div className="detail-item detail-full-width">
                        <span className="detail-label">EXPLANATION</span>
                        <span className="detail-value">{aiResult.proposal.explanation}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons for AI Proposal */}
                {aiResult.status === 'success' && aiResult.proposal && (
                  <div className="preview-actions">
                    <button
                      type="button"
                      className="btn-commit-proposal"
                      onClick={handleApplyProposal}
                      aria-label="Commit and apply verified rule proposal"
                    >
                      <Sparkles size={14} />
                      <span>AUTHORIZE & APPLY PROPOSAL TO ENGINE</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Quick Override Action Banner */}
          <div className="quick-override-banner">
            <div className="override-info">
              <Sparkles size={16} className="override-sparkle" />
              <span>
                {isRuleRewritten
                  ? 'Rule #1 rewritten. Brass key is now recognized by the blast door.'
                  : 'Contradiction detected: Chamber contains Brass Key #101. Rewrite Rule #1 to allow brass.'}
              </span>
            </div>

            <button
              type="button"
              className={`btn-override ${isRuleRewritten ? 'btn-override-done' : ''}`}
              onClick={handleExecuteQuickOverride}
              disabled={isRuleRewritten}
              aria-label="Execute Rule Rewrite Sequence"
            >
              {isRuleRewritten ? (
                <>
                  <Check size={16} />
                  <span>OVERRIDE APPLIED // BRASS PERMITTED</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{"EXECUTE OVERRIDE: REWRITE RULE_01 -> BRASS"}</span>
                </>
              )}
            </button>
          </div>

          {/* Terminal Command Output Log */}
          <div className="terminal-log-output" tabIndex={0} aria-label="Terminal Activity Log">
            {logs.map((logLine, index) => (
              <div
                key={`log_${index}`}
                className={`log-line ${
                  logLine.includes('[ERROR]') || logLine.includes('REJECT')
                    ? 'log-error'
                    : logLine.includes('[SUCCESS]') || logLine.includes('REALITY')
                    ? 'log-success'
                    : logLine.includes('[INPUT]')
                    ? 'log-input'
                    : 'log-info'
                }`}
              >
                {logLine}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>

          {/* Command Line Input */}
          <form className="terminal-input-form" onSubmit={handleCliSubmit}>
            <span className="input-prompt">{'SYS:\\>'}</span>
            <input
              ref={cliInputRef}
              type="text"
              className="terminal-command-input"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              placeholder="Type offline command ('HELP', 'RULES', or 'OVERRIDE RULE_01 BRASS')..."
              aria-label="Terminal Command Input"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className="terminal-submit-btn"
              disabled={!cliInput.trim()}
              aria-label="Execute Command"
            >
              <Send size={14} />
              <span>EXEC</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
