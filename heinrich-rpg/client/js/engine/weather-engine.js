// FILE: client/js/engine/weather-engine.js — PART 5

'use strict';

/**
 * WEATHER ENGINE — Weather state machine. Reads weather-data.js for types
 * and probabilities. Drives all weather-related modifiers in the game.
 */

const WeatherEngine = (() => {

  // ─── WEATHER TYPE DEFINITIONS ─────────────────────────────────────────────
  // (Full definitions live in weather-data.js; this engine manages state)

  const SEASON_WEIGHTS = {
    spring: {
      clear:          0.15,
      partly_cloudy:  0.20,
      overcast:       0.20,
      light_rain:     0.20,
      heavy_rain:     0.10,
      thunderstorm:   0.05,
      fog:            0.08,
      windy:          0.02
    },
    summer: {
      clear:          0.30,
      partly_cloudy:  0.25,
      overcast:       0.10,
      light_rain:     0.10,
      heavy_rain:     0.05,
      thunderstorm:   0.10,
      fog:            0.03,
      heat_wave:      0.07
    },
    autumn: {
      clear:          0.12,
      partly_cloudy:  0.15,
      overcast:       0.25,
      light_rain:     0.20,
      heavy_rain:     0.12,
      thunderstorm:   0.05,
      fog:            0.08,
      windy:          0.03
    },
    winter: {
      clear:          0.10,
      partly_cloudy:  0.10,
      overcast:       0.25,
      light_rain:     0.10,
      heavy_rain:     0.08,
      fog:            0.10,
      snow:           0.15,
      blizzard:       0.05,
      freezing_rain:  0.07
    }
  };

  // Temperature ranges by season (°C)
  const TEMPERATURE_PROFILES = {
    spring:  { min: 5,   max: 18, avg: 11 },
    summer:  { min: 16,  max: 32, avg: 22 },
    autumn:  { min: 3,   max: 16, avg: 9  },
    winter:  { min: -8,  max: 6,  avg: -1 }
  };

  // Weather impact on game systems
  const WEATHER_EFFECTS = {
    clear:       { travel: +15, combat: 0,   agriculture: +5,  hunting: +10, morale: +5, archery: +10 },
    partly_cloudy:{ travel: +5, combat: 0,   agriculture: +5,  hunting: +5,  morale: +2, archery: +5 },
    overcast:    { travel: 0,   combat: 0,   agriculture: 0,   hunting: 0,   morale: -2, archery: 0 },
    light_rain:  { travel: -5,  combat: -5,  agriculture: +10, hunting: -10, morale: -5, archery: -10, stealth: +10 },
    heavy_rain:  { travel: -20, combat: -15, agriculture: +5,  hunting: -20, morale: -15,archery: -25, stealth: +15, fire_chance: -50 },
    thunderstorm:{ travel: -40, combat: -25, agriculture: -5,  hunting: -30, morale: -25,archery: -40, fire_chance: -80, horse_ridden: -20 },
    fog:         { travel: -15, combat: -10, agriculture: 0,   hunting: -15, morale: -8, archery: -30, stealth: +25, ambush_chance: +20 },
    windy:       { travel: -5,  combat: -5,  agriculture: -5,  hunting: -5,  morale: -5, archery: -20, sailing: +15 },
    heat_wave:   { travel: -20, combat: -20, agriculture: -20, hunting: -15, morale: -20,hunger_drain: +50, thirst_drain: +100, fatigue_drain: +50 },
    snow:        { travel: -30, combat: -15, agriculture: -30, hunting: -20, morale: -15,hunger_drain: +30, thirst_drain: -10 },
    blizzard:    { travel: -70, combat: -40, agriculture: -50, hunting: -50, morale: -40,hunger_drain: +80, thirst_drain: -20, shelter_critical: true },
    freezing_rain:{ travel:-45, combat: -30, agriculture: -20, hunting: -30, morale: -30,horse_injury_risk: +20 }
  };

  // ─── WEATHER STATE MACHINE ────────────────────────────────────────────────

  /**
   * Initialize weather state from a season.
   */
  function initWeather(season) {
    const type = _weightedWeatherRoll(season);
    const temp = _generateTemperature(type, season);
    return {
      type,
      temperature: _tempLabel(temp),
      temperature_celsius: temp,
      wind: _generateWind(type),
      precipitation: _getPrecipitationType(type),
      visibility: _getVisibility(type),
      special: _getSpecialCondition(type),
      consecutive_days_same_type: 1,
      forecast_next: _weightedWeatherRoll(season)
    };
  }

  /**
   * Generate new weather. Called once per day.
   * Weather has inertia — more likely to continue the same weather pattern.
   */
  function generateDailyWeather(currentWeather, season) {
    const continuationChance = Math.max(0.2, 0.7 - (currentWeather.consecutive_days_same_type * 0.1));

    let newType;
    if (DiceEngine.chance(continuationChance)) {
      // Continue current weather
      newType = currentWeather.type;
    } else {
      // Roll new weather
      newType = _weatherTransition(currentWeather.type, season);
    }

    const temp = _generateTemperature(newType, season);

    const newWeather = {
      type: newType,
      temperature: _tempLabel(temp),
      temperature_celsius: temp,
      wind: _generateWind(newType),
      precipitation: _getPrecipitationType(newType),
      visibility: _getVisibility(newType),
      special: _getSpecialCondition(newType),
      consecutive_days_same_type: newType === currentWeather.type
        ? currentWeather.consecutive_days_same_type + 1
        : 1,
      forecast_next: _weightedWeatherRoll(season)
    };

    return newWeather;
  }

  // ─── WEATHER EFFECT QUERIES ─────────────────────────────────────────────

  /**
   * Get all current weather modifiers as situational mod array.
   */
  function getWeatherMods(weatherType, activity) {
    const effects = WEATHER_EFFECTS[weatherType] || {};
    const value = effects[activity] || 0;
    if (value === 0) return [];
    return [{ label: `Weather (${weatherType})`, value }];
  }

  /**
   * Get weather description for narrative.
   */
  function getWeatherNarrative(weather) {
    const narratives = {
      clear:        'The sky is clear and blue. Visibility complete.',
      partly_cloudy:'Light clouds scud across a mostly-blue sky.',
      overcast:     'Flat grey sky, dull light. No warmth in it.',
      light_rain:   'Light, persistent rain. Everything damp. Roads turning to mud.',
      heavy_rain:   'Heavy rain hammering down. Visibility poor. Travelling miserable.',
      thunderstorm: 'A violent storm. Lightning. Horses frightened. The road is a river.',
      fog:          'Thick fog. Cannot see twenty paces. The world reduces to shapes.',
      windy:        'A hard, cold wind. It leans against you all day.',
      heat_wave:    'Brutal heat. The air shimmers. Every man and beast suffers.',
      snow:         'Snow falling steadily. The world goes white and quiet.',
      blizzard:     'A blizzard. Survival outdoors is not guaranteed. Find shelter.',
      freezing_rain:'Freezing rain — more dangerous than snow. Everything coats with ice.'
    };
    return narratives[weather.type] || 'Unremarkable weather.';
  }

  /**
   * Assess travel risk given current weather.
   */
  function getTravelRisk(weather) {
    const effect = WEATHER_EFFECTS[weather.type]?.travel || 0;
    if (effect <= -50) return { risk: 'extreme', description: 'Do not travel. Lives at risk.' };
    if (effect <= -30) return { risk: 'high',    description: 'Very difficult. Strong risk of injury or delay.' };
    if (effect <= -15) return { risk: 'moderate',description: 'Hard going. Expect delays and discomfort.' };
    if (effect <= -5)  return { risk: 'low',     description: 'Somewhat unpleasant but manageable.' };
    return { risk: 'none', description: 'Safe to travel.' };
  }

  /**
   * Check if this weather is suitable for a given action.
   */
  function isSuitableFor(weatherType, activity) {
    const effects = WEATHER_EFFECTS[weatherType] || {};
    const impact = effects[activity] || 0;
    return {
      suitable: impact > -15,
      impact,
      note: impact <= -30 ? 'Strongly inadvisable' : impact <= -15 ? 'Difficult' : impact >= 10 ? 'Advantageous' : 'Manageable'
    };
  }

  // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

  function _weightedWeatherRoll(season) {
    const weights = SEASON_WEIGHTS[season] || SEASON_WEIGHTS.spring;
    return DiceEngine.weightedChoice(
      Object.entries(weights).map(([type, prob]) => ({ type, probability: prob }))
    )?.type || 'overcast';
  }

  function _weatherTransition(currentType, season) {
    // Transitions: most weather types can go to adjacent types
    const transitions = {
      clear:         ['partly_cloudy', 'clear', 'windy'],
      partly_cloudy: ['clear', 'overcast', 'partly_cloudy', 'light_rain'],
      overcast:      ['partly_cloudy', 'overcast', 'light_rain', 'fog'],
      light_rain:    ['overcast', 'light_rain', 'heavy_rain', 'clear'],
      heavy_rain:    ['light_rain', 'heavy_rain', 'thunderstorm'],
      thunderstorm:  ['heavy_rain', 'overcast'],
      fog:           ['overcast', 'partly_cloudy', 'fog'],
      windy:         ['clear', 'partly_cloudy', 'overcast'],
      heat_wave:     ['clear', 'partly_cloudy', 'heat_wave'],
      snow:          ['overcast', 'snow', 'blizzard', 'clear'],
      blizzard:      ['snow', 'overcast'],
      freezing_rain: ['light_rain', 'overcast', 'snow']
    };
    const options = transitions[currentType] || ['overcast'];
    // Filter for season-appropriate options
    const seasonWeights = SEASON_WEIGHTS[season] || {};
    const possible = options.filter(t => seasonWeights[t] !== undefined || t === currentType);
    return possible.length > 0
      ? possible[DiceEngine.randInt(0, possible.length - 1)]
      : _weightedWeatherRoll(season);
  }

  function _generateTemperature(weatherType, season) {
    const profile = TEMPERATURE_PROFILES[season] || TEMPERATURE_PROFILES.spring;
    let base = DiceEngine.randInt(profile.min, profile.max);
    if (weatherType === 'heat_wave') base = Math.min(profile.max + 8, 40);
    if (weatherType === 'blizzard') base = Math.max(profile.min - 10, -15);
    if (weatherType === 'snow') base = Math.min(profile.min + 2, 1);
    return base;
  }

  function _tempLabel(celsius) {
    if (celsius <= -5) return 'freezing';
    if (celsius <= 3)  return 'bitter_cold';
    if (celsius <= 10) return 'cold';
    if (celsius <= 17) return 'cool';
    if (celsius <= 23) return 'mild';
    if (celsius <= 28) return 'warm';
    return 'hot';
  }

  function _generateWind(weatherType) {
    const windMap = {
      clear: 'light', partly_cloudy: 'light', overcast: 'moderate',
      light_rain: 'moderate', heavy_rain: 'strong', thunderstorm: 'violent',
      fog: 'calm', windy: 'strong', heat_wave: 'very_light',
      snow: 'moderate', blizzard: 'violent', freezing_rain: 'strong'
    };
    return windMap[weatherType] || 'light';
  }

  function _getPrecipitationType(weatherType) {
    const precip = {
      clear: 'none', partly_cloudy: 'none', overcast: 'none',
      light_rain: 'light_rain', heavy_rain: 'heavy_rain', thunderstorm: 'heavy_rain',
      fog: 'none', windy: 'none', heat_wave: 'none',
      snow: 'snow', blizzard: 'heavy_snow', freezing_rain: 'ice'
    };
    return precip[weatherType] || 'none';
  }

  function _getVisibility(weatherType) {
    const vis = {
      clear: 'excellent', partly_cloudy: 'good', overcast: 'good',
      light_rain: 'moderate', heavy_rain: 'poor', thunderstorm: 'very_poor',
      fog: 'terrible', windy: 'good', heat_wave: 'good',
      snow: 'poor', blizzard: 'near_zero', freezing_rain: 'poor'
    };
    return vis[weatherType] || 'good';
  }

  function _getSpecialCondition(weatherType) {
    if (weatherType === 'blizzard') return 'shelter_required';
    if (weatherType === 'heat_wave') return 'heat_exhaustion_risk';
    if (weatherType === 'thunderstorm') return 'lightning_risk';
    if (weatherType === 'freezing_rain') return 'ice_hazard';
    return null;
  }

  // ─── EXPORTS ─────────────────────────────────────────────────────────────

  return {
    SEASON_WEIGHTS,
    TEMPERATURE_PROFILES,
    WEATHER_EFFECTS,
    initWeather,
    generateDailyWeather,
    getWeatherMods,
    getWeatherNarrative,
    getTravelRisk,
    isSuitableFor
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WeatherEngine };
}

// END FILE: client/js/engine/weather-engine.js
