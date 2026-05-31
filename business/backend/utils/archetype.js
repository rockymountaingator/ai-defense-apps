/**
 * SVI Archetype Classifier
 * Maps quadrant + company size + industry to one of 11 buyer archetypes.
 */

const TRADITIONAL_INDUSTRIES = [
  'Manufacturing & Industrial',
  'Retail & E-Commerce',
  'Logistics & Supply Chain',
];

function classifySize(revenue, headcount) {
  if (revenue) {
    if (revenue.includes('50M') || revenue.includes('250M')) return 'enterprise';
    if (revenue.includes('10M')) return 'midmarket';
    return 'smb';
  }
  if (headcount) {
    if (headcount.includes('2,000') || headcount.includes('501')) return 'enterprise';
    if (headcount.includes('101') || headcount.includes('51')) return 'midmarket';
    return 'smb';
  }
  return 'smb';
}

function getArchetype(quadrant, revenue, headcount, industry) {
  const size = classifySize(revenue, headcount);

  // Normalize quadrant name to snake_case key
  const q = quadrant.toLowerCase().replace(/\s+/g, '_').replace(/^the_/, '');

  const map = {
    sitting_duck: {
      enterprise: 'Exposed Enterprise',
      midmarket: 'Sleeping Giant',
      smb: 'Unaware Small Fish',
    },
    experimentalist: {
      enterprise: 'Innovation Theater',
      midmarket: 'Willful Blind',
      smb: 'Nimble Optimist',
    },
    vanguard: {
      enterprise: 'Prepared Giant',
      midmarket: 'Accidental Vanguard',
      smb: 'Nimble Optimist',
    },
    ai_vanguard: {
      enterprise: 'Prepared Giant',
      midmarket: 'Accidental Vanguard',
      smb: 'Nimble Optimist',
    },
    fortress: {
      enterprise: 'Strategic Defender',
      midmarket: 'Regulated Fortress',
      smb: 'Regulated Fortress',
    },
    untapped_fortress: {
      enterprise: 'Strategic Defender',
      midmarket: 'Regulated Fortress',
      smb: 'Regulated Fortress',
    },
    the_experimentalist: {
      enterprise: 'Innovation Theater',
      midmarket: 'Willful Blind',
      smb: 'Nimble Optimist',
    },
  };

  return map[q]?.[size] || 'Unaware Small Fish';
}

module.exports = { getArchetype, classifySize };
