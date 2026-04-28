/**
 * Maps an academic programme name to the standard degree qualification.
 * The mapping is intentionally case-normalised (lower-case keys) so that
 * look-ups are case-insensitive.
 *
 * HOW TO EXTEND
 * -------------
 * Add a new entry below using the lower-cased programme name as the key
 * and the degree abbreviation as the value.  That is all that is required.
 *
 * Example:
 *   'marine biology': 'BSc',
 */
export const PROGRAM_DEGREE_MAP: Record<string, string> = {
  // ── Science & Technology ──────────────────────────────────────────────────
  'computer science': 'BSc',
  'information technology': 'BSc',
  'software engineering': 'BSc',
  mathematics: 'BSc',
  statistics: 'BSc',
  physics: 'BSc',
  chemistry: 'BSc',
  biology: 'BSc',
  biochemistry: 'BSc',
  microbiology: 'BSc',
  'environmental science': 'BSc',
  geology: 'BSc',
  geography: 'BSc',

  // ── Engineering ───────────────────────────────────────────────────────────
  'electrical engineering': 'BEng',
  'electronics engineering': 'BEng',
  'mechanical engineering': 'BEng',
  'civil engineering': 'BEng',
  'chemical engineering': 'BEng',
  'petroleum engineering': 'BEng',
  'agricultural engineering': 'BEng',
  'computer engineering': 'BEng',
  'systems engineering': 'BEng',
  'telecommunications engineering': 'BEng',

  // ── Health Sciences ───────────────────────────────────────────────────────
  'medicine and surgery': 'MBBS',
  medicine: 'MBBS',
  'medical laboratory science': 'BMLS',
  nursing: 'BNSc',
  pharmacy: 'BPharm',
  physiotherapy: 'BPT',
  dentistry: 'BDS',
  'public health': 'BSc',
  nutrition: 'BSc',

  // ── Built Environment ─────────────────────────────────────────────────────
  architecture: 'BArch',
  'urban planning': 'BSc',
  'quantity surveying': 'BSc',
  'estate management': 'BSc',
  'building technology': 'BSc',

  // ── Social Sciences & Humanities ─────────────────────────────────────────
  economics: 'BSc',
  'political science': 'BSc',
  sociology: 'BSc',
  psychology: 'BSc',
  'mass communication': 'BSc',
  journalism: 'BSc',
  'international relations': 'BSc',
  'public administration': 'BSc',
  'business administration': 'BSc',
  marketing: 'BSc',
  accounting: 'BSc',
  banking: 'BSc',
  finance: 'BSc',

  // ── Arts & Humanities ─────────────────────────────────────────────────────
  'english language': 'BA',
  english: 'BA',
  history: 'BA',
  philosophy: 'BA',
  linguistics: 'BA',
  'theatre arts': 'BA',
  'fine arts': 'BFA',
  music: 'BA',
  'religious studies': 'BA',
  'arabic studies': 'BA',
  'french language': 'BA',
  french: 'BA',

  // ── Law ───────────────────────────────────────────────────────────────────
  law: 'LLB',

  // ── Education ─────────────────────────────────────────────────────────────
  education: 'B.Ed',
  'educational management': 'B.Ed',
  'guidance and counselling': 'B.Ed',

  // ── Agriculture ───────────────────────────────────────────────────────────
  agriculture: 'BSc',
  'animal science': 'BSc',
  'crop science': 'BSc',
  forestry: 'BSc',
  fisheries: 'BSc',
  'food science and technology': 'BSc',
  'food science': 'BSc',
};

/**
 * Resolves the degree for a given programme name.
 * Returns an empty string if the programme is not in the mapping.
 */
export function getDegreeForProgram(programName: string): string {
  return PROGRAM_DEGREE_MAP[programName.trim().toLowerCase()] ?? '';
}

/** All programme names in sorted order (useful for autocomplete lists). */
export const PROGRAM_NAMES: string[] = Object.keys(PROGRAM_DEGREE_MAP).sort(
  (a, b) => a.localeCompare(b),
);
