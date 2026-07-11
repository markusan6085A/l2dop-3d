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
    var t = localStorage.getItem('token');
    if (!t) return;
    var r = await fetch('/character', {
      headers: { Authorization: 'Bearer ' + t },
    });
    if (!r.ok) return;
    var j = await r.json().catch(function () {
      return {};
    });
    if (j.character) applyMagisterSnapshot(j.character);
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

  var SKILL_ICON_CACHE_BUST = 'icb=6';

  function magisterSkillIconUrlWithDpr(iconUrl) {
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

  function combatLine(s) {
    var lines = [];
    if (s.kind === 'passive') {
      lines.push(s.statsNoteUk || 'Пасив.');
    } else if (s.mpCost != null) {
      var t = 'MP: ' + s.mpCost;
      if (s.damagePower != null) {
        t += ' · базова сила скіла: ' + s.damagePower;
      }
      if (s.statsNoteUk) {
        t += ' · ' + s.statsNoteUk;
      }
      lines.push(t);
    } else {
      lines.push(s.statsNoteUk || 'Параметри з’являться після умов скіла.');
    }
    if (s.damageHintUk) {
      lines.push(s.damageHintUk);
    }
    return lines.join('\n');
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
      mountMagisterSkillIconCrisp(frame, magisterSkillIconUrl({ l2SkillId: iconSkillId, iconUrl: null }));
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
    var spNow = Number(snapNowHeader && snapNowHeader.sp);
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
      profEl.innerHTML = '';
      if (d.profession) {
        profEl.hidden = false;
        var nhFight = d.profession.fighterProfessionChoices;
        if (nhFight && nhFight.length) {
          nhFight.forEach(function (ch) {
            var nb = document.createElement('button');
            nb.type = 'button';
            nb.className = 'btn-l2 btn-l2-primary';
            nb.textContent = ch.labelUk;
            nb.addEventListener('click', function () {
              postCharacterProfessionSlug(ch.slug);
            });
            profEl.appendChild(nb);
          });
        }
        if (d.profession.canBecomeHumanWizard) {
          var hwz = document.createElement('button');
          hwz.type = 'button';
          hwz.className = 'btn-l2 btn-l2-primary';
          hwz.textContent = 'Стати чарівником (Wizard)';
          hwz.addEventListener('click', function () {
            postCharacterProfessionSlug('human-wizard');
          });
          profEl.appendChild(hwz);
        }
        if (d.profession.canBecomeHumanCleric) {
          var hcl = document.createElement('button');
          hcl.type = 'button';
          hcl.className = 'btn-l2 btn-l2-primary';
          hcl.textContent = 'Стати кліриком (Cleric)';
          hcl.addEventListener('click', function () {
            postCharacterProfessionSlug('human-cleric');
          });
          profEl.appendChild(hcl);
        }
        if (d.profession.canBecomeHumanSorcerer) {
          var hso = document.createElement('button');
          hso.type = 'button';
          hso.className = 'btn-l2 btn-l2-primary';
          hso.textContent = 'Стати чаклуном (Sorcerer)';
          hso.addEventListener('click', function () {
            postCharacterProfessionSlug('human-sorcerer');
          });
          profEl.appendChild(hso);
        }
        if (d.profession.canBecomeHumanNecromancer) {
          var hne = document.createElement('button');
          hne.type = 'button';
          hne.className = 'btn-l2 btn-l2-primary';
          hne.textContent = 'Стати некромантом (Necromancer)';
          hne.addEventListener('click', function () {
            postCharacterProfessionSlug('human-necromancer');
          });
          profEl.appendChild(hne);
        }
        if (d.profession.canBecomeHumanWarlock) {
          var hwa = document.createElement('button');
          hwa.type = 'button';
          hwa.className = 'btn-l2 btn-l2-primary';
          hwa.textContent = 'Стати чорнокнижником (Warlock)';
          hwa.addEventListener('click', function () {
            postCharacterProfessionSlug('human-warlock');
          });
          profEl.appendChild(hwa);
        }
        if (d.profession.canBecomeHumanBishop) {
          var hbi = document.createElement('button');
          hbi.type = 'button';
          hbi.className = 'btn-l2 btn-l2-primary';
          hbi.textContent = 'Стати єпископом (Bishop)';
          hbi.addEventListener('click', function () {
            postCharacterProfessionSlug('human-bishop');
          });
          profEl.appendChild(hbi);
        }
        if (d.profession.canBecomeHumanProphet) {
          var hpr = document.createElement('button');
          hpr.type = 'button';
          hpr.className = 'btn-l2 btn-l2-primary';
          hpr.textContent = 'Стати пророком (Prophet)';
          hpr.addEventListener('click', function () {
            postCharacterProfessionSlug('human-prophet');
          });
          profEl.appendChild(hpr);
        }
        if (d.profession.canBecomeHumanArchmage) {
          var har = document.createElement('button');
          har.type = 'button';
          har.className = 'btn-l2 btn-l2-primary';
          har.textContent = 'Стати архімагом (Archmage)';
          har.addEventListener('click', function () {
            postCharacterProfessionSlug('human-archmage');
          });
          profEl.appendChild(har);
        }
        if (d.profession.canBecomeHumanSoultaker) {
          var hst = document.createElement('button');
          hst.type = 'button';
          hst.className = 'btn-l2 btn-l2-primary';
          hst.textContent = 'Стати збирачем душ (Soultaker)';
          hst.addEventListener('click', function () {
            postCharacterProfessionSlug('human-soultaker');
          });
          profEl.appendChild(hst);
        }
        if (d.profession.canBecomeHumanArcanaLord) {
          var hal = document.createElement('button');
          hal.type = 'button';
          hal.className = 'btn-l2 btn-l2-primary';
          hal.textContent = 'Стати володарем аркани (Arcana Lord)';
          hal.addEventListener('click', function () {
            postCharacterProfessionSlug('human-arcana-lord');
          });
          profEl.appendChild(hal);
        }
        if (d.profession.canBecomeHumanCardinal) {
          var hca = document.createElement('button');
          hca.type = 'button';
          hca.className = 'btn-l2 btn-l2-primary';
          hca.textContent = 'Стати кардиналом (Cardinal)';
          hca.addEventListener('click', function () {
            postCharacterProfessionSlug('human-cardinal');
          });
          profEl.appendChild(hca);
        }
        if (d.profession.canBecomeHumanHierophant) {
          var hhi = document.createElement('button');
          hhi.type = 'button';
          hhi.className = 'btn-l2 btn-l2-primary';
          hhi.textContent = 'Стати ієрофантом (Hierophant)';
          hhi.addEventListener('click', function () {
            postCharacterProfessionSlug('human-hierophant');
          });
          profEl.appendChild(hhi);
        }
        if (d.profession.canBecomeWarrior) {
          var wb = document.createElement('button');
          wb.type = 'button';
          wb.className = 'btn-l2 btn-l2-primary';
          wb.textContent = 'Стати воїном (Warrior)';
          wb.addEventListener('click', takeHumanWarriorProfession);
          profEl.appendChild(wb);
        }
        if (d.profession.canBecomeKnight) {
          var kb = document.createElement('button');
          kb.type = 'button';
          kb.className = 'btn-l2 btn-l2-primary';
          kb.textContent = 'Стати лицарем (Human Knight)';
          kb.addEventListener('click', takeHumanKnightProfession);
          profEl.appendChild(kb);
        }
        if (d.profession.canBecomeRogue) {
          var rg = document.createElement('button');
          rg.type = 'button';
          rg.className = 'btn-l2 btn-l2-primary';
          rg.textContent = 'Стати розбійником (Rogue)';
          rg.addEventListener('click', takeHumanRogueProfession);
          profEl.appendChild(rg);
        }
        if (d.profession.canBecomeWarlord) {
          var wl = document.createElement('button');
          wl.type = 'button';
          wl.className = 'btn-l2 btn-l2-primary';
          wl.textContent = 'Стати воєначальником (Warlord)';
          wl.addEventListener('click', takeHumanWarlordProfession);
          profEl.appendChild(wl);
        }
        if (d.profession.canBecomeGladiator) {
          var gl = document.createElement('button');
          gl.type = 'button';
          gl.className = 'btn-l2 btn-l2-primary';
          gl.textContent = 'Стати гладіатором (Gladiator)';
          gl.addEventListener('click', takeHumanGladiatorProfession);
          profEl.appendChild(gl);
        }
        if (d.profession.canBecomePaladin) {
          var pl = document.createElement('button');
          pl.type = 'button';
          pl.className = 'btn-l2 btn-l2-primary';
          pl.textContent = 'Стати паладином (Paladin)';
          pl.addEventListener('click', takeHumanPaladinProfession);
          profEl.appendChild(pl);
        }
        if (d.profession.canBecomeDarkAvenger) {
          var da = document.createElement('button');
          da.type = 'button';
          da.className = 'btn-l2 btn-l2-primary';
          da.textContent = 'Стати темним месником (Dark Avenger)';
          da.addEventListener('click', takeHumanDarkAvengerProfession);
          profEl.appendChild(da);
        }
        if (d.profession.canBecomeDreadnought) {
          var dn = document.createElement('button');
          dn.type = 'button';
          dn.className = 'btn-l2 btn-l2-primary';
          dn.textContent = 'Стати дредноутом (Dreadnought)';
          dn.addEventListener('click', takeHumanDreadnoughtProfession);
          profEl.appendChild(dn);
        }
        if (d.profession.canBecomeDuelist) {
          var dl = document.createElement('button');
          dl.type = 'button';
          dl.className = 'btn-l2 btn-l2-primary';
          dl.textContent = 'Стати дуелянтом (Duelist)';
          dl.addEventListener('click', takeHumanDuelistProfession);
          profEl.appendChild(dl);
        }
        if (d.profession.canBecomePhoenixKnight) {
          var pk = document.createElement('button');
          pk.type = 'button';
          pk.className = 'btn-l2 btn-l2-primary';
          pk.textContent = 'Стати лицарем Фенікса (Phoenix Knight)';
          pk.addEventListener('click', takeHumanPhoenixKnightProfession);
          profEl.appendChild(pk);
        }
        if (d.profession.canBecomeHellKnight) {
          var hk = document.createElement('button');
          hk.type = 'button';
          hk.className = 'btn-l2 btn-l2-primary';
          hk.textContent = 'Стати лицарем пекла (Hell Knight)';
          hk.addEventListener('click', takeHumanHellKnightProfession);
          profEl.appendChild(hk);
        }
        if (d.profession.canBecomeTreasureHunter) {
          var th = document.createElement('button');
          th.type = 'button';
          th.className = 'btn-l2 btn-l2-primary';
          th.textContent = 'Стати мисливцем за скарбами (Treasure Hunter)';
          th.addEventListener('click', takeHumanTreasureHunterProfession);
          profEl.appendChild(th);
        }
        if (d.profession.canBecomeHawkeye) {
          var hkEye = document.createElement('button');
          hkEye.type = 'button';
          hkEye.className = 'btn-l2 btn-l2-primary';
          hkEye.textContent = 'Стати яструбом (Hawkeye)';
          hkEye.addEventListener('click', takeHumanHawkeyeProfession);
          profEl.appendChild(hkEye);
        }
        if (d.profession.canBecomeAdventurer) {
          var adv = document.createElement('button');
          adv.type = 'button';
          adv.className = 'btn-l2 btn-l2-primary';
          adv.textContent = 'Стати авантюристом (Adventurer)';
          adv.addEventListener('click', takeHumanAdventurerProfession);
          profEl.appendChild(adv);
        }
        if (d.profession.canBecomeSagittarius) {
          var sag = document.createElement('button');
          sag.type = 'button';
          sag.className = 'btn-l2 btn-l2-primary';
          sag.textContent = 'Стати стрільцем (Sagittarius)';
          sag.addEventListener('click', takeHumanSagittariusProfession);
          profEl.appendChild(sag);
        }
        if (d.profession.canBecomeElfElvenWizard) {
          var efw = document.createElement('button');
          efw.type = 'button';
          efw.className = 'btn-l2 btn-l2-primary';
          efw.textContent =
            'Стати ельфійським чарівником (Elven Wizard)';
          efw.addEventListener('click', function () {
            postCharacterProfessionSlug('elf-elven-wizard');
          });
          profEl.appendChild(efw);
        }
        if (d.profession.canBecomeElfElvenOracle) {
          var efo = document.createElement('button');
          efo.type = 'button';
          efo.className = 'btn-l2 btn-l2-primary';
          efo.textContent =
            'Стати ельфійським оракулом (Elven Oracle)';
          efo.addEventListener('click', function () {
            postCharacterProfessionSlug('elf-elven-oracle');
          });
          profEl.appendChild(efo);
        }
        if (d.profession.canBecomeElfElementalSummoner) {
          var esu = document.createElement('button');
          esu.type = 'button';
          esu.className = 'btn-l2 btn-l2-primary';
          esu.textContent =
            'Стати покликувачем стихій (Elemental Summoner)';
          esu.addEventListener('click', function () {
            postCharacterProfessionSlug('elf-elemental-summoner');
          });
          profEl.appendChild(esu);
        }
        if (d.profession.canBecomeElfSpellsinger) {
          var esp = document.createElement('button');
          esp.type = 'button';
          esp.className = 'btn-l2 btn-l2-primary';
          esp.textContent = 'Стати співаком чарів (Spellsinger)';
          esp.addEventListener('click', function () {
            postCharacterProfessionSlug('elf-spellsinger');
          });
          profEl.appendChild(esp);
        }
        if (d.profession.canBecomeElfElvenElder) {
          var efe = document.createElement('button');
          efe.type = 'button';
          efe.className = 'btn-l2 btn-l2-primary';
          efe.textContent =
            'Стати ельфійським старійшиною (Elven Elder)';
          efe.addEventListener('click', function () {
            postCharacterProfessionSlug('elf-elven-elder');
          });
          profEl.appendChild(efe);
        }
        if (d.profession.canBecomeElfElementalMaster) {
          var ema = document.createElement('button');
          ema.type = 'button';
          ema.className = 'btn-l2 btn-l2-primary';
          ema.textContent =
            'Стати володарем стихій (Elemental Master)';
          ema.addEventListener('click', function () {
            postCharacterProfessionSlug('elf-elemental-master');
          });
          profEl.appendChild(ema);
        }
        if (d.profession.canBecomeElfMysticMuse) {
          var emu = document.createElement('button');
          emu.type = 'button';
          emu.className = 'btn-l2 btn-l2-primary';
          emu.textContent =
            'Стати містичною музою (Mystic Muse)';
          emu.addEventListener('click', function () {
            postCharacterProfessionSlug('elf-mystic-muse');
          });
          profEl.appendChild(emu);
        }
        if (d.profession.canBecomeElfEvasSaint) {
          var evs = document.createElement('button');
          evs.type = 'button';
          evs.className = 'btn-l2 btn-l2-primary';
          evs.textContent = 'Стати святим Еви (Eva\'s Saint)';
          evs.addEventListener('click', function () {
            postCharacterProfessionSlug('elf-evas-saint');
          });
          profEl.appendChild(evs);
        }
        if (d.profession.canBecomeDarkElfDarkWizard) {
          var ddw = document.createElement('button');
          ddw.type = 'button';
          ddw.className = 'btn-l2 btn-l2-primary';
          ddw.textContent =
            'Стати темним чарівником (Dark Wizard)';
          ddw.addEventListener('click', function () {
            postCharacterProfessionSlug('dark-elf-dark-wizard');
          });
          profEl.appendChild(ddw);
        }
        if (d.profession.canBecomeDarkElfShillienOracle) {
          var dso = document.createElement('button');
          dso.type = 'button';
          dso.className = 'btn-l2 btn-l2-primary';
          dso.textContent =
            'Стати оракулом Шиллен (Shillien Oracle)';
          dso.addEventListener('click', function () {
            postCharacterProfessionSlug('dark-elf-shillien-oracle');
          });
          profEl.appendChild(dso);
        }
        if (d.profession.canBecomeDarkElfPhantomSummoner) {
          var dps = document.createElement('button');
          dps.type = 'button';
          dps.className = 'btn-l2 btn-l2-primary';
          dps.textContent =
            'Стати привидним заклинателем (Phantom Summoner)';
          dps.addEventListener('click', function () {
            postCharacterProfessionSlug('dark-elf-phantom-summoner');
          });
          profEl.appendChild(dps);
        }
        if (d.profession.canBecomeDarkElfSpellhowler) {
          var dsp = document.createElement('button');
          dsp.type = 'button';
          dsp.className = 'btn-l2 btn-l2-primary';
          dsp.textContent =
            'Стати заклинателем вітрів (Spellhowler)';
          dsp.addEventListener('click', function () {
            postCharacterProfessionSlug('dark-elf-spellhowler');
          });
          profEl.appendChild(dsp);
        }
        if (d.profession.canBecomeDarkElfShillienElder) {
          var dse = document.createElement('button');
          dse.type = 'button';
          dse.className = 'btn-l2 btn-l2-primary';
          dse.textContent =
            'Стати старійшиною Шиллен (Shillien Elder)';
          dse.addEventListener('click', function () {
            postCharacterProfessionSlug('dark-elf-shillien-elder');
          });
          profEl.appendChild(dse);
        }
        if (d.profession.canBecomeDarkElfSpectralMaster) {
          var dsm = document.createElement('button');
          dsm.type = 'button';
          dsm.className = 'btn-l2 btn-l2-primary';
          dsm.textContent = 'Стати Spectral Master';
          dsm.addEventListener('click', function () {
            postCharacterProfessionSlug('dark-elf-spectral-master');
          });
          profEl.appendChild(dsm);
        }
        if (d.profession.canBecomeDarkElfStormScreamer) {
          var dss = document.createElement('button');
          dss.type = 'button';
          dss.className = 'btn-l2 btn-l2-primary';
          dss.textContent = 'Стати Storm Screamer';
          dss.addEventListener('click', function () {
            postCharacterProfessionSlug('dark-elf-storm-screamer');
          });
          profEl.appendChild(dss);
        }
        if (d.profession.canBecomeDarkElfShillienSaint) {
          var dssn = document.createElement('button');
          dssn.type = 'button';
          dssn.className = 'btn-l2 btn-l2-primary';
          dssn.textContent = 'Стати Shillien Saint';
          dssn.addEventListener('click', function () {
            postCharacterProfessionSlug('dark-elf-shillien-saint');
          });
          profEl.appendChild(dssn);
        }
        if (d.profession.canBecomeOrcShaman) {
          var osm = document.createElement('button');
          osm.type = 'button';
          osm.className = 'btn-l2 btn-l2-primary';
          osm.textContent = 'Стати шаманом орків (Orc Shaman)';
          osm.addEventListener('click', function () {
            postCharacterProfessionSlug('orc-shaman');
          });
          profEl.appendChild(osm);
        }
        if (d.profession.canBecomeOrcOverlord) {
          var ovl = document.createElement('button');
          ovl.type = 'button';
          ovl.className = 'btn-l2 btn-l2-primary';
          ovl.textContent = 'Стати вождем (Overlord)';
          ovl.addEventListener('click', function () {
            postCharacterProfessionSlug('orc-overlord');
          });
          profEl.appendChild(ovl);
        }
        if (d.profession.canBecomeOrcWarcryer) {
          var owc = document.createElement('button');
          owc.type = 'button';
          owc.className = 'btn-l2 btn-l2-primary';
          owc.textContent = 'Стати Warcryer';
          owc.addEventListener('click', function () {
            postCharacterProfessionSlug('orc-warcryer');
          });
          profEl.appendChild(owc);
        }
        if (d.profession.canBecomeOrcDominator) {
          var odm = document.createElement('button');
          odm.type = 'button';
          odm.className = 'btn-l2 btn-l2-primary';
          odm.textContent = 'Стати Dominator';
          odm.addEventListener('click', function () {
            postCharacterProfessionSlug('orc-dominator');
          });
          profEl.appendChild(odm);
        }
        if (d.profession.canBecomeOrcDoomcryer) {
          var odc = document.createElement('button');
          odc.type = 'button';
          odc.className = 'btn-l2 btn-l2-primary';
          odc.textContent = 'Стати Doomcryer';
          odc.addEventListener('click', function () {
            postCharacterProfessionSlug('orc-doomcryer');
          });
          profEl.appendChild(odc);
        }
        if (profEl.childElementCount === 0) {
          profEl.hidden = true;
        }
      } else {
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

      var combat = document.createElement('p');
      combat.className = 'l2-magister-skill-card__combat';
      combat.textContent = combatLine(s);
      metaStack.appendChild(combat);

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
          learnBtn.title = 'Недостатньо умов (рівень або SP).';
        } else {
          learnBtn.addEventListener('click', function () {
            learnMagisterSkill(s.battleId);
          });
        }
        actions.appendChild(learnBtn);
      }
      metaRow.appendChild(actions);
      li.appendChild(metaRow);

      var hintRaw = s.hintUk != null ? String(s.hintUk) : '';
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

  async function takeHumanWarriorProfession() {
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
    var r = await fetch('/character/profession/human-warrior', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanKnightProfession() {
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
    var r = await fetch('/character/profession/human-knight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanRogueProfession() {
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
    var r = await fetch('/character/profession/human-rogue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanHawkeyeProfession() {
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
    var r = await fetch('/character/profession/human-hawkeye', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanSagittariusProfession() {
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
    var r = await fetch('/character/profession/human-sagittarius', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanWarlordProfession() {
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
    var r = await fetch('/character/profession/human-warlord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanPaladinProfession() {
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
    var r = await fetch('/character/profession/human-paladin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanDarkAvengerProfession() {
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
    var r = await fetch('/character/profession/human-dark-avenger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanGladiatorProfession() {
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
    var r = await fetch('/character/profession/human-gladiator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanDreadnoughtProfession() {
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
    var r = await fetch('/character/profession/human-dreadnought', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanDuelistProfession() {
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
    var r = await fetch('/character/profession/human-duelist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanPhoenixKnightProfession() {
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
    var r = await fetch('/character/profession/human-phoenix-knight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanHellKnightProfession() {
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
    var r = await fetch('/character/profession/human-hell-knight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanTreasureHunterProfession() {
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
    var r = await fetch('/character/profession/human-treasure-hunter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  async function takeHumanAdventurerProfession() {
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
    var r = await fetch('/character/profession/human-adventurer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + t,
      },
      body: JSON.stringify({ expectedRevision: snap.revision }),
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
            : j.error || 'Помилка зміни профи.');
      }
      if (r.status === 409) {
        await refreshCharacterSnapshot();
        loadMagisterPage();
      }
      return;
    }
    if (j.character && window.L2 && L2.setLastSnapshot) {
      L2.setLastSnapshot(j.character);
    }
    if (j.character) updateHeroLine(j.character);
    loadMagisterPage();
  }

  /** Зміна профи: slug на кшталт elf-elven-wizard → POST /character/profession/{slug}. */
  async function postCharacterProfessionSlug(slug) {
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
      var r = await fetch('/character/profession/' + slug, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({ expectedRevision: snap.revision }),
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
              : j.error || 'Помилка зміни профи.');
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
