// FILE: client/js/app.js — PART 10
// ══════════════════════════════════════════════════
// THE FATE OF HEINRICH — Main Application Controller
// Orchestrates all modules, manages game loop & state
// ══════════════════════════════════════════════════

const App = (() => {
  'use strict';

  // ─────────────────────────────────────────────────
  // INTERNAL STATE
  // ─────────────────────────────────────────────────
  let _state = {
    gameState: null,
    isLoaded: false,
    isProcessing: false,
    currentPhase: 'startup',
    combatState: null,
    sessionKey: null,
    settings: {},
    pendingInput: null,
    turnCount: 0,
    llmAvailable: true,
    lastSaveTime: null,
    lastPrompt: null,
    lastSystemPrompt: null,
  };

  // ─────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────

  async function init() {
    console.log('[App] Initialising THE FATE OF HEINRICH…');

    // 1. Load settings
    _state.settings = loadSettings();

    // 2. Initialise UI modules
    try { Layout.init(); } catch (e) { console.warn('[App] Layout.init failed:', e); }
    try { ProseDisplay.init('prose-container'); } catch (e) { console.warn('[App] ProseDisplay.init failed:', e); }
    try { StatsPanel.init('stats-panel'); } catch (e) { console.warn('[App] StatsPanel.init failed:', e); }
    try { InfoPanel.init('info-panel'); } catch (e) { console.warn('[App] InfoPanel.init failed:', e); }
    try { InputHandler.init('input-area'); } catch (e) { console.warn('[App] InputHandler.init failed:', e); }
    try { Modals.init(); } catch (e) { console.warn('[App] Modals.init failed:', e); }
    try { Notifications.init(); } catch (e) { console.warn('[App] Notifications.init failed:', e); }

    // 3. Register info-panel tab content providers
    registerTabContentProviders();

    // 4. Server status check
    try {
      const serverStatus = await SaveClient.getServerStatus();
      if (!serverStatus || !serverStatus.online) {
        Notifications.warning(
          '⚠️ Server offline — saves disabled. Check your connection.',
          { persistent: true }
        );
      }
    } catch (e) {
      Notifications.warning(
        '⚠️ Could not reach server — saves may be unavailable.',
        { persistent: true, duration: 10000 }
      );
    }

    // 5. Note API configuration status (used in startup screen)
    const apiConfigured = ApiClient.isConfigured();

    // 6. Bind global listeners
    bindGlobalEventListeners();

    // 7. Apply settings
    applySettings(_state.settings);

    // 8. Register input submit handler
    InputHandler.onSubmit(onInputSubmit);

    // 9. Show startup screen (also shows LLM warning if not configured)
    showStartupScreen(!apiConfigured);

    // 10. Check first-time tutorial flag (will be started after new game begins)
    if (typeof Tutorial !== 'undefined' && Tutorial.isFirstTime && Tutorial.isFirstTime()) {
      console.log('[App] First-time user detected — tutorial will start after new game.');
    }

    console.log('[App] Initialisation complete.');
  }

  // ─────────────────────────────────────────────────
  // STARTUP SCREEN
  // ─────────────────────────────────────────────────

  function showStartupScreen(showLLMWarning) {
    // Create welcome screen if it doesn't exist
    let welcome = document.getElementById('welcome-screen');
    if (!welcome) {
      welcome = document.createElement('div');
      welcome.id = 'welcome-screen';
      welcome.innerHTML = `
        <div class="welcome-backdrop"></div>
        <div class="welcome-content">
          <h1 class="welcome-title">⚔ THE FATE OF HEINRICH</h1>
          <p class="welcome-subtitle">A Medieval Chronicle — Normandy, 1403</p>
          <p class="welcome-quote">"In the year of Our Lord, fourteen hundred and three, a peasant named Heinrich stood at the edge of a field and wondered if the world could be changed by a single pair of hands."</p>
          <div class="welcome-buttons">
            <button id="btn-new-game" class="btn-primary">⚔️ Begin New Game</button>
            <button id="btn-resume-game" class="btn-secondary">📜 Resume Game</button>
            <button id="btn-configure-llm" class="btn-tertiary">⚙️ Configure AI Storyteller</button>
          </div>
          <div class="welcome-resume-quick">
            <input id="quick-session-input" type="text" placeholder="Session key (e.g. HX7K9M2P)" maxlength="8">
            <button id="btn-quick-resume">Load →</button>
          </div>
          <div id="welcome-llm-warning" style="display:none" class="warning-banner">
            ⚠️ AI Storyteller not configured. Configure it before starting.
          </div>
        </div>
      `;
      document.body.appendChild(welcome);
    }

    // Show/hide elements
    welcome.style.display = 'flex';
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) gameContainer.style.display = 'none';

    // LLM warning
    const llmWarning = document.getElementById('welcome-llm-warning');
    if (llmWarning) {
      llmWarning.style.display = (showLLMWarning || !ApiClient.isConfigured()) ? 'block' : 'none';
    }

    // Bind button events (remove old listeners first by cloning)
    _rebindBtn('btn-new-game', () => Modals.show('new-game'));
    _rebindBtn('btn-resume-game', () => showResumeDialog());
    _rebindBtn('btn-configure-llm', () => Modals.show('api-config'));
    _rebindBtn('btn-quick-resume', () => quickResume());

    const sessionInput = document.getElementById('quick-session-input');
    if (sessionInput) {
      const newInput = sessionInput.cloneNode(true);
      sessionInput.parentNode.replaceChild(newInput, sessionInput);
      newInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') quickResume();
      });
    }
  }

  function _rebindBtn(id, handler) {
    const el = document.getElementById(id);
    if (!el) return;
    const fresh = el.cloneNode(true);
    el.parentNode.replaceChild(fresh, el);
    fresh.addEventListener('click', handler);
  }

  // ─────────────────────────────────────────────────
  // RESUME DIALOG
  // ─────────────────────────────────────────────────

  function showResumeDialog() {
    Modals.show('save-load');
  }

  function quickResume() {
    const input = document.getElementById('quick-session-input');
    if (!input) return;
    const key = input.value.trim().toUpperCase();
    if (!/^[A-Z0-9]{8}$/.test(key)) {
      Notifications.error('Session key must be exactly 8 alphanumeric characters.');
      return;
    }
    resumeGame(key);
  }

  // ─────────────────────────────────────────────────
  // NEW GAME
  // ─────────────────────────────────────────────────

  async function startNewGame(options) {
    options = options || {};

    Layout.showLoadingOverlay('Creating your story…');

    try {
      // 1. Create fresh game state
      _state.gameState = GameState.createNew(options);

      // 2. Apply character options
      _state.gameState.heinrich.family_name = options.familyName || 'Renard';
      _state.gameState.heinrich.deepest_want = options.deepestWant || '';
      _state.gameState.heinrich.deepest_fear = options.deepestFear || '';

      // 3. Register with server, get session key
      const result = await SaveClient.newGame(_state.gameState);
      if (!result || !result.sessionKey) {
        throw new Error('Server did not return a session key.');
      }

      _state.sessionKey = result.sessionKey;
      _state.gameState.meta.session_key = result.sessionKey;
      Layout.setSessionDisplay(result.sessionKey);

      // 4. Initial world setup
      WorldTick.processTurn(_state.gameState);

      // 5. Generate starting NPCs
      NPCEngine.generateStartingNPCs(_state.gameState);

      // 6. Set starting location
      _state.gameState.map.current_location = 'village_renard';
      _discoverLocation('village_renard');

      Layout.hideLoadingOverlay();

      // 7. Transition to game container
      const welcome = document.getElementById('welcome-screen');
      if (welcome) welcome.style.display = 'none';
      const gameContainer = document.getElementById('game-container');
      if (gameContainer) gameContainer.style.display = 'flex';

      // 8. Show session key modal
      Modals.show('session-key-display', { key: result.sessionKey, onClose: beginGameAfterSetup });

      // 9. Update state flags
      _state.isLoaded = true;
      _state.currentPhase = 'playing';
      _state.turnCount = 0;

      // 10. Tutorial on first play (delayed so modal can show first)
      if (typeof Tutorial !== 'undefined' && Tutorial.isFirstTime && Tutorial.isFirstTime()) {
        setTimeout(() => {
          if (typeof Tutorial !== 'undefined' && Tutorial.start) Tutorial.start();
        }, 3000);
      }

    } catch (err) {
      Layout.hideLoadingOverlay();
      console.error('[App] startNewGame error:', err);
      Notifications.error('Failed to start new game: ' + (err.message || 'Unknown error'), { duration: 8000 });
    }
  }

  // ─────────────────────────────────────────────────
  // BEGIN GAME AFTER SETUP (opening prose)
  // ─────────────────────────────────────────────────

  async function beginGameAfterSetup() {
    Layout.showLLMTypingIndicator();

    try {
      const { systemPrompt, userPrompt } = PromptBuilder.buildOpeningPrompt(_state.gameState);

      const llmResult = await ApiClient.sendPrompt(systemPrompt, userPrompt, {
        maxTokens: 1500,
        temperature: 0.9,
      });

      Layout.hideLLMTypingIndicator();

      if (llmResult && llmResult.success) {
        const parsed = ResponseParser.parse(llmResult.text, { type: 'opening' });
        const formatted = ResponseParser.formatForDisplay(parsed.prose);
        ProseDisplay.appendProse(formatted, { animate: _state.settings.animateProse, type: 'opening' });

        const choices = ResponseParser.extractChoiceSuggestions(parsed.prose);
        if (choices && choices.length > 0) {
          InputHandler.setChoices(choices);
        }
      } else {
        throw new Error((llmResult && llmResult.error) || 'LLM unavailable');
      }
    } catch (err) {
      Layout.hideLLMTypingIndicator();
      const mechanical = 'The year is 1403. You are Heinrich ' + _state.gameState.heinrich.family_name +
        ', a peasant of Normandy. Your story begins now.';
      ProseDisplay.appendProse(mechanical, { animate: false, type: 'opening' });
      handleLLMFailure(err, { skillChecks: [], events: [], npcActions: [], worldChanges: [] });
    }

    // Update all panels
    StatsPanel.render(_state.gameState);
    InfoPanel.render(_state.gameState);

    InputHandler.enable();
    InputHandler.focus();
    InputHandler.setPlaceholder('What do you do?');
  }

  // ─────────────────────────────────────────────────
  // RESUME GAME
  // ─────────────────────────────────────────────────

  async function resumeGame(sessionKey) {
    Layout.showLoadingOverlay('Loading your story…');

    try {
      const result = await SaveClient.loadGame(sessionKey);

      if (!result || !result.success) {
        Layout.hideLoadingOverlay();
        Notifications.error('Could not load game: ' + (result ? (result.error || 'Unknown error') : 'No response from server'), { duration: 8000 });
        return;
      }

      _state.gameState = result.gameState;
      _state.sessionKey = sessionKey;
      Layout.setSessionDisplay(sessionKey);

      // Validate required fields
      if (!_state.gameState.meta) _state.gameState.meta = { turn: 0, total_turns_played: 0 };
      if (!_state.gameState.heinrich) throw new Error('Corrupt save: missing heinrich data.');
      if (!_state.gameState.skills) throw new Error('Corrupt save: missing skills data.');
      if (!_state.gameState.chronicle) _state.gameState.chronicle = { entries: [] };
      if (!_state.gameState.map) _state.gameState.map = { current_location: 'unknown', discovered: [] };

      // Restore UI
      StatsPanel.render(_state.gameState);
      InfoPanel.render(_state.gameState);

      _state.isLoaded = true;
      _state.currentPhase = 'playing';
      _state.turnCount = _state.gameState.meta.total_turns_played || 0;

      Layout.hideLoadingOverlay();

      // Switch to game view
      const welcome = document.getElementById('welcome-screen');
      if (welcome) welcome.style.display = 'none';
      const gameContainer = document.getElementById('game-container');
      if (gameContainer) gameContainer.style.display = 'flex';

      ProseDisplay.appendSeparator('scene_change');

      // Resume narrative via LLM
      await _sendResumePrompt();

      InputHandler.enable();
      InputHandler.focus();
      InputHandler.setPlaceholder('What do you do?');

    } catch (err) {
      Layout.hideLoadingOverlay();
      console.error('[App] resumeGame error:', err);
      Notifications.error('Resume failed: ' + (err.message || 'Unknown error'), { duration: 8000 });
    }
  }

  async function _sendResumePrompt() {
    Layout.showLLMTypingIndicator();
    try {
      const { systemPrompt, userPrompt } = PromptBuilder.buildTurnPrompt(
        _state.gameState,
        '[RESUME: The player has returned to their story.]',
        { skillChecks: [], events: [], npcActions: [], worldChanges: [], backgroundEvent: null, consequenceTriggers: [], intent: { type: 'free' } }
      );
      const llmResult = await ApiClient.sendPrompt(systemPrompt, userPrompt, { maxTokens: 1200, temperature: 0.85 });
      Layout.hideLLMTypingIndicator();
      if (llmResult && llmResult.success) {
        const parsed = ResponseParser.parse(llmResult.text, { type: 'resume' });
        ProseDisplay.appendProse(ResponseParser.formatForDisplay(parsed.prose), { animate: _state.settings.animateProse, type: 'resume' });
      } else {
        throw new Error((llmResult && llmResult.error) || 'LLM unavailable');
      }
    } catch (err) {
      Layout.hideLLMTypingIndicator();
      ProseDisplay.appendProse(
        'You return to your story. The world remembers everything you have done.',
        { animate: false, type: 'resume' }
      );
    }
  }

  // ─────────────────────────────────────────────────
  // CORE GAME LOOP — processTurn
  // ─────────────────────────────────────────────────

  async function processTurn(playerInput) {
    if (_state.isProcessing) {
      _state.pendingInput = playerInput;
      return;
    }
    _state.isProcessing = true;
    InputHandler.disable();
    if (typeof InputHandler.clearChoices === 'function') InputHandler.clearChoices();

    try {
      // 1. Handle special commands
      if (playerInput.startsWith('/') || isSpecialCommand(playerInput)) {
        const handled = await handleSpecialCommand(playerInput);
        if (handled) {
          _state.isProcessing = false;
          InputHandler.enable();
          InputHandler.focus();
          return;
        }
      }

      // 2. Detect time skip
      const timeSkipData = detectTimeSkip(playerInput);
      if (timeSkipData) {
        await processTimeSkip(timeSkipData.activity, timeSkipData.turns);
        _state.isProcessing = false;
        InputHandler.enable();
        InputHandler.focus();
        return;
      }

      // 3. Parse player intent
      const intent = parsePlayerIntent(playerInput);

      // 4. Detect invention suggestion
      const inventionCheck = detectInventionSuggestion(playerInput);
      if (intent.type === 'invention' || inventionCheck.isInvention) {
        if (inventionCheck.assessment && inventionCheck.assessment.conceived) {
          if (!_state.gameState.heinrich.inventions) {
            _state.gameState.heinrich.inventions = { conceived: [], in_progress: [], completed: [] };
          }
          _state.gameState.heinrich.inventions.conceived.push(inventionCheck.assessment.invention);
        }
      }

      // 5. Determine and run skill checks
      const checksNeeded = determineSkillChecks(intent, _state.gameState);
      const skillCheckResults = [];
      for (const check of checksNeeded) {
        const result = SkillSystem.performCheck(
          _state.gameState, check.skill, check.difficulty, check.modifiers || {}
        );
        skillCheckResults.push(result);
        SkillSystem.applyXP(_state.gameState, check.skill, result.xpGained || 0);
      }

      // 6. Run world tick
      const worldTickResults = WorldTick.processTurn(_state.gameState);

      // 7. Process action effects on game state
      const actionEffects = await processActionEffects(intent, skillCheckResults, _state.gameState);

      // 8. Check consequence triggers
      let consequenceTriggers = [];
      try {
        consequenceTriggers = ConsequenceEngine.checkTriggers(_state.gameState) || [];
      } catch (e) {
        console.warn('[App] ConsequenceEngine.checkTriggers failed:', e);
      }

      // 9. Build engine results package
      const engineResults = {
        skillChecks: skillCheckResults,
        events: [
          ...(worldTickResults.events || []),
          ...(actionEffects.events || []),
        ],
        npcActions: worldTickResults.npcActions || [],
        worldChanges: worldTickResults.changes || [],
        backgroundEvent: worldTickResults.backgroundEvent || null,
        consequenceTriggers,
        intent,
      };

      // 10. Build LLM prompt
      const { systemPrompt, userPrompt } = PromptBuilder.buildTurnPrompt(
        _state.gameState, playerInput, engineResults
      );
      _state.lastPrompt = userPrompt;
      _state.lastSystemPrompt = systemPrompt;

      // 11. Show typing indicator
      Layout.showLLMTypingIndicator();

      // 12. Send to LLM
      let proseText = null;
      try {
        const llmResult = await ApiClient.sendPrompt(systemPrompt, userPrompt, {
          maxTokens: 1200,
          temperature: 0.85,
        });
        if (llmResult && llmResult.success) {
          proseText = llmResult.text;
          _state.llmAvailable = true;
        } else {
          throw new Error((llmResult && llmResult.error) || 'LLM failed');
        }
      } catch (llmErr) {
        proseText = await handleLLMFailure(llmErr, engineResults);
      }

      Layout.hideLLMTypingIndicator();

      // 13. Parse and display prose
      const parsed = ResponseParser.parse(proseText, { type: intent.type });
      const formattedProse = ResponseParser.formatForDisplay(parsed.prose);
      ProseDisplay.appendProse(formattedProse, { animate: _state.settings.animateProse, type: intent.type });

      // 14. Display skill check callouts
      for (const check of skillCheckResults) {
        if (typeof ProseDisplay.appendSkillCheck === 'function') {
          ProseDisplay.appendSkillCheck(check);
        }
      }

      // 15. Show world event notification if significant
      if (engineResults.backgroundEvent) {
        if (typeof ProseDisplay.appendWorldEvent === 'function') {
          ProseDisplay.appendWorldEvent(engineResults.backgroundEvent.description);
        }
      }

      // 16. Update all UI panels
      StatsPanel.render(_state.gameState);
      InfoPanel.render(_state.gameState);

      // 17. Extract and set choice suggestions
      const choices = ResponseParser.extractChoiceSuggestions(parsed.prose);
      if (choices && choices.length > 0) {
        InputHandler.setChoices(choices);
      }

      // 18. Fire notifications
      fireNotificationsForResults(skillCheckResults, worldTickResults, consequenceTriggers);

      // 19. Auto-save
      if (_state.settings.autoSave) {
        try {
          SaveClient.autoSave(_state.gameState);
        } catch (e) {
          console.warn('[App] autoSave failed:', e);
        }
      }

      // 20. Update chronicle
      updateChronicle(playerInput, parsed.prose, engineResults);

      // 21. Advance turns
      _state.turnCount++;
      _state.gameState.meta.turn = (_state.gameState.meta.turn || 0) + 1;
      _state.gameState.meta.total_turns_played = (_state.gameState.meta.total_turns_played || 0) + 1;

      // 22. Scroll prose to bottom
      Layout.scrollProseToBottom();

      // 23. Add to input history
      if (typeof InputHandler.addToHistory === 'function') {
        InputHandler.addToHistory(playerInput);
      }

      // 24. Check for death
      if (
        _state.gameState.heinrich &&
        _state.gameState.heinrich.health &&
        _state.gameState.heinrich.health.status === 'dead'
      ) {
        await handleDeath('unknown');
        return;
      }

      // 25. Set input mode based on context
      updateInputMode();

    } catch (err) {
      console.error('[App] processTurn error:', err);
      Notifications.error('Something went wrong. Your game is safe. Try again.', { duration: 8000 });
    } finally {
      _state.isProcessing = false;
      InputHandler.enable();
      InputHandler.focus();
      // Process pending input if any
      if (_state.pendingInput) {
        const pending = _state.pendingInput;
        _state.pendingInput = null;
        setTimeout(() => processTurn(pending), 100);
      }
    }
  }

  // ─────────────────────────────────────────────────
  // PROCESS ACTION EFFECTS
  // ─────────────────────────────────────────────────

  async function processActionEffects(intent, skillCheckResults, gameState) {
    const events = [];
    const changes = [];

    try {
      const passed = skillCheckResults.length === 0 ||
        skillCheckResults.some(r => r.tier !== 'disaster' && r.tier !== 'failure');

      switch (intent.type) {

        case 'move': {
          if (passed && intent.target) {
            const prevLocation = gameState.map.current_location;
            gameState.map.current_location = intent.target;
            _discoverLocation(intent.target);
            events.push({
              type: 'location_change',
              description: `Moved from ${prevLocation} to ${intent.target}.`,
            });
            changes.push({ type: 'location', from: prevLocation, to: intent.target });
            // Trigger location events
            const locEvents = _getLocationEvents(intent.target, gameState);
            events.push(...locEvents);
          }
          break;
        }

        case 'combat': {
          if (_state.currentPhase !== 'combat') {
            _state.currentPhase = 'combat';
            _state.combatState = CombatEngine.initCombat(gameState, intent.target);
            events.push({ type: 'combat_start', description: 'Combat has begun.' });
            updateInputMode();
          }
          break;
        }

        case 'social': {
          try {
            const socialResult = RelationshipEngine.processInteraction(gameState, intent);
            if (socialResult) {
              if (socialResult.events) events.push(...socialResult.events);
              if (socialResult.changes) changes.push(...socialResult.changes);
            }
          } catch (e) { console.warn('[App] RelationshipEngine.processInteraction failed:', e); }
          break;
        }

        case 'craft': {
          try {
            const craftResult = CraftingEngine.processCraftingAction(gameState, intent, skillCheckResults);
            if (craftResult) {
              if (craftResult.events) events.push(...craftResult.events);
              if (craftResult.changes) changes.push(...craftResult.changes);
            }
          } catch (e) { console.warn('[App] CraftingEngine.processCraftingAction failed:', e); }
          break;
        }

        case 'trade': {
          try {
            const tradeResult = EconomyEngine.processTradeAction(gameState, intent);
            if (tradeResult) {
              if (tradeResult.events) events.push(...tradeResult.events);
              if (tradeResult.changes) changes.push(...tradeResult.changes);
            }
          } catch (e) { console.warn('[App] EconomyEngine.processTradeAction failed:', e); }
          break;
        }

        case 'rest': {
          try {
            const restResult = HealthEngine.processRest(gameState, intent);
            if (restResult) {
              if (restResult.events) events.push(...restResult.events);
              if (restResult.changes) changes.push(...restResult.changes);
            }
          } catch (e) { console.warn('[App] HealthEngine.processRest failed:', e); }
          break;
        }

        case 'stealth': {
          try {
            const stealthResult = SystemsEngine.espionage.processStealthAction(gameState, intent, skillCheckResults);
            if (stealthResult) {
              if (stealthResult.events) events.push(...stealthResult.events);
              if (stealthResult.changes) changes.push(...stealthResult.changes);
            }
          } catch (e) { console.warn('[App] SystemsEngine.espionage.processStealthAction failed:', e); }
          break;
        }

        case 'prayer': {
          try {
            const prayerResult = SystemsEngine.religion.processPrayer(gameState, intent);
            if (prayerResult) {
              if (prayerResult.events) events.push(...prayerResult.events);
              if (prayerResult.changes) changes.push(...prayerResult.changes);
            }
          } catch (e) { console.warn('[App] SystemsEngine.religion.processPrayer failed:', e); }
          break;
        }

        case 'invention': {
          // Advance research on in-progress invention
          if (gameState.heinrich.inventions && gameState.heinrich.inventions.in_progress &&
              gameState.heinrich.inventions.in_progress.length > 0) {
            const activeInvention = gameState.heinrich.inventions.in_progress[0];
            activeInvention.research_progress = (activeInvention.research_progress || 0) + (passed ? 10 : 3);
            if (activeInvention.research_progress >= 100) {
              const completed = gameState.heinrich.inventions.in_progress.shift();
              if (!gameState.heinrich.inventions.completed) gameState.heinrich.inventions.completed = [];
              gameState.heinrich.inventions.completed.push({ ...completed, completed_turn: gameState.meta.turn });
              events.push({ type: 'invention_completed', description: `${completed.name} has been completed!` });
            } else {
              events.push({ type: 'invention_progress', description: `Research on invention advanced.` });
            }
          }
          break;
        }

        case 'free':
        default: {
          // General action — apply any relevant effects based on keywords
          if (passed && skillCheckResults.length > 0) {
            events.push({ type: 'action_success', description: 'The action succeeded.' });
          } else if (skillCheckResults.length > 0) {
            events.push({ type: 'action_failure', description: 'The action did not go as planned.' });
          }
          break;
        }
      }
    } catch (err) {
      console.error('[App] processActionEffects error:', err);
    }

    return { events, changes };
  }

  // ─────────────────────────────────────────────────
  // TIME SKIP
  // ─────────────────────────────────────────────────

  function detectTimeSkip(input) {
    const lower = input.toLowerCase().trim();

    // "I spend X days doing Y" / "spend the next X days Y"
    let m = lower.match(/(?:i\s+)?spend(?:s)?\s+(?:the\s+)?(?:next\s+)?(\d+|one|two|three|four|five|six|seven|ten|fourteen|twenty|thirty)\s+days?\s+(?:doing\s+|working\s+on\s+|(?:just\s+))?(.+)?/);
    if (m) return { turns: _parseTurnCount(m[1]), activity: (m[2] || '').trim() || null };

    // "skip ahead X days"
    m = lower.match(/skip\s+(?:ahead\s+)?(\d+|one|two|three|seven|fourteen|thirty)\s+days?/);
    if (m) return { turns: _parseTurnCount(m[1]), activity: null };

    // "X days pass while I Y"
    m = lower.match(/(\d+|one|two|three|seven)\s+days?\s+pass(?:es)?\s+(?:while\s+(?:i\s+))?(.+)?/);
    if (m) return { turns: _parseTurnCount(m[1]), activity: (m[2] || '').trim() || null };

    // "rest for a week" / "wait a week"
    if (/(?:rest|wait|sleep|pass)\s+(?:for\s+)?(?:a\s+)?week/.test(lower)) {
      return { turns: 7, activity: 'resting' };
    }

    // "spend the winter doing X"
    m = lower.match(/spend\s+the\s+(?:whole\s+)?winter\s+(?:doing\s+)?(.+)?/);
    if (m) return { turns: 90, activity: (m[1] || 'waiting out the winter').trim() };

    // "spend the summer / autumn / spring doing X"
    m = lower.match(/spend\s+the\s+(?:whole\s+)?(summer|autumn|fall|spring)\s+(?:doing\s+)?(.+)?/);
    if (m) return { turns: 90, activity: (m[2] || `${m[1]}`).trim() };

    // "spend a month doing X"
    m = lower.match(/spend\s+(?:a|the)\s+month\s+(?:doing\s+)?(.+)?/);
    if (m) return { turns: 30, activity: (m[1] || '').trim() || null };

    return null;
  }

  function _parseTurnCount(str) {
    const wordMap = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
      ten: 10, fourteen: 14, twenty: 20, thirty: 30,
    };
    const n = parseInt(str, 10);
    if (!isNaN(n)) return n;
    return wordMap[str.toLowerCase()] || 1;
  }

  async function processTimeSkip(activity, turns) {
    if (typeof ProseDisplay.appendSeparator === 'function') {
      ProseDisplay.appendSeparator('time_skip');
    }

    const cappedTurns = Math.min(turns, 365);
    Layout.showLoadingOverlay(`Processing ${cappedTurns} days…`);

    const skipSummary = {
      turns: cappedTurns,
      activity: activity || 'waiting',
      significantEvents: [],
      skillGains: [],
      relationshipChanges: [],
      worldChanges: [],
    };

    try {
      for (let i = 0; i < cappedTurns; i++) {
        const tickResult = WorldTick.processTurn(_state.gameState);

        // Collect significant events
        if (tickResult.events) {
          for (const ev of tickResult.events) {
            if (ev.significant) {
              skipSummary.significantEvents.push(ev);
            }
          }
        }
        if (tickResult.backgroundEvent) {
          skipSummary.significantEvents.push(tickResult.backgroundEvent);
        }
        if (tickResult.changes) {
          skipSummary.worldChanges.push(...tickResult.changes);
        }

        // Periodic skill checks (every 3 turns)
        if (i % 3 === 0) {
          const activitySkill = _activityToSkill(activity);
          if (activitySkill) {
            const result = SkillSystem.performCheck(_state.gameState, activitySkill, 'routine', {});
            SkillSystem.applyXP(_state.gameState, activitySkill, result.xpGained || 0);
            if (result.levelUp) {
              skipSummary.skillGains.push({ skill: activitySkill, level: result.newLevel });
            }
          }
        }

        // Check consequence triggers
        try {
          const triggers = ConsequenceEngine.checkTriggers(_state.gameState) || [];
          for (const t of triggers) {
            skipSummary.significantEvents.push({ description: t.description, significant: true });
          }
        } catch (e) { /* silent */ }

        // Advance turns in meta
        _state.gameState.meta.turn = (_state.gameState.meta.turn || 0) + 1;
        _state.gameState.meta.total_turns_played = (_state.gameState.meta.total_turns_played || 0) + 1;
      }
    } catch (e) {
      console.warn('[App] processTimeSkip simulation error:', e);
    }

    Layout.hideLoadingOverlay();

    // Deduplicate world changes
    skipSummary.worldChanges = skipSummary.worldChanges.slice(0, 20);
    skipSummary.significantEvents = skipSummary.significantEvents.slice(0, 10);

    // Build and send time skip prompt
    Layout.showLLMTypingIndicator();
    try {
      const { systemPrompt, userPrompt } = PromptBuilder.buildTimeSkipPrompt(_state.gameState, skipSummary);
      const llmResult = await ApiClient.sendPrompt(systemPrompt, userPrompt, { maxTokens: 1400, temperature: 0.88 });
      Layout.hideLLMTypingIndicator();

      if (llmResult && llmResult.success) {
        const parsed = ResponseParser.parse(llmResult.text, { type: 'time_skip' });
        ProseDisplay.appendProse(ResponseParser.formatForDisplay(parsed.prose), {
          animate: _state.settings.animateProse, type: 'time_skip',
        });
      } else {
        throw new Error('LLM unavailable');
      }
    } catch (err) {
      Layout.hideLLMTypingIndicator();
      const summary = `${cappedTurns} days pass. ` +
        (skipSummary.significantEvents.length > 0
          ? skipSummary.significantEvents.map(e => e.description).join(' ')
          : 'The world continues its course.');
      ProseDisplay.appendProse(summary, { animate: false, type: 'time_skip' });
    }

    // Update UI
    StatsPanel.render(_state.gameState);
    InfoPanel.render(_state.gameState);
    Layout.scrollProseToBottom();
    _state.turnCount += cappedTurns;
  }

  function _activityToSkill(activity) {
    if (!activity) return null;
    const a = activity.toLowerCase();
    if (/train|fight|sword|combat|drill/.test(a)) return 'sword';
    if (/farm|harvest|field/.test(a)) return 'farming';
    if (/pray|church|worship/.test(a)) return 'theology';
    if (/read|study|learn|book/.test(a)) return 'literacy';
    if (/forge|smith|craft/.test(a)) return 'blacksmithing';
    if (/hunt/.test(a)) return 'hunting';
    if (/trade|sell|market/.test(a)) return 'haggle';
    if (/ride|horse/.test(a)) return 'riding';
    if (/sneak|spy|shadow/.test(a)) return 'stealth';
    if (/brew|cook/.test(a)) return 'cooking';
    return null;
  }

  // ─────────────────────────────────────────────────
  // COMBAT
  // ─────────────────────────────────────────────────

  async function processCombatTurn(action) {
    try {
      const roundResult = CombatEngine.processAction(
        _state.gameState, _state.combatState, action
      );

      if (roundResult.combatEnded) {
        await finalizeCombat(roundResult);
        return;
      }

      // Build and send combat narration
      const { systemPrompt, userPrompt } = PromptBuilder.buildCombatRoundPrompt(
        _state.gameState, _state.combatState, roundResult
      );

      Layout.showLLMTypingIndicator();
      try {
        const llmResult = await ApiClient.sendPrompt(systemPrompt, userPrompt, {
          maxTokens: 600, temperature: 0.9,
        });
        Layout.hideLLMTypingIndicator();

        if (llmResult && llmResult.success) {
          const parsed = ResponseParser.parse(llmResult.text, { type: 'combat' });
          ProseDisplay.appendProse(ResponseParser.formatForDisplay(parsed.prose), {
            animate: _state.settings.animateProse, type: 'combat',
          });
        } else {
          throw new Error('LLM unavailable');
        }
      } catch (e) {
        Layout.hideLLMTypingIndicator();
        ProseDisplay.appendProse(
          `[Combat] ${roundResult.description || 'The fight continues.'}`,
          { animate: false, type: 'combat' }
        );
      }

      StatsPanel.render(_state.gameState);
      Layout.scrollProseToBottom();

    } catch (err) {
      console.error('[App] processCombatTurn error:', err);
      Notifications.error('Combat error. Try again.');
    }
  }

  async function finalizeCombat(result) {
    _state.currentPhase = 'playing';
    const prevCombatState = _state.combatState;
    _state.combatState = null;

    // Apply aftermath
    if (result.loot && result.loot.length > 0) {
      for (const item of result.loot) {
        if (_state.gameState.inventory) {
          _state.gameState.inventory.push(item);
        }
      }
      Notifications.info(`Gained: ${result.loot.map(i => i.name || i).join(', ')}`);
    }
    if (result.wounds) {
      try { HealthEngine.applyWounds(_state.gameState, result.wounds); } catch (e) { /* silent */ }
    }
    if (result.reputationChange) {
      try {
        ReputationEngine.applyChange(_state.gameState, result.reputationChange.amount, result.reputationChange.reason);
      } catch (e) { /* silent */ }
    }

    const outcomeMsg = result.victory
      ? '⚔️ Victory! The battle is won.'
      : result.fled ? '🏃 You escaped from combat.'
      : '💀 You have been defeated.';
    Notifications.info(outcomeMsg, { duration: 5000 });

    if (result.victory) {
      Notifications.success('Combat won!');
    }

    if (prevCombatState && prevCombatState.enemy && !result.victory && !result.fled) {
      _state.gameState.heinrich.health.status = 'dead';
      await handleDeath('combat');
      return;
    }

    updateInputMode();
    StatsPanel.render(_state.gameState);
    InfoPanel.render(_state.gameState);
  }

  // ─────────────────────────────────────────────────
  // SPECIAL COMMANDS
  // ─────────────────────────────────────────────────

  function isSpecialCommand(input) {
    const lower = input.toLowerCase().trim();
    return lower.startsWith('/') ||
      lower === 'inventory' ||
      lower === 'map' ||
      lower === 'save game' ||
      lower === 'help' ||
      lower === 'settings' ||
      lower === 'rest' ||
      lower === 'sleep' ||
      lower === 'wait';
  }

  async function handleSpecialCommand(input) {
    const cmd = input.toLowerCase().trim();

    if (cmd === '/save' || cmd === 'save game') {
      await saveGame();
      return true;
    }
    if (cmd === '/export') {
      await SaveClient.exportGame(_state.sessionKey);
      return true;
    }
    if (cmd === '/map' || cmd === 'map') {
      InfoPanel.setActiveTab('map');
      return true;
    }
    if (cmd === '/inventory' || cmd === '/inv' || cmd === 'inventory') {
      InfoPanel.setActiveTab('inventory');
      return true;
    }
    if (cmd === '/skills') {
      InfoPanel.setActiveTab('skills');
      return true;
    }
    if (cmd === '/help') {
      Modals.show('help');
      return true;
    }
    if (cmd === '/settings') {
      Modals.show('settings');
      return true;
    }
    if (cmd === '/session') {
      Modals.show('session-key-display', { key: _state.sessionKey });
      return true;
    }
    if (cmd === '/chronicle') {
      InfoPanel.setActiveTab('chronicle');
      return true;
    }
    if (cmd === '/memory') {
      InfoPanel.setActiveTab('memory');
      return true;
    }
    if (cmd === '/council') {
      InfoPanel.setActiveTab('council');
      return true;
    }
    if (cmd === '/debug') {
      console.log(getDebugInfo());
      Notifications.info('Debug info logged to console.');
      return true;
    }

    // Rest / Sleep / Wait — process as a 1-turn rest
    if (cmd === 'rest' || cmd === 'sleep' || cmd === 'wait') {
      try {
        HealthEngine.processRest(_state.gameState, { type: 'rest', rawInput: cmd, target: null, modifiers: [] });
      } catch (e) { /* silent */ }
      // Still goes to processTurn to generate narration
      return false;
    }

    return false;
  }

  // ─────────────────────────────────────────────────
  // INVENTION DETECTION
  // ─────────────────────────────────────────────────

  function detectInventionSuggestion(input) {
    const lower = input.toLowerCase();
    const inventionKeywords = [
      'invent', 'create a', 'build a', 'make a', 'design a',
      'figure out how to', 'devise', 'construct a', 'engineer a', 'discover how',
    ];
    const isInvention = inventionKeywords.some(kw => lower.includes(kw));
    if (!isInvention) return { isInvention: false, assessment: null };

    let assessment = null;
    try {
      if (
        typeof SystemsEngine !== 'undefined' &&
        SystemsEngine.invention &&
        typeof SystemsEngine.invention.assessIdea === 'function'
      ) {
        assessment = SystemsEngine.invention.assessIdea(_state.gameState, input);
      } else {
        // Fallback simple assessment
        assessment = {
          conceived: true,
          invention: {
            id: 'inv_' + Date.now(),
            name: input.substring(0, 60),
            description: input,
            research_progress: 0,
            era_appropriate: true,
          },
          viability: 'possible',
        };
      }
    } catch (e) {
      console.warn('[App] invention.assessIdea failed:', e);
    }

    return { isInvention: true, assessment };
  }

  // ─────────────────────────────────────────────────
  // PARSE PLAYER INTENT
  // ─────────────────────────────────────────────────

  function parsePlayerIntent(input) {
    const lower = input.toLowerCase();

    // Extract target — naive extraction of what follows key verbs
    let target = null;
    let type = 'free';

    // Move
    const movePatterns = ['go to', 'travel to', 'walk to', 'ride to', 'head to', 'move to', 'leave for'];
    for (const p of movePatterns) {
      if (lower.includes(p)) {
        target = input.substring(lower.indexOf(p) + p.length).trim().split(/[,\.!?]/)[0].trim();
        target = target.replace(/^(the|a|an)\s+/i, '').trim().toLowerCase().replace(/\s+/g, '_');
        type = 'move';
        break;
      }
    }

    // Invention (check before craft to avoid conflicts)
    if (type === 'free') {
      const invPatterns = ['invent', 'devise a', 'figure out how to make', 'engineer a'];
      for (const p of invPatterns) {
        if (lower.includes(p)) { type = 'invention'; break; }
      }
    }

    // Combat
    if (type === 'free') {
      const combatPatterns = ['attack', 'fight', 'strike', 'stab', 'shoot', 'charge at', 'draw weapon', 'swing at', 'slash', 'punch', 'kick'];
      for (const p of combatPatterns) {
        if (lower.includes(p)) {
          type = 'combat';
          const afterVerb = lower.indexOf(p) + p.length;
          target = input.substring(afterVerb).trim().split(/[,\.!?]/)[0].trim() || null;
          break;
        }
      }
    }

    // Social
    if (type === 'free') {
      const socialPatterns = ['talk to', 'speak with', 'speak to', 'ask ', 'tell ', 'convince', 'threaten', 'flatter', 'bribe', 'persuade', 'negotiate with', 'approach'];
      for (const p of socialPatterns) {
        if (lower.includes(p)) {
          type = 'social';
          const afterVerb = lower.indexOf(p) + p.length;
          target = input.substring(afterVerb).trim().split(/[,\.!?]/)[0].trim() || null;
          break;
        }
      }
    }

    // Craft (non-invention)
    if (type === 'free') {
      const craftPatterns = ['craft ', 'forge ', 'build ', 'repair ', 'make a', 'make the', 'construct '];
      for (const p of craftPatterns) {
        if (lower.includes(p)) {
          type = 'craft';
          const afterVerb = lower.indexOf(p) + p.length;
          target = input.substring(afterVerb).trim().split(/[,\.!?]/)[0].trim() || null;
          break;
        }
      }
    }

    // Trade
    if (type === 'free') {
      const tradePatterns = ['buy ', 'sell ', 'trade ', 'barter', 'purchase', 'negotiate price'];
      for (const p of tradePatterns) {
        if (lower.includes(p)) {
          type = 'trade';
          break;
        }
      }
    }

    // Rest
    if (type === 'free') {
      const restPatterns = ['rest', 'sleep', 'wait', 'camp', 'spend the night', 'make camp', 'lie down'];
      for (const p of restPatterns) {
        if (lower.includes(p)) { type = 'rest'; break; }
      }
    }

    // Stealth
    if (type === 'free') {
      const stealthPatterns = ['sneak', 'hide', 'shadow ', 'follow secretly', 'break in', 'pick the lock', 'pick the door', 'slip past', 'creep'];
      for (const p of stealthPatterns) {
        if (lower.includes(p)) { type = 'stealth'; break; }
      }
    }

    // Prayer
    if (type === 'free') {
      const prayerPatterns = ['pray', 'confess', 'attend mass', 'speak with priest', 'speak with the priest', 'go to church', 'visit the chapel'];
      for (const p of prayerPatterns) {
        if (lower.includes(p)) { type = 'prayer'; break; }
      }
    }

    // Investigate
    if (type === 'free') {
      const investigatePatterns = ['investigate', 'examine', 'search', 'look for', 'explore', 'inspect', 'study ', 'analyse', 'analyze'];
      for (const p of investigatePatterns) {
        if (lower.includes(p)) { type = 'investigate'; break; }
      }
    }

    return {
      type,
      rawInput: input,
      target,
      modifiers: [],
    };
  }

  // ─────────────────────────────────────────────────
  // DETERMINE SKILL CHECKS
  // ─────────────────────────────────────────────────

  function determineSkillChecks(intent, gameState) {
    const checks = [];
    const lower = intent.rawInput.toLowerCase();

    switch (intent.type) {

      case 'move': {
        // Only check if there's likely an obstacle/hazard
        const hazardWords = ['forest', 'mountain', 'river', 'marsh', 'dangerous', 'treacherous', 'night', 'dark'];
        if (hazardWords.some(w => lower.includes(w))) {
          checks.push({ skill: 'survival', difficulty: 'medium', modifiers: {} });
        }
        break;
      }

      case 'combat': {
        // Determine weapon skill
        const weapon = _getEquippedWeapon(gameState);
        const skill = weapon ? _weaponToSkill(weapon) : 'brawling';
        checks.push({ skill, difficulty: 'medium', modifiers: {} });
        break;
      }

      case 'social': {
        if (/threaten|intimidate|bully/.test(lower)) {
          checks.push({ skill: 'intimidation', difficulty: 'medium', modifiers: {} });
        } else if (/seduce|charm|flirt/.test(lower)) {
          checks.push({ skill: 'seduction', difficulty: 'medium', modifiers: {} });
        } else if (/convince|persuade|argue|plead/.test(lower)) {
          checks.push({ skill: 'speech', difficulty: 'medium', modifiers: {} });
        } else if (/bribe/.test(lower)) {
          checks.push({ skill: 'haggle', difficulty: 'medium', modifiers: {} });
        } else {
          checks.push({ skill: 'speech', difficulty: 'routine', modifiers: {} });
        }
        break;
      }

      case 'craft': {
        const craftSkill = _determineCraftSkill(lower);
        checks.push({ skill: craftSkill, difficulty: 'medium', modifiers: {} });
        break;
      }

      case 'trade': {
        checks.push({ skill: 'haggle', difficulty: 'medium', modifiers: {} });
        break;
      }

      case 'stealth': {
        checks.push({ skill: 'stealth', difficulty: 'medium', modifiers: {} });
        if (/pick the lock|lockpick/.test(lower)) {
          checks.push({ skill: 'lockpicking', difficulty: 'high', modifiers: {} });
        }
        break;
      }

      case 'prayer': {
        checks.push({ skill: 'theology', difficulty: 'routine', modifiers: {} });
        break;
      }

      case 'investigate': {
        const obsSkill = _getSkillForObservation(gameState);
        checks.push({ skill: obsSkill, difficulty: 'medium', modifiers: {} });
        break;
      }

      case 'invention': {
        checks.push({ skill: 'engineering', difficulty: 'high', modifiers: {} });
        break;
      }

      case 'rest': {
        // No skill check for resting
        break;
      }

      case 'free':
      default: {
        // Attempt to infer from keywords
        const freeSkill = _inferSkillFromInput(lower);
        if (freeSkill) {
          checks.push({ skill: freeSkill, difficulty: 'routine', modifiers: {} });
        }
        break;
      }
    }

    return checks;
  }

  function _getEquippedWeapon(gameState) {
    if (!gameState.inventory) return null;
    const equipped = gameState.inventory.find(item =>
      item.equipped && (item.type === 'weapon' || item.category === 'weapon')
    );
    return equipped ? equipped.name || equipped.id : null;
  }

  function _weaponToSkill(weaponName) {
    const wl = weaponName.toLowerCase();
    if (/sword|blade|saber/.test(wl)) return 'sword';
    if (/axe|hatchet/.test(wl)) return 'axe';
    if (/bow|arrow/.test(wl)) return 'archery';
    if (/spear|lance|pike/.test(wl)) return 'polearm';
    if (/dagger|knife|dirk/.test(wl)) return 'dagger';
    if (/staff|club|mace/.test(wl)) return 'bludgeon';
    return 'brawling';
  }

  function _determineCraftSkill(lower) {
    if (/sword|blade|knife|armor|mail|shield|metal/.test(lower)) return 'blacksmithing';
    if (/bread|cook|stew|meal|food|ale|brew/.test(lower)) return 'cooking';
    if (/shoe|boot|leather|saddle/.test(lower)) return 'leatherworking';
    if (/cloth|shirt|dress|robe|garment/.test(lower)) return 'tailoring';
    if (/bow|arrow|shaft|fletch/.test(lower)) return 'bowmaking';
    if (/house|barn|wall|fence|carpen/.test(lower)) return 'carpentry';
    if (/pot|jug|clay|ceramic/.test(lower)) return 'pottery';
    return 'crafting';
  }

  function _getSkillForObservation(gameState) {
    // Use whatever observation/perception skill is available
    if (gameState.skills) {
      if (gameState.skills.observation !== undefined) return 'observation';
      if (gameState.skills.perception !== undefined) return 'perception';
      if (gameState.skills.read_people !== undefined) return 'read_people';
    }
    return 'agility'; // fallback proxy
  }

  function _inferSkillFromInput(lower) {
    if (/climb/.test(lower)) return 'athletics';
    if (/swim/.test(lower)) return 'swimming';
    if (/run|sprint|chase/.test(lower)) return 'athletics';
    if (/lie|deceive|bluff|pretend/.test(lower)) return 'deception';
    if (/read|write/.test(lower)) return 'literacy';
    if (/dance/.test(lower)) return 'performance';
    if (/sing|perform/.test(lower)) return 'performance';
    if (/animal|horse|tame|calm|handle/.test(lower)) return 'animal_handling';
    if (/heal|bandage|medicine/.test(lower)) return 'medicine';
    return null;
  }

  // ─────────────────────────────────────────────────
  // UPDATE INPUT MODE
  // ─────────────────────────────────────────────────

  function updateInputMode() {
    if (!_state.isLoaded) return;

    try {
      if (_state.currentPhase === 'combat') {
        InputHandler.setInputMode('combat');
      } else if (_state.gameState && _state.gameState.active_dialogue_npc) {
        InputHandler.setInputMode('dialogue');
      } else {
        InputHandler.setInputMode('normal');
      }
    } catch (e) {
      console.warn('[App] updateInputMode failed:', e);
    }
  }

  // ─────────────────────────────────────────────────
  // NOTIFICATIONS FOR RESULTS
  // ─────────────────────────────────────────────────

  function fireNotificationsForResults(skillCheckResults, worldTickResults, consequenceTriggers) {
    // Skill checks
    for (const check of skillCheckResults) {
      if (check.tier === 'critical') {
        Notifications.success('⚡ Critical Success! — ' + check.skill, { duration: 4000 });
      } else if (check.tier === 'disaster') {
        Notifications.error('💥 Disaster! — ' + check.skill, { duration: 4000 });
      }

      // Skill level ups
      if (check.levelUp) {
        if (typeof Notifications.skillUp === 'function') {
          Notifications.skillUp(check.skill, check.newLevel);
        } else {
          Notifications.success(
            `📈 ${_capitalise(check.skill)} improved to level ${check.newLevel}!`,
            { duration: 5000 }
          );
        }
      }
    }

    // World events
    if (worldTickResults && worldTickResults.events) {
      for (const ev of worldTickResults.events) {
        if (ev.significant && ev.description) {
          if (typeof Notifications.worldEvent === 'function') {
            Notifications.worldEvent(ev.description);
          } else {
            Notifications.info('🌍 ' + ev.description, { duration: 5000 });
          }
        }
      }
    }

    // Consequence triggers
    if (consequenceTriggers) {
      for (const ct of consequenceTriggers) {
        if (ct.title || ct.description) {
          if (typeof Notifications.consequence === 'function') {
            Notifications.consequence(ct.title || ct.description, ct.severity || 'minor');
          } else {
            Notifications.info('⚖️ ' + (ct.title || ct.description), { duration: 6000 });
          }
        }
      }
    }

    // Achievements
    if (worldTickResults && worldTickResults.achievements) {
      for (const ach of worldTickResults.achievements) {
        if (typeof Notifications.achievement === 'function') {
          Notifications.achievement(ach);
        } else {
          Notifications.success('🏆 Achievement: ' + (ach.name || ach), { duration: 6000 });
        }
      }
    }
  }

  // ─────────────────────────────────────────────────
  // CHRONICLE
  // ─────────────────────────────────────────────────

  function updateChronicle(playerInput, prose, engineResults) {
    if (!_state.gameState.chronicle) {
      _state.gameState.chronicle = { entries: [] };
    }

    const entry = {
      id: `entry_${_state.gameState.meta.turn}`,
      turn: _state.gameState.meta.turn || 0,
      date: _state.gameState.calendar ? { ..._state.gameState.calendar.date } : {},
      type: engineResults.intent ? engineResults.intent.type : 'free',
      playerAction: playerInput.substring(0, 100),
      summary: generateChronicaleSummary(playerInput, engineResults),
      location: _state.gameState.map ? _state.gameState.map.current_location : 'unknown',
    };

    _state.gameState.chronicle.entries.push(entry);

    // Keep only last 500 entries
    if (_state.gameState.chronicle.entries.length > 500) {
      _state.gameState.chronicle.entries = _state.gameState.chronicle.entries.slice(-500);
    }
  }

  function generateChronicaleSummary(playerInput, engineResults) {
    const intent = engineResults.intent || { type: 'free' };
    const checks = engineResults.skillChecks || [];
    const events = engineResults.events || [];

    let summary = '';

    // Describe the action
    const shortInput = playerInput.replace(/^(i |you )/i, '').substring(0, 60);
    summary += _capitalise(shortInput);
    if (!summary.endsWith('.')) summary += '.';

    // Add skill check outcome
    if (checks.length > 0) {
      const mainCheck = checks[0];
      if (mainCheck.tier === 'critical') {
        summary += ' Succeeded brilliantly.';
      } else if (mainCheck.tier === 'success' || mainCheck.tier === 'strong') {
        summary += ' Succeeded.';
      } else if (mainCheck.tier === 'partial') {
        summary += ' Partially succeeded.';
      } else if (mainCheck.tier === 'failure') {
        summary += ' Failed.';
      } else if (mainCheck.tier === 'disaster') {
        summary += ' Went disastrously wrong.';
      }
    }

    // Add notable event
    const notableEvent = events.find(e => e.significant || e.type === 'location_change');
    if (notableEvent) {
      summary += ' ' + (notableEvent.description || '').substring(0, 60);
    }

    // Trim to ~40 words max
    const words = summary.split(' ');
    if (words.length > 40) {
      summary = words.slice(0, 40).join(' ') + '…';
    }

    return summary.trim();
  }

  // ─────────────────────────────────────────────────
  // MECHANICAL SUMMARY (LLM fallback)
  // ─────────────────────────────────────────────────

  function generateMechanicalSummary(engineResults) {
    let summary = '';

    const checks = engineResults.skillChecks || [];
    for (const check of checks) {
      summary += `[${_capitalise(check.skill)}] Roll: ${check.roll} vs ${check.target} — ${(check.tier || 'unknown').toUpperCase()}. `;
    }

    const events = engineResults.events || [];
    for (const ev of events) {
      if (ev.description) {
        summary += ev.description + ' ';
      }
    }

    return summary.trim() || 'The turn advances. The world continues.';
  }

  // ─────────────────────────────────────────────────
  // LLM FAILURE HANDLING
  // ─────────────────────────────────────────────────

  async function handleLLMFailure(error, engineResults) {
    _state.llmAvailable = false;
    console.warn('[App] LLM failure:', error);

    Notifications.warning('AI storyteller unavailable. Showing mechanical summary.', {
      persistent: false,
      duration: 6000,
      onClick: () => retryLastPrompt(),
    });

    if (typeof ProseDisplay.appendSystemMessage === 'function') {
      ProseDisplay.appendSystemMessage(
        'AI storyteller unavailable. <a href="#" onclick="App.retryLastPrompt(); return false;">[Retry Narrative]</a>',
        'warning'
      );
    }

    return generateMechanicalSummary(engineResults);
  }

  async function retryLastPrompt() {
    if (!_state.lastPrompt || !_state.lastSystemPrompt) {
      Notifications.warning('No prompt to retry.');
      return;
    }

    Layout.showLLMTypingIndicator();
    try {
      const llmResult = await ApiClient.sendPrompt(_state.lastSystemPrompt, _state.lastPrompt, {
        maxTokens: 1200,
        temperature: 0.85,
      });
      Layout.hideLLMTypingIndicator();

      if (llmResult && llmResult.success) {
        _state.llmAvailable = true;
        const parsed = ResponseParser.parse(llmResult.text, { type: 'retry' });
        ProseDisplay.appendProse(
          '— Narrative recovered —\n\n' + ResponseParser.formatForDisplay(parsed.prose),
          { animate: _state.settings.animateProse, type: 'retry' }
        );
      } else {
        throw new Error('Retry failed');
      }
    } catch (err) {
      Layout.hideLLMTypingIndicator();
      Notifications.error('Retry failed. AI storyteller still unavailable.', { duration: 5000 });
    }
  }

  // ─────────────────────────────────────────────────
  // SAVE GAME
  // ─────────────────────────────────────────────────

  async function saveGame() {
    try {
      _state.gameState.meta.last_saved = new Date().toISOString();
      const result = await SaveClient.saveGame(_state.gameState);
      if (result && result.success) {
        Notifications.success('Game saved — ' + _state.sessionKey);
        _state.lastSaveTime = new Date().toISOString();
        // Update header display if available
        if (typeof Layout.updateLastSaveDisplay === 'function') {
          Layout.updateLastSaveDisplay(_state.lastSaveTime);
        }
      } else {
        Notifications.error('Save failed! Check server connection.', { duration: 6000 });
      }
    } catch (err) {
      console.error('[App] saveGame error:', err);
      Notifications.error('Save failed! Check server connection.', { duration: 6000 });
    }
  }

  // ─────────────────────────────────────────────────
  // DEATH HANDLING
  // ─────────────────────────────────────────────────

  async function handleDeath(causeOfDeath) {
    _state.currentPhase = 'dead';
    InputHandler.disable();

    Layout.showLLMTypingIndicator();
    try {
      const { systemPrompt, userPrompt } = PromptBuilder.buildDeathPrompt(_state.gameState, causeOfDeath);
      const llmResult = await ApiClient.sendPrompt(systemPrompt, userPrompt, {
        maxTokens: 1200, temperature: 0.9,
      });
      Layout.hideLLMTypingIndicator();

      if (llmResult && llmResult.success) {
        const parsed = ResponseParser.parse(llmResult.text, { type: 'death' });
        ProseDisplay.appendProse(ResponseParser.formatForDisplay(parsed.prose), {
          animate: _state.settings.animateProse, type: 'death',
        });
      } else {
        throw new Error('LLM unavailable');
      }
    } catch (err) {
      Layout.hideLLMTypingIndicator();
      ProseDisplay.appendProse(
        `Heinrich ${_state.gameState.heinrich.family_name} has died. ` +
        `His story is over, but his legacy endures.`,
        { animate: false, type: 'death' }
      );
    }

    // Final save
    try {
      _state.gameState.meta.last_saved = new Date().toISOString();
      await SaveClient.saveGame(_state.gameState);
    } catch (e) { /* silent */ }

    // Death / legacy screen
    if (typeof ProseDisplay.appendSeparator === 'function') {
      ProseDisplay.appendSeparator('scene_change');
    }

    _showDeathScreen();

    InputHandler.enable();
  }

  function _showDeathScreen() {
    const gs = _state.gameState;
    const legacyScore = _calculateLegacyScore(gs);
    const achievements = gs.achievements ? gs.achievements.length : 0;

    // Show last 5 chronicle entries
    const lastEntries = gs.chronicle && gs.chronicle.entries
      ? gs.chronicle.entries.slice(-5).map(e => `— ${e.summary}`).join('\n')
      : '— No chronicle entries.';

    const legacyLines = [
      '',
      '══════════════════════════════════',
      `✝ HEINRICH ${(gs.heinrich.family_name || '').toUpperCase()} — LEGACY`,
      '══════════════════════════════════',
      `Legacy Score: ${legacyScore}`,
      `Achievements: ${achievements}`,
      `Turns Played: ${gs.meta.total_turns_played || 0}`,
      '',
      'Final Chronicle:',
      lastEntries,
      '',
      'What will you do next?',
      '  [Continue as heir]  [View full chronicle]  [Start new game]',
    ].join('\n');

    ProseDisplay.appendProse(legacyLines, { animate: false, type: 'legacy' });

    // Show heir option if applicable
    const hasHeirs = gs.dynasty && gs.dynasty.children && gs.dynasty.children.length > 0;
    const choices = [];
    if (hasHeirs) choices.push('Continue as heir');
    choices.push('View full chronicle');
    choices.push('Start new game');
    InputHandler.setChoices(choices);
  }

  function _calculateLegacyScore(gs) {
    let score = 0;
    score += (gs.meta.total_turns_played || 0) * 2;
    score += (gs.reputation ? (gs.reputation.overall || 0) : 0) * 5;
    score += (gs.achievements ? gs.achievements.length * 10 : 0);
    if (gs.heinrich.inventions && gs.heinrich.inventions.completed) {
      score += gs.heinrich.inventions.completed.length * 25;
    }
    if (gs.dynasty && gs.dynasty.children) {
      score += gs.dynasty.children.length * 15;
    }
    if (gs.properties && gs.properties.length > 0) {
      score += gs.properties.length * 20;
    }
    return score;
  }

  // ─────────────────────────────────────────────────
  // SETTINGS
  // ─────────────────────────────────────────────────

  function applySettings(settings) {
    try {
      if (typeof ProseDisplay.applyTheme === 'function') {
        ProseDisplay.applyTheme(settings.theme || 'dark_parchment');
      }
      if (typeof ProseDisplay.setFontSize === 'function') {
        ProseDisplay.setFontSize(settings.fontSize || 'medium');
      }
      if (typeof ProseDisplay.setParagraphSpacing === 'function') {
        ProseDisplay.setParagraphSpacing(settings.spacing || 'normal');
      }
    } catch (e) {
      console.warn('[App] applySettings display error:', e);
    }

    try {
      localStorage.setItem('heinrich_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('[App] Could not persist settings:', e);
    }

    _state.settings = settings;
  }

  function loadSettings() {
    try {
      const stored = localStorage.getItem('heinrich_settings');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('[App] loadSettings failed:', e);
    }
    return {
      theme: 'dark_parchment',
      fontSize: 'medium',
      spacing: 'normal',
      autoSave: true,
      animateProse: true,
    };
  }

  // ─────────────────────────────────────────────────
  // REGISTER TAB CONTENT PROVIDERS
  // ─────────────────────────────────────────────────

  function registerTabContentProviders() {
    try {
      InfoPanel.registerTabContent('npcs', (gs) =>
        NPCCodex.render(gs.npcs, gs.npc_relationships));
      InfoPanel.registerTabContent('inventory', (gs) =>
        InventoryView.render(gs.inventory));
      InfoPanel.registerTabContent('map', (gs) =>
        MapView.render(gs.map, gs.map.current_location));
      InfoPanel.registerTabContent('skills', (gs) =>
        SkillTreeView.render(gs.skills));
      InfoPanel.registerTabContent('holdings', (gs) =>
        PropertyView.render(gs.properties));
      InfoPanel.registerTabContent('chronicle', (gs) =>
        ChronicleView.render(gs.chronicle, gs.calendar));
      InfoPanel.registerTabContent('memory', (gs) =>
        MemoryPalace.render(gs.heinrich.memory_palace));
      InfoPanel.registerTabContent('consequences', (gs) =>
        ConsequenceTracker.render(gs.consequences));
      InfoPanel.registerTabContent('inventions', (gs) =>
        InventionView.render(gs.heinrich.inventions));
    } catch (e) {
      console.warn('[App] registerTabContentProviders partial failure:', e);
    }
  }

  // ─────────────────────────────────────────────────
  // INPUT SUBMIT HANDLER
  // ─────────────────────────────────────────────────

  function onInputSubmit(inputData) {
    const text = (inputData && inputData.text) ? inputData.text.trim() : '';
    if (!text) return;

    if (!_state.isLoaded) {
      // Handle startup inputs (bare session keys)
      if (/^[A-Z0-9]{8}$/i.test(text)) {
        quickResume(); // will re-read from input field, or…
        resumeGame(text.toUpperCase());
      }
      return;
    }

    switch (_state.currentPhase) {
      case 'playing':
        processTurn(text);
        break;

      case 'combat':
        processCombatTurn(inputData);
        break;

      case 'dead':
        if (text.toLowerCase().includes('heir')) {
          continueAsHeir();
        } else if (text.toLowerCase().includes('new')) {
          Modals.show('new-game');
        } else if (text.toLowerCase().includes('chronicle')) {
          InfoPanel.setActiveTab('chronicle');
        }
        break;

      default:
        processTurn(text);
        break;
    }
  }

  // ─────────────────────────────────────────────────
  // BIND GLOBAL EVENT LISTENERS
  // ─────────────────────────────────────────────────

  function bindGlobalEventListeners() {
    window.addEventListener('resize', () => {
      try { Layout.onResize(); } catch (e) { /* silent */ }
    });

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveGame();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        try { SaveClient.exportGame(_state.sessionKey); } catch (err) {
          Notifications.error('Export failed: ' + err.message);
        }
      }
      if (e.key === 'F1') {
        e.preventDefault();
        Modals.show('help');
      }
      if (e.key === 'Escape') {
        try { Modals.hideAll(); } catch (err) { /* silent */ }
      }
    });

    document.addEventListener('heinrich:saved', (e) => {
      _state.lastSaveTime = e.detail ? e.detail.timestamp : new Date().toISOString();
    });

    document.addEventListener('heinrich:savefailed', () => {
      Notifications.error('Auto-save failed. Check server connection.', { duration: 8000 });
    });

    document.addEventListener('heinrich:loaded', (e) => {
      Notifications.success('Game loaded — Session ' + (e.detail ? e.detail.sessionKey : ''));
    });

    document.addEventListener('heinrich:newgame', (e) => {
      startNewGame(e.detail || {});
    });

    document.addEventListener('heinrich:resume', (e) => {
      resumeGame(e.detail ? e.detail.sessionKey : '');
    });

    document.addEventListener('heinrich:import', (e) => {
      importGame(e.detail ? e.detail.file : null);
    });

    document.addEventListener('heinrich:apiconfigured', () => {
      const warn = document.getElementById('welcome-llm-warning');
      if (warn) warn.style.display = 'none';
      Notifications.success('AI Storyteller connected!');
    });

    document.addEventListener('heinrich:settingschanged', (e) => {
      applySettings(e.detail || {});
    });
  }

  // ─────────────────────────────────────────────────
  // DEBUG INFO
  // ─────────────────────────────────────────────────

  function getDebugInfo() {
    return {
      turn: _state.turnCount,
      sessionKey: _state.sessionKey,
      phase: _state.currentPhase,
      isProcessing: _state.isProcessing,
      llmAvailable: _state.llmAvailable,
      lastSave: _state.lastSaveTime,
      gameStateKeys: _state.gameState ? Object.keys(_state.gameState) : [],
    };
  }

  // ─────────────────────────────────────────────────
  // IMPORT GAME
  // ─────────────────────────────────────────────────

  async function importGame(file) {
    if (!file) {
      Notifications.error('No file provided for import.');
      return;
    }
    Layout.showLoadingOverlay('Importing save…');
    try {
      const result = await SaveClient.importGame(file);
      Layout.hideLoadingOverlay();
      if (result && result.success) {
        await resumeGame(result.sessionKey);
        Notifications.success('Save imported! New session: ' + result.sessionKey);
      } else {
        Notifications.error('Import failed: ' + (result ? (result.error || 'Unknown error') : 'No response'));
      }
    } catch (err) {
      Layout.hideLoadingOverlay();
      Notifications.error('Import failed: ' + (err.message || 'Unknown error'));
    }
  }

  // ─────────────────────────────────────────────────
  // CONTINUE AS HEIR
  // ─────────────────────────────────────────────────

  async function continueAsHeir(heirId) {
    if (!_state.gameState.dynasty || !_state.gameState.dynasty.children ||
        !_state.gameState.dynasty.children.length) {
      Notifications.warning('No living heirs to continue with.');
      return;
    }

    const heir = heirId
      ? _state.gameState.dynasty.children.find(c => c.id === heirId)
      : _state.gameState.dynasty.children[0];

    if (!heir) {
      Notifications.error('Heir not found.');
      return;
    }

    try {
      DynastyEngine.transitionToHeir(_state.gameState, heir.id);
    } catch (e) {
      console.warn('[App] DynastyEngine.transitionToHeir failed:', e);
    }

    _state.currentPhase = 'playing';
    _state.gameState.heinrich.health.status = 'alive';

    if (typeof ProseDisplay.appendSeparator === 'function') {
      ProseDisplay.appendSeparator('scene_change');
    }

    Layout.showLLMTypingIndicator();
    try {
      const { systemPrompt, userPrompt } = PromptBuilder.buildOpeningPrompt(_state.gameState);
      const result = await ApiClient.sendPrompt(systemPrompt, userPrompt, {
        maxTokens: 1500, temperature: 0.9,
      });
      Layout.hideLLMTypingIndicator();

      if (result && result.success) {
        const parsed = ResponseParser.parse(result.text, { type: 'opening' });
        ProseDisplay.appendProse(
          ResponseParser.formatForDisplay(parsed.prose),
          { animate: _state.settings.animateProse, type: 'opening' }
        );
      } else {
        throw new Error('LLM unavailable');
      }
    } catch (err) {
      Layout.hideLLMTypingIndicator();
      ProseDisplay.appendProse(
        `A new chapter begins. You are now ${heir.name}, heir of the ${_state.gameState.heinrich.family_name} line.`,
        { animate: false, type: 'opening' }
      );
    }

    StatsPanel.render(_state.gameState);
    InfoPanel.render(_state.gameState);
    InputHandler.enable();
    InputHandler.focus();
    InputHandler.setInputMode('normal');
    InputHandler.setPlaceholder('What do you do?');
  }

  // ─────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────

  function _discoverLocation(locationId) {
    if (!_state.gameState.map) return;
    if (!_state.gameState.map.discovered) _state.gameState.map.discovered = [];
    if (!_state.gameState.map.discovered.includes(locationId)) {
      _state.gameState.map.discovered.push(locationId);
    }
  }

  function _getLocationEvents(locationId, gameState) {
    // Return any events associated with first-time discovery or revisiting
    const events = [];
    const wasDiscovered = gameState.map.discovered &&
      gameState.map.discovered.filter(l => l === locationId).length > 1;

    if (!wasDiscovered) {
      events.push({
        type: 'location_discovered',
        description: `Discovered: ${locationId.replace(/_/g, ' ')}.`,
        significant: true,
      });
    }

    return events;
  }

  function _capitalise(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ─────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────

  return {
    init,
    processTurn,
    saveGame,
    resumeGame,
    startNewGame,
    importGame,
    handleDeath,
    getDebugInfo,
    applySettings,
    loadSettings,
    retryLastPrompt,
    continueAsHeir,
    getState: () => _state,
    getGameState: () => _state.gameState,
    getSessionKey: () => _state.sessionKey,
    getCurrentPhase: () => _state.currentPhase,
    isProcessing: () => _state.isProcessing,
  };

})();

// ─────────────────────────────────────────────────
// AUTO-INITIALISE WHEN DOM IS READY
// ─────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Expose for debugging
if (typeof window !== 'undefined') {
  window.Heinrich = {
    App,
    getState: () => App.getState(),
    debug: () => App.getDebugInfo(),
  };
}

// END FILE: client/js/app.js

// ══════════════════════════════════════════════════
// ✅ PART 10 COMPLETE — THE FATE OF HEINRICH IS BUILT
// All 91 files across 10 parts are complete.
// Run: cd server && npm install && node server.js
// Open: http://localhost:3000
// ══════════════════════════════════════════════════
