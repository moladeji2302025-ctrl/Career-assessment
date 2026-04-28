/**
 * Scenario-based interest questions for the assessment.
 *
 * Each question presents a real-world scenario and a set of answer options.
 * The answers are designed to surface interests, working styles, and values
 * without asking directly — making the data richer for the AI analysis model.
 *
 * HOW TO EXTEND
 * -------------
 * Add a new object to the SCENARIO_QUESTIONS array following the same shape.
 * Use a unique, stable `id` string (used as the key in `scenarioResponses`).
 */

export interface ScenarioOption {
  value: string;
  label: string;
}

export interface ScenarioQuestion {
  id: string;
  question: string;
  options: ScenarioOption[];
}

export const SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  {
    id: 'sq_problem_solving',
    question:
      'You are working on a difficult task and hit a wall. You are most likely to:',
    options: [
      { value: 'search_and_experiment', label: 'Search online and experiment until I find a solution' },
      { value: 'break_down_methodically', label: 'Break the problem into smaller parts and tackle each one methodically' },
      { value: 'ask_for_guidance', label: 'Ask a colleague or mentor for guidance' },
      { value: 'creative_unconventional', label: 'Step back, think creatively, and try an unconventional approach' },
      { value: 'document_and_escalate', label: 'Document what I know and escalate to someone with more expertise' },
    ],
  },
  {
    id: 'sq_team_role',
    question: 'In a group project, you naturally gravitate toward the role of:',
    options: [
      { value: 'organiser', label: 'The organiser — making sure everyone knows what to do and when' },
      { value: 'ideas_person', label: 'The ideas person — generating creative concepts and approaches' },
      { value: 'analyst', label: 'The analyst — researching, evaluating, and making sense of data' },
      { value: 'mediator', label: 'The mediator — keeping the team harmonious and communication flowing' },
      { value: 'executor', label: 'The executor — getting things done efficiently and reliably' },
    ],
  },
  {
    id: 'sq_free_saturday',
    question: 'You have a free Saturday with no obligations. You are most likely to spend it:',
    options: [
      { value: 'learning_project', label: 'Learning a new skill or working on a personal project' },
      { value: 'outdoors_physical', label: 'Exploring nature, exercising, or a physical hobby' },
      { value: 'creating', label: 'Creating something — art, music, writing, or crafting' },
      { value: 'socialising', label: 'Socialising — catching up with friends or family' },
      { value: 'volunteering', label: 'Volunteering or helping someone in my community' },
    ],
  },
  {
    id: 'sq_ideal_workday',
    question: 'Your ideal workday mostly involves:',
    options: [
      { value: 'technical_building', label: 'Solving technical problems and building systems or models' },
      { value: 'communicating', label: 'Communicating with clients, partners, or team members' },
      { value: 'research_analysis', label: 'Analysing data, writing reports, or doing in-depth research' },
      { value: 'leading_strategising', label: 'Leading meetings, making strategic decisions, and guiding others' },
      { value: 'content_creation', label: 'Creating visual or written content and presenting ideas' },
    ],
  },
  {
    id: 'sq_pride_moment',
    question: 'You feel most proud of yourself when you:',
    options: [
      { value: 'build_create', label: 'Build or create something that did not exist before' },
      { value: 'help_others', label: 'Help someone solve a problem or reach a goal' },
      { value: 'earn_recognition', label: 'Earn recognition for your expertise or knowledge' },
      { value: 'deliver_on_time', label: 'Deliver a project ahead of schedule and within budget' },
      { value: 'convince_others', label: 'Convince others to adopt a better idea or approach' },
    ],
  },
  {
    id: 'sq_social_impact',
    question: 'If you could make a major difference in Nigeria or Africa, you would focus on:',
    options: [
      { value: 'education', label: 'Improving access to quality education' },
      { value: 'technology_infra', label: 'Developing technology and digital infrastructure' },
      { value: 'health_systems', label: 'Strengthening health systems and medical services' },
      { value: 'agriculture_food', label: 'Growing agriculture and food security' },
      { value: 'economic_opportunity', label: 'Creating more economic opportunities and jobs' },
    ],
  },
  {
    id: 'sq_complexity',
    question: 'When given a complex problem, you tend to:',
    options: [
      { value: 'love_complexity', label: 'Love the complexity — it is energising and gives me room to shine' },
      { value: 'simplify_framework', label: 'Break it down into a simple framework before proceeding' },
      { value: 'research_adapt', label: 'Research what others have done and adapt their solutions' },
      { value: 'involve_others', label: 'Involve others immediately to tackle it collaboratively' },
      { value: 'systematic_work_through', label: 'Find it challenging but work through it systematically' },
    ],
  },
  {
    id: 'sq_feedback',
    question: 'When someone challenges or criticises your work, you usually:',
    options: [
      { value: 'reflect_adjust', label: 'Listen carefully, reflect, and adjust if their point is valid' },
      { value: 'defend_counter', label: 'Immediately defend my reasoning and present counter-evidence' },
      { value: 'motivated_prove', label: 'Feel motivated to prove them wrong by doing even better' },
      { value: 'welcome_actively', label: 'Welcome it openly — I actively seek out critical feedback' },
      { value: 'difficult_but_accept', label: 'Find it difficult initially but eventually take it on board' },
    ],
  },
  {
    id: 'sq_communication',
    question: 'When explaining a complex idea to a non-expert, you prefer to:',
    options: [
      { value: 'visual_aids', label: 'Use diagrams, charts, or visual aids' },
      { value: 'story_analogy', label: 'Tell a story or real-life analogy to make it relatable' },
      { value: 'step_by_step', label: 'Walk them through the logic step by step' },
      { value: 'summary_then_detail', label: 'Give them a summary first, then detail if they want more' },
      { value: 'respond_to_questions', label: 'Let them ask questions and respond to those specifically' },
    ],
  },
  {
    id: 'sq_risk_tolerance',
    question:
      'You are offered a promising but uncertain opportunity that requires leaving your comfort zone. You are most likely to:',
    options: [
      { value: 'take_immediately', label: 'Take it immediately — high risk, high reward' },
      { value: 'research_first', label: 'Research thoroughly before deciding' },
      { value: 'discuss_trusted', label: 'Discuss it with trusted people before committing' },
      { value: 'negotiate_reduce_risk', label: 'Negotiate to reduce the risk before accepting' },
      { value: 'decline_stable', label: 'Decline — I prefer a steady, predictable path for now' },
    ],
  },
  {
    id: 'sq_learning_style',
    question: 'When learning something new, you prefer:',
    options: [
      { value: 'video_demos', label: 'Watching video tutorials or demonstrations' },
      { value: 'reading_docs', label: 'Reading books, articles, or documentation' },
      { value: 'learning_by_doing', label: 'Jumping in and learning by doing' },
      { value: 'class_workshop', label: 'Attending a class or workshop with an instructor' },
      { value: 'peer_mentor', label: 'Learning alongside a peer or mentor' },
    ],
  },
  {
    id: 'sq_long_term_identity',
    question: 'In 10 years, your ideal professional identity is:',
    options: [
      { value: 'expert_authority', label: 'A recognised expert or authority in my field' },
      { value: 'founder_owner', label: 'A founder or business owner' },
      { value: 'senior_leader', label: 'A senior leader who shapes the direction of an organisation' },
      { value: 'community_impact', label: 'Someone who has made a visible impact on my community' },
      { value: 'creative_professional', label: 'A creative professional known for original work' },
    ],
  },
  {
    id: 'sq_tools_enjoy',
    question: 'In your day-to-day work, you most enjoy working with:',
    options: [
      { value: 'technology_data', label: 'Technology, software, or data' },
      { value: 'people_clients', label: 'People — clients, colleagues, or communities' },
      { value: 'ideas_strategy', label: 'Ideas, concepts, and strategic thinking' },
      { value: 'physical_tangible', label: 'Physical or tangible materials and processes' },
      { value: 'words_visuals_storytelling', label: 'Words, visuals, or storytelling media' },
    ],
  },
  {
    id: 'sq_decision_making',
    question: 'When making an important decision, you primarily rely on:',
    options: [
      { value: 'data_evidence', label: 'Data and evidence' },
      { value: 'intuition_gut', label: 'Intuition and gut feeling' },
      { value: 'advice_trusted', label: 'Advice from people I trust' },
      { value: 'pros_cons_analysis', label: 'A structured pros-and-cons analysis' },
      { value: 'values_principles', label: 'Values and principles that matter to me' },
    ],
  },
  {
    id: 'sq_energy_drain',
    question: 'After a full day of the following, which would leave you most drained?',
    options: [
      { value: 'back_to_back_meetings', label: 'Back-to-back meetings and social interactions' },
      { value: 'solo_technical_work', label: 'Working alone on a technical or analytical problem' },
      { value: 'repetitive_tasks', label: 'Repetitive, routine tasks with no variety' },
      { value: 'managing_conflict', label: 'Managing conflict or difficult conversations' },
      { value: 'administrative_tasks', label: 'Handling administrative or bureaucratic processes' },
    ],
  },
  {
    id: 'sq_side_project',
    question: 'If you started a side project tomorrow, it would most likely be:',
    options: [
      { value: 'tech_product_app', label: 'A tech product or app that solves a problem I\'ve noticed' },
      { value: 'creative_content_channel', label: 'A creative content channel (blog, podcast, YouTube, etc.)' },
      { value: 'community_social_enterprise', label: 'A community initiative or social enterprise' },
      { value: 'small_business_trade', label: 'A small business or trade' },
      { value: 'research_writing', label: 'A research or writing project on a topic I care about' },
    ],
  },
  {
    id: 'sq_achievement_type',
    question: 'Which type of achievement gives you the most satisfaction?',
    options: [
      { value: 'public_recognition', label: 'Winning a competition or being recognised publicly' },
      { value: 'personal_challenge', label: 'Completing a personally challenging project' },
      { value: 'mentee_success', label: 'Seeing someone I mentored or helped succeed' },
      { value: 'large_audience_impact', label: 'Having my work reach and impact a large audience' },
      { value: 'financial_reward', label: 'Earning a significant financial reward' },
    ],
  },
  {
    id: 'sq_conflict_resolution',
    question: 'When there is a disagreement in your team about the best approach, you:',
    options: [
      { value: 'data_logic', label: 'Present data or logical arguments to settle it objectively' },
      { value: 'find_middle_ground', label: 'Try to find a middle ground everyone can accept' },
      { value: 'defer_to_expert', label: 'Defer to the most experienced person in the room' },
      { value: 'make_final_call', label: 'Step up and make a final call to keep things moving' },
      { value: 'suggest_more_research', label: 'Suggest taking more time to research before deciding' },
    ],
  },
  {
    id: 'sq_new_skill',
    question: 'When asked to do something outside your current skill set, you:',
    options: [
      { value: 'excited_start_learning', label: 'Get excited and immediately start researching how to learn it' },
      { value: 'anxious_but_push', label: 'Feel anxious but push through and figure it out' },
      { value: 'ask_for_help_first', label: 'Ask for help or training before starting' },
      { value: 'delegate_if_possible', label: 'Delegate it if possible to someone better suited' },
      { value: 'do_best_flag', label: 'Do my best but flag to the team that I may need support' },
    ],
  },
  {
    id: 'sq_work_rhythm',
    question: 'You do your best work when:',
    options: [
      { value: 'tight_deadlines', label: 'Working under tight deadlines with high pressure' },
      { value: 'deep_focus_time', label: 'Given plenty of time for deep focus and reflection' },
      { value: 'close_collaboration', label: 'Collaborating closely with a team' },
      { value: 'autonomous_schedule', label: 'Given autonomy to structure my own time' },
      { value: 'varied_tasks', label: 'Working on multiple varied tasks that keep things interesting' },
    ],
  },
];
