/**
 * Scenario-based questions for the Interests & Skills section.
 *
 * PURPOSE
 * -------
 * These are behavioural / situational prompts designed to surface a
 * respondent's natural inclinations, work style, and career-fit signals
 * without explicitly asking them about a job title.  The AI model uses the
 * pattern of responses across all questions to infer personality dimensions
 * (e.g. analytical vs. creative, individual contributor vs. collaborative,
 * people-oriented vs. systems-oriented, etc.).
 *
 * DATA STRUCTURE
 * ---------------
 * Each question has a stable string `id` that becomes the key in the backend
 * `scenarioResponses` payload record.  The `value` of each option is a short
 * lowercase slug — this is what gets stored, not the display label.  This
 * keeps the payload compact and label-independent.
 *
 * HOW TO EXTEND
 * -------------
 * Add a new object to SCENARIO_QUESTIONS.  Give it a unique `id` prefixed
 * with "sq_", write a clear `prompt`, and provide exactly 4 options.
 * Update the validation in AssessmentForm.tsx if you add required questions.
 */

export interface ScenarioOption {
  value: string;
  label: string;
}

export interface ScenarioQuestion {
  id: string;
  prompt: string;
  options: ScenarioOption[];
}

export const SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  {
    id: 'sq_team_approach',
    prompt: 'Your team is given a complex new project. Your first instinct is to…',
    options: [
      { value: 'structure', label: 'Break it into clear tasks and assign responsibilities' },
      { value: 'research', label: 'Deep-dive into research and gather all relevant data' },
      { value: 'innovate', label: 'Brainstorm creative or unconventional approaches' },
      { value: 'stakeholder', label: 'Talk to stakeholders to understand their real expectations' },
    ],
  },
  {
    id: 'sq_energised_by',
    prompt: 'You feel most energised at work when you are…',
    options: [
      { value: 'technical', label: 'Solving a tough technical or analytical puzzle' },
      { value: 'persuasion', label: 'Convincing someone of an important idea' },
      { value: 'creative', label: 'Creating something new — a design, product, or piece of writing' },
      { value: 'organising', label: 'Turning chaos into a clear, organised structure' },
    ],
  },
  {
    id: 'sq_colleague_mistake',
    prompt: 'A colleague makes a serious mistake that could affect the whole team. You…',
    options: [
      { value: 'direct', label: 'Address it directly and professionally with that person' },
      { value: 'fix', label: 'Quietly resolve it yourself to protect the team' },
      { value: 'escalate', label: 'Escalate to leadership to ensure accountability' },
      { value: 'team', label: 'Bring everyone together to work through it collectively' },
    ],
  },
  {
    id: 'sq_free_time',
    prompt: 'Given an unexpected free hour at work, you would most likely…',
    options: [
      { value: 'learn', label: 'Teach yourself a new tool, skill, or concept' },
      { value: 'connect', label: 'Catch up with colleagues and build relationships' },
      { value: 'personal_project', label: 'Work on a personal idea or side project' },
      { value: 'improve', label: 'Review existing processes and spot improvements' },
    ],
  },
  {
    id: 'sq_ideal_project',
    prompt: 'Which type of project excites you the most?',
    options: [
      { value: 'software', label: 'Building a functioning software application or system' },
      { value: 'data', label: 'Analysing a large dataset to uncover hidden patterns' },
      { value: 'design', label: 'Designing a seamless, beautiful user experience' },
      { value: 'strategy', label: 'Developing a market-entry or business strategy' },
    ],
  },
  {
    id: 'sq_explaining',
    prompt: 'When explaining a complex idea to others, you prefer to…',
    options: [
      { value: 'visual', label: 'Draw diagrams or create slides and visual aids' },
      { value: 'document', label: 'Write clear, detailed documentation they can read at their own pace' },
      { value: 'verbal', label: 'Talk through it with real-world stories and examples' },
      { value: 'prototype', label: "Build a quick demo or prototype — show, don't tell" },
    ],
  },
  {
    id: 'sq_success_metric',
    prompt: 'The piece of feedback that matters most to you is…',
    options: [
      { value: 'impact', label: '"This created a real, visible change for people"' },
      { value: 'numbers', label: '"The metrics show significant, measurable improvement"' },
      { value: 'peers', label: '"Your colleagues consider you one of the most skilled"' },
      { value: 'craft', label: '"The final output looks, sounds, or reads beautifully"' },
    ],
  },
  {
    id: 'sq_startup_question',
    prompt: 'A well-funded startup offers you a role. Your first question is about…',
    options: [
      { value: 'tech', label: 'The technology stack and engineering challenges' },
      { value: 'culture', label: "The team culture and the people you'd work with" },
      { value: 'mission', label: 'The social mission and who it ultimately serves' },
      { value: 'growth', label: 'The equity, growth trajectory, and compensation' },
    ],
  },
  {
    id: 'sq_accomplishment',
    prompt: 'You feel most proud and accomplished when you have…',
    options: [
      { value: 'engineered', label: 'Delivered a reliable, well-engineered solution' },
      { value: 'taught', label: 'Helped someone clearly understand something difficult' },
      { value: 'deal', label: 'Closed an important deal or won a negotiation' },
      { value: 'created', label: 'Created something beautiful, novel, or deeply moving' },
    ],
  },
  {
    id: 'sq_deadline',
    prompt: 'When working under an extremely tight deadline, you typically…',
    options: [
      { value: 'systematic', label: 'Focus and work systematically through your task list' },
      { value: 'collaborate', label: 'Quickly coordinate with teammates to split the workload' },
      { value: 'lead', label: 'Take charge and direct others on priorities' },
      { value: 'solo', label: 'Buckle down and push through independently' },
    ],
  },
  {
    id: 'sq_superpower',
    prompt: 'If you could have one professional superpower, it would be…',
    options: [
      { value: 'technical_mastery', label: 'Instantly mastering any technical skill or tool' },
      { value: 'empathy', label: 'Always knowing exactly what people need and feel' },
      { value: 'foresight', label: 'Seeing industry trends and the future with perfect clarity' },
      { value: 'persuasion', label: 'Being able to persuade anyone of any well-reasoned idea' },
    ],
  },
  {
    id: 'sq_societal_impact',
    prompt: 'Your ideal lasting contribution to society would be to…',
    options: [
      { value: 'invention', label: 'Invent or build technology that transforms everyday life' },
      { value: 'policy', label: 'Reshape policies or systems that improve millions of lives' },
      { value: 'enterprise', label: 'Build an enterprise that creates thousands of jobs' },
      { value: 'culture', label: 'Create art, media, or content that moves and unites people' },
    ],
  },
  {
    id: 'sq_disagreement',
    prompt: 'When you disagree with a plan at work, you typically…',
    options: [
      { value: 'data_based', label: 'Gather data and evidence to support an alternative approach' },
      { value: 'dialogue', label: 'Start a conversation and work through differences diplomatically' },
      { value: 'monitor', label: 'Go along but watch closely and document potential failure points' },
      { value: 'redesign', label: 'Redesign the plan entirely and present a better version' },
    ],
  },
  {
    id: 'sq_friends_say',
    prompt: 'Your friends would say you are the person who always…',
    options: [
      { value: 'problem_solver', label: 'Fixes things and comes up with clever solutions' },
      { value: 'connector', label: 'Brings people together and builds community' },
      { value: 'visionary', label: 'Inspires others with big, ambitious ideas' },
      { value: 'organiser', label: 'Keeps everyone on track and the plan on schedule' },
    ],
  },
  {
    id: 'sq_measure_success',
    prompt: 'You prefer to measure your own success primarily by…',
    options: [
      { value: 'quality', label: 'The quality, accuracy, and precision of your work' },
      { value: 'influence', label: 'The number of people you helped or positively influenced' },
      { value: 'financial', label: 'The financial return or commercial value you generated' },
      { value: 'creativity', label: 'The originality and innovative impact of what you produced' },
    ],
  },
  {
    id: 'sq_learning_style',
    prompt: 'When learning something brand new, you prefer to…',
    options: [
      { value: 'hands_on', label: 'Jump straight in and learn by doing and making mistakes' },
      { value: 'reading', label: 'Read extensively before attempting anything' },
      { value: 'observe', label: "Watch an expert demonstrate and then replicate their steps" },
      { value: 'discuss', label: 'Talk it through with someone and ask lots of questions' },
    ],
  },
  {
    id: 'sq_work_style',
    prompt: 'When tackling a large, open-ended task, you tend to…',
    options: [
      { value: 'independent', label: 'Work independently and rely on your own judgment' },
      { value: 'guided', label: 'Appreciate clear guidelines and well-defined parameters' },
      { value: 'collaborative', label: 'Constantly bounce ideas off others throughout' },
      { value: 'flexible', label: 'Adapt your style dynamically to what the task demands' },
    ],
  },
];
