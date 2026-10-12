/**
 * Canonical form for comparing a guess with an element name.
 * Case-insensitive and tolerant of keyboards without umlauts: "Wueste", "Wüste" and "WÜSTE" are equal,
 * as are "Straße" and "Strasse".
 */
export function normalizeWord(word: string): string {
  return word
    .normalize('NFC')
    .trim()
    .toUpperCase()
    .replace(/Ä/g, 'AE')
    .replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE')
    .replace(/ẞ/g, 'SS');
}

export const isCorrectGuess = (guess: string, name: string): boolean =>
  normalizeWord(guess) === normalizeWord(name);
