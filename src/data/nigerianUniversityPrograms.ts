/**
 * Nigerian University Programmes — curated from National Universities Commission
 * (NUC) accredited programme lists and Benchmark Minimum Academic Standards (BMAS)
 * documents (https://www.nuc.edu.ng).
 *
 * CURATION STRATEGY
 * -----------------
 * • Only programmes with broad accreditation across multiple Nigerian institutions
 *   are included; highly specialised or rarely-offered variants are merged into
 *   the most common name.
 * • Programme names are normalised to Title Case reflecting NUC usage.
 * • Programmes are grouped by the conventional Nigerian university faculty
 *   structure.  A small number of programmes (e.g. "Mass Communication") may
 *   legitimately belong to more than one faculty; they appear under their most
 *   common faculty assignment, and the flat NIGERIAN_PROGRAMME_NAMES list is
 *   deduplicated automatically.
 *
 * SOURCE
 * ------
 * National Universities Commission (NUC) — https://www.nuc.edu.ng
 *   "List of Approved Programmes" and "Benchmark Minimum Academic Standards"
 *   documents (publicly available on the NUC website, last reviewed 2024).
 *
 * HOW TO EXTEND
 * -------------
 * Add an entry under the appropriate faculty object below.  If the programme
 * is also studied by NYSC corp members and is not yet in programDegreeMapping.ts,
 * add the corresponding degree entry there as well.
 */

export interface ProgrammeCategory {
  faculty: string;
  programmes: string[];
}

export const NIGERIAN_UNIVERSITY_PROGRAMMES: ProgrammeCategory[] = [
  {
    faculty: 'Agriculture',
    programmes: [
      'Agricultural Economics',
      'Agricultural Extension & Rural Development',
      'Animal Production & Health',
      'Animal Science',
      'Aquaculture & Fisheries Management',
      'Crop Production & Protection',
      'Food Science & Technology',
      'Forestry & Wildlife Management',
      'Home Economics',
      'Horticulture',
      'Nutrition & Dietetics',
      'Soil Science',
    ],
  },
  {
    faculty: 'Arts & Humanities',
    programmes: [
      'Arabic Studies',
      'Christian Religious Studies',
      'Communication Arts',
      'Creative & Cultural Studies',
      'English Language & Literature',
      'Fine & Applied Arts',
      'French',
      'German',
      'Hausa',
      'History & International Studies',
      'Igbo',
      'Islamic Studies',
      'Linguistics',
      'Music',
      'Philosophy',
      'Religious & Cultural Studies',
      'Theatre & Performing Arts',
      'Visual Arts',
      'Yoruba',
    ],
  },
  {
    faculty: 'Basic Medical & Health Sciences',
    programmes: [
      'Anatomy',
      'Dentistry',
      'Human Physiology',
      'Medical Laboratory Science',
      'Medical Rehabilitation',
      'Medicine & Surgery',
      'Nursing',
      'Optometry',
      'Pharmacy',
      'Physiotherapy',
      'Public Health',
      'Radiography',
      'Veterinary Medicine',
    ],
  },
  {
    faculty: 'Education',
    programmes: [
      'Adult & Non-Formal Education',
      'Biology Education',
      'Business Education',
      'Chemistry Education',
      'Computer Science Education',
      'Early Childhood Education',
      'Economics Education',
      'Educational Administration & Planning',
      'Educational Psychology',
      'English Education',
      'French Education',
      'Geography Education',
      'Guidance & Counselling',
      'Health Education',
      'History Education',
      'Home Economics Education',
      'Library & Information Science',
      'Mathematics Education',
      'Physical & Health Education',
      'Physics Education',
      'Political Science Education',
      'Religious Studies Education',
      'Social Studies Education',
      'Special Education',
      'Technical & Vocational Education',
    ],
  },
  {
    faculty: 'Engineering & Technology',
    programmes: [
      'Agricultural Engineering',
      'Biomedical Engineering',
      'Chemical Engineering',
      'Civil Engineering',
      'Computer Engineering',
      'Electrical & Electronics Engineering',
      'Marine Engineering',
      'Mechatronics Engineering',
      'Mechanical Engineering',
      'Metallurgical & Materials Engineering',
      'Mining Engineering',
      'Petroleum Engineering',
      'Production Engineering',
      'Software Engineering',
      'Systems Engineering',
      'Telecommunications Engineering',
    ],
  },
  {
    faculty: 'Environmental Sciences',
    programmes: [
      'Architecture',
      'Building Technology',
      'Environmental Management',
      'Estate Management',
      'Geomatics',
      'Industrial Design',
      'Interior Architecture & Design',
      'Landscape Architecture',
      'Quantity Surveying',
      'Surveying & Geoinformatics',
      'Urban & Regional Planning',
    ],
  },
  {
    faculty: 'Law',
    programmes: ['Law (LLB)'],
  },
  {
    faculty: 'Management Sciences',
    programmes: [
      'Accounting',
      'Actuarial Science',
      'Banking & Finance',
      'Business Administration',
      'Business Management',
      'Cooperative & Rural Development',
      'Entrepreneurship',
      'Finance',
      'Hotel & Tourism Management',
      'Human Resource Management',
      'Industrial Relations & Human Resource Management',
      'Insurance',
      'International Business',
      'Management',
      'Marketing',
      'Mass Communication',
      'Office & Information Management',
      'Public Administration',
      'Taxation',
    ],
  },
  {
    faculty: 'Sciences',
    programmes: [
      'Applied Geophysics',
      'Biochemistry',
      'Biology',
      'Biotechnology',
      'Chemistry',
      'Computer Science',
      'Earth Sciences',
      'Environmental Science',
      'Geology',
      'Industrial Chemistry',
      'Industrial Mathematics',
      'Industrial Physics',
      'Information Technology',
      'Mathematics',
      'Microbiology',
      'Physics',
      'Science Laboratory Technology',
      'Statistics',
    ],
  },
  {
    faculty: 'Social Sciences',
    programmes: [
      'Conflict & Peace Studies',
      'Criminology & Security Studies',
      'Development Studies',
      'Economics',
      'Gender Studies',
      'Geography',
      'International Relations',
      'Journalism',
      'Political Science',
      'Psychology',
      'Social Work',
      'Sociology',
    ],
  },
];

/** Flat list of all programme names, sorted alphabetically and deduplicated. */
export const NIGERIAN_PROGRAMME_NAMES: string[] = NIGERIAN_UNIVERSITY_PROGRAMMES
  .flatMap((cat) => cat.programmes)
  .filter((v, i, arr) => arr.indexOf(v) === i)
  .sort((a, b) => a.localeCompare(b));
