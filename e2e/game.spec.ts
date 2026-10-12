import { expect, Page, test } from '@playwright/test';

const SAVE_KEY = 'linguafusion-save';
const LEGACY_SAVE_KEY = 'alchemie-fusion-save';
const BASICS = ['feuer', 'wasser', 'erde', 'luft'];

/** Starts the app with a save already in place (only on the first load, so reloads keep real progress). */
async function seedSave(page: Page, save: Record<string, unknown>, key = SAVE_KEY) {
  await page.addInitScript(
    ([storageKey, value]) => {
      if (!localStorage.getItem('linguafusion-save') && !localStorage.getItem('alchemie-fusion-save')) {
        localStorage.setItem(storageKey as string, value as string);
      }
    },
    [key, JSON.stringify(save)],
  );
}

const baseSave = {
  unlockedElements: BASICS,
  discoveredElements: BASICS,
  tutorialCompleted: true,
  // Already-owned badges keep celebration dialogs out of the way of these tests.
  badges: ['tutorial', 'first-discovery', 'first-word', 'first-combo', 'ten-discoveries', 'perfect-words'],
};

const card = (page: Page, name: string) => page.locator('.element-grid .element-card', { hasText: name }).first();
const getSave = (page: Page) => page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? 'null'), SAVE_KEY);

async function combine(page: Page, a: string, b: string) {
  await card(page, a).click();
  await card(page, b).click();
  await page.getByRole('button', { name: /Kombiniere/ }).click();
}

async function solve(page: Page, answer: string) {
  await page.getByLabel('Name des Elements').fill(answer);
  await page.getByRole('button', { name: 'Prüfen' }).click();
}

test('the tutorial can be skipped and the board is usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'Tutorial' })).toBeVisible();
  await page.getByRole('button', { name: 'Tutorial überspringen' }).click();
  await expect(page.getByRole('button', { name: 'Feuer' })).toBeVisible();
});

test('an element can be combined with itself (Feuer + Feuer = Energie)', async ({ page }) => {
  await seedSave(page, baseSave);
  await page.goto('/');

  await card(page, 'Feuer').click();
  await card(page, 'Feuer').click();
  await expect(page.locator('.combination-slot.filled')).toHaveCount(2);

  await page.getByRole('button', { name: /Kombiniere/ }).click();
  await expect(page.getByText('Neue Entdeckung!')).toBeVisible();

  await solve(page, 'Wasser');
  await expect(page.getByRole('alert')).toContainText('falsch');
  await solve(page, 'ENERGIE');

  const dialog = page.getByRole('dialog', { name: 'Richtig' });
  await expect(dialog).toContainText('Energie');
  await dialog.getByRole('button', { name: 'Weiter' }).click();
  await expect(card(page, 'Energie')).toBeVisible();

  const save = await getSave(page);
  expect(save.unlockedElements).toContain('energie');
  expect(save.wordsSolved).toBe(1);
  expect(save.mistakes).toBe(1);
  expect(save.perfectWords).toBe(0); // solved on the second try, so not perfect
});

test('umlauts can be typed as ue/oe/ae/ss', async ({ page }) => {
  await seedSave(page, { ...baseSave, unlockedElements: [...BASICS, 'sand'], discoveredElements: [...BASICS, 'sand'] });
  await page.goto('/');
  await combine(page, 'Sand', 'Sand');
  await solve(page, 'Wueste');
  await expect(page.getByRole('dialog', { name: 'Richtig' })).toContainText('Wüste');
});

test('a puzzle that was open during a reload is resumed', async ({ page }) => {
  await seedSave(page, baseSave);
  await page.goto('/');
  await combine(page, 'Feuer', 'Wasser');
  await expect(page.getByText('Neue Entdeckung!')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Neue Entdeckung!')).toBeVisible();
  await solve(page, 'Dampf');
  await expect(page.getByRole('dialog', { name: 'Richtig' })).toBeVisible();
});

test('skipping a puzzle gives the element back to be found again', async ({ page }) => {
  await seedSave(page, baseSave);
  await page.goto('/');
  await combine(page, 'Feuer', 'Wasser');
  await page.getByRole('button', { name: 'Überspringen' }).click();
  await expect(page.getByText(/Übersprungen/)).toBeVisible();
  expect((await getSave(page)).unlockedElements).not.toContain('dampf');

  await combine(page, 'Feuer', 'Wasser');
  await expect(page.getByText('Neue Entdeckung!')).toBeVisible();
});

test('repeating a known combination or trying an invalid one gives feedback and no points', async ({ page }) => {
  await seedSave(page, baseSave);
  await page.goto('/');
  await combine(page, 'Feuer', 'Wasser');
  await solve(page, 'Dampf');
  await page.getByRole('dialog', { name: 'Richtig' }).getByRole('button', { name: 'Weiter' }).click();

  await combine(page, 'Feuer', 'Wasser');
  await expect(page.getByText(/kennst du schon/)).toBeVisible();
  await expect(page.getByText('Neue Entdeckung!')).toHaveCount(0);

  await combine(page, 'Dampf', 'Erde');
  await expect(page.getByText('Aus dieser Kombination entsteht nichts.')).toBeVisible();

  const save = await getSave(page);
  expect(save.wordsSolved).toBe(1);
  expect(save.streak).toBe(0);
});

test('a corrupt save does not brick the app', async ({ page }) => {
  await seedSave(page, { unlockedElements: null });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Feuer' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('beschädigt');
  expect(await page.evaluate(() => localStorage.getItem('linguafusion-save-corrupt'))).toContain('unlockedElements');

  await page.reload();
  await expect(page.getByRole('button', { name: 'Feuer' })).toBeVisible();
});

test('a save from before the rebrand is picked up', async ({ page }) => {
  await seedSave(
    page,
    { ...baseSave, unlockedElements: [...BASICS, 'dampf'], discoveredElements: [...BASICS, 'dampf'], hintsUsed: 3 },
    LEGACY_SAVE_KEY,
  );
  await page.goto('/');
  await expect(card(page, 'Dampf')).toBeVisible();
  await expect.poll(async () => (await getSave(page))?.unlockedElements).toContain('dampf');
});

test('resetting asks for confirmation from the statistics tab', async ({ page }) => {
  await seedSave(page, { ...baseSave, unlockedElements: [...BASICS, 'dampf'], discoveredElements: [...BASICS, 'dampf'] });
  await page.goto('/');
  await page.getByRole('tab', { name: /Statistiken/ }).click();

  let prompts = 0;
  page.once('dialog', dialog => { prompts++; void dialog.dismiss(); });
  await page.getByRole('button', { name: /Spiel zurücksetzen/ }).click();
  expect(prompts).toBe(1);
  await expect.poll(async () => (await getSave(page)).unlockedElements).toContain('dampf');

  page.once('dialog', dialog => { void dialog.accept(); });
  await page.getByRole('button', { name: /Spiel zurücksetzen/ }).click();
  await expect.poll(async () => (await getSave(page)).unlockedElements).toEqual(BASICS);
});

test('importing rejects files that are not saves', async ({ page }) => {
  await seedSave(page, baseSave);
  await page.goto('/');
  page.on('dialog', dialog => { void dialog.accept(); });
  await page.locator('input[type=file]').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') });
  await expect(page.getByRole('status')).toContainText('kein gültiger Spielstand');
  expect((await getSave(page)).tutorialCompleted).toBe(true);
});

test('all tabs render and the collection loads lazily without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await seedSave(page, baseSave);
  await page.goto('/');
  await page.getByRole('tab', { name: /Sammlung/ }).click();
  await expect(page.locator('.react-flow')).toBeVisible();
  await page.getByRole('tab', { name: /Abzeichen/ }).click();
  await expect(page.locator('.badge-grid')).toBeVisible();
  await page.getByRole('tab', { name: /Statistiken/ }).click();
  await expect(page.locator('.stats-grid')).toBeVisible();
  expect(errors).toEqual([]);
});
