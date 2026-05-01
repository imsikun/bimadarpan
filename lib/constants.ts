export const STATE_SLUGS = [
  'andhra-pradesh', 'arunachal-pradesh', 'assam', 'bihar', 'chhattisgarh',
  'goa', 'gujarat', 'haryana', 'himachal-pradesh', 'jharkhand', 'karnataka',
  'kerala', 'madhya-pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
  'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil-nadu',
  'telangana', 'tripura', 'uttar-pradesh', 'uttarakhand', 'west-bengal',
  'delhi', 'jammu-kashmir', 'ladakh',
] as const;

export const SLUG_TO_STATE: Record<string, { name: string; region: string }> = {
  'andhra-pradesh':    { name: 'Andhra Pradesh',    region: 'South'     },
  'arunachal-pradesh': { name: 'Arunachal Pradesh',  region: 'Northeast' },
  'assam':             { name: 'Assam',              region: 'Northeast' },
  'bihar':             { name: 'Bihar',              region: 'East'      },
  'chhattisgarh':      { name: 'Chhattisgarh',       region: 'Central'   },
  'goa':               { name: 'Goa',                region: 'West'      },
  'gujarat':           { name: 'Gujarat',             region: 'West'      },
  'haryana':           { name: 'Haryana',             region: 'North'     },
  'himachal-pradesh':  { name: 'Himachal Pradesh',   region: 'North'     },
  'jharkhand':         { name: 'Jharkhand',           region: 'East'      },
  'karnataka':         { name: 'Karnataka',           region: 'South'     },
  'kerala':            { name: 'Kerala',              region: 'South'     },
  'madhya-pradesh':    { name: 'Madhya Pradesh',      region: 'Central'   },
  'maharashtra':       { name: 'Maharashtra',         region: 'West'      },
  'manipur':           { name: 'Manipur',             region: 'Northeast' },
  'meghalaya':         { name: 'Meghalaya',           region: 'Northeast' },
  'mizoram':           { name: 'Mizoram',             region: 'Northeast' },
  'nagaland':          { name: 'Nagaland',            region: 'Northeast' },
  'odisha':            { name: 'Odisha',              region: 'East'      },
  'punjab':            { name: 'Punjab',              region: 'North'     },
  'rajasthan':         { name: 'Rajasthan',           region: 'North'     },
  'sikkim':            { name: 'Sikkim',              region: 'Northeast' },
  'tamil-nadu':        { name: 'Tamil Nadu',          region: 'South'     },
  'telangana':         { name: 'Telangana',           region: 'South'     },
  'tripura':           { name: 'Tripura',             region: 'Northeast' },
  'uttar-pradesh':     { name: 'Uttar Pradesh',       region: 'North'     },
  'uttarakhand':       { name: 'Uttarakhand',         region: 'North'     },
  'west-bengal':       { name: 'West Bengal',         region: 'East'      },
  'delhi':             { name: 'Delhi',               region: 'North'     },
  'jammu-kashmir':     { name: 'Jammu & Kashmir',     region: 'North'     },
  'ladakh':            { name: 'Ladakh',              region: 'North'     },
};

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
