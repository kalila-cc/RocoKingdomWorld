// Optional isolated-browser smoke test. Pass PLAYWRIGHT_MODULE when using a
// bundled runtime; no personal Chrome profile or real progress is accessed.
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const context = { window: {} };
for (const file of ['data.js', 'planner-core.js']) vm.runInNewContext(await readFile(path.join(root, 'offline/assets', file), 'utf8'), context);
const api = context.window.ROCO_PLANNER, pets = context.window.ROCO_DATA.pets;
const breedable = pets.filter(p => api.isEggTarget(p) && p.groups.includes('妖精组'));
const favorite = breedable[0], missing = breedable[1];
const fathers = breedable.filter(p => p !== favorite && p !== missing && !(p.flags & api.FLAG.FEMALE_ONLY)).slice(0, 5);
assert.equal(fathers.length, 5);
const owned = Object.fromEntries(pets.map(p => [api.petKey(p), api.OWN.COMBO_F]));
for (const father of fathers) owned[api.petKey(father)] |= api.OWN.COMBO_M;
delete owned[api.petKey(missing)];
const legacy = { version: 5, owned, focus: 'all', nestCount: 10 };
const server = createServer(async (request, response) => {
  try {
    const relative = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/+/, '') || 'index.html';
    const resolved = path.resolve(root, 'offline', relative);
    if (!resolved.startsWith(path.resolve(root, 'offline') + path.sep)) throw new Error('outside test root');
    const body = await readFile(resolved);
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png' };
    response.writeHead(200, { 'Content-Type': types[path.extname(resolved)] || 'application/octet-stream' });
    response.end(body);
  } catch { response.writeHead(404); response.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => { window.showSaveFilePicker = undefined; });
  await page.goto(`http://127.0.0.1:${server.address().port}/#catalog`);
  const importPayload = async payload => {
    await page.locator('#importInput').setInputFiles({ name: 'test-progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(payload)) });
    await page.waitForFunction(() => document.querySelector('#toast').textContent === '进度导入成功');
  };
  await importPayload(legacy);
  const heart = page.locator('button[data-favorite]').filter({ has: page.locator('svg') });
  assert.equal(await heart.count(), pets.length);
  const favoriteButton = page.locator(`button[data-favorite="${api.petKey(favorite)}"]`);
  await favoriteButton.click();
  assert.equal(await favoriteButton.getAttribute('aria-pressed'), 'true');
  const favoriteFilter = page.locator('#viewFilter [data-value="favorite"]');
  const allFilter = page.locator('#viewFilter [data-value="all"]');
  await favoriteFilter.click();
  assert.equal(await favoriteFilter.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('.pet-card').count(), 1);
  // Other catalog filters intersect with liked cards rather than being reset.
  const otherSeason = pets.find(p => p.season.slice(0, 2) !== favorite.season.slice(0, 2)).season.slice(0, 2);
  await page.locator(`#seasonFilter [data-value="${otherSeason}"]`).click();
  assert.equal(await page.locator('.pet-card').count(), 0);
  assert.match(await page.locator('#noResults').textContent(), /当前筛选下没有喜爱的精灵/);
  await page.locator('#seasonFilter [data-value="all"]').click();
  assert.equal(await page.locator('.pet-card').count(), 1);
  await favoriteButton.click();
  assert.equal(await page.locator('.pet-card').count(), 0, 'unliked card disappears immediately');
  await allFilter.click();
  await favoriteButton.click();
  await page.reload();
  assert.equal(await favoriteButton.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('.favorite-button.active').count(), 1);
  await page.locator('[data-module="planner"]').click();
  assert.match(await page.locator('#recommendationKind').textContent(), /偏爱/);
  assert.equal(await page.locator('.nest-slot.mother').count(), 5);
  assert.equal(await page.locator('.nest-slot.mother strong').filter({ hasText: api.petLabel(favorite) }).count(), 1);
  await page.locator('[data-module="catalog"]').click();
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const exported = JSON.parse(await readFile(await (await downloadEvent).path(), 'utf8'));
  assert.equal(exported.version, 6);
  assert.deepEqual(exported.favorites, [api.petKey(favorite)]);
  assert.deepEqual(exported.owned, owned);
  await favoriteButton.click();
  assert.equal(await favoriteButton.getAttribute('aria-pressed'), 'false');
  await importPayload(exported);
  assert.equal(await favoriteButton.getAttribute('aria-pressed'), 'true');
  page.once('dialog', dialog => dialog.dismiss());
  await page.locator('#clearBtn').click();
  assert.ok(await page.locator('.gender-button.active').count() > 0);
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#clearBtn').click();
  assert.equal(await page.locator('.gender-button.active').count(), 0);
  assert.equal(await favoriteButton.getAttribute('aria-pressed'), 'true');
  await importPayload(legacy);
  assert.equal(await page.locator('.favorite-button.active').count(), 0);
  await favoriteButton.click();
  await page.locator('.pet-grid').scrollIntoViewIfNeeded();
  await mkdir(path.join(root, 'tmp'), { recursive: true });
  await page.screenshot({ path: path.join(root, 'tmp/favorites-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await favoriteButton.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(root, 'tmp/favorites-mobile.png') });
  const overlaps = await page.locator('.favorite-button').evaluateAll(buttons => buttons.some(button => {
    const box = button.getBoundingClientRect(), heading = button.parentElement.querySelector('h3').getBoundingClientRect();
    return box.left < heading.right - 30;
  }));
  assert.equal(overlaps, false);
  assert.deepEqual(errors, []);
  console.log('PASS: favorite click/reload, mixed plan, JSON export/import, old-file compatibility, clear confirm/preserve, desktop/mobile screenshots.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
