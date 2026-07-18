/**
 * Dev: дерево професій → POST /character/dev-self-profession
 */
(function () {
  var TIER_LABELS = ['Старт', '1 профа', '2 профа', '3 профа'];
  var treePayload = null;
  var activeRaceId = 'Human';
  var inFlight = false;
  var snapshot = null;

  function $(id) {
    return document.getElementById(id);
  }

  function showMsg(text, isErr) {
    var el = $('l2-dev-prof-msg');
    if (!el) return;
    el.hidden = !text;
    el.textContent = text || '';
    el.style.color = isErr ? '#f87171' : 'var(--gold, #e8c038)';
  }

  function profLabelUk(prof, ch) {
    if (window.L2 && typeof L2.hudL2ProfessionUkFromSnapshot === 'function' && ch) {
      var fake = Object.assign({}, ch, { l2Profession: prof });
      return L2.hudL2ProfessionUkFromSnapshot(fake);
    }
    return prof.replace(/_/g, ' ');
  }

  function fmtCurrent(ch) {
    if (!ch) return '';
    return (
      'Зараз: ' +
      ch.name +
      ' · ' +
      (ch.race || '—') +
      ' · ' +
      profLabelUk(ch.l2Profession, ch) +
      ' · Lv ' +
      ch.level +
      ' · rev ' +
      ch.revision
    );
  }

  function loadCharacter() {
    var t = localStorage.getItem('token');
    var cur = $('l2-dev-prof-current');
    if (!t || !window.fetch) {
      if (cur) cur.textContent = 'Увійди в гру.';
      return Promise.resolve(null);
    }
    return (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
      ? L2.resyncCharacterWhenRequired()
      : Promise.resolve(null)
    )
      .then(function (ch) {
        snapshot = ch;
        if (!ch) {
          if (cur) cur.textContent = 'Немає персонажа.';
          return null;
        }
        if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
          L2.applyMutationSnapshot(ch);
        }
        if (ch.race) activeRaceId = ch.race;
        if (cur) cur.textContent = fmtCurrent(ch);
        renderTrees();
        renderRaceTabs();
        return ch;
      })
      .catch(function () {
        if (cur) cur.textContent = 'Не вдалося завантажити дані.';
        return null;
      });
  }

  function loadTree() {
    return fetch('/character/dev-profession-tree')
      .then(function (r) {
        if (!r.ok) throw new Error('tree');
        return r.json();
      })
      .then(function (payload) {
        treePayload = payload;
        renderRaceTabs();
        renderTrees();
      });
  }

  function raceBlock() {
    if (!treePayload || !Array.isArray(treePayload.races)) return null;
    for (var i = 0; i < treePayload.races.length; i++) {
      if (treePayload.races[i].id === activeRaceId) return treePayload.races[i];
    }
    return treePayload.races[0] || null;
  }

  function renderRaceTabs() {
    var host = $('l2-dev-prof-race-tabs');
    if (!host || !treePayload) return;
    host.innerHTML = '';
    treePayload.races.forEach(function (race) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'l2-dev-prof-race-tab' +
        (race.id === activeRaceId ? ' l2-dev-prof-race-tab--active' : '');
      btn.textContent = race.labelUk;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', race.id === activeRaceId ? 'true' : 'false');
      btn.addEventListener('click', function () {
        activeRaceId = race.id;
        renderRaceTabs();
        renderTrees();
      });
      host.appendChild(btn);
    });
  }

  function renderTrees() {
    var host = $('l2-dev-prof-trees');
    if (!host) return;
    host.innerHTML = '';
    var race = raceBlock();
    if (!race) return;

    race.trees.forEach(function (tree) {
      var block = document.createElement('section');
      block.className = 'l2-dev-prof-tree';

      var h = document.createElement('h2');
      h.className = 'l2-dev-prof-tree__title';
      h.textContent = tree.labelUk;
      block.appendChild(h);

      var grid = document.createElement('div');
      grid.className = 'l2-dev-prof-tree__grid';

      tree.tiers.forEach(function (tier, tierIdx) {
        var col = document.createElement('div');
        col.className = 'l2-dev-prof-tree__col';

        var cap = document.createElement('div');
        cap.className = 'l2-dev-prof-tree__tier';
        cap.textContent = TIER_LABELS[tierIdx] || 'Tier ' + tierIdx;
        col.appendChild(cap);

        tier.forEach(function (prof) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'l2-dev-prof-node';
          if (snapshot && snapshot.l2Profession === prof) {
            btn.classList.add('l2-dev-prof-node--active');
          }
          btn.disabled = inFlight;
          btn.title = prof;
          btn.innerHTML =
            '<span class="l2-dev-prof-node__name">' +
            profLabelUk(prof, snapshot) +
            '</span>' +
            '<span class="l2-dev-prof-node__slug">' +
            prof +
            '</span>';
          btn.addEventListener('click', function () {
            applyProfession(prof);
          });
          col.appendChild(btn);
        });

        grid.appendChild(col);
      });

      block.appendChild(grid);
      host.appendChild(block);
    });
  }

  function applyProfession(prof) {
    if (inFlight) return;
    var t = localStorage.getItem('token');
    if (!t) {
      showMsg('Потрібен вхід.', true);
      return;
    }
    var snap =
      window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : snapshot;
    if (!snap || typeof snap.revision !== 'number') {
      showMsg('Онови snapshot (F5).', true);
      loadCharacter();
      return;
    }

    inFlight = true;
    showMsg('Змінюю…', false);
    renderTrees();

    fetch('/character/dev-self-profession', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + t,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expectedRevision: snap.revision,
        l2Profession: prof,
      }),
    })
      .then(function (r) {
        return r.json().then(function (j) {
          return { ok: r.ok, status: r.status, j: j };
        });
      })
      .then(function (x) {
        if (x.ok && x.j && x.j.character) {
          snapshot = x.j.character;
          if (L2.setLastSnapshot) L2.setLastSnapshot(x.j.character);
          if (typeof L2.applyHudFromSnapshot === 'function') {
            L2.applyHudFromSnapshot(x.j.character);
          }
          activeRaceId = x.j.character.race || activeRaceId;
          var cur = $('l2-dev-prof-current');
          if (cur) cur.textContent = fmtCurrent(x.j.character);
          showMsg('Професію змінено.', false);
          renderRaceTabs();
          renderTrees();
          return;
        }
        var uk =
          x.j && x.j.messageUk ? x.j.messageUk : 'Помилка ' + (x.status || '') + '.';
        showMsg(uk, true);
        if (x.status === 409) loadCharacter();
      })
      .catch(function () {
        showMsg('Мережа або сервер недоступні.', true);
      })
      .finally(function () {
        inFlight = false;
        renderTrees();
      });
  }

  function init() {
    fetch('/game/client-config')
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (cfg) {
        if (!cfg || cfg.devSelfBoost !== true) {
          window.location.replace('/menu.html');
          return;
        }
        if (window.L2 && typeof L2.mountL2Nav === 'function') {
          L2.mountL2Nav({ onStub: function () {} });
        }
        return loadTree().then(function () {
          return loadCharacter();
        });
      })
      .catch(function () {
        window.location.replace('/menu.html');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
