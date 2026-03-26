// FILE: client/js/llm/response-parser.js — PART 9

/**
 * ResponseParser — parses, cleans, validates, and formats LLM narrative output.
 * Exposed as a browser global via IIFE; no ES module import/export.
 *
 * Responsibilities:
 *  - parse()                — raw LLM text → structured result
 *  - extractChoiceSuggestions() — implied action options from prose
 *  - cleanProse()           — remove leaked mechanics, fix spacing/quotes
 *  - validateProse()        — detect forbidden content
 *  - formatForDisplay()     — prose → HTML with semantic markup
 *  - extractNPCDialogue()   — pull out dialogue with speaker attribution
 */
const ResponseParser = (() => {

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTANTS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Patterns that indicate leaked game-mechanical content. */
  const MECHANIC_PATTERNS = [
    /\b\d+\s*(?:XP|experience points?)\b/gi,
    /\bskill\s+(?:level|rank|score)\s*(?:of\s*)?\d+\b/gi,
    /\b(?:rolled?|roll)\s+a?\s*\d+\b/gi,
    /\b\d+d\d+\b/gi,                                         // dice notation: 2d6
    /\b(?:hit points?|HP|health points?)\s*:?\s*\d+\b/gi,
    /\b(?:attribute|stat)\s+\w+\s*(?:is|=|:)\s*\d+\b/gi,
    /\binventory\s+(?:slot|space|weight)\b/gi,
    /\b(?:gold|silver|copper)\s+pieces?\s*:?\s*\d+\b/gi,    // explicit currency amounts
    /\b(?:succeeded?|failed?)\s+(?:a\s+)?(?:DC|difficulty\s+class)\b/gi,
    /\bDC\s*\d+\b/gi,
    /\b(?:bonus|penalty|modifier)\s+of\s*[+-]?\d+\b/gi,
    /\bthreshold\s*:?\s*\d+\b/gi,
  ];

  /** Modern anachronism patterns — words/concepts alien to 1400s Europe. */
  const ANACHRONISM_PATTERNS = [
    /\b(?:okay|OK|alright)\b/gi,
    /\b(?:stress|trauma|PTSD|anxiety disorder)\b/gi,
    /\b(?:percent|percentage|%)\b/gi,
    /\b(?:literally|basically|actually|honestly)\b/gi,    // modern filler
    /\b(?:cool|awesome|amazing|fantastic|super)\b/gi,
    /\b(?:guy|guys|dude|buddy|pal|mate)\b/gi,
    /\b(?:bye|goodbye|hey)\b/gi,
    /\b(?:yeah|yep|nope|nah)\b/gi,
    /\b(?:smartphone|phone|internet|computer|robot|electricity)\b/gi,
  ];

  /** Patterns where the narrator makes decisions for Heinrich. */
  const DECISION_PATTERNS = [
    /\byou (?:decide|choose|decide to|choose to|opt to|resolve to)\b/gi,
    /\byou (?:will|shall|must|should) (?:go|do|take|fight|run|flee|attack)\b/gi,
    /\byou (?:know that you must|realize you should)\b/gi,
  ];

  /** Typographic quote replacements. */
  const QUOTE_REPLACEMENTS = [
    // Opening double quote after: start, space, (, [, em-dash, en-dash, newline
    { pattern: /(^|[\s(\[—–\n])"(?=\w)/gm, replacement: '$1\u201C' },
    // Closing double quote before: space, !, ?, ., ,, ), ], —, end
    { pattern: /"(?=[\s!?.,:;)\]—–]|$)/gm, replacement: '\u201D' },
    // Remaining double quotes → smart (fallback)
    { pattern: /"([^"]*)"/g,               replacement: '\u201C$1\u201D' },
    // Single quotes (apostrophes / contractions)
    { pattern: /(\w)'(\w)/g,              replacement: '$1\u2019$2' },
    // Opening single quote
    { pattern: /(^|[\s(\[—–])'/gm,       replacement: '$1\u2018' },
    // Closing single quote
    { pattern: /'(?=[\s!?.,:;)\]—–]|$)/gm, replacement: '\u2019' },
  ];

  // Patterns suggesting a natural choice point in the prose
  const CHOICE_HINT_PATTERNS = [
    /you could (?:also\s+)?([^.!?]{5,60})/gi,
    /(?:perhaps|maybe) (?:you\s+)?([^.!?]{5,60})/gi,
    /(?:there is|there's) (?:still\s+)?(?:time\s+)?(?:to\s+)([^.!?]{5,50})/gi,
    /you might ([^.!?]{5,50})/gi,
    /the (?:\w+ ){0,3}(?:awaits?|beckons?|looms?|waits?) ([^.!?]{5,50})/gi,
    /(?:to the \w+),? (?:lies?|stands?|waits?) ([^.!?]{5,50})/gi,
  ];

  // Words that mark dialogue attribution
  const DIALOGUE_VERBS = [
    'says?', 'said', 'speaks?', 'spoke', 'whispers?', 'whispered',
    'shouts?', 'shouted', 'calls?', 'called', 'mutters?', 'muttered',
    'growls?', 'growled', 'laughs?', 'laughed', 'hisses?', 'hissed',
    'replies?', 'replied', 'answers?', 'answered', 'asks?', 'asked',
    'declares?', 'declared', 'announces?', 'announced', 'adds?', 'added',
    'snaps?', 'snapped', 'barks?', 'barked',
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  function _countWords(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function _estimateReadTimeSeconds(wordCount) {
    // Average adult reading speed ≈ 238 wpm for literary prose
    return Math.round((wordCount / 238) * 60);
  }

  /** Splits prose into paragraph strings, filtering empty ones. */
  function _splitParagraphs(text) {
    return text
      .split(/\n{2,}/)
      .map(p => p.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim())
      .filter(Boolean);
  }

  /**
   * _applyQuoteReplacement(text)
   * Converts ASCII quotes to typographic (curly) quotes.
   */
  function _applyQuoteReplacement(text) {
    let result = text;
    for (const { pattern, replacement } of QUOTE_REPLACEMENTS) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }

  /**
   * _escapeHtml(str)
   * Minimal HTML escaping for prose content (we intentionally allow our own markup).
   */
  function _escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * _stripLeadingLabel(text)
   * Remove common LLM preambles like "Here is the prose:" or "Certainly! ..."
   */
  function _stripLeadingLabel(text) {
    return text
      .replace(/^(?:here(?:'s| is)(?: the)? (?:narration|prose|response|scene|text)[:\s]*\n+)/i, '')
      .replace(/^(?:certainly[!,.]?\s*\n+)/i, '')
      .replace(/^(?:of course[!,.]?\s*\n+)/i, '')
      .replace(/^(?:sure[!,.]?\s*\n+)/i, '')
      .trim();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * parse(rawText, context)
   * Parses raw LLM response into structured result.
   *
   * @param {string} rawText
   * @param {{ type?: 'turn'|'opening'|'resume'|'timeskip'|'combat'|'death'|'invention' }} [context={}]
   * @returns {{ prose: string, paragraphs: string[], wordCount: number, estimatedReadTime: number }}
   */
  function parse(rawText, context = {}) {
    if (!rawText || typeof rawText !== 'string') {
      return { prose: '', paragraphs: [], wordCount: 0, estimatedReadTime: 0 };
    }

    // 1. Strip leading LLM preamble
    let text = _stripLeadingLabel(rawText);

    // 2. Clean mechanical leakage and normalize
    text = cleanProse(text);

    // 3. Split into paragraphs
    const paragraphs = _splitParagraphs(text);

    // 4. Re-join as clean prose (single newlines between paragraphs)
    const prose = paragraphs.join('\n\n');

    const wordCount        = _countWords(prose);
    const estimatedReadTime = _estimateReadTimeSeconds(wordCount);

    return {
      prose,
      paragraphs,
      wordCount,
      estimatedReadTime,
      type: context.type || 'turn',
    };
  }

  /**
   * cleanProse(text)
   * Removes leaked mechanics, fixes spacing, normalizes quotes.
   *
   * @param {string} text
   * @returns {string}
   */
  function cleanProse(text) {
    if (!text || typeof text !== 'string') return '';

    let result = text;

    // 1. Remove mechanical references
    for (const pattern of MECHANIC_PATTERNS) {
      result = result.replace(pattern, '');
    }

    // 2. Normalize em-dashes and en-dashes
    result = result
      .replace(/\s*--\s*/g, '\u2014')          // -- → —
      .replace(/\s*---\s*/g, '\u2014')         // --- → —
      .replace(/(\w)\s*-\s*(\w)/g, '$1-$2');  // preserve hyphenated words

    // 3. Normalize ellipsis
    result = result.replace(/\.{3,}/g, '\u2026'); // ... → …

    // 4. Fix multiple spaces and leading/trailing whitespace per line
    result = result.replace(/[^\S\n]+/g, ' ');    // multiple spaces → one (preserve newlines)
    result = result.replace(/^ +| +$/gm, '');     // trim each line

    // 5. Normalize paragraph breaks (3+ newlines → 2)
    result = result.replace(/\n{3,}/g, '\n\n');

    // 6. Typographic quotes
    result = _applyQuoteReplacement(result);

    // 7. Remove stray bracketed mechanical notes: [Roll: 15], [Skill: Sword 4], etc.
    result = result.replace(/\[(?:Roll|Skill|Stat|Check|DC|XP|HP|Level)[^\]]*\]/gi, '');

    // 8. Final trim
    return result.trim();
  }

  /**
   * validateProse(text)
   * Checks for forbidden content categories.
   *
   * @param {string} text
   * @returns {{ valid: boolean, issues: string[] }}
   */
  function validateProse(text) {
    if (!text || typeof text !== 'string') {
      return { valid: false, issues: ['Empty or non-string input'] };
    }

    const issues = [];

    // Check mechanic leakage
    for (const pattern of MECHANIC_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        issues.push(`Mechanic reference detected: "${match[0]}"`);
        // Reset lastIndex for global patterns
        pattern.lastIndex = 0;
      }
    }

    // Check modern anachronisms
    for (const pattern of ANACHRONISM_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        issues.push(`Possible anachronism: "${match[0]}"`);
        pattern.lastIndex = 0;
      }
    }

    // Check decisions made for Heinrich
    for (const pattern of DECISION_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        issues.push(`Decision made for Heinrich: "${match[0]}"`);
        pattern.lastIndex = 0;
      }
    }

    // Check it's actually second-person
    const firstPersonCount  = (text.match(/\b(?:I am|I was|I have|I will|I felt|I saw)\b/g) || []).length;
    const secondPersonCount = (text.match(/\bYou (?:are|were|have|feel|see|stand|sit|walk)\b/gi) || []).length;
    if (firstPersonCount > secondPersonCount && firstPersonCount > 2) {
      issues.push('Prose appears to be in first-person rather than second-person');
    }

    // Check minimum length
    const wordCount = _countWords(text);
    if (wordCount < 30) {
      issues.push(`Prose is very short (${wordCount} words); likely incomplete`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * extractChoiceSuggestions(prose)
   * Scans prose for natural choice points, returns up to 5 implied action strings.
   * These are suggestions only — the player can always free-type.
   *
   * @param {string} prose
   * @returns {string[]}
   */
  function extractChoiceSuggestions(prose) {
    if (!prose || typeof prose !== 'string') return [];

    const suggestions = new Set();

    // Pattern-based extraction
    for (const pattern of CHOICE_HINT_PATTERNS) {
      let match;
      // Reset lastIndex for global patterns
      const localPattern = new RegExp(pattern.source, pattern.flags);
      while ((match = localPattern.exec(prose)) !== null) {
        const captured = (match[1] || match[0]).trim();
        if (captured.length >= 5 && captured.length <= 80) {
          // Capitalise and clean
          const clean = captured
            .replace(/[.!?,;:]+$/, '')
            .replace(/^(?:to\s+)/i, '')
            .trim();
          if (clean.length >= 4) {
            suggestions.add(_capitalize(clean));
          }
        }
        if (suggestions.size >= 5) break;
      }
      if (suggestions.size >= 5) break;
    }

    // Sentence-ending heuristic: last sentence often implies the next action
    if (suggestions.size < 3) {
      const sentences = prose.split(/(?<=[.!?])\s+/).filter(Boolean);
      const lastSentence = sentences[sentences.length - 1] || '';

      // Look for "The [place] [verb]s" patterns suggesting approach
      const approachMatch = lastSentence.match(/[Tt]he (\w+(?: \w+){0,3}) (?:awaits?|beckons?|looms?)/);
      if (approachMatch) {
        suggestions.add(`Approach the ${approachMatch[1]}`);
      }

      // Look for named NPCs in last two sentences
      const recentText = sentences.slice(-2).join(' ');
      const npcNameMatch = recentText.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b(?:\s+\w+){0,5}(?:waits?|stands?|watches?)/);
      if (npcNameMatch && suggestions.size < 5) {
        suggestions.add(`Speak to ${npcNameMatch[1]}`);
      }
    }

    return Array.from(suggestions).slice(0, 5);
  }

  /**
   * formatForDisplay(prose)
   * Converts prose to HTML with semantic markup.
   *
   * Markup applied:
   *  - Each paragraph → <p>
   *  - Em-dashes properly rendered
   *  - Ellipsis → &hellip;
   *  - Dialogue in <span class="dialogue">
   *  - First sentence of each paragraph's first clause → <span class="sensory-anchor">
   *
   * @param {string} prose
   * @returns {string}  HTML string
   */
  function formatForDisplay(prose) {
    if (!prose || typeof prose !== 'string') return '';

    const paragraphs = _splitParagraphs(prose);

    const htmlParagraphs = paragraphs.map((para, paraIndex) => {
      let html = _escapeHtml(para);

      // 1. Ellipsis
      html = html.replace(/\u2026/g, '&hellip;');
      html = html.replace(/\.\.\./g, '&hellip;');

      // 2. Em-dash
      html = html.replace(/\u2014/g, '&mdash;');

      // 3. En-dash
      html = html.replace(/\u2013/g, '&ndash;');

      // 4. Typographic quotes (may have been escaped, work on the escaped form)
      html = html.replace(/\u201C/g, '&ldquo;').replace(/\u201D/g, '&rdquo;');
      html = html.replace(/\u2018/g, '&lsquo;').replace(/\u2019/g, '&rsquo;');

      // 5. Wrap dialogue in spans
      // Matches "quoted text" with typographic or HTML entity quotes
      html = html.replace(
        /(&ldquo;)((?:[^&]|&(?!rdquo;))*?)(&rdquo;)/g,
        '<span class="dialogue">$1$2$3</span>',
      );
      // Also handle single-quoted dialogue (less common but present)
      html = html.replace(
        /(&lsquo;)((?:[^&]|&(?!rsquo;))*?)(&rsquo;)/g,
        '<span class="dialogue">$1$2$3</span>',
      );

      // 6. Sensory anchor — first sentence of each paragraph
      // Find first sentence (up to first period/exclamation/question that ends a clause)
      const firstSentenceMatch = html.match(/^(.+?(?:[.!?](?:\s|&hellip;|$)))/);
      if (firstSentenceMatch) {
        const firstSentence = firstSentenceMatch[0];
        const rest          = html.slice(firstSentence.length);
        html = `<span class="sensory-anchor">${firstSentence}</span>${rest}`;
      }

      return `<p>${html}</p>`;
    });

    return htmlParagraphs.join('\n');
  }

  /**
   * extractNPCDialogue(prose)
   * Pulls out dialogue lines with speaker attribution.
   *
   * Returns array of { speaker, line } where speaker may be 'unknown' if
   * attribution cannot be determined.
   *
   * @param {string} prose
   * @returns {Array<{ speaker: string, line: string }>}
   */
  function extractNPCDialogue(prose) {
    if (!prose || typeof prose !== 'string') return [];

    const results = [];
    const verbPattern = DIALOGUE_VERBS.join('|');

    // Pattern 1: "Quoted text," Name verbs / Name verbs, "Quoted text"
    // We work on the raw prose (with typographic quotes normalised to ASCII for regex simplicity)
    const normalised = prose
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");

    // Pattern: [Name] [verb], "[dialogue]"  OR  "[dialogue]," [Name] [verb]
    // Also: "[dialogue]" [Name] [verb]s.
    const dialogueBlockRegex = new RegExp(
      // Case A: "Dialogue" Speaker verb
      `"([^"]{1,300})"[,.]?\\s+([A-Z][a-z]+(?:\\s[A-Z][a-z]+)?)\\s+(?:${verbPattern})` +
      '|' +
      // Case B: Speaker verb, "Dialogue" / Speaker verb: "Dialogue"
      `([A-Z][a-z]+(?:\\s[A-Z][a-z]+)?)\\s+(?:${verbPattern})s?[,:]\\s+"([^"]{1,300})"`,
      'g',
    );

    let match;
    while ((match = dialogueBlockRegex.exec(normalised)) !== null) {
      if (match[1] && match[2]) {
        // Case A
        results.push({ speaker: match[2].trim(), line: match[1].trim() });
      } else if (match[3] && match[4]) {
        // Case B
        results.push({ speaker: match[3].trim(), line: match[4].trim() });
      }
    }

    // Pattern 2: any remaining quoted text without clear attribution → 'unknown'
    const quotedOnly = new RegExp(`"([^"]{10,300})"`, 'g');
    const alreadyCaptured = new Set(results.map(r => r.line));

    let qMatch;
    while ((qMatch = quotedOnly.exec(normalised)) !== null) {
      const line = qMatch[1].trim();
      if (!alreadyCaptured.has(line)) {
        // Try to find a nearby name (within 40 chars before or after)
        const start   = Math.max(0, qMatch.index - 40);
        const end     = Math.min(normalised.length, qMatch.index + qMatch[0].length + 40);
        const context = normalised.slice(start, end);
        const nameMatch = context.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(?:the|a|an\s+)?\w*/);
        const speaker   = nameMatch ? nameMatch[1].trim() : 'unknown';

        results.push({ speaker, line });
        alreadyCaptured.add(line);
      }
    }

    return results;
  }

  // ─── Private utility used in extractChoiceSuggestions ─────────────────────
  function _capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ─── Expose public surface ─────────────────────────────────────────────────
  return Object.freeze({
    parse,
    cleanProse,
    validateProse,
    extractChoiceSuggestions,
    formatForDisplay,
    extractNPCDialogue,
  });
})();

// END FILE: client/js/llm/response-parser.js
