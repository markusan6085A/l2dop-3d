/**
 * Помічник для новачків: інвентар → баф → місто → Gludio → полювання → скіли.
 */
(function (global) {
  var L2 = global.L2 || (global.L2 = {});
  var STORAGE_STEP_KEY = 'l2-helper-step';
  var STORAGE_LEGACY_KEY = 'l2-helper-buffer-tip';
  var STORAGE_GRIND_LEVEL_KEY = 'l2-helper-grind-level';
  var STORAGE_LEARN5_DONE_KEY = 'l2-helper-learn5-done';
  var STORAGE_SKILLS_SEEN_KEY = 'l2-helper-skills-seen';
  var LINK_COLOR = '#bfa88a';
  var FIRST_LEARN_MIN_LEVEL = 5;
  var GLUDIO_CITY_ID = 'l2dop_gludio';
  var GLUDIO_MAGISTER_NPC_ID = 30344;
  var SKILLS_PAGE_HREF =
    '/magister.html?npcId=' + encodeURIComponent(String(GLUDIO_MAGISTER_NPC_ID));
  var TOWN_BUFFER_SKILL_IDS = [
    1036, 1040, 1045, 1048, 1059, 1062, 1068, 1077, 1085, 1086, 1240,
  ];
  var RENDER_STEPS = {
    inventory: 1,
    buffer: 1,
    city: 1,
    hunt: 1,
    fight: 1,
    learn5: 1,
    'skills-new': 1,
  };
  var learnCheckInFlight = false;
  var dismissedHelperStep = null;

  function getHelperStep() {
    try {
      var step = localStorage.getItem(STORAGE_STEP_KEY);
      if (step === 'learn') step = 'learn5';
      if (step) return step;
      if (localStorage.getItem(STORAGE_LEGACY_KEY) === '1') return 'inventory';
      return null;
    } catch (e) {
      return null;
    }
  }

  function setHelperStep(step) {
    try {
      if (step) {
        localStorage.setItem(STORAGE_STEP_KEY, step);
      } else {
        localStorage.removeItem(STORAGE_STEP_KEY);
      }
      localStorage.removeItem(STORAGE_LEGACY_KEY);
    } catch (e) {
      /* ignore */
    }
    dismissedHelperStep = null;
  }

  function isLearn5Done() {
    try {
      return localStorage.getItem(STORAGE_LEARN5_DONE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function markLearn5Done() {
    try {
      localStorage.setItem(STORAGE_LEARN5_DONE_KEY, '1');
    } catch (e) {
      /* ignore */
    }
  }

  function readSkillsSeenIds() {
    try {
      var raw = localStorage.getItem(STORAGE_SKILLS_SEEN_KEY);
      if (!raw) return [];
      return raw
        .split(',')
        .map(function (x) {
          return String(x || '').trim();
        })
        .filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  function writeSkillsSeenIds(ids) {
    try {
      var uniq = [];
      var seen = {};
      (ids || []).forEach(function (id) {
        var s = String(id || '').trim();
        if (!s || seen[s]) return;
        seen[s] = true;
        uniq.push(s);
      });
      uniq.sort();
      localStorage.setItem(STORAGE_SKILLS_SEEN_KEY, uniq.join(','));
    } catch (e) {
      /* ignore */
    }
  }

  function readGrindLevel() {
    try {
      var raw = localStorage.getItem(STORAGE_GRIND_LEVEL_KEY);
      var n = Number(raw);
      return Number.isFinite(n) && n > 0 ? n : null;
    } catch (e) {
      return null;
    }
  }

  function writeGrindLevel(level) {
    try {
      localStorage.setItem(STORAGE_GRIND_LEVEL_KEY, String(level));
    } catch (e) {
      /* ignore */
    }
  }

  function clearGrindLevel() {
    try {
      localStorage.removeItem(STORAGE_GRIND_LEVEL_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  L2.markHelperBufferTipPending = function () {
    setHelperStep('inventory');
  };

  L2.markHelperTutorialPending = function () {
    setHelperStep('inventory');
  };

  L2.dismissHelperBufferTip = function () {
    setHelperStep(null);
    clearGrindLevel();
    try {
      localStorage.removeItem(STORAGE_LEARN5_DONE_KEY);
      localStorage.removeItem(STORAGE_SKILLS_SEEN_KEY);
    } catch (e) {
      /* ignore */
    }
  };

  L2.advanceHelperToHuntTip = function () {
    setHelperStep('hunt');
  };

  function hasTownBufferBuffs(c) {
    if (!c || !Array.isArray(c.activeBuffs)) return false;
    for (var i = 0; i < c.activeBuffs.length; i++) {
      var sid = Number(c.activeBuffs[i] && c.activeBuffs[i].skillId);
      if (TOWN_BUFFER_SKILL_IDS.indexOf(sid) >= 0) return true;
    }
    return false;
  }

  function hasEquippedGear(c) {
    var eq = c && c.inventory && c.inventory.eq;
    if (!eq || typeof eq !== 'object') return false;
    var keys = [
      'l1',
      'l2',
      'l3',
      'l4',
      'lh',
      'lg',
      'lf',
      'lr1',
      'lr2',
      'le1',
      'le2',
      'neck',
    ];
    for (var i = 0; i < keys.length; i++) {
      var v = eq[keys[i]];
      if (v == null) continue;
      if (typeof v === 'number' && v > 0) return true;
      if (typeof v === 'object' && v.itemId != null && Number(v.itemId) > 0) {
        return true;
      }
    }
    return false;
  }

  function isCityHubPage() {
    if (typeof document === 'undefined' || !document.body) return false;
    if (document.body.classList.contains('l2-page-char')) return false;
    if (document.body.classList.contains('l2-page-map')) return false;
    return !!document.getElementById('city-services');
  }

  function isMagisterHubPage() {
    if (typeof document === 'undefined' || !document.body) return false;
    return (
      document.body.classList.contains('l2-page-magisters') ||
      document.body.classList.contains('l2-page-magister')
    );
  }

  function learnableBattleIds(skills) {
    var out = [];
    if (!Array.isArray(skills)) return out;
    for (var i = 0; i < skills.length; i++) {
      var s = skills[i];
      if (s && s.canLearn && s.battleId) out.push(String(s.battleId));
    }
    return out;
  }

  function hasNewLearnableIds(currentIds, seenIds) {
    var seen = {};
    (seenIds || []).forEach(function (id) {
      seen[id] = true;
    });
    for (var i = 0; i < currentIds.length; i++) {
      if (!seen[currentIds[i]]) return true;
    }
    return false;
  }

  function fetchMagisterSkills() {
    var t = L2.token ? L2.token() : null;
    if (!t) return Promise.resolve([]);
    return fetch(
      '/character/magister?npcId=' + encodeURIComponent(String(GLUDIO_MAGISTER_NPC_ID)),
      {
        headers: { Authorization: 'Bearer ' + t },
        cache: 'no-store',
      }
    )
      .then(function (r) {
        if (!r.ok) return [];
        return r.json();
      })
      .then(function (j) {
        return Array.isArray(j && j.skills) ? j.skills : [];
      })
      .catch(function () {
        return [];
      });
  }

  function fetchLearnableSkillOffers() {
    return fetchMagisterSkills().then(function (skills) {
      return learnableBattleIds(skills);
    });
  }

  function hasSkillsForLearn5Tip(skills, level) {
    if (!Array.isArray(skills) || skills.length === 0) return false;
    var lvl = Number(level);
    if (!Number.isFinite(lvl)) return false;
    for (var i = 0; i < skills.length; i++) {
      var s = skills[i];
      if (!s || s.learnedMax) continue;
      var minLv = Number(s.minLevel);
      if (!Number.isFinite(minLv) || minLv > lvl) continue;
      var cur = Number(s.skillLevel || 0);
      var max = Number(s.maxSkillLevel || 1);
      if (cur < max) return true;
    }
    return false;
  }

  function isEarlyTutorialStep(step) {
    return (
      step === 'inventory' ||
      step === 'buffer' ||
      step === 'city' ||
      step === 'hunt'
    );
  }

  function shouldTryLearn5Tip(c) {
    if (isLearn5Done()) return false;
    if (!c || Number(c.level) < FIRST_LEARN_MIN_LEVEL) return false;
    var step = getHelperStep();
    if (step !== 'fight' && step !== 'grinding') return false;
    return true;
  }

  function acknowledgeCurrentLearnableSkills() {
    return fetchLearnableSkillOffers().then(function (ids) {
      writeSkillsSeenIds(ids);
      return ids;
    });
  }

  function finishSkillsHelperVisit() {
    setHelperStep('skills-watch');
    clearGrindLevel();
    void acknowledgeCurrentLearnableSkills();
  }

  function maybeAdvanceToLearn5(c) {
    if (!shouldTryLearn5Tip(c)) return;
    if (learnCheckInFlight) return;
    learnCheckInFlight = true;
    fetchMagisterSkills()
      .then(function (skills) {
        learnCheckInFlight = false;
        if (!hasSkillsForLearn5Tip(skills, c.level)) return;
        setHelperStep('learn5');
        renderHelper('learn5');
      })
      .catch(function () {
        learnCheckInFlight = false;
      });
  }

  function maybeShowNewSkillsTip(c) {
    if (!isLearn5Done()) return;
    var step = getHelperStep();
    if (step === 'learn5' || step === 'skills-new') return;
    if (!c || Number(c.level) < FIRST_LEARN_MIN_LEVEL) return;
    if (learnCheckInFlight) return;
    learnCheckInFlight = true;
    fetchLearnableSkillOffers()
      .then(function (ids) {
        learnCheckInFlight = false;
        if (!ids.length) return;
        if (!hasNewLearnableIds(ids, readSkillsSeenIds())) return;
        setHelperStep('skills-new');
        renderHelper('skills-new');
      })
      .catch(function () {
        learnCheckInFlight = false;
      });
  }

  function resolveHelperStep(c) {
    var step = getHelperStep();
    if (!step) {
      if (isLearn5Done()) maybeShowNewSkillsTip(c);
      return null;
    }
    if (step === 'buffer' && c && !hasEquippedGear(c)) {
      setHelperStep('inventory');
      return 'inventory';
    }
    if (step === 'inventory' && c && hasEquippedGear(c)) {
      setHelperStep('buffer');
      return 'buffer';
    }
    if (step === 'buffer' && c && hasTownBufferBuffs(c)) {
      setHelperStep('city');
      return 'city';
    }
    if (step === 'city') {
      if (isCityHubPage()) {
        setHelperStep('hunt');
        return 'hunt';
      }
      return 'city';
    }
    if (
      (step === 'fight' || step === 'grinding') &&
      c &&
      Number(c.level) >= FIRST_LEARN_MIN_LEVEL &&
      !isLearn5Done()
    ) {
      maybeAdvanceToLearn5(c);
      if (getHelperStep() === 'learn5') return 'learn5';
      return null;
    }
    if (step === 'skills-watch') {
      maybeShowNewSkillsTip(c);
      return null;
    }
    if ((step === 'learn5' || step === 'skills-new') && isMagisterHubPage()) {
      if (step === 'learn5') markLearn5Done();
      finishSkillsHelperVisit();
      return null;
    }
    return RENDER_STEPS[step] ? step : null;
  }

  function getHudPanel() {
    return (
      document.querySelector('.l2-hud-panel') ||
      document.getElementById('l2-hud-panel-mount')
    );
  }

  function createLink(href, text) {
    var link = document.createElement('a');
    link.className = 'l2-game-helper__link';
    link.href = href;
    link.textContent = text;
    link.style.color = LINK_COLOR;
    return link;
  }

  function createGludioMapLink() {
    var link = createLink('#', 'Town of Gludio');
    link.addEventListener('click', function (e) {
      e.preventDefault();
      setHelperStep('fight');
      void L2.helperGoToGludioMap();
    });
    return link;
  }

  function buildInventoryText(p) {
    p.appendChild(document.createTextNode('Перейди в '));
    p.appendChild(createLink('/char.html', 'Інвентар'));
    p.appendChild(document.createTextNode(' і одягни спорядження.'));
  }

  function buildBufferText(p) {
    var label = document.createElement('span');
    label.className = 'l2-game-helper__label';
    label.textContent = 'Помічник:';
    p.appendChild(label);
    p.appendChild(document.createTextNode(' Перейди в '));
    p.appendChild(createLink('/town-buffer.html', 'Магічна статуя'));
    p.appendChild(document.createTextNode(' і візьми баф.'));
  }

  function buildCityText(p) {
    var label = document.createElement('span');
    label.className = 'l2-game-helper__label';
    label.textContent = 'Помічник:';
    p.appendChild(label);
    p.appendChild(document.createTextNode(' Перейди в '));
    p.appendChild(createLink('/city.html', 'Місто'));
    p.appendChild(document.createTextNode('.'));
  }

  function buildHuntText(p) {
    p.appendChild(
      document.createTextNode(
        'Відмінно! Час перевірити свою силу. Телепортуйся до '
      )
    );
    p.appendChild(createGludioMapLink());
    p.appendChild(
      document.createTextNode(
        ' та вирушай в околиці міста. Полюй на монстрів, отримуй досвід і ставай сильнішим!'
      )
    );
  }

  function buildFightText(p) {
    var label = document.createElement('span');
    label.className = 'l2-game-helper__label';
    label.textContent = 'Помічник:';
    p.appendChild(label);
    p.appendChild(
      document.createTextNode(' Бий мобів свого уровня і ставай сильнішим!')
    );
  }

  function buildLearn5Text(p) {
    p.appendChild(
      document.createTextNode(
        'Відмінно! Ти вже став сильнішим, саме час вивчити навички. Перейди в '
      )
    );
    var link = createLink('/magisters.html', 'Гільдія магів');
    link.addEventListener('click', function () {
      markLearn5Done();
      finishSkillsHelperVisit();
    });
    p.appendChild(link);
    p.appendChild(document.createTextNode(' і натисни Вивчити навички!'));
  }

  function buildSkillsNewText(p) {
    p.appendChild(document.createTextNode('Вам доступні нові навички. '));
    var link = createLink(SKILLS_PAGE_HREF, 'Перейти');
    link.addEventListener('click', function () {
      finishSkillsHelperVisit();
    });
    p.appendChild(link);
  }

  function appendCloseControl(p, step) {
    p.appendChild(document.createTextNode(' '));
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'l2-game-helper__close';
    close.textContent = 'Закрити';
    close.addEventListener('click', function () {
      dismissedHelperStep = step;
      if (step === 'skills-new') {
        setHelperStep('skills-watch');
        void acknowledgeCurrentLearnableSkills();
      } else if (step === 'learn5') {
        markLearn5Done();
        finishSkillsHelperVisit();
      } else {
        var snap = L2.lastSnapshot ? L2.lastSnapshot() : null;
        var lvl = snap && snap.level != null ? Number(snap.level) : 1;
        if (lvl >= FIRST_LEARN_MIN_LEVEL) {
          markLearn5Done();
          finishSkillsHelperVisit();
        } else {
          setHelperStep(null);
          clearGrindLevel();
        }
      }
      hideHelper();
    });
    p.appendChild(close);
  }

  function buildHelperShell() {
    var aside = document.createElement('aside');
    aside.className = 'l2-game-helper';
    aside.id = 'l2-game-helper';
    aside.setAttribute('role', 'complementary');
    aside.setAttribute('aria-label', 'Помічник');

    var img = document.createElement('img');
    img.className = 'l2-game-helper__avatar';
    img.src = '/assets/helper.jpg';
    img.alt = '';
    img.width = 38;
    img.height = 38;
    img.decoding = 'async';
    img.addEventListener('error', function onErr() {
      img.removeEventListener('error', onErr);
      img.src = '/icons/drops/other.svg';
    });

    var p = document.createElement('p');
    p.className = 'l2-game-helper__text';

    aside.appendChild(img);
    aside.appendChild(p);
    return aside;
  }

  function renderHelper(step) {
    var existing = document.getElementById('l2-game-helper');
    if (!existing) {
      existing = buildHelperShell();
      var hud = getHudPanel();
      if (!hud || !hud.parentNode) return;
      if (hud.nextSibling) {
        hud.parentNode.insertBefore(existing, hud.nextSibling);
      } else {
        hud.parentNode.appendChild(existing);
      }
    }

    if (existing.dataset.helperStep !== step) {
      var p = existing.querySelector('.l2-game-helper__text');
      if (!p) return;
      p.textContent = '';
      if (step === 'inventory') buildInventoryText(p);
      else if (step === 'buffer') buildBufferText(p);
      else if (step === 'city') buildCityText(p);
      else if (step === 'hunt') buildHuntText(p);
      else if (step === 'fight') buildFightText(p);
      else if (step === 'learn5') buildLearn5Text(p);
      else if (step === 'skills-new') buildSkillsNewText(p);
      appendCloseControl(p, step);
      existing.dataset.helperStep = step;
    }

    if (dismissedHelperStep === step) {
      existing.hidden = true;
      return;
    }

    existing.hidden = false;
  }

  function hideHelper() {
    var el = document.getElementById('l2-game-helper');
    if (el) el.hidden = true;
  }

  L2.onHelperMobClicked = function () {
    var step = getHelperStep();
    if (step !== 'fight' && step !== 'grinding') return;
    var c = L2.lastSnapshot ? L2.lastSnapshot() : null;
    var lvl = c && c.level != null ? Number(c.level) : 1;
    if (!Number.isFinite(lvl) || lvl < 1) lvl = 1;
    writeGrindLevel(lvl);
    setHelperStep('grinding');
    hideHelper();
    if (lvl >= FIRST_LEARN_MIN_LEVEL) {
      maybeAdvanceToLearn5(c);
    }
  };

  async function teleportToGludioIfNeeded() {
    var t = L2.token ? L2.token() : null;
    if (!t) return;
    var snap = L2.lastSnapshot ? L2.lastSnapshot() : null;
    if (!snap || snap.revision == null) {
      if (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function') {
        snap = await L2.resyncCharacterWhenRequired();
      }
    }
    if (!snap || String(snap.cityId || '') === GLUDIO_CITY_ID) return;

    async function postTp(revision) {
      return fetch('/game/teleport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({
          teleportId: 'gludio',
          expectedRevision: revision,
        }),
      });
    }

    var r = await postTp(snap.revision);
    if (r.status === 409) {
      if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
        try {
          var conflictBody = {};
          try {
            conflictBody = await r.json();
          } catch (e409) {
            conflictBody = {};
          }
          snap = await L2.resyncCharacterAfterConflict(null, conflictBody);
          if (snap) r = await postTp(snap.revision);
        } catch (eResync) {
          /* ignore */
        }
      }
    }
    if (!r.ok) return;
    var j = await r.json();
    if (j.character) {
      if (L2.setLastSnapshot) L2.setLastSnapshot(j.character);
      if (L2.applyHudFromSnapshot) L2.applyHudFromSnapshot(j.character);
    }
  }

  L2.helperGoToGludioMap = async function () {
    setHelperStep('fight');
    try {
      await teleportToGludioIfNeeded();
    } catch (e) {
      /* ignore */
    }
    window.location.href = '/map.html';
  };

  L2.syncGameHelper = function (c) {
    var step = resolveHelperStep(c);
    if (!step && shouldTryLearn5Tip(c)) {
      maybeAdvanceToLearn5(c);
      step = getHelperStep();
    }
    if (!step && isLearn5Done()) {
      step = getHelperStep();
    }
    if (step && RENDER_STEPS[step]) {
      if (dismissedHelperStep === step) {
        hideHelper();
        return;
      }
      renderHelper(step);
    } else {
      hideHelper();
    }
  };

  L2.mountGameHelper = function () {
    var c = L2.lastSnapshot ? L2.lastSnapshot() : null;
    L2.syncGameHelper(c);
  };
})(window);
