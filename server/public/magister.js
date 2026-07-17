/**
 * Сторінка магістра: іконка + назва, рівень, SP, опис, MP / сила скіла.
 */
(function () {
  var magisterActionInFlight = false;

  function $(id) {
    return document.getElementById(id);
  }

  function magisterNpcIdQuery() {
    try {
      var p = new URLSearchParams(window.location.search);
      var v = p.get('npcId');
      if (v == null || String(v).trim() === '') return '';
      var n = Number(v);
      if (!Number.isInteger(n) || n < 1) return '';
      return String(n);
    } catch (e) {
      return '';
    }
  }

  function magisterApiUrl() {
    var q = magisterNpcIdQuery();
    return q ? '/character/magister?npcId=' + encodeURIComponent(q) : '/character/magister';
  }

  function magisterViewModeQuery() {
    try {
      var p = new URLSearchParams(window.location.search);
      var v = String(p.get('mode') || '').trim().toLowerCase();
      return v;
    } catch (e) {
      return '';
    }
  }

  /** Узгоджено з server skillIconAssetIdForDisplay: 141↔142 у файлах іконок. */
  function magisterSkillIconUrl(s) {
    var id = s.l2SkillId;
    if (id === 141) id = 142;
    else if (id === 142) id = 141;
    if (window.L2 && typeof L2.resolveSkillIconUrl === 'function') {
      return L2.resolveSkillIconUrl(id, s.iconUrl);
    }
    if (s.iconUrl && String(s.iconUrl).charAt(0) === '/') return s.iconUrl;
    return '/game/skill-icon/' + id;
  }

  function updateHeroLine(c) {
    if (!c) return;
    if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
      L2.applyHudFromSnapshot(c);
    }
  }

  function applyMagisterSnapshot(snapshot) {
    if (!snapshot) return;
    if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(snapshot);
      return;
    }
    if (window.L2 && typeof L2.applyCharacterSnapshot === 'function') {
      L2.applyCharacterSnapshot(snapshot);
      return;
    }
    if (window.L2 && typeof L2.setLastSnapshot === 'function') {
      L2.setLastSnapshot(snapshot);
    }
    updateHeroLine(snapshot);
  }

  async function refreshCharacterSnapshot() {
    if (window.L2 && typeof L2.getCachedCharacter === 'function') {
      var cached = L2.getCachedCharacter();
      if (cached) {
        applyMagisterSnapshot(cached);
        return;
      }
    }
    if (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function') {
      var c = await L2.resyncCharacterWhenRequired();
      if (c) applyMagisterSnapshot(c);
    }
  }

  function setMagisterSkillIconFrameOuter(frame, logicalW, logicalH) {
    var borderPx = 1;
    frame.style.width = logicalW + borderPx * 2 + 'px';
    frame.style.height = logicalH + borderPx * 2 + 'px';
  }

  function mediaMinDpr(minVal) {
    try {
      if (!window.matchMedia) return false;
      var s = String(minVal);
      return (
        window.matchMedia('(min-resolution: ' + s + 'dppx)').matches ||
        window.matchMedia('(-webkit-min-device-pixel-ratio: ' + s + ')').matches
      );
    } catch (e) {
      return false;
    }
  }

  function effectiveSkillIconDpr() {
    var r = Number(window.devicePixelRatio);
    if (!(r >= 1)) r = 1;
    try {
      if (mediaMinDpr(2)) r = Math.max(r, 2);
      else if (mediaMinDpr(1.5)) r = Math.max(r, 1.5);
      else if (mediaMinDpr(1.25)) r = Math.max(r, 1.25);
    } catch (e) {
      /* ignore */
    }
    try {
      if (window.visualViewport && window.visualViewport.scale > 1) {
        r = Math.max(r, Math.min(3, window.visualViewport.scale));
      }
    } catch (e2) {
      /* ignore */
    }
    if (r > 3) r = 3;
    return r;
  }

  var SKILL_ICON_CACHE_BUST = 'icb=7';

  function magisterSkillIconUrlWithDpr(iconUrl) {
    if (iconUrl && String(iconUrl).indexOf('/skills/') === 0) {
      return iconUrl;
    }
    var dpr = effectiveSkillIconDpr();
    var sep = iconUrl.indexOf('?') >= 0 ? '&' : '?';
    return (
      iconUrl +
      sep +
      'dpr=' +
      encodeURIComponent(String(dpr)) +
      '&' +
      SKILL_ICON_CACHE_BUST
    );
  }

  function mountMagisterSkillIconCrisp(frame, iconUrl) {
    frame.innerHTML = '';
    var dpr = effectiveSkillIconDpr();
    var url = magisterSkillIconUrlWithDpr(iconUrl);
    var img = document.createElement('img');
    img.className = 'l2-magister-skill-icon';
    img.alt = '';
    img.decoding = 'async';
    img.onload = function () {
      var nw = img.naturalWidth || 1;
      var nh = img.naturalHeight || 1;
      /**
       * Деякі старі іконки приходять дуже дрібними; тримаємо мін. 32x32,
       * щоб у картці магістра іконка не виглядала «порожньою».
       */
      var logW = Math.max(32, Math.round(nw / dpr));
      var logH = Math.max(32, Math.round(nh / dpr));
      img.style.width = logW + 'px';
      img.style.height = logH + 'px';
      setMagisterSkillIconFrameOuter(frame, logW, logH);
    };
    img.onerror = function () {
      img.onerror = null;
      img.onload = function () {
        var nw2 = img.naturalWidth || 32;
        var nh2 = img.naturalHeight || 32;
        var w = Math.max(32, nw2 * 1);
        var h = Math.max(32, nh2 * 1);
        img.style.width = w + 'px';
        img.style.height = h + 'px';
        setMagisterSkillIconFrameOuter(frame, w, h);
      };
      img.src = iconUrl;
    };
    img.src = url;
    frame.appendChild(img);
  }

  function passiveDescriptionUk(s) {
    var note =
      s && s.statsNoteUk != null ? String(s.statsNoteUk).trim() : '';
    if (note) return note;
    var hint = s && s.hintUk != null ? String(s.hintUk).trim() : '';
    if (hint) return hint.replace(/^Пасив\s*·\s*/i, 'Пасив: ');
    return 'Пасив.';
  }

  function combatLine(s) {
    return '';
  }

  function renderLearnedOnlyList(list, d) {
    var snap =
      window.L2 && typeof L2.lastSnapshot === 'function'
        ? L2.lastSnapshot()
        : null;
    var learned = snap && Array.isArray(snap.learnedBattleSkillsDetail)
      ? snap.learnedBattleSkillsDetail
      : [];
    var byBattleId = Object.create(null);
    (d.skills || []).forEach(function (s) {
      var k = String((s && s.battleId) || '').trim();
      if (k) byBattleId[k] = s;
    });

    if (!learned.length) {
      var empty = document.createElement('li');
      empty.className = 'l2-magisters-empty';
      empty.textContent = 'Ще немає вивчених скілів.';
      list.appendChild(empty);
      return;
    }

    learned.forEach(function (e) {
      if (!e || Number(e.level) < 1) return;
      var bid = String(e.battleId || '').trim();
      if (!bid) return;
      var s = byBattleId[bid] || null;
      var li = document.createElement('li');
      li.className = 'l2-magister-skill-card';

      var head = document.createElement('div');
      head.className = 'l2-magister-skill-card__head';
      var frame = document.createElement('span');
      frame.className = 'l2-magister-skill-icon-frame';
      var iconSkillId = s && Number.isFinite(Number(s.l2SkillId))
        ? Number(s.l2SkillId)
        : (function () {
            var m = /^l2_(\d+)$/.exec(bid);
            return m ? parseInt(m[1], 10) : 1;
          })();
      mountMagisterSkillIconCrisp(frame, magisterSkillIconUrl({ l2SkillId: iconSkillId, iconUrl: e.iconUrl || null }));
      head.appendChild(frame);
      var name = document.createElement('h2');
      name.className = 'l2-magister-skill-card__name';
      name.textContent =
        e && e.nameUk && String(e.nameUk).trim()
          ? String(e.nameUk).trim()
          : s && s.nameUk
            ? s.nameUk
            : bid;
      head.appendChild(name);
      li.appendChild(head);

      var meta = document.createElement('p');
      meta.className = 'l2-magister-skill-card__meta';
      var kindUk =
        e && e.kind === 'passive'
          ? 'пасив'
          : s && s.kind === 'passive'
            ? 'пасив'
            : 'активний';
      var maxLvl =
        e && e.maxSkillLevel != null && Number(e.maxSkillLevel) > 1
          ? Number(e.maxSkillLevel)
          : s && s.maxSkillLevel != null && Number(s.maxSkillLevel) > 1
            ? Number(s.maxSkillLevel)
            : null;
      var maxPart = maxLvl != null ? '/' + String(Math.floor(maxLvl)) : '';
      meta.textContent = 'Ранг: ' + Math.floor(Number(e.level)) + maxPart + ' · ' + kindUk;
      li.appendChild(meta);

      var desc = document.createElement('p');
      desc.className = 'l2-magister-skill-card__desc';
      if (e && e.hintUk && String(e.hintUk).trim()) {
        desc.textContent = String(e.hintUk).trim();
      } else if (s && s.hintUk && String(s.hintUk).trim()) {
        desc.textContent = String(s.hintUk).trim();
      } else if (s && s.statsNoteUk && String(s.statsNoteUk).trim()) {
        desc.textContent = String(s.statsNoteUk).trim();
      } else {
        desc.textContent = 'Вивчений скіл.';
      }
      li.appendChild(desc);
      list.appendChild(li);
    });
  }

  async function loadMagisterPage() {
    var errEl = $('magister-err');
    var loadErr = $('magister-load-err');
    var panel = $('magister-panel');
    var noteEl = $('magister-note');
    var profEl = $('magister-profession');
    var list = $('magister-list');
    var title = $('magister-title');
    var sub = $('magister-sub');
    var introEl = panel.querySelector('.l2-magister-intro');
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }
    if (!list || !panel) return;
    list.innerHTML = '';

    var t = localStorage.getItem('token');
    if (!t) {
      if (loadErr) {
        loadErr.hidden = false;
        loadErr.textContent = 'Потрібен вхід. Перейди на головну.';
      }
      panel.hidden = true;
      return;
    }

    var r = await fetch(magisterApiUrl(), {
      headers: { Authorization: 'Bearer ' + t },
      cache: 'no-store',
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (!r.ok) {
      if (loadErr) {
        loadErr.hidden = false;
        loadErr.textContent = 'Не вдалося завантажити магістра.';
      }
      panel.hidden = true;
      return;
    }
    if (loadErr) loadErr.hidden = true;
    panel.hidden = false;

    var d = await r.json();
    var snapNowHeader =
      window.L2 && typeof L2.lastSnapshot === 'function'
        ? L2.lastSnapshot()
        : null;
    var spNow =
      d && typeof d.characterSp === 'number' && Number.isFinite(d.characterSp)
        ? Math.max(0, Math.floor(d.characterSp))
        : Number(snapNowHeader && snapNowHeader.sp);
    if (title) {
      title.hidden = true;
      title.textContent = '';
    }
    if (sub) {
      var left = d && d.npc && d.npc.titleUk ? String(d.npc.titleUk) : '';
      var spText = Number.isFinite(spNow) ? String(Math.floor(spNow)) : '—';
      sub.innerHTML =
        '<span class="l2-magister-panel__sub-left">' +
        left +
        '</span>' +
        '<span class="l2-magister-panel__sub-right">SP: ' +
        spText +
        '</span>';
    }
    if (magisterViewModeQuery() === 'learned') {
      if (title) title.textContent = 'Вивчені скіли';
      if (sub) sub.textContent = 'Список твоїх вивчених умінь';
      if (introEl) {
        introEl.innerHTML =
          '<p>Тут відображаються всі скіли, які ти вже вивчив у магістрів.</p>' +
          '<p>Перевіряй ранги умінь і повертайся до навчання, коли збереш рівень та SP.</p>';
      }
      renderLearnedOnlyList(list, d);
      return;
    }
    if (noteEl) {
      if (d.noteUk) {
        noteEl.hidden = false;
        noteEl.textContent = d.noteUk;
      } else {
        noteEl.hidden = true;
        noteEl.textContent = '';
      }
    }

    if (profEl) {
      if (window.L2MagisterProfession && typeof L2MagisterProfession.renderProfessionBanner === 'function') {
        L2MagisterProfession.renderProfessionBanner(profEl, d.profession, magisterNpcIdQuery());
      } else {
        profEl.innerHTML = '';
        profEl.hidden = true;
      }
    }

    (d.skills || []).forEach(function (s) {
      var li = document.createElement('li');
      li.className = 'l2-magister-skill-card';

      var head = document.createElement('div');
      head.className = 'l2-magister-skill-card__head';
      var frame = document.createElement('span');
      frame.className = 'l2-magister-skill-icon-frame';
      mountMagisterSkillIconCrisp(frame, magisterSkillIconUrl(s));
      head.appendChild(frame);
      var name = document.createElement('h2');
      name.className = 'l2-magister-skill-card__name';
      name.textContent = s.nameUk;
      head.appendChild(name);
      li.appendChild(head);

      var metaRow = document.createElement('div');
      metaRow.className = 'l2-magister-skill-card__meta-row';

      var metaStack = document.createElement('div');
      metaStack.className = 'l2-magister-skill-card__meta-stack';

      var meta = document.createElement('p');
      meta.className = 'l2-magister-skill-card__meta';
      meta.textContent =
        'Мін. рівень: ' +
        s.minLevel +
        ' · SP за ранг: ' +
        s.spCost +
        (s.maxSkillLevel != null && s.maxSkillLevel > 1
          ? ' · ранг: ' +
            (s.skillLevel != null ? s.skillLevel : 0) +
            '/' +
            s.maxSkillLevel
          : '') +
        (s.kind === 'passive' ? ' · пасив' : ' · активний бойовий');
      metaStack.appendChild(meta);

      var combatText = combatLine(s);
      if (combatText) {
        var combat = document.createElement('p');
        combat.className = 'l2-magister-skill-card__combat';
        combat.textContent = combatText;
        metaStack.appendChild(combat);
      }

      metaRow.appendChild(metaStack);

      var actions = document.createElement('div');
      actions.className = 'l2-magister-skill-card__actions';
      if (s.learnedMax) {
        var ok = document.createElement('span');
        ok.className =
          'l2-magister-skill-card__status-msg l2-magister-skill-card__status-msg--max';
        ok.textContent = 'Максимальний ранг';
        actions.appendChild(ok);
      } else {
        var learnBtn = document.createElement('button');
        learnBtn.type = 'button';
        var isRankUp = s.skillLevel != null && s.skillLevel >= 1;
        learnBtn.className =
          'l2-magister-skill-card__learn-link' +
          (isRankUp ? ' l2-magister-skill-card__learn-link--rankup' : '');
        learnBtn.textContent = 'Вивчити скіл';
        if (!s.canLearn) {
          learnBtn.disabled = true;
          learnBtn.title =
            s.canLearnBlockReasonUk != null &&
            String(s.canLearnBlockReasonUk).trim() !== ''
              ? String(s.canLearnBlockReasonUk).trim()
              : 'Недостатньо умов (рівень або SP).';
        } else {
          learnBtn.addEventListener('click', function () {
            learnMagisterSkill(s.battleId);
          });
        }
        actions.appendChild(learnBtn);
      }
      metaRow.appendChild(actions);
      li.appendChild(metaRow);

      var hintRaw =
        s.kind === 'passive'
          ? passiveDescriptionUk(s)
          : s.hintUk != null
            ? String(s.hintUk)
            : '';
      var hint = hintRaw.replace(/\s+/g, ' ').trim();
      var nameForDup =
        s.nameUk != null ? String(s.nameUk).replace(/\s+/g, ' ').trim() : '';
      if (hint !== '' && hint !== nameForDup) {
        var desc = document.createElement('p');
        desc.className = 'l2-magister-skill-card__desc';
        desc.textContent = hintRaw.trim();
        li.appendChild(desc);
      }

      list.appendChild(li);
    });
  }

  async function learnMagisterSkill(battleId) {
    if (magisterActionInFlight) return;
    magisterActionInFlight = true;
    var errEl = $('magister-err');
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }
    var snap =
      window.L2 && typeof L2.lastSnapshot === 'function'
        ? L2.lastSnapshot()
        : null;
    if (!snap || snap.revision == null) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Немає даних героя — онови сторінку.';
      }
      return;
    }
    var t = localStorage.getItem('token');
    try {
      var r = await fetch('/character/skills/learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({
          battleId: battleId,
          expectedRevision: snap.revision,
        }),
      });
      var j = await r.json().catch(function () {
        return {};
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (!r.ok) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent =
            j.messageUk ||
            (j.error === 'revision_conflict'
              ? 'Конфлікт даних — синхронізація…'
              : j.error || 'Помилка вивчення.');
        }
        if (r.status === 409) {
          if (window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
            await L2.resyncCharacterAfterConflict();
          } else {
            await refreshCharacterSnapshot();
          }
          loadMagisterPage();
        }
        return;
      }
      if (j.character) applyMagisterSnapshot(j.character);
      loadMagisterPage();
    } finally {
      magisterActionInFlight = false;
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function () {},
      });
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    var t = localStorage.getItem('token');
    if (!t) {
      var loadErr = $('magister-load-err');
      var panel = $('magister-panel');
      if (loadErr) {
        loadErr.hidden = false;
        loadErr.textContent = 'Потрібен вхід. Перейди на головну.';
      }
      if (panel) panel.hidden = true;
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    await refreshCharacterSnapshot();
    await loadMagisterPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
