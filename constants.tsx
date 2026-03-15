
import React from 'react';
import { AssetCard, Mission } from './types';

export const RISK_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

export const PLAYER_COLORS = [
  '#ff0000', // Red Emperor
  '#3b82f6', // Shadow Czar
  '#22c55e', // Rising General
  '#eab308', // Chief Dealer
  '#a855f7', // Eternal Marshal
  '#f97316', // Subcontinental Strategist
  '#ec4899', // Union Chancellor
  '#78350f', // Desert Crown
  '#71717a', // Silicon Emperor
];

export const MISSION_LIST: Mission[] = [
  { id: 'm1', type: 'continent', description: 'Conquer Europe, Australia, and one other continent', targetContinents: ['Europe', 'Australia'], extraContinentsCount: 1 },
  { id: 'm2', type: 'continent', description: 'Conquer Europe, South America, and one other continent', targetContinents: ['Europe', 'South America'], extraContinentsCount: 1 },
  { id: 'm3', type: 'continent', description: 'Conquer North America and Africa', targetContinents: ['North America', 'Africa'] },
  { id: 'm4', type: 'continent', description: 'Conquer Asia and South America', targetContinents: ['Asia', 'South America'] },
  { id: 'm5', type: 'continent', description: 'Conquer North America and Australia', targetContinents: ['North America', 'Australia'] },
  { id: 'm6', type: 'continent', description: 'Conquer Asia and Africa', targetContinents: ['Asia', 'Africa'] },
  { id: 'm7', type: 'elimination', description: 'Eliminate the Red Emperor forces', targetPlayerColor: '#ff0000' },
  { id: 'm8', type: 'elimination', description: 'Eliminate the Shadow Czar forces', targetPlayerColor: '#3b82f6' },
  { id: 'm9', type: 'elimination', description: 'Eliminate the Rising General forces', targetPlayerColor: '#22c55e' },
  { id: 'm10', type: 'elimination', description: 'Eliminate the Chief Dealer forces', targetPlayerColor: '#eab308' },
  { id: 'm11', type: 'elimination', description: 'Eliminate the Eternal Marshal forces', targetPlayerColor: '#a855f7' },
  { id: 'm12', type: 'elimination', description: 'Eliminate the Subcontinental Strategist forces', targetPlayerColor: '#f97316' },
  { id: 'm13', type: 'elimination', description: 'Eliminate the Union Chancellor forces', targetPlayerColor: '#ec4899' },
  { id: 'm14', type: 'elimination', description: 'Eliminate the Desert Crown forces', targetPlayerColor: '#78350f' },
  { id: 'm15', type: 'elimination', description: 'Eliminate the Silicon Emperor forces', targetPlayerColor: '#71717a' },
  { id: 'm16', type: 'territory_count', description: 'Conquer 24 territories of your choice', territoryCount: 24 }
];

export const ICONS = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/>
      <rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/>
      <rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  ),
  Alert: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
  ),
  Brain: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z"/>
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  ),
  Sword: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
      <line x1="13" y1="19" x2="19" y2="13"/>
      <line x1="16" y1="16" x2="20" y2="20"/>
      <line x1="19" y1="21" x2="20" y2="20"/>
      <line x1="20" y1="20" x2="21" y2="19"/>
    </svg>
  ),
  Dice: {
    '1': "M74.5 36A38.5 38.5 0 0 0 36 74.5v363A38.5 38.5 0 0 0 74.5 476h363a38.5 38.5 0 0 0 38.5-38.5v-363A38.5 38.5 0 0 0 437.5 36h-363zM256 206a50 50 0 0 1 0 100 50 50 0 0 1 0-100z",
    '2': "M74.5 36A38.5 38.5 0 0 0 36 74.5v363A38.5 38.5 0 0 0 74.5 476h363a38.5 38.5 0 0 0 38.5-38.5v-363A38.5 38.5 0 0 0 437.5 36h-363zm316.97 36.03A50 50 0 0 1 440 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm-268 268A50 50 0 0 1 172 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97z",
    '3': "M74.5 36A38.5 38.5 0 0 0 36 74.5v363A38.5 38.5 0 0 0 74.5 476h363a38.5 38.5 0 0 0 38.5-38.5v-363A38.5 38.5 0 0 0 437.5 36h-363zm316.97 36.03A50 50 0 0 1 440 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zM256 206a50 50 0 0 1 0 100 50 50 0 0 1 0-100zM123.47 340.03A50 50 0 0 1 172 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97z",
    '4': "M74.5 36A38.5 38.5 0 0 0 36 74.5v363A38.5 38.5 0 0 0 74.5 476h363a38.5 38.5 0 0 0 38.5-38.5v-363A38.5 38.5 0 0 0 437.5 36h-363zm48.97 36.03A50 50 0 0 1 172 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm268 0A50 50 0 0 1 440 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm-268 268A50 50 0 0 1 172 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm268 0A50 50 0 0 1 440 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97z",
    '5': "M74.5 36A38.5 38.5 0 0 0 36 74.5v363A38.5 38.5 0 0 0 74.5 476h363a38.5 38.5 0 0 0 38.5-38.5v-363A38.5 38.5 0 0 0 437.5 36h-363zm48.97 36.03A50 50 0 0 1 172 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm268 0A50 50 0 0 1 440 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zM256 206a50 50 0 0 1 0 100 50 50 0 0 1 0-100zM123.47 340.03A50 50 0 0 1 172 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm268 0A50 50 0 0 1 440 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97z",
    '6': "M74.5 36A38.5 38.5 0 0 0 36 74.5v363A38.5 38.5 0 0 0 74.5 476h363a38.5 38.5 0 0 0 38.5-38.5v-363A38.5 38.5 0 0 0 437.5 36h-363zm48.97 36.03A50 50 0 0 1 172 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm268 0A50 50 0 0 1 440 122a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zM122 206a50 50 0 0 1 0 100 50 50 0 0 1 0-100zm268 0a50 50 0 0 1 0 100 50 50 0 0 1 0-100zM123.47 340.03A50 50 0 0 1 172 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97zm268 0A50 50 0 0 1 440 390a50 50 0 0 1-100 0 50 50 0 0 1 51.47-49.97z"
  },
  Tank: () => "M130.613 43.002v66.926c-22.925 19.7-38.03 48.177-40.533 80.252h234.51c-2.666-34.175-19.637-64.265-45.133-84.006H149.303V43.002h-18.69zM472.62 58.738l-41.53 11.127 16.504 61.588 41.525-11.127-16.5-61.588zm-54.042 36.627-98.787 26.47a136.585 136.585 0 0 1 13.647 25.15l92.342-24.745-7.202-26.875zM121.53 206.342l-78.364 37.045.002 50.3 18.207-7.556H442.11l19.316 6.413c0-51.397-119.076-83.53-183.166-86.2H121.53zm-38.17 97.88v.038c-35.936.645-65.065 30.15-65.065 66.232 0 36.484 29.777 66.26 66.262 66.26 1.286 0 2.563-.046 3.832-.12h106.473c1.27.074 2.545.12 3.832.12s2.563-.046 3.832-.12h107.34c1.27.074 2.545.12 3.832.12 1.286 0 2.562-.046 3.83-.12H423.7c1.268.074 2.544.12 3.83.12 36.486 0 66.263-29.776 66.263-66.26 0-36.485-29.777-66.262-66.262-66.262-.276 0-.55.02-.827.022v-.03H83.36zm47.2 18.686h22.13a66.882 66.882 0 0 0-11.063 14.014 66.74 66.74 0 0 0-11.066-14.014zm114.14 0h22.995a66.814 66.814 0 0 0-11.498 14.766 66.814 66.814 0 0 0-11.498-14.766zm115.003 0h21.824a66.929 66.929 0 0 0-10.912 13.748 66.861 66.861 0 0 0-10.912-13.748zm-275.146.012a47.43 47.43 0 0 1 47.572 47.572 47.41 47.41 0 0 1-44.333 47.45H83.36v.09a47.414 47.414 0 0 1-46.378-47.54 47.434 47.434 0 0 1 47.575-47.572zm114.138 0a47.43 47.43 0 0 1 47.573 47.572 47.409 47.409 0 0 1-44.332 47.45h-6.48a47.41 47.41 0 0 1-44.335-47.45 47.434 47.434 0 0 1 47.575-47.572zm115.004 0a47.428 47.428 0 0 1 47.57 47.533v.078a47.41 47.41 0 0 1-44.33 47.413h-6.48a47.411 47.411 0 0 1-44.335-47.45 47.434 47.434 0 0 1 47.574-47.573zm113.83 0a47.431 47.431 0 0 1 47.575 47.572 47.432 47.432 0 0 1-47.574 47.572c-.277 0-.55-.016-.827-.02v-.1h-2.412a47.41 47.41 0 0 1-44.33-47.413v-.078a47.43 47.43 0 0 1 47.57-47.532zm-171.333 80.39a66.812 66.812 0 0 0 11.362 14.633h-22.724a66.737 66.737 0 0 0 11.36-14.632zm-114.572.75a66.858 66.858 0 0 0 10.93 13.883h-21.858a66.802 66.802 0 0 0 10.928-13.882zm228.99.266a66.819 66.819 0 0 0 10.776 13.617h-21.55a66.787 66.787 0 0 0 10.775-13.617z"
};

export const ADJACENCIES: Record<string, string[]> = {
  'alaska': ['northwest_territory', 'alberta', 'kamchatka'],
  'northwest_territory': ['alaska', 'alberta', 'ontario', 'greenland'],
  'greenland': ['northwest_territory', 'ontario', 'quebec', 'iceland'],
  'alberta': ['alaska', 'northwest_territory', 'ontario', 'western_united_states'],
  'ontario': ['northwest_territory', 'greenland', 'quebec', 'western_united_states', 'eastern_united_states', 'alberta'],
  'quebec': ['ontario', 'greenland', 'eastern_united_states'],
  'western_united_states': ['alberta', 'ontario', 'eastern_united_states', 'central_america'],
  'eastern_united_states': ['ontario', 'quebec', 'western_united_states', 'central_america'],
  'central_america': ['western_united_states', 'eastern_united_states', 'venezuela'],
  'venezuela': ['central_america', 'peru', 'brazil'],
  'peru': ['venezuela', 'brazil', 'argentina'],
  'brazil': ['venezuela', 'peru', 'argentina', 'north_africa'],
  'argentina': ['peru', 'brazil'],
  'iceland': ['greenland', 'great_britain', 'scandinavia'],
  'scandinavia': ['iceland', 'great_britain', 'northern_europe', 'ukraine'],
  'ukraine': ['scandinavia', 'northern_europe', 'southern_europe', 'ural', 'afghanistan', 'middle_east'],
  'great_britain': ['iceland', 'scandinavia', 'northern_europe', 'western_europe'],
  'western_europe': ['great_britain', 'northern_europe', 'southern_europe', 'north_africa'],
  'northern_europe': ['great_britain', 'scandinavia', 'ukraine', 'southern_europe', 'western_europe'],
  'southern_europe': ['northern_europe', 'ukraine', 'western_europe', 'north_africa', 'egypt', 'middle_east'],
  'north_africa': ['western_europe', 'southern_europe', 'egypt', 'east_africa', 'congo', 'brazil'],
  'egypt': ['north_africa', 'southern_europe', 'middle_east', 'east_africa'],
  'east_africa': ['egypt', 'north_africa', 'congo', 'south_africa', 'madagascar', 'middle_east'],
  'congo': ['north_africa', 'east_africa', 'south_africa'],
  'south_africa': ['congo', 'east_africa', 'madagascar'],
  'madagascar': ['east_africa', 'south_africa'],
  'ural': ['ukraine', 'siberia', 'afghanistan', 'china'],
  'siberia': ['ural', 'yakursk', 'irkutsk', 'mongolia', 'china'],
  'yakursk': ['siberia', 'irkutsk', 'kamchatka'],
  'irkutsk': ['siberia', 'yakursk', 'kamchatka', 'mongolia'],
  'mongolia': ['siberia', 'irkutsk', 'kamchatka', 'japan', 'china'],
  'kamchatka': ['yakursk', 'irkutsk', 'mongolia', 'japan', 'alaska'],
  'japan': ['kamchatka', 'mongolia'],
  'china': ['mongolia', 'siberia', 'ural', 'afghanistan', 'india', 'siam'],
  'afghanistan': ['ukraine', 'ural', 'china', 'india', 'middle_east'],
  'middle_east': ['ukraine', 'afghanistan', 'india', 'egypt', 'east_africa', 'southern_europe'],
  'india': ['middle_east', 'afghanistan', 'china', 'siam'],
  'siam': ['india', 'china', 'indonesia'],
  'indonesia': ['siam', 'new_guinea', 'western_australia'],
  'new_guinea': ['indonesia', 'eastern_australia'],
  'western_australia': ['indonesia', 'eastern_australia'],
  'eastern_australia': ['western_australia', 'new_guinea']
};

export const CONTINENTS: Record<string, string[]> = {
  'North America': ['alaska', 'northwest_territory', 'greenland', 'alberta', 'ontario', 'quebec', 'western_united_states', 'eastern_united_states', 'central_america'],
  'South America': ['venezuela', 'peru', 'brazil', 'argentina'],
  'Europe': ['iceland', 'scandinavia', 'ukraine', 'great_britain', 'western_europe', 'northern_europe', 'southern_europe'],
  'Africa': ['north_africa', 'egypt', 'east_africa', 'congo', 'south_africa', 'madagascar'],
  'Asia': ['ural', 'siberia', 'yakursk', 'irkutsk', 'mongolia', 'kamchatka', 'japan', 'china', 'afghanistan', 'middle_east', 'india', 'siam'],
  'Australia': ['indonesia', 'new_guinea', 'western_australia', 'eastern_australia']
};

export const FULL_DECK: AssetCard[] = [
  { id: 'c1', territoryId: 'alaska', type: 'infantry' },
  { id: 'c2', territoryId: 'northwest_territory', type: 'cavalry' },
  { id: 'c3', territoryId: 'greenland', type: 'artillery' },
  { id: 'c4', territoryId: 'alberta', type: 'infantry' },
  { id: 'c5', territoryId: 'ontario', type: 'cavalry' },
  { id: 'c6', territoryId: 'quebec', type: 'artillery' },
  { id: 'c7', territoryId: 'western_united_states', type: 'cavalry' },
  { id: 'c8', territoryId: 'eastern_united_states', type: 'artillery' },
  { id: 'c9', territoryId: 'central_america', type: 'infantry' },
  { id: 'c10', territoryId: 'venezuela', type: 'infantry' },
  { id: 'c11', territoryId: 'peru', type: 'cavalry' },
  { id: 'c12', territoryId: 'brazil', type: 'artillery' },
  { id: 'c13', territoryId: 'argentina', type: 'infantry' },
  { id: 'c14', territoryId: 'iceland', type: 'infantry' },
  { id: 'c15', territoryId: 'scandinavia', type: 'cavalry' },
  { id: 'c16', territoryId: 'ukraine', type: 'artillery' },
  { id: 'c17', territoryId: 'great_britain', type: 'infantry' },
  { id: 'c18', territoryId: 'northern_europe', type: 'cavalry' },
  { id: 'c19', territoryId: 'western_europe', type: 'artillery' },
  { id: 'c20', territoryId: 'southern_europe', type: 'infantry' },
  { id: 'c21', territoryId: 'north_africa', type: 'cavalry' },
  { id: 'c22', territoryId: 'egypt', type: 'infantry' },
  { id: 'c23', territoryId: 'east_africa', type: 'artillery' },
  { id: 'c24', territoryId: 'congo', type: 'infantry' },
  { id: 'c25', territoryId: 'south_africa', type: 'cavalry' },
  { id: 'c26', territoryId: 'madagascar', type: 'artillery' },
  { id: 'c27', territoryId: 'ural', type: 'infantry' },
  { id: 'c28', territoryId: 'siberia', type: 'cavalry' },
  { id: 'c29', territoryId: 'yakursk', type: 'artillery' },
  { id: 'c30', territoryId: 'kamchatka', type: 'infantry' },
  { id: 'c31', territoryId: 'irkutsk', type: 'cavalry' },
  { id: 'c32', territoryId: 'mongolia', type: 'artillery' },
  { id: 'c33', territoryId: 'japan', type: 'infantry' },
  { id: 'c34', territoryId: 'afghanistan', type: 'cavalry' },
  { id: 'c35', territoryId: 'middle_east', type: 'artillery' },
  { id: 'c36', territoryId: 'india', type: 'infantry' },
  { id: 'c37', territoryId: 'china', type: 'cavalry' },
  { id: 'c38', territoryId: 'siam', type: 'artillery' },
  { id: 'c39', territoryId: 'indonesia', type: 'infantry' },
  { id: 'c40', territoryId: 'new_guinea', type: 'cavalry' },
  { id: 'c41', territoryId: 'western_australia', type: 'artillery' },
  { id: 'c42', territoryId: 'eastern_australia', type: 'infantry' },
  { id: 'w1', type: 'wild' },
  { id: 'w2', type: 'wild' }
];
