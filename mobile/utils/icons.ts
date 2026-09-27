import type { Ionicons } from '@expo/vector-icons';

/** Backend `icon` strings -> Ionicons names, with a safe fallback. */
export function iconFor(name: string): keyof typeof Ionicons.glyphMap {
  const map: Record<string, keyof typeof Ionicons.glyphMap> = {
    'check-square': 'checkbox-outline',
    checkbox: 'checkbox-outline',
    home: 'home-outline',
    'map-pin': 'location-outline',
    location: 'location-outline',
    heart: 'heart-outline',
    users: 'people-outline',
    people: 'people-outline',
    calendar: 'calendar-outline',
    wifi: 'wifi-outline',
    truck: 'cube-outline',
    'shopping-bag': 'bag-handle-outline',
    scissors: 'cut-outline',
    star: 'sparkles-outline',
    briefcase: 'briefcase-outline',
    book: 'book-outline',
    shield: 'shield-checkmark-outline',
  };
  return map[name] ?? 'grid-outline';
}
