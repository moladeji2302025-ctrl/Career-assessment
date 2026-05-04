/**
 * A named group of sub-departments within the organisation.
 * Used to render an <optgroup> in the department dropdown.
 */
export interface OrganizationDepartmentGroup {
  group: string;
  departments: string[];
}

/**
 * Hierarchical department structure for the organisation.
 * Each entry represents a parent department with its sub-departments.
 * Add or remove entries here to keep the list current.
 */
export const ORGANIZATION_DEPARTMENTS: OrganizationDepartmentGroup[] = [
  {
    group: 'MD',
    departments: ["MD's office", 'Procurement'],
  },
  {
    group: 'Engineering',
    departments: [
      'Technical services',
      'Innovation',
      'IT',
      'SCC',
      'NOC',
      'Broadband',
    ],
  },
  {
    group: 'Marketing and Admin',
    departments: [
      'Human capital management/HR',
      'Account',
      'Audit',
      'Admin',
      'Maintenance',
    ],
  },
];

// ─── Career interest categories ───────────────────────────────────────────────

/**
 * A named group of related career interest areas.
 * Displayed with a visible category header in the form.
 */
export interface CareerCategory {
  category: string;
  careers: string[];
}

/**
 * Categorised career interest areas for the interests & skills section.
 * Organised into Arts, Tech, Social Sciences, Sciences, Management,
 * Business, and additional relevant categories.
 *
 * HOW TO EXTEND
 * -------------
 * Add a new string to an existing category's `careers` array, or add a new
 * category object.  The UI renders each category with a header automatically.
 */
export const CAREER_INTEREST_CATEGORIES: CareerCategory[] = [
  {
    category: 'Technology & Engineering',
    careers: [
      'Software Engineering',
      'Web Development (Frontend)',
      'Web Development (Backend)',
      'Full-Stack Development',
      'Mobile App Development',
      'Data Science & Analytics',
      'Artificial Intelligence / Machine Learning',
      'Cloud Computing & Infrastructure',
      'Cybersecurity',
      'DevOps & Site Reliability Engineering',
      'Blockchain & Web3',
      'Embedded Systems & IoT',
      'Game Development',
      'Database Administration',
      'Network Engineering',
      'AR / VR Development',
      'IT Support & Systems Administration',
      'Robotics & Automation',
      'Quantum Computing',
    ],
  },
  {
    category: 'Design & Product',
    careers: [
      'UX / Product Design',
      'UI Design',
      'Graphic Design',
      'Motion Graphics & Animation',
      'Industrial Design',
      'Product Management',
      'Brand Design',
      'Interaction Design',
    ],
  },
  {
    category: 'Sciences',
    careers: [
      'Research & Academia',
      'Laboratory Science',
      'Environmental Science',
      'Health Research & Epidemiology',
      'Physics & Applied Sciences',
      'Chemistry & Materials Science',
      'Biology & Biotechnology',
      'Astronomy & Astrophysics',
      'Forensic Science',
      'Geology & Earth Sciences',
      'Marine Science',
      'Climate Science & Meteorology',
      'Agricultural Research',
      'Food Science & Technology',
    ],
  },
  {
    category: 'Health & Medicine',
    careers: [
      'Medicine & Surgery',
      'Nursing & Midwifery',
      'Pharmacy',
      'Public Health',
      'Biomedical Research',
      'Mental Health & Counselling',
      'Physiotherapy & Rehabilitation',
      'Nutrition & Dietetics',
      'Dentistry & Oral Health',
      'Medical Imaging & Radiology',
      'Health Tech',
      'Veterinary Medicine',
      'Occupational Therapy',
      'Medical Laboratory Science',
    ],
  },
  {
    category: 'Social Sciences',
    careers: [
      'Sociology & Social Work',
      'Psychology & Behavioural Sciences',
      'Political Science & Governance',
      'International Relations & Diplomacy',
      'Development Studies',
      'Criminal Justice & Law Enforcement',
      'Community Development',
      'Anthropology',
      'Peace & Conflict Studies',
      'Gender Studies',
      'Urban Planning & Development',
    ],
  },
  {
    category: 'Arts & Creative Industries',
    careers: [
      'Creative Writing & Literature',
      'Fine Arts & Visual Arts',
      'Music & Performance',
      'Film & Media Production',
      'Theatre & Drama',
      'Linguistics & Language Studies',
      'Philosophy & Ethics',
      'Fashion Design',
      'Photography & Visual Content',
      'Interior Design',
      'Cultural Studies',
      'Sculpture & Ceramics',
      'Dance & Choreography',
    ],
  },
  {
    category: 'Communication & Media',
    careers: [
      'Journalism & News Media',
      'Advertising & Public Relations',
      'Content Creation & Digital Media',
      'Broadcast Media (TV / Radio)',
      'Social Media & Influencer Marketing',
      'Publishing & Editorial',
      'Copywriting & Technical Writing',
      'Podcast Production',
    ],
  },
  {
    category: 'Management & Strategy',
    careers: [
      'Business Administration & Management',
      'Project Management',
      'Human Resource Management',
      'Operations Management',
      'Supply Chain & Logistics',
      'Quality Assurance & Control',
      'Risk Management',
      'Strategy & Management Consulting',
      'Change Management',
      'Organisational Development',
    ],
  },
  {
    category: 'Business & Finance',
    careers: [
      'Accounting & Auditing',
      'Banking & Finance',
      'Investment & Capital Markets',
      'Insurance',
      'Fintech & Digital Banking',
      'Entrepreneurship & Startups',
      'Marketing & Growth',
      'Sales & Business Development',
      'Real Estate & Property Management',
      'E-Commerce & Retail',
      'Taxation & Fiscal Policy',
      'Microfinance & Development Finance',
    ],
  },
  {
    category: 'Law & Policy',
    careers: [
      'Legal Practice & Litigation',
      'Corporate Law',
      'Human Rights & Advocacy',
      'Policy & Government',
      'Compliance & Regulatory Affairs',
      'Intellectual Property Law',
      'International Law',
      'Environmental Law',
    ],
  },
  {
    category: 'Education & Training',
    careers: [
      'Teaching & Education',
      'Educational Technology (EdTech)',
      'Curriculum Development',
      'Academic Research',
      'Corporate Training & Development',
      'Early Childhood Education',
      'Special Needs Education',
    ],
  },
  {
    category: 'Agriculture & Environment',
    careers: [
      'Agricultural Science & Farming',
      'Agribusiness & Food Systems',
      'Environmental Management',
      'Climate & Sustainability',
      'Horticulture & Crop Production',
      'Fisheries & Aquaculture',
      'Forestry & Wildlife Conservation',
      'Renewable Energy & Clean Tech',
      'Waste Management & Recycling',
      'Water Resources Management',
    ],
  },
  {
    category: 'Architecture & Built Environment',
    careers: [
      'Architecture & Structural Design',
      'Civil & Infrastructure Engineering',
      'Quantity Surveying',
      'Estate & Property Management',
      'Building & Construction Management',
      'Land Surveying & Geomatics',
    ],
  },
  {
    category: 'Hospitality & Tourism',
    careers: [
      'Hotel & Hospitality Management',
      'Tourism & Travel Management',
      'Event Planning & Management',
      'Culinary Arts & Food Service',
      'Sports Management',
      'Recreation & Leisure Management',
    ],
  },
];

// ─── Enjoyed skills ───────────────────────────────────────────────────────────

/**
 * Skills respondents may genuinely enjoy using.
 * Substantially expanded to cover a wide range of skill types.
 * Extend by adding items to the array.
 */
export const ENJOYED_SKILLS_OPTIONS: string[] = [
  // Cognitive & analytical
  'Problem solving',
  'Critical thinking',
  'Analytical reasoning',
  'Data analysis',
  'Research & investigation',
  'Strategic planning',
  'Systems thinking',
  'Financial modelling & budgeting',
  'Pattern recognition',

  // Technical & digital
  'Programming / Coding',
  'Database management',
  'Cloud & server administration',
  'Cybersecurity & ethical hacking',
  'Data visualisation',
  'Machine learning & AI tools',
  'Web or app development',
  'Video editing & post-production',
  'Graphic design & visual tools',

  // Communication & interpersonal
  'Communication & writing',
  'Public speaking & presenting',
  'Negotiation & persuasion',
  'Active listening',
  'Conflict resolution',
  'Storytelling & content creation',
  'Copywriting & editing',
  'Teaching / Mentoring',
  'Networking & relationship building',

  // Creative & design
  'Creative thinking & ideation',
  'Design & visual thinking',
  'Illustration & drawing',
  'Music composition or performance',
  'Crafting & making things by hand',
  'Photography or videography',
  'Fashion & styling',

  // Leadership & management
  'Leadership & team management',
  'Project planning & coordination',
  'Decision making under pressure',
  'Delegation & resource allocation',
  'Change management',
  'Coaching & developing others',

  // Personal effectiveness
  'Attention to detail',
  'Time management & organisation',
  'Adaptability & flexibility',
  'Self-motivation & discipline',
  'Empathy & emotional intelligence',
  'Teamwork & collaboration',
  'Initiative & proactiveness',
  'Multitasking',

  // Field / domain specific
  'Scientific experimentation',
  'Medical or clinical assessment',
  'Legal research & drafting',
  'Farming & agronomy',
  'Sales & customer engagement',
  'Event planning & logistics',
  'Community organising',
  'Policy analysis & advocacy',
];

// ─── Work environment options ─────────────────────────────────────────────────

export const WORK_ENVIRONMENT_OPTIONS: string[] = [
  'Fully remote',
  'Hybrid (mix of remote and in-office)',
  'On-site / In-office',
  'Flexible / I have no preference',
];

// ─── Primary motivation options ───────────────────────────────────────────────

/**
 * Motivating factors at work.
 * Extend by adding items to the array.
 */
export const PRIMARY_MOTIVATION_OPTIONS: string[] = [
  'Financial stability / high income',
  'Making a social impact',
  'Continuous learning & growth',
  'Creative expression',
  'Recognition & achievement',
  'Work–life balance',
  'Building something of my own',
  'Helping others directly',
  'Job security & stability',
  'Autonomy & independence',
  'Collaboration & sense of community',
  'Career advancement & promotions',
  'Solving challenging problems',
  'Meaningful & purposeful work',
  'Innovation & working on cutting-edge things',
  'Global exposure & international opportunities',
  'Flexibility in schedule and location',
  'Mentorship & being guided by experts',
  'Status & prestige within my industry',
  'Leaving a lasting legacy',
];

// ─── Biggest strength options ─────────────────────────────────────────────────

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
