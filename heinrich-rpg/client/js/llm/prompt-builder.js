// FILE: client/js/llm/prompt-builder.js — PART 9

/**
 * PromptBuilder — constructs LLM prompts from game state.
 * Exposed as a browser global via IIFE; no ES module import/export.
 *
 * All build* methods return { systemPrompt, userPrompt }.
 * The SYSTEM_PROMPT is a frozen constant on the returned object.
 */
const PromptBuilder = (() => {

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM PROMPT — canonical, immutable narrative contract with the LLM
  // ═══════════════════════════════════════════════════════════════════════════
  const SYSTEM_PROMPT = `You are the narrative voice of a medieval text RPG. You write ONLY prose — vivid, muscular, historically grounded fiction in second-person present tense. You NEVER calculate dice rolls, track inventory, manage skills, or process game mechanics. That is handled by the game engine, which provides you with all results.

STYLE RULES:
- Second-person present tense. Always.
- Sensory anchoring: every scene opens with a grounding detail — sound, smell, texture, temperature.
- Dialogue: direct speech only. Each NPC has a unique speech_pattern — honor it absolutely. No two NPCs sound alike.
- Interiority: narrate Heinrich's physical and emotional states without dictating his decisions.
- Tone: muscular and immediate. Gritty, never gratuitous. Beautiful, never purple. Cold mud and warm bread.
- Pacing: match length to gravity. Brief for routine actions, expansive for pivotal moments.
- THE MOMENT: For skill checks, write 2-4 visceral present-tense sentences of the attempt BEFORE the result.
- Heinrich's language_stage affects his dialogue: peasant = rough, direct; courtly = elegant, layered.

HEINRICH'S GENIUS:
Heinrich has extraordinary intuition. When the player suggests ideas that seem ahead of their time, treat this as Heinrich having a flash of brilliance — an insight that others would never conceive. The world reacts to these ideas with awe, suspicion, fear, or greed — never with acceptance that they're "normal." Heinrich is extraordinary, and the world should feel it.

INVENTION NARRATION:
When Heinrich attempts to invent or innovate, narrate:
- The moment of inspiration (visceral, exciting)
- The difficulties of explanation (he can't cite sources that don't exist)
- The physical experimentation (trial and error, failures before success)
- The world's reaction (wonder, hostility, fear of witchcraft, opportunism)
Never make invention easy. Always make it feel earned.

NEVER:
- Reference game mechanics, dice, skill levels, or XP in prose
- Make decisions for Heinrich
- Contradict the engine's provided outcomes
- Use anachronistic language or concepts in the world's voice (Heinrich can THINK anachronistically but the WORLD does not)
- Dismiss the player's creative ideas — always find the historically plausible path`;

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  /**
   * _formatDate(calendar)
   * @param {{ dayOfWeek?: number, day?: number, month?: number, year?: number, timeOfDay?: string }} calendar
   * @returns {string}  e.g. "Monday, 3 March 1403, Dawn"
   */
  function _formatDate(calendar) {
    if (!calendar) return 'An unknown date';
    const dow   = DAY_NAMES[calendar.dayOfWeek ?? 1]   || 'Monday';
    const day   = calendar.day   ?? 1;
    const month = MONTH_NAMES[(calendar.month ?? 1) - 1] || 'January';
    const year  = calendar.year  ?? 1400;
    const time  = calendar.timeOfDay
      ? `, ${_capitalize(calendar.timeOfDay)}`
      : '';
    return `${dow}, ${day} ${month} ${year}${time}`;
  }

  /**
   * _capitalize(str) — capitalises first letter.
   */
  function _capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * _formatWeather(weather)
   * @param {{ condition?: string, temperature?: string, wind?: string, precipitation?: string }} weather
   * @returns {string}
   */
  function _formatWeather(weather) {
    if (!weather) return 'Overcast skies, a damp chill in the air.';

    const parts = [];

    const conditionMap = {
      clear:      'Clear skies, pale winter sun offering little warmth',
      cloudy:     'Heavy cloud cover, the light flat and grey',
      overcast:   'A low ceiling of iron-grey clouds',
      rainy:      'Rain falls in steady curtains',
      drizzle:    'A thin drizzle mists the air',
      stormy:     'A violent storm batters the land',
      foggy:      'Dense fog clings to every surface',
      snowy:      'Snow falls thick and silent',
      sleet:      'Sleet hisses against stone and thatch',
      hail:       'Hail rattles like thrown stones',
      windy:      'A fierce wind tears at cloaks and banners',
    };
    const condition = conditionMap[weather.condition?.toLowerCase()] || weather.condition || 'Grey skies';
    parts.push(condition);

    const tempMap = {
      freezing:   'bone-cracking cold',
      cold:       'bitter chill',
      cool:       'cool',
      mild:       'mild',
      warm:       'warmth',
      hot:        'oppressive heat',
      sweltering: 'sweltering heat',
    };
    if (weather.temperature) {
      const temp = tempMap[weather.temperature.toLowerCase()] || weather.temperature;
      parts.push(temp);
    }

    const windMap = {
      calm:    'the air still',
      breeze:  'a gentle breeze',
      breezy:  'a steady breeze',
      windy:   'strong gusts',
      gale:    'gale-force winds',
      storm:   'howling storm winds',
    };
    if (weather.wind) {
      const wind = windMap[weather.wind.toLowerCase()] || weather.wind;
      parts.push(wind);
    }

    return parts.join(', ') + '.';
  }

  /**
   * _formatHealthStatus(heinrich)
   * @param {{ health?: number, maxHealth?: number, hunger?: number, fatigue?: number, wounds?: Array, morale?: number }} heinrich
   * @returns {string}
   */
  function _formatHealthStatus(heinrich) {
    if (!heinrich) return 'Status unknown.';

    const parts = [];

    // Health
    const hp    = heinrich.health    ?? 100;
    const maxHp = heinrich.maxHealth ?? 100;
    const hpPct = maxHp > 0 ? (hp / maxHp) * 100 : 100;
    if      (hpPct >= 90) parts.push('hale');
    else if (hpPct >= 70) parts.push('lightly wounded');
    else if (hpPct >= 50) parts.push('moderately wounded');
    else if (hpPct >= 30) parts.push('badly hurt');
    else if (hpPct >= 10) parts.push('critically injured');
    else                   parts.push('near death');

    // Hunger
    const hunger = heinrich.hunger ?? 0;
    if      (hunger > 80) parts.push('starving');
    else if (hunger > 60) parts.push('very hungry');
    else if (hunger > 40) parts.push('hungry');
    else if (hunger > 20) parts.push('peckish');

    // Fatigue
    const fatigue = heinrich.fatigue ?? 0;
    if      (fatigue > 80) parts.push('exhausted');
    else if (fatigue > 60) parts.push('very tired');
    else if (fatigue > 40) parts.push('tired');
    else if (fatigue > 20) parts.push('slightly weary');

    // Active wounds
    const wounds = (heinrich.wounds || []).filter(w => w.active !== false);
    if (wounds.length > 0) {
      const woundDesc = wounds.map(w => w.description || w.name || 'wound').join(', ');
      parts.push(`bearing: ${woundDesc}`);
    }

    // Morale
    const morale = heinrich.morale ?? 50;
    if      (morale > 80) parts.push('spirits high');
    else if (morale < 20) parts.push('spirits low');

    return parts.length > 0 ? _capitalize(parts.join(', ')) + '.' : 'In fair condition.';
  }

  /**
   * _selectRelevantNPCs(npcs, locationId, maxCount)
   * Picks up to maxCount NPCs present at locationId, prioritising those
   * with high relationship magnitude or named roles.
   *
   * @param {Object}  npcs        - map of npcId → NPC object
   * @param {string}  locationId
   * @param {number}  maxCount
   * @returns {Array}
   */
  function _selectRelevantNPCs(npcs, locationId, maxCount = 5) {
    if (!npcs || typeof npcs !== 'object') return [];

    const atLocation = Object.values(npcs).filter(npc => {
      return npc.location === locationId || npc.currentLocation === locationId;
    });

    // Score each NPC by relevance
    const scored = atLocation.map(npc => {
      let score = 0;
      if (npc.isQuestGiver)     score += 30;
      if (npc.isNamedCharacter) score += 20;
      if (npc.isAlly)           score += 15;
      if (npc.isEnemy)          score += 10;
      const relMag = Math.abs(npc.relationship ?? npc.relationshipScore ?? 0);
      score += relMag / 10;
      if (npc.hasActiveDialogue) score += 25;
      return { npc, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxCount).map(s => s.npc);
  }

  /**
   * _formatNPCsPresent(npcs, relationships, locationId)
   * @param {Object} npcs          - map of npcId → NPC object
   * @param {Object} relationships - map of npcId → { score, disposition, history[] }
   * @param {string} locationId
   * @returns {string}
   */
  function _formatNPCsPresent(npcs, relationships, locationId) {
    const relevant = _selectRelevantNPCs(npcs, locationId, 5);
    if (relevant.length === 0) return 'None of note.';

    return relevant.map(npc => {
      const rel = (relationships || {})[npc.id] || {};
      const disposition = rel.disposition || _scoreToDisposition(rel.score ?? 0);
      const speechHint  = npc.speech_pattern ? ` Speech pattern: ${npc.speech_pattern}.` : '';
      const secret      = npc.currentSecret  ? ` Currently concealing: ${npc.currentSecret}.` : '';
      const mood        = npc.currentMood    ? ` Mood: ${npc.currentMood}.` : '';

      return [
        `- ${npc.name || npc.id} (${npc.role || npc.occupation || 'unknown'})`,
        `  Disposition toward Heinrich: ${disposition}`,
        speechHint + mood + secret,
      ].filter(Boolean).join('\n');
    }).join('\n');
  }

  function _scoreToDisposition(score) {
    if (score >=  60) return 'devoted';
    if (score >=  30) return 'friendly';
    if (score >=  10) return 'warm';
    if (score >=  -9) return 'neutral';
    if (score >= -29) return 'cool';
    if (score >= -59) return 'hostile';
    return 'enemy';
  }

  /**
   * _compressHistory(entries, maxTokens)
   * Trims chronicle entries to stay within a rough token budget.
   * Rule of thumb: 1 token ≈ 4 characters.
   *
   * @param {Array<{turn?: number, summary?: string, prose?: string, action?: string}>} entries
   * @param {number} maxTokens
   * @returns {Array}
   */
  function _compressHistory(entries, maxTokens) {
    if (!entries || entries.length === 0) return [];
    const maxChars = maxTokens * 4;
    const result   = [];
    let charCount  = 0;

    // Iterate newest-first, then reverse for display
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry   = entries[i];
      const text    = entry.summary || entry.prose || entry.action || '';
      const snippet = text.length > 200 ? text.slice(0, 197) + '…' : text;
      charCount    += snippet.length + 20; // overhead for formatting
      if (charCount > maxChars) break;
      result.unshift({ ...entry, _snippet: snippet });
    }

    return result;
  }

  /**
   * _formatRecentHistory(chronicle, turns)
   * @param {Array}  chronicle
   * @param {number} turns    - how many recent turns to include
   * @returns {string}
   */
  function _formatRecentHistory(chronicle, turns = 5) {
    if (!chronicle || chronicle.length === 0) return 'No prior events.';

    const recent = chronicle.slice(-turns);
    const compressed = _compressHistory(recent, 400);

    if (compressed.length === 0) return 'No prior events.';

    return compressed.map((entry, i) => {
      const turnLabel = entry.turn ? `Turn ${entry.turn}` : `Event ${i + 1}`;
      const text      = entry._snippet || entry.summary || entry.action || '';
      return `[${turnLabel}] ${text}`;
    }).join('\n');
  }

  /**
   * _formatSkillCheck(checkResult)
   * @param {{ skill?: string, difficulty?: string, roll?: number, threshold?: number, success?: boolean, degree?: string, consequence?: string }} checkResult
   * @returns {string}
   */
  function _formatSkillCheck(checkResult) {
    if (!checkResult) return '';
    const skill      = checkResult.skill      || 'Unknown skill';
    const difficulty = checkResult.difficulty || 'moderate';
    const success    = checkResult.success;
    const degree     = checkResult.degree     || (success ? 'success' : 'failure');
    const consequence = checkResult.consequence || '';

    const outcomeStr = success
      ? `SUCCESS (${degree})`
      : `FAILURE (${degree})`;

    return [
      `  Skill: ${skill} | Difficulty: ${difficulty} | Outcome: ${outcomeStr}`,
      consequence ? `  Consequence: ${consequence}` : '',
    ].filter(Boolean).join('\n');
  }

  /**
   * _formatInventionContext(invention)
   * @param {{ name?: string, concept?: string, phase?: string, progressPct?: number, failures?: number, materials?: string[], witnesses?: string[], obstacles?: string[] }} invention
   * @returns {string}
   */
  function _formatInventionContext(invention) {
    if (!invention) return '';
    const lines = [
      `Invention: ${invention.name || 'unnamed concept'}`,
      invention.concept    ? `Concept: ${invention.concept}`                        : '',
      invention.phase      ? `Current phase: ${invention.phase}`                    : '',
      invention.progressPct != null ? `Progress: ${invention.progressPct}%`         : '',
      invention.failures   ? `Failed attempts so far: ${invention.failures}`        : '',
      invention.materials?.length   ? `Available materials: ${invention.materials.join(', ')}` : '',
      invention.witnesses?.length   ? `Witnesses: ${invention.witnesses.join(', ')}` : '',
      invention.obstacles?.length   ? `Obstacles: ${invention.obstacles.join(', ')}` : '',
    ];
    return lines.filter(Boolean).join('\n  ');
  }

  /**
   * _calculateParagraphCount(context)
   * Determines how many prose paragraphs to request based on scene gravity.
   *
   * @param {{ type?: string, hasSkillCheck?: boolean, hasCombat?: boolean, isMajorEvent?: boolean, isPivotal?: boolean, isMundane?: boolean }} context
   * @returns {number}
   */
  function _calculateParagraphCount(context) {
    if (!context) return 3;
    if (context.type === 'death')       return 5;
    if (context.type === 'opening')     return 4;
    if (context.type === 'timeskip')    return 4;
    if (context.type === 'invention')   return 4;
    if (context.type === 'combat')      return 2;
    if (context.isPivotal)              return 4;
    if (context.isMajorEvent)           return 3;
    if (context.hasSkillCheck)          return 3;
    if (context.isMundane)              return 2;
    return 3;
  }

  /**
   * _buildSceneContext(gameState)
   * Builds the SCENE CONTEXT block common to most prompts.
   */
  function _buildSceneContext(gameState) {
    const heinrich   = gameState.heinrich   || {};
    const world      = gameState.world      || {};
    const calendar   = world.calendar       || gameState.calendar || {};
    const weather    = world.weather        || gameState.weather  || {};
    const location   = gameState.currentLocation || world.currentLocation || {};
    const locationName = location.name || location.id || 'an unknown place';
    const locationDesc = location.description
      ? ` — ${location.description.slice(0, 120)}${location.description.length > 120 ? '…' : ''}`
      : '';

    const languageStage = heinrich.languageStage || heinrich.language_stage || 'peasant';
    const activeOaths   = (heinrich.oaths || []).filter(o => o.active !== false).map(o => o.description || o.name).join('; ') || 'None';
    const relevantRep   = _buildReputationSnippet(gameState, location.factions || []);

    const appearance = [
      heinrich.age ? `${heinrich.age} years old` : '',
      heinrich.class || heinrich.occupation || '',
      heinrich.appearance || '',
      (heinrich.scars || []).length > 0 ? `Scars: ${heinrich.scars.join(', ')}` : '',
    ].filter(Boolean).join('; ');

    return [
      'SCENE CONTEXT:',
      `- Location: ${locationName}${locationDesc}`,
      `- Date/Time: ${_formatDate(calendar)}`,
      `- Weather: ${_formatWeather(weather)}`,
      `- Heinrich: ${appearance}`,
      `  Status: ${_formatHealthStatus(heinrich)}`,
      `- Language stage: ${languageStage}`,
      `- Active oaths: ${activeOaths}`,
      `- Relevant reputation: ${relevantRep}`,
    ].join('\n');
  }

  /**
   * _buildReputationSnippet(gameState, factionIds)
   */
  function _buildReputationSnippet(gameState, factionIds) {
    const reputations = gameState.reputations || gameState.faction_reputations || {};
    if (Object.keys(reputations).length === 0) return 'Unknown to most.';

    const snippets = factionIds
      .map(fid => {
        const rep = reputations[fid];
        if (!rep) return null;
        const score = rep.score ?? rep.value ?? 0;
        return `${fid}: ${_scoreToReputation(score)}`;
      })
      .filter(Boolean);

    if (snippets.length === 0) {
      // Fall back to first 3 known reputations
      const fallback = Object.entries(reputations).slice(0, 3).map(([fid, rep]) => {
        const score = rep.score ?? rep.value ?? 0;
        return `${fid}: ${_scoreToReputation(score)}`;
      });
      return fallback.join(' | ') || 'Unknown to most.';
    }

    return snippets.join(' | ');
  }

  function _scoreToReputation(score) {
    if (score >=  75) return 'celebrated';
    if (score >=  50) return 'respected';
    if (score >=  25) return 'known favourably';
    if (score >=  -24) return 'unremarkable';
    if (score >=  -49) return 'regarded with suspicion';
    if (score >=  -74) return 'distrusted';
    return 'reviled';
  }

  /**
   * _buildNPCBlock(gameState)
   */
  function _buildNPCBlock(gameState) {
    const npcs          = gameState.npcs          || {};
    const relationships = gameState.relationships  || {};
    const locationId    = (gameState.currentLocation || {}).id || gameState.currentLocationId || '';
    const formatted     = _formatNPCsPresent(npcs, relationships, locationId);
    return `PRESENT NPCs:\n${formatted}`;
  }

  /**
   * _buildHistoryBlock(gameState, turns)
   */
  function _buildHistoryBlock(gameState, turns = 5) {
    const chronicle = gameState.chronicle || gameState.history || [];
    return `RECENT HISTORY (last ${Math.min(turns, chronicle.length)} turns):\n${_formatRecentHistory(chronicle, turns)}`;
  }

  /**
   * _buildInstructionLine(paragraphCount, specificInstructions)
   */
  function _buildInstructionLine(paragraphCount, specificInstructions = '') {
    const base = `INSTRUCTIONS: Write ${paragraphCount} paragraphs in second-person present tense.`;
    const suffix = 'End with a moment that invites player choice without prescribing options.';
    return [base, specificInstructions, suffix].filter(Boolean).join(' ');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC BUILD METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * buildTurnPrompt(gameState, playerInput, engineResults)
   *
   * @param {Object} gameState
   * @param {string} playerInput
   * @param {{ skillChecks?: Array, events?: Array, npcActions?: Array, worldChanges?: Array, backgroundEvent?: Object }} engineResults
   * @returns {{ systemPrompt: string, userPrompt: string }}
   */
  function buildTurnPrompt(gameState, playerInput, engineResults = {}) {
    const { skillChecks = [], events = [], npcActions = [], worldChanges = [], backgroundEvent } = engineResults;

    const hasSkillCheck  = skillChecks.length > 0;
    const isMajorEvent   = events.length > 0 || worldChanges.length > 0;
    const paragraphCount = _calculateParagraphCount({ type: 'turn', hasSkillCheck, isMajorEvent });

    const sceneContext = _buildSceneContext(gameState);
    const npcBlock     = _buildNPCBlock(gameState);
    const historyBlock = _buildHistoryBlock(gameState, 5);

    const blocks = [
      sceneContext,
      '',
      npcBlock,
      '',
      historyBlock,
      '',
      `PLAYER ACTION: "${playerInput}"`,
    ];

    // Skill checks
    if (hasSkillCheck) {
      blocks.push('');
      blocks.push('SKILL CHECK RESULTS:');
      skillChecks.forEach(check => blocks.push(_formatSkillCheck(check)));
    }

    // NPC reactions
    if (npcActions.length > 0) {
      blocks.push('');
      blocks.push('NPC REACTIONS (already determined by engine):');
      npcActions.forEach(a => {
        blocks.push(`  - ${a.npcName || a.npcId}: ${a.action || a.description || JSON.stringify(a)}`);
      });
    }

    // World changes
    if (worldChanges.length > 0) {
      blocks.push('');
      blocks.push('WORLD CHANGES (already applied by engine):');
      worldChanges.forEach(c => {
        blocks.push(`  - ${c.description || JSON.stringify(c)}`);
      });
    }

    // Background event woven in
    if (backgroundEvent) {
      blocks.push('');
      blocks.push(`BACKGROUND EVENT: ${backgroundEvent.description || JSON.stringify(backgroundEvent)}`);
    }

    // Specific instructions
    let specificInstructions = '';
    if (hasSkillCheck) {
      specificInstructions = 'Write the moment of the attempt BEFORE its outcome — visceral, present-tense. Then reveal what the engine determined.';
    } else if (isMajorEvent) {
      specificInstructions = 'Treat this as a pivotal moment. Let the world\'s reaction unfold with weight.';
    }

    blocks.push('');
    blocks.push(_buildInstructionLine(paragraphCount, specificInstructions));

    return {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt:   blocks.join('\n'),
    };
  }

  /**
   * buildOpeningPrompt(gameState)
   * Builds the new-game first-scene prompt.
   *
   * @param {Object} gameState
   * @returns {{ systemPrompt: string, userPrompt: string }}
   */
  function buildOpeningPrompt(gameState) {
    const heinrich   = gameState.heinrich   || {};
    const world      = gameState.world      || {};
    const calendar   = world.calendar       || {};
    const location   = gameState.currentLocation || {};

    const paragraphCount = _calculateParagraphCount({ type: 'opening' });

    const userPrompt = [
      'OPENING SCENE — NEW GAME',
      '',
      _buildSceneContext(gameState),
      '',
      'CHARACTER BACKGROUND:',
      `- Name: ${heinrich.name || 'Heinrich'}`,
      `- Origin: ${heinrich.origin || 'unknown village'}`,
      `- Motivation: ${heinrich.motivation || 'unknown'}`,
      `- Starting circumstances: ${heinrich.startingCircumstances || 'uncertain'}`,
      heinrich.backstory ? `- Backstory: ${heinrich.backstory}` : '',
      '',
      `INSTRUCTIONS: Write ${paragraphCount} paragraphs establishing the opening scene.`,
      'Open with a powerful sensory moment — not a generic "you wake up" but something specific to this character and this place.',
      'Establish the world\'s texture, Heinrich\'s immediate situation, and a nascent sense of possibility.',
      'End with a moment that naturally invites the player\'s first choice.',
    ].filter(l => l !== null && l !== undefined).join('\n');

    return { systemPrompt: SYSTEM_PROMPT, userPrompt };
  }

  /**
   * buildResumePrompt(gameState)
   * Builds the prompt for resuming an existing saved game.
   *
   * @param {Object} gameState
   * @returns {{ systemPrompt: string, userPrompt: string }}
   */
  function buildResumePrompt(gameState) {
    const chronicle      = gameState.chronicle || gameState.history || [];
    const lastEntry      = chronicle[chronicle.length - 1] || {};
    const paragraphCount = _calculateParagraphCount({ type: 'resume' }) || 3;

    const userPrompt = [
      'RESUME SCENE — RETURNING PLAYER',
      '',
      _buildSceneContext(gameState),
      '',
      _buildNPCBlock(gameState),
      '',
      'LAST SESSION SUMMARY:',
      _formatRecentHistory(chronicle, 3),
      '',
      lastEntry.lastProse ? `WHERE WE LEFT OFF:\n"${lastEntry.lastProse.slice(0, 300)}…"` : '',
      '',
      `INSTRUCTIONS: Write ${paragraphCount} paragraphs re-establishing this scene.`,
      'Briefly but vividly re-anchor the player in Heinrich\'s immediate reality — sensory detail first.',
      'Remind us what hangs in the balance without reciting the plot.',
      'End with the present moment, open for action.',
    ].filter(Boolean).join('\n');

    return { systemPrompt: SYSTEM_PROMPT, userPrompt };
  }

  /**
   * buildTimeSkipPrompt(gameState, skipSummary)
   *
   * @param {Object} gameState
   * @param {{ turns: number, activity: string, significantEvents?: string[], skillGains?: Array, relationshipChanges?: Array, worldChanges?: Array }} skipSummary
   * @returns {{ systemPrompt: string, userPrompt: string }}
   */
  function buildTimeSkipPrompt(gameState, skipSummary = {}) {
    const {
      turns               = 1,
      activity            = 'going about daily life',
      significantEvents   = [],
      skillGains          = [],
      relationshipChanges = [],
      worldChanges        = [],
    } = skipSummary;

    const paragraphCount = _calculateParagraphCount({ type: 'timeskip' });

    const blocks = [
      'TIME SKIP — MONTAGE',
      '',
      _buildSceneContext(gameState),
      '',
      `SKIP DURATION: ${turns} turn${turns !== 1 ? 's' : ''}`,
      `DOMINANT ACTIVITY: ${activity}`,
    ];

    if (significantEvents.length > 0) {
      blocks.push('');
      blocks.push('SIGNIFICANT EVENTS (already resolved by engine):');
      significantEvents.forEach(e => blocks.push(`  - ${e}`));
    }

    if (skillGains.length > 0) {
      blocks.push('');
      blocks.push('GROWTH (engine-determined, do NOT mention numbers):');
      skillGains.forEach(g => {
        const desc = g.description || `${g.skill || 'a skill'} has deepened`;
        blocks.push(`  - ${desc}`);
      });
    }

    if (relationshipChanges.length > 0) {
      blocks.push('');
      blocks.push('RELATIONSHIP SHIFTS:');
      relationshipChanges.forEach(r => {
        blocks.push(`  - ${r.npcName || r.npcId}: ${r.change || r.description || 'relationship changed'}`);
      });
    }

    if (worldChanges.length > 0) {
      blocks.push('');
      blocks.push('WORLD CHANGES:');
      worldChanges.forEach(c => blocks.push(`  - ${c.description || c}`));
    }

    blocks.push('');
    blocks.push(
      `INSTRUCTIONS: Write ${paragraphCount} paragraphs as a montage — compress time visually.`,
      'Show rather than tell. Use fragments, brief vivid images, the sense of days bleeding together.',
      'Weave in the significant events naturally. End in the present moment, at the current location.',
    );

    return { systemPrompt: SYSTEM_PROMPT, userPrompt: blocks.join('\n') };
  }

  /**
   * buildInventionPrompt(gameState, invention, phase)
   *
   * @param {Object} gameState
   * @param {Object} invention
   * @param {'inspiration'|'research'|'prototype'|'introduction'} phase
   * @returns {{ systemPrompt: string, userPrompt: string }}
   */
  function buildInventionPrompt(gameState, invention = {}, phase = 'inspiration') {
    const paragraphCount = _calculateParagraphCount({ type: 'invention' });

    const phaseInstructions = {
      inspiration: [
        'Narrate the flash of insight — where it comes from, the visceral electricity of the idea.',
        'Heinrich cannot cite sources that don\'t exist. Show him grasping for language to frame the impossible thought.',
        'Leave the idea half-formed, tantalizing, dangerous.',
      ],
      research: [
        'Narrate the painstaking work of trying to understand and document what Heinrich senses is possible.',
        'Show the frustration of working without a framework. Every analogy is improvised. Every test risks being called witchcraft.',
        'Include a small failure or dead end — progress is never linear.',
      ],
      prototype: [
        'Narrate the physical work of building. Hands on materials. Trial and catastrophic error.',
        'Show the wonder of something almost working — and the gap between almost and actually.',
        'Include at least one moment where a witness reacts: confusion, fear, or awe.',
      ],
      introduction: [
        'Narrate the moment Heinrich shows his invention to the world.',
        'The world\'s reaction must feel earned: suspicion, religious unease, opportunistic greed, or wonder.',
        'Show what it COSTS Heinrich to bring this into being — socially, physically, spiritually.',
      ],
    };

    const instructions = phaseInstructions[phase] || phaseInstructions.inspiration;

    const userPrompt = [
      `INVENTION SCENE — PHASE: ${phase.toUpperCase()}`,
      '',
      _buildSceneContext(gameState),
      '',
      _buildNPCBlock(gameState),
      '',
      'INVENTION CONTEXT:',
      `  ${_formatInventionContext(invention)}`,
      '',
      `INSTRUCTIONS: Write ${paragraphCount} paragraphs narrating this invention phase.`,
      ...instructions,
      'End with a moment that invites the player\'s next choice — push further, pause, or abandon.',
    ].join('\n');

    return { systemPrompt: SYSTEM_PROMPT, userPrompt };
  }

  /**
   * buildCombatRoundPrompt(gameState, combatState, roundResult)
   *
   * @param {Object} gameState
   * @param {{ enemies?: Array, round?: number, phase?: string }} combatState
   * @param {{ attackerAction?: string, defenderAction?: string, hit?: boolean, damage?: number, attacker?: string, special?: string }} roundResult
   * @returns {{ systemPrompt: string, userPrompt: string }}
   */
  function buildCombatRoundPrompt(gameState, combatState = {}, roundResult = {}) {
    const enemies      = combatState.enemies || [];
    const round        = combatState.round   || 1;
    const paragraphCount = _calculateParagraphCount({ type: 'combat' });

    const enemyLines = enemies.map(e => {
      const hpPct = e.maxHealth ? Math.round((e.health / e.maxHealth) * 100) : 100;
      const condition = hpPct > 70 ? 'still standing strong'
        : hpPct > 40 ? 'wounded but dangerous'
        : hpPct > 10 ? 'badly hurt, desperate'
        : 'barely standing';
      return `  - ${e.name || 'Enemy'} (${e.type || 'combatant'}): ${condition}`;
    });

    const resultLines = [];
    if (roundResult.attacker)     resultLines.push(`Attacker: ${roundResult.attacker}`);
    if (roundResult.attackerAction) resultLines.push(`Action: ${roundResult.attackerAction}`);
    if (roundResult.defenderAction) resultLines.push(`Counter: ${roundResult.defenderAction}`);
    if (roundResult.hit !== undefined) resultLines.push(`Hit: ${roundResult.hit ? 'Yes' : 'No'}`);
    if (roundResult.damage)       resultLines.push(`Damage dealt: ${roundResult.damage} (do NOT include this number in prose)`);
    if (roundResult.special)      resultLines.push(`Special: ${roundResult.special}`);

    const userPrompt = [
      `COMBAT — ROUND ${round}`,
      '',
      _buildSceneContext(gameState),
      '',
      'COMBATANTS:',
      ...enemyLines,
      '',
      'ROUND RESULT (engine-determined):',
      ...resultLines.map(l => `  ${l}`),
      '',
      `INSTRUCTIONS: Write ${paragraphCount} punchy paragraphs of combat narration.`,
      'Present-tense, visceral, kinetic. Show the attempt before the result.',
      'Do not mention numbers. Let the body language and aftermath show success or failure.',
      'End where action pauses, inviting the player\'s next move.',
    ].join('\n');

    return { systemPrompt: SYSTEM_PROMPT, userPrompt };
  }

  /**
   * buildDeathPrompt(gameState, causeOfDeath)
   *
   * @param {Object} gameState
   * @param {string} causeOfDeath
   * @returns {{ systemPrompt: string, userPrompt: string }}
   */
  function buildDeathPrompt(gameState, causeOfDeath = 'unknown causes') {
    const heinrich     = gameState.heinrich  || {};
    const chronicle    = gameState.chronicle || gameState.history || [];
    const paragraphCount = _calculateParagraphCount({ type: 'death' });

    const majorMoments = chronicle
      .filter(e => e.isPivotal || e.isMajor || e.significance === 'major')
      .slice(-5)
      .map(e => `  - ${e.summary || e.description || e.action || ''}`)
      .join('\n');

    const userPrompt = [
      'DEATH SCENE — END OF HEINRICH\'S STORY',
      '',
      _buildSceneContext(gameState),
      '',
      `CAUSE OF DEATH: ${causeOfDeath}`,
      '',
      'HEINRICH\'S LEGACY:',
      `  Age at death: ${heinrich.age || 'unknown'}`,
      `  Turn reached: ${gameState.currentTurn || chronicle.length}`,
      majorMoments ? `  Pivotal moments:\n${majorMoments}` : '',
      (heinrich.achievements || []).length > 0
        ? `  Achievements: ${heinrich.achievements.join(', ')}`
        : '',
      (heinrich.inventions || []).length > 0
        ? `  Inventions: ${heinrich.inventions.join(', ')}`
        : '',
      '',
      `INSTRUCTIONS: Write ${paragraphCount} paragraphs for Heinrich\'s death scene and epitaph.`,
      'The death itself should be rendered with honesty and gravity — not melodrama.',
      'Then step back and give his life its due: what he changed, what he left behind, what was lost.',
      'The final paragraph should be an epitaph — one or two sentences that could be carved in stone.',
      'Make it feel earned. Make it feel final. Make it feel true.',
    ].filter(Boolean).join('\n');

    return { systemPrompt: SYSTEM_PROMPT, userPrompt };
  }

  // ─── Expose public surface ─────────────────────────────────────────────────
  return Object.freeze({
    SYSTEM_PROMPT,
    buildTurnPrompt,
    buildOpeningPrompt,
    buildResumePrompt,
    buildTimeSkipPrompt,
    buildInventionPrompt,
    buildCombatRoundPrompt,
    buildDeathPrompt,
  });
})();

// END FILE: client/js/llm/prompt-builder.js
