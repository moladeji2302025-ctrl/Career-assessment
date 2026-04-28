/**
 * Departments within the organisation that respondents can be posted to.
 * Add or remove entries here to keep the list current.
 */
export const ORGANIZATION_DEPARTMENTS: string[] = [
  'Software Development',
  'Data Science & Analytics',
  'Product Management',
  'Business Analysis',
  'Quality Assurance',
  'DevOps & Infrastructure',
  'UI/UX Design',
  'Cybersecurity',
  'Finance & Accounting',
  'Human Resources',
  'Marketing & Communications',
  'Operations',
  'Project Management',
  'Customer Success',
  'Research & Development',
  'Legal & Compliance',
];

// ─── Career interests (categorised) ──────────────────────────────────────────

/**
 * Career interest areas grouped by broad category.
 * Used to render the categorised career-interests section in the form.
 * Extend by adding items to an existing category or adding a new category object.
 */
export interface CareerCategory {
  category: string;
  items: string[];
}

export const CAREER_INTERESTS_BY_CATEGORY: CareerCategory[] = [
  {
    category: 'Technology',
    items: [
      'Software Engineering',
      'Web Development (Front-end)',
      'Web Development (Back-end / Full-stack)',
      'Mobile App Development',
      'Data Science & Analytics',
      'Artificial Intelligence / Machine Learning',
      'Cybersecurity',
      'Cloud Computing & Infrastructure',
      'DevOps & Site Reliability Engineering',
      'Blockchain & Web3',
      'Embedded Systems & IoT',
      'Game Development',
      'Database Administration',
      'IT Support & Systems Administration',
    ],
  },
  {
    category: 'Business & Management',
    items: [
      'Business Analysis',
      'Entrepreneurship & Startups',
      'Project Management',
      'Operations Management',
      'Supply Chain & Logistics',
      'Corporate Strategy',
      'Management Consulting',
      'Risk Management',
      'International Business',
    ],
  },
  {
    category: 'Finance',
    items: [
      'Finance & Banking',
      'Investment & Asset Management',
      'Fintech & Digital Payments',
      'Accounting & Auditing',
      'Insurance & Actuarial Science',
      'Tax & Regulatory Compliance',
    ],
  },
  {
    category: 'Creative Arts & Design',
    items: [
      'UI/UX & Product Design',
      'Graphic Design & Branding',
      'Motion Graphics & Animation',
      'Film, TV & Video Production',
      'Photography',
      'Music & Audio Production',
      'Fashion Design',
      'Fine Arts & Illustration',
      'Architecture & Interior Design',
      'Creative Writing & Storytelling',
    ],
  },
  {
    category: 'Marketing & Communications',
    items: [
      'Digital Marketing & SEO',
      'Content Creation & Strategy',
      'Social Media Management',
      'Public Relations & Communications',
      'Brand Management',
      'Advertising',
      'Journalism & Media',
    ],
  },
  {
    category: 'Social Sciences & Humanities',
    items: [
      'International Relations & Diplomacy',
      'Political Science & Governance',
      'Sociology & Community Development',
      'Psychology & Counselling',
      'Philosophy & Ethics',
      'History & Cultural Studies',
      'Development Studies & NGO Work',
      'Social Work',
    ],
  },
  {
    category: 'Sciences & Research',
    items: [
      'Research & Academia',
      'Biomedical Sciences',
      'Environmental Science & Sustainability',
      'Pharmaceutical Research',
      'Food Science & Agriculture',
      'Physics & Engineering Sciences',
      'Chemistry & Materials Science',
    ],
  },
  {
    category: 'Health & Medicine',
    items: [
      'Medicine & Clinical Practice',
      'Nursing & Allied Health',
      'Public Health & Epidemiology',
      'Health Tech & Medical Devices',
      'Mental Health Services',
      'Nutrition & Dietetics',
      'Physiotherapy & Rehabilitation',
    ],
  },
  {
    category: 'Education & Training',
    items: [
      'Teaching & Classroom Education',
      'Educational Technology (EdTech)',
      'Corporate Training & Learning Development',
      'Coaching & Mentoring',
      'Curriculum Development',
    ],
  },
  {
    category: 'Legal & Compliance',
    items: [
      'Law & Legal Practice',
      'Legal Tech',
      'Corporate Governance & Compliance',
      'Human Rights & Advocacy',
      'Intellectual Property & Patents',
    ],
  },
  {
    category: 'Human Resources & Organisational Development',
    items: [
      'Talent Acquisition & Recruitment',
      'Human Resources Management',
      'Organisational Development',
      'Diversity, Equity & Inclusion',
      'Labour Relations',
    ],
  },
  {
    category: 'Public Sector & Policy',
    items: [
      'Public Policy & Administration',
      'Civil Service & Government',
      'Non-Governmental Organisations (NGOs)',
      'Think Tank & Policy Research',
      'International Development',
    ],
  },
];

/**
 * Flat list derived from the categorised map, used for payload serialisation
 * and any legacy code that expects a plain string array.
 */
export const CAREER_INTEREST_OPTIONS: string[] = CAREER_INTERESTS_BY_CATEGORY
  .flatMap((cat) => cat.items);

// ─── Skills ───────────────────────────────────────────────────────────────────

/**
 * Pre-defined enjoyed-skill options.
 * Extend by adding items to the array.
 */
export const ENJOYED_SKILLS_OPTIONS: string[] = [
  // Technical
  'Programming / Coding',
  'Data analysis & interpretation',
  'Systems thinking & architecture',
  'Database management',
  'Research & literature review',
  'Technical writing & documentation',
  'Mathematical reasoning',
  'Statistical modelling',
  // Creative
  'Creative thinking & ideation',
  'Design & visual thinking',
  'Storytelling & narrative',
  'Writing & content creation',
  'Music or audio production',
  'Visual art or illustration',
  // People & Communication
  'Communication & presentation',
  'Public speaking & facilitation',
  'Teaching & mentoring',
  'Negotiation & persuasion',
  'Networking & relationship building',
  'Empathy & active listening',
  'Team leadership & people management',
  // Strategy & Organisation
  'Problem solving & troubleshooting',
  'Critical thinking & evaluation',
  'Project planning & scheduling',
  'Strategic planning',
  'Process improvement & optimisation',
  'Decision making under pressure',
  'Attention to detail & quality control',
  // Business
  'Sales & business development',
  'Financial analysis & budgeting',
  'Marketing & campaign planning',
  'Customer & stakeholder engagement',
];

// ─── Work environment ─────────────────────────────────────────────────────────

export const WORK_ENVIRONMENT_OPTIONS: string[] = [
  'Fully remote',
  'Hybrid (mix of remote and in-office)',
  'On-site / In-office',
  'Flexible / I have no preference',
];

// ─── Motivation ───────────────────────────────────────────────────────────────

/**
 * Primary motivation factors.
 * Extend by adding items to the array.
 */
export const PRIMARY_MOTIVATION_OPTIONS: string[] = [
  'Financial stability and high income',
  'Making a measurable social impact',
  'Continuous learning and professional growth',
  'Creative expression and originality',
  'Recognition, status, and achievement',
  'Work–life balance and personal freedom',
  'Building something of my own (entrepreneurship)',
  'Directly helping individuals day-to-day',
  'Being part of an innovative, fast-moving team',
  'Advancing in a stable, respected career path',
  'Solving complex intellectual challenges',
  'Gaining authority and leadership responsibility',
  'Collaborating with diverse, talented people',
  'Contributing to scientific or academic knowledge',
  'Creating products that delight users',
  'Representing or advocating for a community',
];

// ─── Biggest strength ─────────────────────────────────────────────────────────

export const BIGGEST_STRENGTH_OPTIONS: string[] = [
  'Analytical thinking',
  'Creativity & innovation',
  'Attention to detail',
  'Leadership & influence',
  'Empathy & people skills',
  'Adaptability',
  'Persistence & resilience',
  'Technical aptitude',
];
