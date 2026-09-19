// Parse only literal Lua data tables; never execute downloaded Wiki code.
export function parseLuaData(source) {
  const tokens = source.match(/--[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|-?\d+(?:\.\d+)?|[A-Za-z_][A-Za-z_0-9]*|[{}\[\]=,;]|\S/g)
    .filter(t => !t.startsWith('--'));
  let i = 0;
  const expect = t => { if (tokens[i++] !== t) throw new Error(`Expected ${t} at token ${i}`); };
  function value() {
    const t = tokens[i++];
    if (t === '{') {
      const entries = []; let explicit = false; let next = 1;
      while (tokens[i] !== '}') {
        let key;
        if (tokens[i] === '[') { i++; key = value(); expect(']'); expect('='); explicit = true; }
        else if (tokens[i + 1] === '=') { key = tokens[i++]; i++; explicit = true; }
        else key = next++;
        if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error('Unsafe table key');
        entries.push([key, value()]);
        if ([',', ';'].includes(tokens[i])) i++;
        else if (tokens[i] !== '}') throw new Error(`Unsupported Lua at ${i}`);
      }
      i++;
      return explicit ? Object.fromEntries(entries) : entries.map(e => e[1]);
    }
    if (t?.startsWith('"')) return JSON.parse(t);
    if (t === 'true') return true;
    if (t === 'false') return false;
    if (t === 'nil') return null;
    if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
    throw new Error(`Unsupported Lua value ${t}`);
  }
  expect('return'); const result = value();
  if (i !== tokens.length) throw new Error('Unexpected executable Lua after data');
  return result;
}

export const WIKI_API = 'https://wiki.biligame.com/nrc/api.php';
export async function wikiQuery(params) {
  const url = new URL(WIKI_API);
  Object.entries({format: 'json', ...params}).forEach(([k,v]) => url.searchParams.set(k,v));
  const response = await fetch(url, {headers: {'User-Agent':'RocoRarePlannerUpdater/2.0 (noncommercial catalog sync)'}, signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(`Wiki HTTP ${response.status}: stop without changing local data; do not bypass site access restrictions`);
  const data = await response.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data;
}

export async function loadWikiTables(names) {
  const response = await wikiQuery({action:'query', titles:names.map(n => `模块:${n}`).join('|'), prop:'revisions', rvprop:'ids|timestamp|content', rvslots:'main'});
  const tables = {}; const revisions = [];
  for (const page of Object.values(response.query.pages)) {
    if (page.missing !== undefined) throw new Error(`Missing ${page.title}`);
    const rev = page.revisions[0];
    const key = page.title.replace(/^[^:]+:/,'');
    tables[key] = parseLuaData(rev.slots.main['*']);
    revisions.push({title:page.title, revision:rev.revid, timestamp:rev.timestamp});
  }
  return {tables,revisions};
}
