import { elements, ElementCategory } from './elements';

export type BadgeCondition =
  | 'discovered'
  | 'words'
  | 'combinations'
  | 'streak'
  | 'perfect'
  | 'tutorial'
  | 'export'
  | 'night'
  | 'morning'
  | `category-${ElementCategory}`;

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: BadgeCondition;
  requirement: number;
}

const categorySize = (category: ElementCategory): number =>
  elements.filter(e => e.category === category).length;

/** Elements the player has to find (everything except the basic starting elements). */
const DISCOVERABLE_COUNT = elements.filter(e => e.category !== 'basic').length;

export const badges: Badge[] = [
  { id: 'first-discovery', name: 'Erster Fund', description: 'Entdecke dein erstes Element', icon: '🔓', condition: 'discovered', requirement: 1 },
  { id: 'ten-discoveries', name: 'Entdecker', description: 'Entdecke 10 neue Elemente', icon: '🔬', condition: 'discovered', requirement: 10 },
  { id: 'fifty-discoveries', name: 'Forscher', description: 'Entdecke 50 neue Elemente', icon: '🧪', condition: 'discovered', requirement: 50 },
  { id: 'hundred-discoveries', name: 'Wissenschaftler', description: 'Entdecke 100 neue Elemente', icon: '🎓', condition: 'discovered', requirement: 100 },
  { id: 'all-discoveries', name: 'Meisteralchemist', description: 'Entdecke alle Elemente', icon: '⚗️', condition: 'discovered', requirement: DISCOVERABLE_COUNT },
  { id: 'first-word', name: 'Wortmeister', description: 'Löse dein erstes Buchstabenrätsel', icon: '📝', condition: 'words', requirement: 1 },
  { id: 'ten-words', name: 'Buchstabenvirtuose', description: 'Löse 10 Buchstabenrätsel', icon: '✍️', condition: 'words', requirement: 10 },
  { id: 'fifty-words', name: 'Rätselexperte', description: 'Löse 50 Buchstabenrätsel', icon: '🧩', condition: 'words', requirement: 50 },
  { id: 'hundred-words', name: 'Wortgenie', description: 'Löse 100 Buchstabenrätsel', icon: '🏆', condition: 'words', requirement: 100 },
  { id: 'first-combo', name: 'Erste Kombination', description: 'Kombiniere zum ersten Mal', icon: '✨', condition: 'combinations', requirement: 1 },
  { id: 'ten-combos', name: 'Kombinierer', description: 'Führe 10 Kombinationen durch', icon: '🔗', condition: 'combinations', requirement: 10 },
  { id: 'fifty-combos', name: 'Alchemist', description: 'Führe 50 Kombinationen durch', icon: '🧙', condition: 'combinations', requirement: 50 },
  { id: 'hundred-combos', name: 'Großmeister', description: 'Führe 100 Kombinationen durch', icon: '👑', condition: 'combinations', requirement: 100 },
  { id: 'basic-nature', name: 'Naturfreund', description: 'Entdecke alle Naturelemente', icon: '🌿', condition: 'category-nature', requirement: categorySize('nature') },
  { id: 'basic-animal', name: 'Tierliebhaber', description: 'Entdecke alle Tierelemente', icon: '🐾', condition: 'category-animal', requirement: categorySize('animal') },
  { id: 'basic-plant', name: 'Pflanzenkenner', description: 'Entdecke alle Pflanzenelemente', icon: '🌸', condition: 'category-plant', requirement: categorySize('plant') },
  { id: 'basic-food', name: 'Feinschmecker', description: 'Entdecke alle Nahrungselemente', icon: '🍎', condition: 'category-food', requirement: categorySize('food') },
  { id: 'basic-object', name: 'Handwerker', description: 'Entdecke alle Objektelemente', icon: '🔧', condition: 'category-object', requirement: categorySize('object') },
  { id: 'basic-concept', name: 'Denker', description: 'Entdecke alle Konzeptelemente', icon: '💭', condition: 'category-concept', requirement: categorySize('concept') },
  { id: 'streak-3', name: 'Dreierserie', description: '3 neue Entdeckungen in Folge', icon: '🔥', condition: 'streak', requirement: 3 },
  { id: 'streak-5', name: 'Fünferserie', description: '5 neue Entdeckungen in Folge', icon: '💥', condition: 'streak', requirement: 5 },
  { id: 'streak-10', name: 'Zehnerserie', description: '10 neue Entdeckungen in Folge', icon: '⭐', condition: 'streak', requirement: 10 },
  { id: 'export-import', name: 'Datenspezialist', description: 'Exportiere oder importiere deinen Spielstand', icon: '💾', condition: 'export', requirement: 1 },
  { id: 'tutorial', name: 'Lernwilliger', description: 'Schließe das Tutorial ab', icon: '📚', condition: 'tutorial', requirement: 1 },
  { id: 'perfect-words', name: 'Perfektionist', description: 'Löse 10 Rätsel beim ersten Versuch', icon: '💎', condition: 'perfect', requirement: 10 },
  { id: 'night-owl', name: 'Nachteule', description: 'Spiele zwischen 0 und 5 Uhr', icon: '🦉', condition: 'night', requirement: 1 },
  { id: 'early-bird', name: 'Frühaufsteher', description: 'Spiele zwischen 5 und 6 Uhr morgens', icon: '🐦', condition: 'morning', requirement: 1 },
];

export const BADGE_IDS: ReadonlySet<string> = new Set(badges.map(b => b.id));

export const getBadgeById = (id: string): Badge | undefined => badges.find(b => b.id === id);
