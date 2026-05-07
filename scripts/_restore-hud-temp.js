const fs = require("fs");
const path = require("path");

const expDash = `            <div class="l2-hud-exp-wrap">
              <div class="l2-hud-exp-head">
                <span class="l2-hud-exp-title">Exp</span>
                <span class="l2-hud-exp-nums"
                  ><span id="l2-hud-exp-cur">—</span> / <span id="l2-hud-exp-max">—</span></span
                >
              </div>
              <div
                class="l2-hud-exp-bar"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow="0"
                id="l2-hud-exp-bar"
              >
                <div class="l2-hud-exp-fill" id="l2-hud-exp-fill" style="width: 0%"></div>
              </div>
            </div>`;

function vitals(g) {
  return `            <div class="l2-hud-vitals" aria-label="Статуси" role="group">
              <div class="l2-hud-stat l2-hud-stat--hp">
                <div class="l2-hud-stat-hd">
                  <span class="l2-hud-stat-ic" title="HP">
                    <svg class="l2-hud-vi-svg" viewBox="0 0 32 32" width="16" height="16">
                      <path
                        fill="#e64a4a"
                        d="M16 28S4 20.2 4 12.5C4 8.1 7.1 4 11.3 4c2.2 0 4.1 1.1 4.7 2.2.6-1.1 2.5-2.2 4.7-2.2C24.9 4 28 8.1 28 12.5 28 20.2 16 28 16 28z"
                      />
                    </svg>
                  </span>
                  <span class="l2-hud-stat-lbl">HP</span>
                  <span class="l2-hud-stat-nums"
                    ><span id="l2-hud-hp-cur">—</span> / <span id="l2-hud-hp-max">—</span></span
                  >
                </div>
                <div class="l2-hud-stat-bar">
                  <div class="l2-hud-stat-inner" id="l2-hud-hp-inner" style="width: 0%"></div>
                </div>
              </div>
              <div class="l2-hud-stat l2-hud-stat--mp">
                <div class="l2-hud-stat-hd">
                  <span class="l2-hud-stat-ic" title="MP">
                    <svg class="l2-hud-vi-svg" viewBox="0 0 32 32" width="16" height="16">
                      <defs>
                        <linearGradient id="l2hudMP${g}" x1="12" y1="3" x2="20" y2="10" gradientUnits="userSpaceOnUse">
                          <stop stop-color="#c8e8ff" />
                          <stop offset="1" stop-color="#0d4a9c" />
                        </linearGradient>
                      </defs>
                      <path
                        fill="url(#l2hudMP${g})"
                        d="M16 3l1.1 2.1 2.3.3-1.6 1.5.3 2.3-2.1-1.1-2.1 1.1.3-2.3-1.6-1.5 2.3-.3L16 3z"
                      />
                    </svg>
                  </span>
                  <span class="l2-hud-stat-lbl">MP</span>
                  <span class="l2-hud-stat-nums"
                    ><span id="l2-hud-mp-cur">—</span> / <span id="l2-hud-mp-max">—</span></span
                  >
                </div>
                <div class="l2-hud-stat-bar">
                  <div class="l2-hud-stat-inner" id="l2-hud-mp-inner" style="width: 0%"></div>
                </div>
              </div>
              <div class="l2-hud-stat l2-hud-stat--sp">
                <div class="l2-hud-stat-hd">
                  <span class="l2-hud-stat-ic" title="SP">
                    <svg class="l2-hud-vi-svg" viewBox="0 0 32 32" width="16" height="16">
                      <defs>
                        <linearGradient id="l2hudSP${g}" x1="8" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                          <stop stop-color="#fff4a0" />
                          <stop offset="0.5" stop-color="#e6b800" />
                          <stop offset="1" stop-color="#6a4800" />
                        </linearGradient>
                      </defs>
                      <path fill="url(#l2hudSP${g})" d="M18 2L4 20h7l-3 10 20-20h-7l-3-8z" />
                    </svg>
                  </span>
                  <span class="l2-hud-stat-lbl">SP</span>
                  <span class="l2-hud-stat-nums"
                    ><span id="l2-hud-sp-cur">—</span> / <span id="l2-hud-sp-max">—</span></span
                  >
                </div>
                <div class="l2-hud-stat-bar">
                  <div class="l2-hud-stat-inner" id="l2-hud-sp-inner" style="width: 0%"></div>
                </div>
              </div>
            </div>`;
}

const needle = `            </div>
            
          </header>`;

const needleNoBlank = `            </div>
          </header>`;

const insert12 = (g) => `            </div>\n${expDash}\n${vitals(g)}\n          </header>`;

const files12 = [
  ["char.html", "char"],
  ["donate.html", "don"],
  ["map.html", "map"],
  ["teleport.html", "tp"],
  ["magister.html", "mgstr"],
  ["options.html", "opt"],
  ["gm-shop.html", "gm"],
  ["pers.html", "pers"],
];

const root = path.join(__dirname, "..", "server", "public");

for (const [fn, g] of files12) {
  const fp = path.join(root, fn);
  let s = fs.readFileSync(fp, "utf8");
  const rep = insert12(g);
  if (s.includes(needle)) {
    s = s.replace(needle, rep);
  } else if (s.includes(needleNoBlank)) {
    s = s.replace(needleNoBlank, rep);
  } else {
    console.error("no needle", fn);
    continue;
  }
  fs.writeFileSync(fp, s, "utf8");
  console.log("ok", fn);
}

const exp14 = expDash.replace(/^            /gm, "              ");
function vitals14(g) {
  return vitals(g).replace(/^            /gm, "              ");
}
const insert14 = (g) =>
  `              </div>\n${exp14}\n${vitals14(g)}\n            </header>`;

const needle14 = `              </div>
              
            </header>`;

const needle14nb = `              </div>
            </header>`;

for (const [fn, g] of [
  ["city.html", "city"],
  ["magisters.html", "mgs"],
]) {
  const fp = path.join(root, fn);
  let s = fs.readFileSync(fp, "utf8");
  const rep = insert14(g);
  if (s.includes(needle14)) s = s.replace(needle14, rep);
  else if (s.includes(needle14nb)) s = s.replace(needle14nb, rep);
  else {
    console.error("no needle14", fn);
    continue;
  }
  fs.writeFileSync(fp, s, "utf8");
  console.log("ok", fn);
}
