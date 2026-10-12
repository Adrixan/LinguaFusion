import { describe, expect, it } from 'vitest';
import { elements, getCombinableElements, BASIC_ELEMENT_IDS } from './elements';
import { badges, BADGE_IDS } from './badges';

const ids = new Set(elements.map(e => e.id));

describe('element data', () => {
  it('has the documented size and unique ids', () => {
    expect(elements).toHaveLength(220);
    expect(ids.size).toBe(elements.length);
  });

  it('starts from the four basic elements, which have no recipe', () => {
    expect([...BASIC_ELEMENT_IDS].sort()).toEqual(['erde', 'feuer', 'luft', 'wasser']);
    for (const element of elements.filter(e => e.category === 'basic')) {
      expect(element.combinations).toEqual([]);
    }
  });

  it('gives every other element exactly one recipe made of known elements', () => {
    for (const element of elements.filter(e => e.category !== 'basic')) {
      expect(element.combinations, element.id).toHaveLength(1);
      for (const parent of element.combinations[0]) {
        expect(ids.has(parent), `${element.id} uses unknown ${parent}`).toBe(true);
      }
    }
  });

  it('never maps one pair of ingredients to two results', () => {
    const seen = new Map<string, string>();
    for (const element of elements) {
      for (const pair of element.combinations) {
        const key = [...pair].sort().join('+');
        expect(seen.get(key), `${key} is ambiguous`).toBeUndefined();
        seen.set(key, element.id);
      }
    }
  });

  it('resolves recipes independent of order', () => {
    expect(getCombinableElements('feuer', 'wasser')?.id).toBe('dampf');
    expect(getCombinableElements('wasser', 'feuer')?.id).toBe('dampf');
    expect(getCombinableElements('feuer', 'feuer')?.id).toBe('energie');
    expect(getCombinableElements('feuer', 'stein2')).toBeUndefined();
  });

  it('can reach every element from the basics (self-combinations allowed)', () => {
    const have = new Set<string>(BASIC_ELEMENT_IDS);
    let changed = true;
    while (changed) {
      changed = false;
      for (const element of elements) {
        if (!have.has(element.id) && element.combinations.some(([a, b]) => have.has(a) && have.has(b))) {
          have.add(element.id);
          changed = true;
        }
      }
    }
    expect(elements.filter(e => !have.has(e.id)).map(e => e.id)).toEqual([]);
  });

  it('has clean, unique symbols', () => {
    const symbols = new Map<string, string>();
    for (const element of elements) {
      expect(element.symbol.trim(), element.id).not.toBe('');
      expect(element.symbol, `${element.id} contains a replacement character`).not.toContain('�');
      expect(symbols.get(element.symbol), `${element.id} shares a symbol`).toBeUndefined();
      symbols.set(element.symbol, element.id);
    }
  });

  it('does not give away the answer in the hint', () => {
    for (const element of elements) {
      expect(element.hint.toLowerCase(), element.id).not.toContain(element.name.toLowerCase());
    }
  });
});

describe('badge data', () => {
  it('has unique ids', () => {
    expect(BADGE_IDS.size).toBe(badges.length);
  });

  it('never asks for more than the game can deliver', () => {
    const nonBasic = elements.filter(e => e.category !== 'basic').length;
    for (const badge of badges) {
      expect(badge.requirement, badge.id).toBeGreaterThan(0);
      if (badge.condition === 'discovered') expect(badge.requirement, badge.id).toBeLessThanOrEqual(nonBasic);
      if (badge.condition.startsWith('category-')) {
        const category = badge.condition.slice('category-'.length);
        expect(badge.requirement, badge.id).toBe(elements.filter(e => e.category === category).length);
      }
    }
    expect(badges.find(b => b.id === 'all-discoveries')?.requirement).toBe(nonBasic);
  });
});
