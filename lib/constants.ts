export const STATE_SLUGS = [
  'andhra-pradesh', 'arunachal-pradesh', 'assam', 'bihar', 'chhattisgarh',
  'goa', 'gujarat', 'haryana', 'himachal-pradesh', 'jharkhand', 'karnataka',
  'kerala', 'madhya-pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
  'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil-nadu',
  'telangana', 'tripura', 'uttar-pradesh', 'uttarakhand', 'west-bengal',
  'delhi', 'jammu-kashmir', 'ladakh',
] as const;

export const NEWS_CATEGORIES = {
  regulatory: 'Regulatory',
  claims:     'Claims',
  market:     'Market',
  scandal:    'Scandal',
  government: 'Government',
} as const;

export const NEWS_CATEGORY_COLORS: Record<string, string> = {
  regulatory: 'badge--purple',
  claims:     'badge--teal',
  market:     'badge--saffron',
  scandal:    'badge--red',
  government: 'badge--neutral',
};

export const QUIZ_ARCHETYPES = [
  'trap', 'real-number', 'agent-script', 'fine-print', 'govt-scheme', 'calculation',
] as const;

export const CURRENT_FISCAL_YEAR = 'FY25';

export const TOPOJSON_URL = '/india-states.json';
export const TOPOJSON_FALLBACK = 'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json';
