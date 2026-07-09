const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../public');
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.html'))) {
  const t = fs.readFileSync(path.join(dir, f), 'utf8');
  const cyr = /[\u0400-\u04FF]/.test(t);
  const likelyUk = t.includes('lang="uk"') || t.includes('data-i18n') || t.includes('l2-');
  if (likelyUk && !cyr) console.log('BROKEN', f);
  else if (cyr) console.log('OK', f);
}
