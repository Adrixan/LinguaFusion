import { elements, getCombinableElements } from '../src/data/elements.ts';
const basics = ['feuer','wasser','erde','luft'];
function reach(allowSelf: boolean) {
  const have = new Set(basics); let ch = true;
  while (ch) { ch = false;
    for (const e of elements) { if (have.has(e.id)) continue;
      if (e.combinations.some(([a,b]) => have.has(a) && have.has(b) && (allowSelf || a !== b))) { have.add(e.id); ch = true; } } }
  return have;
}
const r = reach(false);
console.log('self-combo recipes:', elements.filter(e => e.combinations.some(([a,b]) => a===b)).map(e=>e.id).join(','));
console.log('reachable WITHOUT self-combination:', r.size, '/', elements.length);
console.log('unreachable:', elements.filter(e => !r.has(e.id)).map(e => e.id).join(','));

// worst-case perf of generallyCombinable at full unlock
const ids = elements.map(e => e.id);
let t = performance.now(); let n = 0;
for (let i = 0; i < ids.length; i++) for (let j = i; j < ids.length; j++) { getCombinableElements(ids[i], ids[j]); n++; }
console.log(`all-pairs lookups: ${n} in ${(performance.now()-t).toFixed(0)} ms (one hint recompute at 100% unlock, node, desktop CPU)`);
