
export type TransportMode = 'walking' | 'driving' | 'transit' | 'cycling';

export interface ItineraryItem {
  id: string;
  time: string;
  location: string;
  activity: string;
  transportMode: TransportMode;
  notes: string;
  estimatedTravelTime?: string; // Result from AI
}

export interface Day {
  id: string;
  label: string; // e.g., "Day 1"
  date?: string; // YYYY-MM-DD
  items: ItineraryItem[];
}

export interface PackingItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface PackingCategory {
  id: string;
  name: string;
  items: PackingItem[];
}

export interface PackingTemplate {
  id: string;
  name: string;
  categories: PackingCategory[];
}

export interface TripData {
  days: Day[];
  packingList: PackingCategory[];
  savedAt: string;
}

export const TRANSPORT_ICONS: Record<TransportMode, string> = {
  walking: 'PersonStanding',
  driving: 'Car',
  transit: 'Train',
  cycling: 'Bike',
};

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
  walking: '步行',
  driving: '開車',
  transit: '大眾運輸',
  cycling: '騎行',
};

export const NOTE_PRESETS = [
  '需預約', '只收現金', '門票已買', '拍照熱點', '排隊美食', '伴手禮', '停留 1 小時'
];
