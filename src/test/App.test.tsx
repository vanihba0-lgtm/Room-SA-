import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../app/App';
import { gameStore } from '../game/engine/store';
import * as aiClient from '../services/ai/client';

describe('ROOM S A — UI & Interactive Gameplay Integration (Milestones 1 & 2)', () => {
  beforeEach(() => {
    // Reset store before each test
    gameStore.dispatch({ type: 'RESTART_GAME' });
    vi.restoreAllMocks();
  });

  // UI rendering and object interactions
  it('renders chamber scene, interactive objects, inventory HUD, and terminal trigger', () => {
    render(<App />);

    // Brand and chamber title
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/ROOM\s+S A/i);
    expect(screen.getByText(/CHAMBER 101 \/\/ THE OBVIOUS LIE/i)).toBeInTheDocument();

    // Hotspot buttons
    expect(
      screen.getByRole('button', { name: /Machined Brass Key/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Reinforced Blast Door:/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Observation Slate:/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Anomaly Terminal:/i })
    ).toBeInTheDocument();

    // Inventory HUD
    expect(screen.getByLabelText(/Player Inventory/i)).toBeInTheDocument();
    expect(screen.getByText('0/3')).toBeInTheDocument();
  });

  it('collects the brass key when clicked and updates the inventory HUD', () => {
    render(<App />);

    const keyBtn = screen.getByRole('button', { name: /Machined Brass Key/i });
    fireEvent.click(keyBtn);

    // Inventory HUD updates
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByText('Machined Brass Key')).toBeInTheDocument();

    // Feedback toast displays collection message
    expect(screen.getByRole('status')).toHaveTextContent(/Retrieved: Machined Brass Key/i);
  });

  it('rejects door opening initially and displays deceptive rule feedback', () => {
    render(<App />);

    // Click door without key
    const doorBtn = screen.getByRole('button', { name: /Reinforced Blast Door:/i });
    fireEvent.click(doorBtn);

    expect(screen.getByRole('status')).toHaveTextContent(/A key is required/i);

    // Collect brass key
    const keyBtn = screen.getByRole('button', { name: /Machined Brass Key/i });
    fireEvent.click(keyBtn);

    // Click door with brass key while RULE_01 is active
    fireEvent.click(doorBtn);

    expect(screen.getByRole('status')).toHaveTextContent(
      /Rule #1 insists only copper keys are recognized/i
    );
  });

  // 7. Deterministic offline terminal command OVERRIDE RULE_01 BRASS
  it('7. processes deterministic offline terminal command OVERRIDE RULE_01 BRASS without network', () => {
    render(<App />);

    // Open terminal
    fireEvent.click(screen.getByRole('button', { name: /^Open Terminal$/i }));

    const cliInput = screen.getByLabelText(/Terminal Command Input/i);
    fireEvent.change(cliInput, { target: { value: 'OVERRIDE RULE_01 BRASS' } });
    fireEvent.click(screen.getByRole('button', { name: /Execute Command/i }));

    // Rule successfully rewritten
    expect(screen.getByLabelText(/Active Rule/i)).toHaveTextContent(
      /Doors yield to brass keys/i
    );
  });

  // 9. Natural language interpretation in Anomaly Terminal: Success & Preview
  it('9. interprets natural-language request, displays preview, and applies proposal to engine', async () => {
    vi.spyOn(aiClient, 'interpretRuleWithAI').mockResolvedValueOnce({
      status: 'success',
      message: 'Natural-language intent resolved: rewrite RULE_01 to accept brass keys.',
      providerName: 'mock-gemini-agent',
      proposal: {
        targetRuleId: 'RULE_01',
        proposedStatement: 'Doors yield to brass keys.',
        newPredicateKey: 'RULE_BRASS_KEY_ALLOWED',
        operation: 'OVERRIDE_PREDICATE',
        targetCondition: 'brass',
        explanation: 'Allow brass keys to disengage the hydraulic clamps.',
        confidence: 0.98,
      },
    });

    render(<App />);

    // Open terminal
    fireEvent.click(screen.getByRole('button', { name: /^Open Terminal$/i }));

    const nlInput = screen.getByLabelText(
      /Describe desired rule change in natural language/i
    );
    fireEvent.change(nlInput, {
      target: { value: 'Allow this brass key to unlock the blast door' },
    });

    const interpretBtn = screen.getByRole('button', {
      name: /Interpret natural language request/i,
    });
    fireEvent.click(interpretBtn);

    // Verify preview displays
    const previewBox = await screen.findByRole('region', {
      name: /AI Interpretation Proposal Result/i,
    });
    expect(within(previewBox).getByText('RULE_01')).toBeInTheDocument();
    expect(within(previewBox).getByText('OVERRIDE_PREDICATE')).toBeInTheDocument();
    expect(within(previewBox).getByText('98%')).toBeInTheDocument();

    // Click Authorize & Apply Proposal
    const applyBtn = screen.getByRole('button', {
      name: /Commit and apply verified rule proposal/i,
    });
    fireEvent.click(applyBtn);

    // Header rule indicator updates to rewritten rule
    expect(screen.getByLabelText(/Active Rule/i)).toHaveTextContent(
      /Doors yield to brass keys/i
    );
  });

  // 9b. Natural language interpretation rejection state
  it('displays explicit rejection state when a request is rejected by AI proxy', async () => {
    vi.spyOn(aiClient, 'interpretRuleWithAI').mockResolvedValueOnce({
      status: 'rejected',
      message: 'Rejected: Containment protocol prohibits total rule deletion.',
      providerName: 'mock-gemini-agent',
      proposal: {
        targetRuleId: 'RULE_ALL',
        proposedStatement: 'Remove every rule in the universe.',
        newPredicateKey: 'RULE_DELETE_ALL',
        operation: 'UNSUPPORTED',
        explanation: 'Universal deletion is blocked.',
        confidence: 0.1,
      },
    });

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /^Open Terminal$/i }));

    const nlInput = screen.getByLabelText(
      /Describe desired rule change in natural language/i
    );
    fireEvent.change(nlInput, {
      target: { value: 'Remove every rule in the universe' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Interpret natural language request/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/PROPOSAL REJECTED \/\/ CONSTRAINT VIOLATION/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Containment protocol prohibits total rule deletion/i)
    ).toBeInTheDocument();
    // Rule remains unchanged
    expect(screen.getByLabelText(/Active Rule/i)).toHaveTextContent(
      /Doors yield only to copper keys/i
    );
  });

  // 8. Full playthrough from start to finish
  it('8. allows full walkthrough to escape, displays victory overlay, and supports restart', () => {
    render(<App />);

    // 1. Collect Brass Key
    const keyBtn = screen.getByRole('button', { name: /Machined Brass Key/i });
    fireEvent.click(keyBtn);
    expect(screen.getByText('Machined Brass Key')).toBeInTheDocument();

    // 2. Open Terminal & Execute Override
    fireEvent.click(screen.getByRole('button', { name: /^Open Terminal$/i }));
    const overrideBtn = screen.getByRole('button', {
      name: /Execute Rule Rewrite Sequence/i,
    });
    fireEvent.click(overrideBtn);

    // Close terminal
    fireEvent.click(screen.getByRole('button', { name: /Close terminal/i }));

    // 3. Click Blast Door to escape!
    const doorBtn = screen.getByRole('button', { name: /Reinforced Blast Door:/i });
    fireEvent.click(doorBtn);

    // Victory overlay appears
    const victoryDialog = screen.getByRole('dialog', {
      name: /CHAMBER 101 CLEARED/i,
    });
    expect(victoryDialog).toBeInTheDocument();
    expect(
      within(victoryDialog).getByText(/ESCAPE PROTOCOL VERIFIED/i)
    ).toBeInTheDocument();

    // 4. Click Restart Chamber
    const restartBtn = within(victoryDialog).getByRole('button', {
      name: /Restart Chamber 101/i,
    });
    fireEvent.click(restartBtn);

    // Game returns to initial state
    expect(
      screen.queryByRole('dialog', { name: /CHAMBER 101 CLEARED/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText('0/3')).toBeInTheDocument();
    expect(screen.getByLabelText(/Active Rule/i)).toHaveTextContent(
      /Doors yield only to copper keys/i
    );
  });
});
