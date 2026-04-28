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
  // ── Agriculture ───────────────────────────────────────────────────────────
  agriculture: 'BSc',
  'agricultural economics': 'BSc',
  'agricultural engineering': 'BEng',
  'agricultural extension & rural development': 'BSc',
  'animal production & health': 'BSc',
  'animal science': 'BSc',
  'aquaculture & fisheries management': 'BSc',
  'crop production & protection': 'BSc',
  'crop science': 'BSc',
  fisheries: 'BSc',
  'food science': 'BSc',
  'food science and technology': 'BSc',
  'food science & technology': 'BSc',
  'forestry & wildlife management': 'BSc',
  forestry: 'BSc',
  'home economics': 'BSc',
  horticulture: 'BSc',
  'nutrition & dietetics': 'BSc',
  nutrition: 'BSc',
  'soil science': 'BSc',

  // ── Arts & Humanities ─────────────────────────────────────────────────────
  'arabic studies': 'BA',
  'christian religious studies': 'BA',
  'communication arts': 'BA',
  'creative & cultural studies': 'BA',
  'english language & literature': 'BA',
  'english language': 'BA',
  english: 'BA',
  'fine & applied arts': 'BFA',
  'fine arts': 'BFA',
  french: 'BA',
  'french language': 'BA',
  german: 'BA',
  hausa: 'BA',
  'history & international studies': 'BA',
  history: 'BA',
  igbo: 'BA',
  'islamic studies': 'BA',
  linguistics: 'BA',
  music: 'BA',
  philosophy: 'BA',
  'religious & cultural studies': 'BA',
  'religious studies': 'BA',
  'theatre & performing arts': 'BA',
  'theatre arts': 'BA',
  'visual arts': 'BFA',
  yoruba: 'BA',

  // ── Basic Medical & Health Sciences ──────────────────────────────────────
  anatomy: 'BSc',
  dentistry: 'BDS',
  'human physiology': 'BSc',
  'medical laboratory science': 'BMLS',
  'medical rehabilitation': 'BSc',
  'medicine & surgery': 'MBBS',
  medicine: 'MBBS',
  nursing: 'BNSc',
  optometry: 'BOptom',
  pharmacy: 'BPharm',
  physiotherapy: 'BPT',
  'public health': 'BSc',
  radiography: 'BSc',
  'veterinary medicine': 'DVM',

  // ── Education ─────────────────────────────────────────────────────────────
  'adult & non-formal education': 'B.Ed',
  'biology education': 'B.Ed',
  'business education': 'B.Ed',
  'chemistry education': 'B.Ed',
  'computer science education': 'B.Ed',
  'early childhood education': 'B.Ed',
  'economics education': 'B.Ed',
  'educational administration & planning': 'B.Ed',
  'educational management': 'B.Ed',
  'educational psychology': 'B.Ed',
  education: 'B.Ed',
  'english education': 'B.Ed',
  'french education': 'B.Ed',
  'geography education': 'B.Ed',
  'guidance & counselling': 'B.Ed',
  'health education': 'B.Ed',
  'history education': 'B.Ed',
  'home economics education': 'B.Ed',
  'library & information science': 'BLS',
  'library science': 'BLS',
  'mathematics education': 'B.Ed',
  'physical & health education': 'B.Ed',
  'physics education': 'B.Ed',
  'political science education': 'B.Ed',
  'religious studies education': 'B.Ed',
  'social studies education': 'B.Ed',
  'special education': 'B.Ed',
  'technical & vocational education': 'B.Ed',

  // ── Engineering & Technology ──────────────────────────────────────────────
  'biomedical engineering': 'BEng',
  'chemical engineering': 'BEng',
  'civil engineering': 'BEng',
  'computer engineering': 'BEng',
  'electrical & electronics engineering': 'BEng',
  'electrical engineering': 'BEng',
  'electronics engineering': 'BEng',
  'marine engineering': 'BEng',
  'mechatronics engineering': 'BEng',
  'mechanical engineering': 'BEng',
  'metallurgical & materials engineering': 'BEng',
  'mining engineering': 'BEng',
  'petroleum engineering': 'BEng',
  'production engineering': 'BEng',
  'software engineering': 'BSc',
  'systems engineering': 'BEng',
  'telecommunications engineering': 'BEng',

  // ── Environmental Sciences ────────────────────────────────────────────────
  architecture: 'BArch',
  'building technology': 'BSc',
  'environmental management': 'BSc',
  'environmental science': 'BSc',
  'estate management': 'BSc',
  geomatics: 'BSc',
  geography: 'BSc',
  'industrial design': 'BSc',
  'interior architecture & design': 'BArch',
  'landscape architecture': 'BArch',
  'quantity surveying': 'BSc',
  'surveying & geoinformatics': 'BSc',
  'urban & regional planning': 'BSc',
  'urban planning': 'BSc',

  // ── Law ───────────────────────────────────────────────────────────────────
  law: 'LLB',
  'law (llb)': 'LLB',

  // ── Management Sciences ───────────────────────────────────────────────────
  accounting: 'BSc',
  'actuarial science': 'BSc',
  'banking & finance': 'BSc',
  banking: 'BSc',
  'business administration': 'BSc',
  'business management': 'BSc',
  'cooperative & rural development': 'BSc',
  entrepreneurship: 'BSc',
  finance: 'BSc',
  'hotel & tourism management': 'BSc',
  'human resource management': 'BSc',
  'industrial relations & human resource management': 'BSc',
  insurance: 'BSc',
  'international business': 'BSc',
  management: 'BSc',
  marketing: 'BSc',
  'mass communication': 'BSc',
  'office & information management': 'BSc',
  'public administration': 'BSc',
  taxation: 'BSc',

  // ── Sciences ──────────────────────────────────────────────────────────────
  'applied geophysics': 'BSc',
  biochemistry: 'BSc',
  biology: 'BSc',
  biotechnology: 'BSc',
  chemistry: 'BSc',
  'computer science': 'BSc',
  'earth sciences': 'BSc',
  geology: 'BSc',
  'industrial chemistry': 'BSc',
  'industrial mathematics': 'BSc',
  'industrial physics': 'BSc',
  'information technology': 'BSc',
  mathematics: 'BSc',
  microbiology: 'BSc',
  physics: 'BSc',
  'science laboratory technology': 'BSc',
  statistics: 'BSc',

  // ── Social Sciences ───────────────────────────────────────────────────────
  'conflict & peace studies': 'BSc',
  'criminology & security studies': 'BSc',
  'development studies': 'BSc',
  economics: 'BSc',
  'gender studies': 'BSc',
  'international relations': 'BSc',
  journalism: 'BSc',
  'political science': 'BSc',
  psychology: 'BSc',
  'social work': 'BSc',
  sociology: 'BSc',
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
