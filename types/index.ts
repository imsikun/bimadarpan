export interface State {
  id: number;
  slug: string;
  name: string;
  region: string;
}

export interface StateMetrics {
  id: number;
  state_slug: string;
  fiscal_year: string;
  penetration_pct: number;
  premium_cr: number;
  total_policies: number;
  life_premium_cr: number;
  health_premium_cr: number;
  motor_premium_cr: number;
  claim_ratio_pct: number;
  settlement_ratio_pct: number;
  top_insurer: string;
  leading_type: 'life' | 'health' | 'motor' | 'general';
  majority_category: 'poor' | 'middle' | 'rich';
  data_source: string;
  data_type: 'official' | 'estimated' | 'proxy';
  last_updated: string;
}

export interface StateWithMetrics extends State {
  metrics: StateMetrics | null;
}

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  source_url: string;
  category: 'regulatory' | 'claims' | 'market' | 'scandal' | 'government';
  summary: string;
  published_at: string;
  ingested_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  scenario_context: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  shock_stat: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'jargon' | 'mis-selling' | 'products' | 'claims' | 'regulations' | 'reality-check';
  archetype: 'trap' | 'real-number' | 'agent-script' | 'fine-print' | 'govt-scheme' | 'calculation';
}

export type QuizQuestionClient = Omit<QuizQuestion, 'correct_option'>;

export interface HealthCheckAnswers {
  age: number;
  dependents: number;
  monthly_income: number;
  has_term_insurance: boolean;
  has_health_insurance: boolean;
  health_sum_insured: number;
  has_home_loan: boolean;
  has_critical_illness_cover: boolean;
  employer_provides_health: boolean;
}

export interface CoverageReport {
  score: number;
  grade: 'poor' | 'fair' | 'good' | 'excellent';
  has: string[];
  missing: string[];
  recommended_health_cover: number;
  recommended_term_cover: number;
  estimated_annual_premium_min: number;
  estimated_annual_premium_max: number;
  warning: string;
  summary: string;
}
