// FILE: client/js/engine/calendar.js — PART 5

'use strict';

/**
 * CALENDAR ENGINE — Date tracking, time advancement, seasons,
 * moon phases, day-of-week, historical event triggers.
 */

const CalendarEngine = (() => {

  // ─── CONSTANTS ────────────────────────────────────────────────────────────
  const MONTHS = [
    { id: 1,  name: 'January',   name_fr: 'Janvier',   days: 31, season: 'winter' },
    { id: 2,  name: 'February',  name_fr: 'Février',   days: 28, season: 'winter' },
    { id: 3,  name: 'March',     name_fr: 'Mars',      days: 31, season: 'spring' },
    { id: 4,  name: 'April',     name_fr: 'Avril',     days: 30, season: 'spring' },
    { id: 5,  name: 'May',       name_fr: 'Mai',       days: 31, season: 'spring' },
    { id: 6,  name: 'June',      name_fr: 'Juin',      days: 30, season: 'summer' },
    { id: 7,  name: 'July',      name_fr: 'Juillet',   days: 31, season: 'summer' },
    { id: 8,  name: 'August',    name_fr: 'Août',      days: 31, season: 'summer' },
    { id: 9,  name: 'September', name_fr: 'Septembre', days: 30, season: 'autumn' },
    { id: 10, name: 'October',   name_fr: 'Octobre',   days: 31, season: 'autumn' },
    { id: 11, name: 'November',  name_fr: 'Novembre',  days: 30, season: 'autumn' },
    { id: 12, name: 'December',  name_fr: 'Décembre',  days: 31, season: 'winter' }
  ];

  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAYS_OF_WEEK_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  const TIME_OF_DAY_SEQUENCE = ['dawn', 'morning', 'midday', 'afternoon', 'evening', 'dusk', 'night', 'deep_night'];

  // Turns per day: 8 (one per time-of-day block)
  const TURNS_PER_DAY = 8;

  const MOON_PHASES = [
    'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
    'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent'
  ];

  // ─── CHURCH CALENDAR ──────────────────────────────────────────────────────
  const CHURCH_CALENDAR = {
    // Fixed feasts
    christmas: { month: 12, day: 25, name: 'Christmas', importance: 'major', effects: { piety_opportunity: true, work_suspended: true } },
    epiphany:  { month: 1,  day: 6,  name: 'Epiphany / Three Kings', importance: 'major' },
    candlemas: { month: 2,  day: 2,  name: 'Candlemas', importance: 'medium', effects: { candle_blessing: true } },
    annunciation: { month: 3, day: 25, name: 'Annunciation', importance: 'medium' },
    john_baptist: { month: 6, day: 24, name: 'St John the Baptist / Midsummer', importance: 'major', effects: { midsummer_fires: true } },
    assumption:{ month: 8,  day: 15, name: 'Assumption of Mary', importance: 'major' },
    michaelmas:{ month: 9,  day: 29, name: 'Michaelmas', importance: 'major', effects: { rents_due: true } },
    allsaints: { month: 11, day: 1,  name: 'All Saints', importance: 'major', effects: { procession: true } },
    martinmas: { month: 11, day: 11, name: 'Martinmas', importance: 'major', effects: { slaughter_season: true } },
    // Easter: moveable — calculate based on year
    // Lent: 40 days before Easter (no meat, fish only, more pious)
  };

  // Historical events (from historical-events.js integration)
  // These are checked by the calendar each turn

  // ─── CORE TICK ────────────────────────────────────────────────────────────

  /**
   * Advance the calendar by one turn (one time-of-day block).
   * Returns { events: [], changed_day: bool, changed_month: bool, changed_year: bool }
   */
  function advanceTurn(calendar) {
    const events = [];
    let changedDay = false, changedMonth = false, changedYear = false;

    // Advance time of day
    const timeIndex = TIME_OF_DAY_SEQUENCE.indexOf(calendar.time_of_day);
    const nextTimeIndex = (timeIndex + 1) % TIME_OF_DAY_SEQUENCE.length;
    calendar.time_of_day = TIME_OF_DAY_SEQUENCE[nextTimeIndex];

    // If we've cycled back to dawn — a new day has begun
    if (nextTimeIndex === 0) {
      changedDay = true;
      calendar.hours_awake = 0; // Reset in health engine
      calendar.hours_since_meal += 24;
      calendar.hours_since_drink += 24;
      calendar.days_elapsed_total = (calendar.days_elapsed_total || 0) + 1;

      // Advance date
      const monthDef = MONTHS[calendar.date.month - 1];
      calendar.date.day++;

      if (calendar.date.day > monthDef.days) {
        calendar.date.day = 1;
        calendar.date.month++;
        changedMonth = true;

        if (calendar.date.month > 12) {
          calendar.date.month = 1;
          calendar.date.year++;
          changedYear = true;
          events.push({ type: 'new_year', year: calendar.date.year });
        }

        calendar.season = getSeason(calendar.date.month);
        if (changedMonth) {
          events.push({ type: 'new_month', month: calendar.date.month, season: calendar.season });
        }
      }

      // Update day of week
      const daysSinceEpoch = _daysSinceEpoch(calendar.date);
      calendar.day_of_week = DAYS_OF_WEEK[daysSinceEpoch % 7];

      // Update moon phase
      calendar.moon_phase = _getMoonPhase(calendar.days_elapsed_total);

      // Check church calendar events
      const churchEvent = _checkChurchCalendar(calendar.date);
      if (churchEvent) events.push({ type: 'church_calendar', event: churchEvent });
    }

    return { events, changedDay, changedMonth, changedYear };
  }

  /**
   * Advance multiple turns at once (for time skips).
   * Returns array of events from each turn advanced.
   */
  function advanceMultipleTurns(calendar, turns) {
    const allEvents = [];
    for (let i = 0; i < turns; i++) {
      const result = advanceTurn(calendar);
      allEvents.push(...result.events);
    }
    return allEvents;
  }

  // ─── DATE UTILITIES ───────────────────────────────────────────────────────

  function getSeason(month) {
    return MONTHS[month - 1]?.season || 'spring';
  }

  function getMonthName(month, french = false) {
    const def = MONTHS[month - 1];
    return french ? def?.name_fr : def?.name;
  }

  function formatDate(date, french = false) {
    const monthName = getMonthName(date.month, french);
    if (french) return `${date.day} ${monthName} ${date.year}`;
    return `${date.day} ${monthName}, ${date.year}`;
  }

  /**
   * Get a medieval-appropriate date description.
   * Medieval people often referenced dates by feast days.
   */
  function getMedievalDateDescription(date) {
    // Check if this is near a major feast day
    for (const [key, feast] of Object.entries(CHURCH_CALENDAR)) {
      if (feast.month === date.month) {
        const diff = date.day - feast.day;
        if (diff === 0) return `the feast of ${feast.name}`;
        if (diff === 1) return `the day after ${feast.name}`;
        if (diff === -1) return `the eve of ${feast.name}`;
        if (diff > 0 && diff <= 7) return `the ${diff}th day after ${feast.name}`;
        if (diff < 0 && diff >= -7) return `${-diff} days before ${feast.name}`;
      }
    }
    // Fallback to secular date
    return `${date.day} ${getMonthName(date.month, true)}`;
  }

  function getDaysInMonth(month, year) {
    if (month === 2 && _isLeapYear(year)) return 29;
    return MONTHS[month - 1]?.days || 30;
  }

  function _isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Get approximate days since a reference epoch (1 Jan 1400).
   * Used for day-of-week calculation.
   */
  function _daysSinceEpoch(date) {
    // Jan 1, 1400 was a Thursday (index 4)
    // Rough approximation for 1400s dates
    const yearDiff = date.year - 1400;
    let days = yearDiff * 365 + Math.floor(yearDiff / 4);
    for (let m = 1; m < date.month; m++) {
      days += MONTHS[m - 1].days;
    }
    days += date.day - 1;
    return days + 4; // offset to get Thursday for Jan 1 1400
  }

  function _getMoonPhase(daysSinceStart) {
    // Moon cycle ~29.5 days, 8 phases
    const cycleDay = daysSinceStart % 30;
    const phaseIndex = Math.floor(cycleDay / 3.75);
    return MOON_PHASES[Math.min(phaseIndex, 7)];
  }

  function _checkChurchCalendar(date) {
    for (const [key, feast] of Object.entries(CHURCH_CALENDAR)) {
      if (feast.month === date.month && feast.day === date.day) {
        return feast;
      }
    }
    return null;
  }

  // ─── SEASON DESCRIPTIONS ─────────────────────────────────────────────────

  /**
   * Get atmospheric season description for LLM prompt context.
   */
  function getSeasonDescription(calendar) {
    const season = getSeason(calendar.date.month);
    const timeOfDay = calendar.time_of_day;

    const descriptions = {
      spring: {
        dawn: 'Birds riot in the hedgerows before the sun is fully up. Mist lies in every low field.',
        morning: 'The morning air is cool and green-smelling, ripe with new growth.',
        midday: 'Spring sun warm on the back, the soil dark and ready.',
        afternoon: 'Bees. Blossoms. The world looks new because it is.',
        evening: 'Long spring evenings. The light lingers later every day.',
        dusk: 'The first swallows cut the dusk sky.',
        night: 'Spring nights cool and clean, full of frog-song.',
        deep_night: 'Still spring night. Stars sharp.'
      },
      summer: {
        dawn: 'Already warm before full light. The air smells of hay and hot stone.',
        morning: 'The summer morning heavy and golden, bees already working.',
        midday: 'Brutal summer midday. The road shimmers. Find shade or suffer.',
        afternoon: 'Long summer afternoon. The flies are relentless.',
        evening: 'Summer evening warm and golden, dust still hanging in the air.',
        dusk: 'The best hour of summer — cool beginning to arrive, light still lingering.',
        night: 'Summer night thick with cricket-song and the smell of warm earth.',
        deep_night: 'Even deep night is warm. The stars are enormous.'
      },
      autumn: {
        dawn: 'Autumn dawn grey and cold. Breath mists. The trees are turning.',
        morning: 'Autumn morning with low sun through colored leaves.',
        midday: 'Thin autumn sun. Not enough warmth to lift the chill.',
        afternoon: 'The afternoons get shorter. The dark comes earlier every day.',
        evening: 'Autumn evening cold. The smell of woodsmoke from every chimney.',
        dusk: 'Autumn dusk red and brief.',
        night: 'Autumn night cold and clear, the stars bright beyond the bare branches.',
        deep_night: 'Deep autumn night — frost by morning, probably.'
      },
      winter: {
        dawn: 'Winter dawn grey and reluctant. Ice on puddles. Fingers stiff.',
        morning: 'A clear winter morning — beautiful, deadly cold.',
        midday: 'Winter midday thin and pale. Not enough sun to warm anything.',
        afternoon: 'The winter afternoon already darkening before it began.',
        evening: 'Winter evening dark by the fifth hour. The fire is everything.',
        dusk: 'Winter dusk comes fast and final.',
        night: 'Winter night absolute. The cold has weight.',
        deep_night: 'The coldest hour. Between midnight and dawn. Everything hurts.'
      }
    };

    return descriptions[season]?.[timeOfDay] || 'The day passes.';
  }

  /**
   * Get agricultural implications of the current season.
   * Affects what tasks NPCs are doing and what makes sense for Heinrich.
   */
  function getSeasonalContext(calendar) {
    const season = getSeason(calendar.date.month);
    const month = calendar.date.month;

    const contexts = {
      spring: {
        work: 'Plowing, planting, lambing, shearing',
        food_availability: 'sparse — stores running low, game available',
        lord_demands: 'High — spring plowing requires all hands',
        travel_conditions: 'improving — roads soft with mud'
      },
      summer: {
        work: 'Weeding, hay cutting, early harvest of some crops',
        food_availability: 'improving — foraging good, markets stocked',
        lord_demands: 'Moderate — hay harvest all hands',
        travel_conditions: 'best — roads dry and firm'
      },
      autumn: {
        work: 'Grain harvest, apple picking, pig slaughter, root storage',
        food_availability: 'abundant — harvest time',
        lord_demands: 'Very high — harvest requires all available labor',
        travel_conditions: 'good but deteriorating as rains return'
      },
      winter: {
        work: 'Indoor crafts, wood cutting, repair, survival',
        food_availability: 'depends on stored reserves — may be scarce',
        lord_demands: 'Low — little field work',
        travel_conditions: 'difficult — cold, mud or ice, short days'
      }
    };

    return contexts[season] || contexts.spring;
  }

  // ─── EXPORTS ──────────────────────────────────────────────────────────────

  return {
    MONTHS,
    DAYS_OF_WEEK,
    DAYS_OF_WEEK_FR,
    TIME_OF_DAY_SEQUENCE,
    TURNS_PER_DAY,
    MOON_PHASES,
    CHURCH_CALENDAR,
    advanceTurn,
    advanceMultipleTurns,
    getSeason,
    getMonthName,
    formatDate,
    getMedievalDateDescription,
    getDaysInMonth,
    getSeasonDescription,
    getSeasonalContext
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CalendarEngine };
}

// END FILE: client/js/engine/calendar.js
