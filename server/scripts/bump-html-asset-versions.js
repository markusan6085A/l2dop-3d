const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));

for (const file of files) {
  const p = path.join(dir, file);
  let t = fs.readFileSync(p, 'utf8');
  const before = t;
  t = t
    .replace(/common\.js\?v=20260709miruNav1[67]/g, 'common.js?v=20260709perfLayout1')
    .replace(/common\.js\?v=20260709perf[12]/g, 'common.js?v=20260709perfLayout1')
    .replace(/l2-app-chrome-skin\.css\?v=20260709miruNav15/g, 'l2-app-chrome-skin.css?v=20260709perfLayout1')
    .replace(/l2-app-chrome-skin\.css\?v=20260709perf1/g, 'l2-app-chrome-skin.css?v=20260709perfLayout1')
    .replace(/l2-app-chrome-skin\.css\?v=20260708globalClsAll2/g, 'l2-app-chrome-skin.css?v=20260709perfLayout1');
  if (t !== before) {
    fs.writeFileSync(p, t, 'utf8');
    console.log('UPDATED', file);
  }
}
