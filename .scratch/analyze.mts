import { elements, getCombinableElements } from '../src/data/elements.ts';
import { badges } from '../src/data/badges.ts';

const byId = new Map<string, any>();
const dupIds: string[] = [];
for (const e of elements) { if (byId.has(e.id)) dupIds.push(e.id); byId.set(e.id, e); }
console.log('total elements', elements.length, 'dup ids', dupIds);

const counts: Record<string, number> = {};
for (const e of elements) counts[e.category] = (counts[e.category] ?? 0) + 1;
console.log('category counts', counts);
console.log('badge reqs:', badges.filter(b => b.condition.startsWith('category-') || b.condition === 'discovered').map(b => `${b.id}:${b.condition}:${b.requirement}`).join(' '));

// unknown refs
for (const e of elements) for (const [a, b] of e.combinations) for (const p of [a, b]) if (!byId.has(p)) console.log('UNKNOWN PARENT', e.id, p);

// duplicate recipes (same unordered pair -> multiple results)
const recipes = new Map<string, string[]>();
for (const e of elements) for (const c of e.combinations) { const k = [...c].sort().join('+'); recipes.set(k, [...(recipes.get(k) ?? []), e.id]); }
for (const [k, v] of recipes) if (v.length > 1) console.log('AMBIGUOUS RECIPE', k, v);

// elements with multiple recipes
console.log('multi-recipe elements', elements.filter(e => e.combinations.length > 1).map(e => e.id));
// elements with no recipe except basics
console.log('non-basic with no recipe', elements.filter(e => e.category !== 'basic' && e.combinations.length === 0).map(e => e.id));
console.log('basic w/ recipe', elements.filter(e => e.category === 'basic' && e.combinations.length).map(e => e.id));

// reachability (fixpoint from the 4 basics)
const have = new Set(['feuer', 'wasser', 'erde', 'luft']);
let changed = true; const order: string[] = [];
while (changed) {
  changed = false;
  for (const e of elements) {
    if (have.has(e.id)) continue;
    if (e.combinations.some(([a, b]) => have.has(a) && have.has(b))) { have.add(e.id); order.push(e.id); changed = true; }
  }
}
console.log('reachable', have.size, 'UNREACHABLE', elements.filter(e => !have.has(e.id)).map(e => e.id));

// cycles in first-recipe graph (what CollectionGraph uses)
const color = new Map<string, number>(); const cyc: string[] = [];
function dfs(id: string, path: string[]) {
  color.set(id, 1);
  const e = byId.get(id);
  if (e?.combinations[0]) for (const p of e.combinations[0]) {
    if (!byId.has(p)) continue;
    if (color.get(p) === 1) cyc.push([...path, id, p].join('>'));
    else if (!color.get(p)) dfs(p, [...path, id]);
  }
  color.set(id, 2);
}
for (const e of elements) if (!color.get(e.id)) dfs(e.id, []);
console.log('cycles in first-recipe graph', cyc.length, cyc.slice(0,5));

// symbol / name checks
for (const e of elements) {
  if (/�/.test(e.symbol) || e.symbol.trim() === '') console.log('BAD SYMBOL', e.id, JSON.stringify(e.symbol));
  if (!/^[a-z]+$/.test(e.id)) console.log('odd id', e.id);
}
const symCount = new Map<string, string[]>();
for (const e of elements) symCount.set(e.symbol, [...(symCount.get(e.symbol) ?? []), e.id]);
console.log('DUP SYMBOLS', [...symCount].filter(([,v]) => v.length > 1).map(([k,v]) => `${k}:${v.join(',')}`));
// hints leaking answer
for (const e of elements) if (e.hint.toLowerCase().includes(e.name.toLowerCase())) console.log('HINT LEAKS NAME', e.id, '=>', e.hint);
// names with spaces/umlauts: typing
console.log('names with non-ascii', elements.filter(e => /[^A-Za-z]/.test(e.name)).map(e => e.name));
// names vs ids mismatch for umlauts
console.log('long names', elements.filter(e=>e.name.length>10).map(e=>e.name));
// badge ids with conditions not implemented
const impl = new Set(['discovered','tutorial','export','night','morning','speed']);
console.log('badges w/ unimplemented condition', badges.filter(b => !impl.has(b.condition) && !b.condition.startsWith('category-')).map(b => `${b.id}(${b.condition})`));
console.log('badges never earnable', badges.filter(b => ['export','speed'].includes(b.condition)).map(b=>b.id));
// elements that are never an ingredient (leaves)
const used = new Set<string>(); for (const e of elements) for (const c of e.combinations) c.forEach(x => used.add(x));
console.log('leaf elements', elements.filter(e => !used.has(e.id)).length);
// time per getCombinableElements
const t = performance.now(); for (let i=0;i<220*220/2;i++) getCombinableElements('feuer','wasser'); console.log('24k lookups ms', (performance.now()-t).toFixed(1));
