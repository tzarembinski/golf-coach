export const SWING_POSITIONS = {
  ADDRESS: 'address',
  TOP: 'top',
  IMPACT: 'impact',
  FOLLOW_THROUGH: 'follow_through',
};

export const SWING_POSITION_LABELS = {
  [SWING_POSITIONS.ADDRESS]: 'Address',
  [SWING_POSITIONS.TOP]: 'Top',
  [SWING_POSITIONS.IMPACT]: 'Impact',
  [SWING_POSITIONS.FOLLOW_THROUGH]: 'Follow-Through',
};

export const SWING_POSITION_DESCRIPTIONS = {
  [SWING_POSITIONS.ADDRESS]: 'Setup position before starting the swing',
  [SWING_POSITIONS.TOP]: 'Top of the backswing',
  [SWING_POSITIONS.IMPACT]: 'Moment of club-ball contact',
  [SWING_POSITIONS.FOLLOW_THROUGH]: 'Finish position after impact',
};

export const SCORE_COLORS = {
  excellent: 'text-green-600',
  good: 'text-golf-green-600',
  average: 'text-yellow-600',
  poor: 'text-orange-600',
  verypoor: 'text-red-600',
};

export const SCORE_BG_COLORS = {
  excellent: 'bg-green-100',
  good: 'bg-golf-green-100',
  average: 'bg-yellow-100',
  poor: 'bg-orange-100',
  verypoor: 'bg-red-100',
};

/**
 * Get score category based on score value
 * @param {number} score - Score from 0-100
 * @returns {string} Score category
 */
export const getScoreCategory = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'average';
  if (score >= 40) return 'poor';
  return 'verypoor';
};
