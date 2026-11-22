// Official Batangas City hotlines used by the GCare Assistant.
// When a resident asks "who do I call?", the chat answers from this list
// (instead of letting the AI guess numbers).

export const HOTLINES = [
  // Emergency
  { name: '24/7 EBD Emergency Health Hotline', group: 'Emergency', topics: ['medical'], numbers: ['0999-222-6626'] },
  { name: 'BFP Batangas City (Fire)', group: 'Emergency', topics: ['fire'], numbers: ['425-7163', '0915-602-1984'] },
  { name: 'Batangas Component Police Station', group: 'Emergency', topics: ['police'], numbers: ['723-2030', '0916-429-1515', '0999-694-6805'] },
  { name: 'City Disaster Risk Reduction and Management Office (CDRRMO)', group: 'Emergency', topics: ['disaster'], numbers: ['702-3902'] },
  { name: "Mayor's Action Center", group: 'Emergency', topics: ['general'], numbers: ['723-1511'] },

  // Hospitals
  { name: 'Batangas Medical Center', group: 'Hospitals', topics: ['medical'], numbers: ['723-0911'] },
  { name: 'St. Patrick’s Hospital & Medical Center', group: 'Hospitals', topics: ['medical'], numbers: ['723-1605'] },
  { name: 'Jesus of Nazareth Hospital', group: 'Hospitals', topics: ['medical'], numbers: ['723-4144'] },
  { name: 'Golden Gate General Hospital', group: 'Hospitals', topics: ['medical'], numbers: ['723-2508'] },
  { name: 'Batangas Healthcare Specialists Medical Center', group: 'Hospitals', topics: ['medical'], numbers: ['(043) 403-8642'] },
  { name: 'United Doctors of St. Camillus de Lellis Hospital and Medical Center', group: 'Hospitals', topics: ['medical'], numbers: ['0918-994-2074'] },

  // Utilities & services
  { name: 'MERALCO Batangas City', group: 'Utilities & Services', topics: ['power'], numbers: ['16211', '1622-2874'], note: 'Textline: 0920-971-6211 / 0917-551-6211' },
  { name: 'National Power Corporation (National Highway)', group: 'Utilities & Services', topics: ['power'], numbers: ['300-3592'] },
  { name: 'PrimeWater Batangas City', group: 'Utilities & Services', topics: ['water'], numbers: ['0949-414-2633', '980-6928'] },
  { name: 'LTO Batangas City', group: 'Utilities & Services', topics: ['traffic'], numbers: ['740-9738'] },
  { name: 'VAWC Batangas City', group: 'Utilities & Services', topics: ['vawc'], numbers: ['0956-826-7017'] },
];

// A word can appear under more than one topic (e.g. "accident" -> police + medical).
const TOPIC_WORDS = {
  fire: [
    'fire', 'fires', 'sunog', 'nasusunog', 'nasunog', 'sunugin', 'bfp', 'bumbero', 'firefighter', 'firefighters', 'fire truck',
    'burning', 'smoke', 'usok', 'explosion', 'exploded', 'sumabog', 'gas leak', 'lpg', 'short circuit', 'burn', 'burns', 'paso',
  ],
  medical: [
    'ambulance', 'ambulansya', 'medical', 'medic', 'paramedic', 'hospital', 'hospitals', 'ospital', 'pagamutan', 'emergency room', 'er',
    'doctor', 'nurse', 'clinic', 'health hotline', 'health center', 'injured', 'injury', 'hurt', 'wound', 'sugat', 'nasugatan', 'bleeding', 'dugo',
    'ems', 'sick', 'stroke', 'heart attack', 'faint', 'fainted', 'hinimatay', 'unconscious', 'overdose', 'poison', 'poisoned', 'lason',
    'seizure', 'asthma', 'fracture', 'broken bone', 'giving birth', 'labor', 'manganganak', 'burn', 'burns', 'paso',
    'accident', 'aksidente', 'crash', 'collision', 'nabangga', 'banggaan', 'hit and run',
  ],
  police: [
    'police', 'pulis', 'crime', 'criminal', 'theft', 'thief', 'steal', 'stolen', 'nakaw', 'magnanakaw', 'nanakawan', 'robbery', 'robber', 'holdap',
    'hold up', 'burglar', 'snatcher', 'intruder', 'kidnap', 'kidnapped', 'shooting', 'gunshot', 'gun', 'stabbing', 'stabbed', 'saksak', 'fight', 'riot',
    'suspicious', 'threat', 'threatening', 'harassment', 'harassed', 'stalker', 'scam', 'scammer', 'rape', 'raped', 'molest', 'molested', 'sexual assault',
    'abuse', 'abused', 'abusive', 'violence', 'violent', 'battered', 'beat', 'beats', 'beaten', 'beating', 'sinasaktan', 'binubugbog', 'bugbog',
    'road rage', 'reckless driver', 'reckless driving', 'accident', 'aksidente', 'crash', 'collision', 'nabangga', 'banggaan', 'hit and run',
  ],
  power: [
    'electric', 'electricity', 'electrical', 'meralco', 'power', 'power outage', 'kuryente', 'brownout', 'blackout', 'live wire', 'wire', 'wires', 'sparks',
    'transformer', 'poste', 'fallen pole', 'electrocuted', 'napocor', 'npc',
  ],
  water: ['water', 'water interruption', 'tubig', 'walang tubig', 'primewater', 'prime water', 'leak', 'leaking', 'burst pipe', 'pipe', 'faucet'],
  disaster: [
    'disaster', 'calamity', 'kalamidad', 'sakuna', 'drrmo', 'cdrrmo', 'flood', 'flooding', 'flash flood', 'baha', 'typhoon', 'storm', 'bagyo',
    'earthquake', 'lindol', 'landslide', 'tsunami', 'volcano', 'taal', 'ashfall', 'fallen tree', 'trapped', 'stranded', 'evacuate', 'evacuation', 'evacuation center', 'rescue',
  ],
  traffic: [
    'lto', 'license', 'licence', 'driver license', 'driver', 'plate', 'registration', 'traffic', 'traffic violation', 'ticket',
    'road rage', 'reckless driver', 'reckless driving',
  ],
  vawc: [
    'vawc', 'abuse', 'abused', 'abusive', 'violence', 'domestic', 'domestic violence', 'battered', 'beat', 'beats', 'beaten', 'beating', 'sinasaktan', 'binubugbog', 'bugbog',
    'child abuse', 'rape', 'raped', 'molest', 'molested', 'sexual assault', 'harassment', 'harassed',
  ],
  general: ['mayor', 'action center', 'mac', 'city hall'],
};

// Asking for a number / help
const INTENT = /\b(call|calling|hotline|hotlines|number|numbers|contact|contacts|dial|numero|phone|telepono|tawag|tawagan|tatawag|tatawagan)\b/;
const URGENT = /\b(need help|help me|help!|urgent|saklolo|tulong|tulungan|emergency number|emergency contact|nearest|nearby|malapit)\b/;
const GENERIC = /(emergenc|emerhensya|hotline|urgent|saklolo|tulong|tulungan|need help|help me|who (do|should|can|to) (i )?call|who to call)/;

// General "information" questions are left to the AI, e.g. "Are there any flood alerts?" or "How do I report a fire?"
const INFO_Q = /\b(alert|alerts|event|events|volunteer|volunteers|report|reports|news|announcement|announcements|forecast|status|history|tips|safety|prepare|preparedness|drill|prevent|prevention|how do i|how to|how can i|what is|guide)\b/;

const has = (text, word) => new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(text);

// Returns { title, groups: [{ label, items }] } or null if the message isn't asking who to call.
export function findHotlines(message) {
  const text = String(message || '').toLowerCase();
  const topics = Object.keys(TOPIC_WORDS).filter((t) => TOPIC_WORDS[t].some((w) => has(text, w)));
  const intent = INTENT.test(text);
  const info = INFO_Q.test(text);
  const asking = intent || URGENT.test(text);

  let items = null;
  let title = '';
  if (topics.length && (asking || !info)) {
    items = HOTLINES.filter((h) => h.topics.some((t) => topics.includes(t)));
    title = 'Here are the numbers you can call:';
  } else if (GENERIC.test(text) && (intent || !info)) {
    items = HOTLINES;
    title = 'Here are the emergency and service hotlines for Batangas City:';
  }
  if (!items || items.length === 0) return null;

  const labels = [...new Set(items.map((h) => h.group))];
  return {
    title,
    groups: labels.map((label) => ({ label, items: items.filter((h) => h.group === label) })),
  };
}

export const telHref = (n) => `tel:${String(n).replace(/[^\d+]/g, '')}`;