export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  requirement: number;
}

export const badges: Badge[] = [
  {
    id: 'first-discovery',
    name: 'Erster Fund',
    description: 'Entdecke dein erstes Element',
    icon: '🔓',
    condition: 'discovered',
    requirement: 1
  },
  {
    id: 'ten-discoveries',
    name: 'Entdecker',
    description: 'Entdecke 10 Elemente',
    icon: '🔬',
    condition: 'discovered',
    requirement: 10
  },
  {
    id: 'fifty-discoveries',
    name: 'Forscher',
    description: 'Entdecke 50 Elemente',
    icon: '🧪',
    condition: 'discovered',
    requirement: 50
  },
  {
    id: 'hundred-discoveries',
    name: 'Wissenschaftler',
    description: 'Entdecke 100 Elemente',
    icon: '🎓',
    condition: 'discovered',
    requirement: 100
  },
  {
    id: 'all-discoveries',
    name: 'Meisteralchemist',
    description: 'Entdecke alle Elemente',
    icon: '⚗️',
    condition: 'discovered',
    requirement: 350
  },
  {
    id: 'first-word',
    name: 'Wortmeister',
    description: 'Löse dein erstes Buchstabenrätsel',
    icon: '📝',
    condition: 'words',
    requirement: 1
  },
  {
    id: 'ten-words',
    name: 'Buchstabenvirtuose',
    description: 'Löse 10 Buchstabenrätsel',
    icon: '✍️',
    condition: 'words',
    requirement: 10
  },
  {
    id: 'fifty-words',
    name: 'Rätselexperte',
    description: 'Löse 50 Buchstabenrätsel',
    icon: '🧩',
    condition: 'words',
    requirement: 50
  },
  {
    id: 'hundred-words',
    name: 'Wortgenie',
    description: 'Löse 100 Buchstabenrätsel',
    icon: '🏆',
    condition: 'words',
    requirement: 100
  },
  {
    id: 'first-combo',
    name: 'Erste Kombination',
    description: 'Kombiniere zum ersten Mal',
    icon: '✨',
    condition: 'combinations',
    requirement: 1
  },
  {
    id: 'ten-combos',
    name: 'Kombinierer',
    description: 'Führe 10 Kombinationen durch',
    icon: '🔗',
    condition: 'combinations',
    requirement: 10
  },
  {
    id: 'fifty-combos',
    name: 'Alchemist',
    description: 'Führe 50 Kombinationen durch',
    icon: '🧙',
    condition: 'combinations',
    requirement: 50
  },
  {
    id: 'hundred-combos',
    name: 'Großmeister',
    description: 'Führe 100 Kombinationen durch',
    icon: '👑',
    condition: 'combinations',
    requirement: 100
  },
  {
    id: 'basic-nature',
    name: 'Naturfreund',
    description: 'Entdecke alle Naturelemente',
    icon: '🌿',
    condition: 'category-nature',
    requirement: 20
  },
  {
    id: 'basic-animal',
    name: 'Tierliebhaber',
    description: 'Entdecke alle Tierelemente',
    icon: '🐾',
    condition: 'category-animal',
    requirement: 30
  },
  {
    id: 'basic-plant',
    name: 'Pflanzenkenner',
    description: 'Entdecke alle Pflanzenelemente',
    icon: '🌸',
    condition: 'category-plant',
    requirement: 20
  },
  {
    id: 'basic-food',
    name: 'Feinschmecker',
    description: 'Entdecke alle Food-Elemente',
    icon: '🍎',
    condition: 'category-food',
    requirement: 25
  },
  {
    id: 'basic-object',
    name: 'Handwerker',
    description: 'Entdecke alle Objekt-Elemente',
    icon: '🔧',
    condition: 'category-object',
    requirement: 40
  },
  {
    id: 'basic-concept',
    name: 'Denker',
    description: 'Entdecke alle Konzept-Elemente',
    icon: '💭',
    condition: 'category-concept',
    requirement: 35
  },
  {
    id: 'streak-3',
    name: 'Dreierstreak',
    description: '3 Kombinationen in Folge',
    icon: '🔥',
    condition: 'streak',
    requirement: 3
  },
  {
    id: 'streak-5',
    name: 'Fünferstreak',
    description: '5 Kombinationen in Folge',
    icon: '💥',
    condition: 'streak',
    requirement: 5
  },
  {
    id: 'streak-10',
    name: 'Zehnerstreak',
    description: '10 Kombinationen in Folge',
    icon: '⭐',
    condition: 'streak',
    requirement: 10
  },
  {
    id: 'hint-used',
    name: 'Hinweisnehmer',
    description: 'Nutze zum ersten Mal einen Hinweis',
    icon: '💡',
    condition: 'hints',
    requirement: 1
  },
  {
    id: 'many-hints',
    name: 'Hinweisjäger',
    description: 'Nutze 20 Hinweise',
    icon: '🔍',
    condition: 'hints',
    requirement: 20
  },
  {
    id: 'export-import',
    name: 'Datenspezialist',
    description: 'Exportiere oder importiere Spielstand',
    icon: '💾',
    condition: 'export',
    requirement: 1
  },
  {
    id: 'tutorial',
    name: 'Lernwilliger',
    description: 'Schließe das Tutorial ab',
    icon: '📚',
    condition: 'tutorial',
    requirement: 1
  },
  {
    id: 'perfect-words',
    name: 'Perfektionist',
    description: 'Löse 10 Rätsel ohne Hinweis',
    icon: '💎',
    condition: 'perfect',
    requirement: 10
  },
  {
    id: 'speedster',
    name: 'Schnellkombinierer',
    description: '10 Kombinationen in unter 2 Minuten',
    icon: '⚡',
    condition: 'speed',
    requirement: 10
  },
  {
    id: 'night-owl',
    name: 'Nachteule',
    description: 'Spiele nach Mitternacht',
    icon: '🦉',
    condition: 'night',
    requirement: 1
  },
  {
    id: 'early-bird',
    name: 'Frühaufsteher',
    description: 'Spiele vor 6 Uhr morgens',
    icon: '🐦',
    condition: 'morning',
    requirement: 1
  }
];

export const getBadgeById = (id: string): Badge | undefined => {
  return badges.find(b => b.id === id);
};
