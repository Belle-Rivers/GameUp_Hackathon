/**
 * @type {Record<number, {cases: number, timeLimitSeconds: number, mechanics: string[]}>}
 */
export const CAMPAIGN_DAYS = {
  1: {
    cases: 5,
    timeLimitSeconds: 120,
    mechanics: ['basic receipts', 'rulebook keys', 'single action per citizen'],
  },
  2: {
    cases: 6,
    timeLimitSeconds: 100,
    mechanics: ['possible fraud', 'compost kit eligibility', 'multiple actions'],
  },
  3: {
    cases: 7,
    timeLimitSeconds: 90,
    mechanics: ['cool roof permit', 'AC threshold unknown', 'final day pressure'],
  },
};

export {};