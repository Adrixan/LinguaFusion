const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:4173/');
  await page.getByRole('button', { name: '×' }).first().click(); // skip tutorial
  const card = n => page.locator('.element-grid .element-card', { hasText: n }).first();

  // 1) self-combination: click Feuer twice
  await card('Feuer').click(); await card('Feuer').click();
  const slots = await page.locator('.combination-slot.filled').count();
  console.log('1) filled slots after clicking Feuer twice:', slots, '(2 needed for Feuer+Feuer=Energie)');

  // 2) legit combo then reload mid-puzzle
  await card('Feuer').click(); await card('Wasser').click();
  await page.getByRole('button', { name: /Kombiniere/ }).click();
  console.log('2) puzzle shown:', await page.locator('.pending-discovery').count() === 1);
  await page.waitForTimeout(400);
  await page.reload();
  await page.waitForTimeout(500);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('alchemie-fusion-save')));
  console.log('   after reload -> discovered has dampf:', saved.discoveredElements.includes('dampf'),
              '| unlocked has dampf:', saved.unlockedElements.includes('dampf'),
              '| puzzle visible:', await page.locator('.pending-discovery').count() === 1);
  // try to recombine Feuer + Wasser
  await card('Feuer').click(); await card('Wasser').click();
  console.log('   recombine Feuer+Wasser -> Kombiniere button:', await page.getByRole('button', { name: /Kombiniere/ }).count());
  await page.getByRole('button', { name: /Kombiniere/ }).click();
  console.log('   puzzle appears again:', await page.locator('.pending-discovery').count() === 1);

  // 3) corrupt save shape -> crash loop
  await page.evaluate(() => localStorage.setItem('alchemie-fusion-save', JSON.stringify({ unlockedElements: null })));
  await page.reload(); await page.waitForTimeout(500);
  console.log('3) corrupt save -> root children:', await page.evaluate(() => document.getElementById('root').children.length), '| errors:', errors.slice(-1));
  await page.reload(); await page.waitForTimeout(300);
  console.log('   still blank after 2nd reload:', await page.evaluate(() => document.getElementById('root').children.length) === 0);

  // 4) farming / dedupe / reset
  await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.getByRole('button', { name: '×' }).first().click();
  const dismissAll = async () => { for (let k = 0; k < 6; k++) { await page.waitForTimeout(1300); const b = page.locator('.modal-overlay button:has-text("Weiter")'); if (!(await b.count())) break; await b.last().click({ force: true }); } };
  const save = () => page.evaluate(() => JSON.parse(localStorage.getItem('alchemie-fusion-save')));
  await card('Feuer').click(); await card('Wasser').click();
  await page.getByRole('button', { name: /Kombiniere/ }).click();
  console.log('4) modals open simultaneously after solving (Richtig + badge):');
  const input = page.locator('.guess-input input'); await input.fill('DAMPF'); await input.press('Enter');
  await page.waitForTimeout(1500);
  console.log('   .modal-overlay count:', await page.locator('.modal-overlay').count());
  await dismissAll();
  let st = await save();
  console.log('   after solving Dampf: wordsSolved', st.wordsSolved, 'hintsUsed', st.hintsUsed, 'perfectWords', st.perfectWords, 'badges', st.badges.join(','));
  // recombine the SAME already-discovered pair
  await card('Feuer').click(); await card('Wasser').click();
  await page.getByRole('button', { name: /Kombiniere/ }).click();
  console.log('   recombine already-discovered pair -> puzzle re-opened:', await page.locator('.pending-discovery').count() === 1);
  const inp2 = page.locator('.guess-input input'); await inp2.fill('DAMPF'); await inp2.press('Enter'); await dismissAll();
  st = await save();
  console.log('   after re-solving: wordsSolved', st.wordsSolved, 'hintsUsed', st.hintsUsed, 'combinations', st.combinations, 'discovered', st.discoveredElements.length);
  await page.getByRole('button', { name: /Statistiken/ }).click();
  page.on('dialog', d => { console.log('   dialog shown on reset:', d.message()); d.dismiss(); });
  await page.getByRole('button', { name: /Spiel zurücksetzen/ }).click(); await page.waitForTimeout(400);
  st = await save();
  console.log('   Stats-tab reset (no dialog) -> discovered:', st.discoveredElements.length, 'wordsSolved', st.wordsSolved);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
