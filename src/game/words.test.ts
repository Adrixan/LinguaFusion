import { describe, expect, it } from 'vitest';
import { isCorrectGuess, normalizeWord } from './words';

describe('isCorrectGuess', () => {
  it('ignores case and surrounding whitespace', () => {
    expect(isCorrectGuess('  feuer ', 'Feuer')).toBe(true);
    expect(isCorrectGuess('FEUER', 'Feuer')).toBe(true);
  });

  it('accepts umlauts and their transliteration', () => {
    expect(isCorrectGuess('Wüste', 'Wüste')).toBe(true);
    expect(isCorrectGuess('Wueste', 'Wüste')).toBe(true);
    expect(isCorrectGuess('WÜSTE', 'Wueste')).toBe(true);
    expect(isCorrectGuess('Koenig', 'König')).toBe(true);
    expect(isCorrectGuess('Strasse', 'Straße')).toBe(true);
    expect(isCorrectGuess('Straße', 'Straße')).toBe(true);
  });

  it('rejects different words', () => {
    expect(isCorrectGuess('Wuste', 'Wüste')).toBe(false);
    expect(isCorrectGuess('', 'Feuer')).toBe(false);
    expect(isCorrectGuess('Feuers', 'Feuer')).toBe(false);
  });

  it('normalizes to upper case with expanded umlauts', () => {
    expect(normalizeWord('Höhle')).toBe('HOEHLE');
  });
});
