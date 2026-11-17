export const ALERT_LEVELS = {
  critical: { label: 'Critical', color: '#a00000' },
  warning: { label: 'Warning', color: '#c2570c' },
  advisory: { label: 'Advisory', color: '#2f6f9f' },
};

export const ALERTS = [
  {
    id: 'a1',
    level: 'critical',
    title: 'Heavy Rainfall Advisory',
    area: 'Batangas Province',
    issuedAt: '2026-11-07T10:30:00',
    active: true,
    body: [
      'Heavy to intense rainfall is expected over Batangas Province in the next 24 hours. Flooding and landslides are possible in low-lying and mountainous areas.',
      'Residents near rivers and slopes should prepare to evacuate. Keep your emergency kit ready, charge your phone, and follow instructions from your local DRRMO.',
    ],
  },
  {
    id: 'a2',
    level: 'warning',
    title: 'Possible Flooding Along Balagtas River',
    area: 'Golden Country Homes',
    issuedAt: '2026-11-07T08:15:00',
    active: true,
    body: [
      'Water levels along Balagtas River are rising due to continuous rain. Low-lying streets near the river may flood within the next few hours.',
      'Move vehicles and appliances to higher ground and avoid crossing flooded roads.',
    ],
  },
  {
    id: 'a3',
    level: 'advisory',
    title: 'Scheduled Water Service Interruption',
    area: 'Central area',
    issuedAt: '2026-11-06T14:00:00',
    active: true,
    body: [
      'Water service may be temporarily unavailable in selected areas due to scheduled maintenance and system improvement works.',
      'Store enough water for essential household needs before the interruption starts.',
    ],
  },
  {
    id: 'a4',
    level: 'advisory',
    title: 'Classes Suspended Due to Severe Weather',
    area: 'Batangas City',
    issuedAt: '2026-11-06T06:30:00',
    active: false,
    body: [
      'Classes in selected schools and educational institutions were suspended due to severe weather conditions.',
      'Classes have resumed. Check your school for updates.',
    ],
  },
];