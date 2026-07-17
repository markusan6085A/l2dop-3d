/**
 * Вибір профи у магістра: список-посилання + POST /character/profession/{slug}.
 */
(function (global) {
  var PROFESSION_FLAG_CHOICES = [
    ['canBecomeHumanWizard', 'human-wizard', 'Стати чарівником (Wizard)'],
    ['canBecomeHumanCleric', 'human-cleric', 'Стати кліриком (Cleric)'],
    ['canBecomeHumanSorcerer', 'human-sorcerer', 'Стати чаклуном (Sorcerer)'],
    ['canBecomeHumanNecromancer', 'human-necromancer', 'Стати некромантом (Necromancer)'],
    ['canBecomeHumanWarlock', 'human-warlock', 'Стати чорнокнижником (Warlock)'],
    ['canBecomeHumanBishop', 'human-bishop', 'Стати єпископом (Bishop)'],
    ['canBecomeHumanProphet', 'human-prophet', 'Стати пророком (Prophet)'],
    ['canBecomeHumanArchmage', 'human-archmage', 'Стати архімагом (Archmage)'],
    ['canBecomeHumanSoultaker', 'human-soultaker', 'Стати збирачем душ (Soultaker)'],
    ['canBecomeHumanArcanaLord', 'human-arcana-lord', 'Стати володарем аркани (Arcana Lord)'],
    ['canBecomeHumanCardinal', 'human-cardinal', 'Стати кардиналом (Cardinal)'],
    ['canBecomeHumanHierophant', 'human-hierophant', 'Стати ієрофантом (Hierophant)'],
    ['canBecomeWarrior', 'human-warrior', 'Стати воїном (Warrior)'],
    ['canBecomeKnight', 'human-knight', 'Стати лицарем (Human Knight)'],
    ['canBecomeRogue', 'human-rogue', 'Стати розбійником (Rogue)'],
    ['canBecomeWarlord', 'human-warlord', 'Стати воєначальником (Warlord)'],
    ['canBecomeGladiator', 'human-gladiator', 'Стати гладіатором (Gladiator)'],
    ['canBecomePaladin', 'human-paladin', 'Стати паладином (Paladin)'],
    ['canBecomeDarkAvenger', 'human-dark-avenger', 'Стати темним месником (Dark Avenger)'],
    ['canBecomeDreadnought', 'human-dreadnought', 'Стати дредноутом (Dreadnought)'],
    ['canBecomeDuelist', 'human-duelist', 'Стати дуелянтом (Duelist)'],
    ['canBecomePhoenixKnight', 'human-phoenix-knight', 'Стати лицарем Фенікса (Phoenix Knight)'],
    ['canBecomeHellKnight', 'human-hell-knight', 'Стати лицарем пекла (Hell Knight)'],
    ['canBecomeTreasureHunter', 'human-treasure-hunter', 'Стати мисливцем за скарбами (Treasure Hunter)'],
    ['canBecomeHawkeye', 'human-hawkeye', 'Стати яструбом (Hawkeye)'],
    ['canBecomeAdventurer', 'human-adventurer', 'Стати авантюристом (Adventurer)'],
    ['canBecomeSagittarius', 'human-sagittarius', 'Стати стрільцем (Sagittarius)'],
    ['canBecomeElfElvenWizard', 'elf-elven-wizard', 'Стати ельфійським чарівником (Elven Wizard)'],
    ['canBecomeElfElvenOracle', 'elf-elven-oracle', 'Стати ельфійським оракулом (Elven Oracle)'],
    ['canBecomeElfElementalSummoner', 'elf-elemental-summoner', 'Стати покликувачем стихій (Elemental Summoner)'],
    ['canBecomeElfSpellsinger', 'elf-spellsinger', 'Стати співаком чарів (Spellsinger)'],
    ['canBecomeElfElvenElder', 'elf-elven-elder', 'Стати ельфійським старійшиною (Elven Elder)'],
    ['canBecomeElfElementalMaster', 'elf-elemental-master', 'Стати володарем стихій (Elemental Master)'],
    ['canBecomeElfMysticMuse', 'elf-mystic-muse', 'Стати містичною музою (Mystic Muse)'],
    ['canBecomeElfEvasSaint', 'elf-evas-saint', "Стати святим Еви (Eva's Saint)"],
    ['canBecomeDarkElfDarkWizard', 'dark-elf-dark-wizard', 'Стати темним чарівником (Dark Wizard)'],
    ['canBecomeDarkElfShillienOracle', 'dark-elf-shillien-oracle', 'Стати оракулом Шиллен (Shillien Oracle)'],
    ['canBecomeDarkElfPhantomSummoner', 'dark-elf-phantom-summoner', 'Стати привидним заклинателем (Phantom Summoner)'],
    ['canBecomeDarkElfSpellhowler', 'dark-elf-spellhowler', 'Стати заклинателем вітрів (Spellhowler)'],
    ['canBecomeDarkElfShillienElder', 'dark-elf-shillien-elder', 'Стати старійшиною Шиллен (Shillien Elder)'],
    ['canBecomeDarkElfSpectralMaster', 'dark-elf-spectral-master', 'Стати Spectral Master'],
    ['canBecomeDarkElfStormScreamer', 'dark-elf-storm-screamer', 'Стати Storm Screamer'],
    ['canBecomeDarkElfShillienSaint', 'dark-elf-shillien-saint', 'Стати Shillien Saint'],
    ['canBecomeOrcShaman', 'orc-shaman', 'Стати шаманом орків (Orc Shaman)'],
    ['canBecomeOrcOverlord', 'orc-overlord', 'Стати вождем (Overlord)'],
    ['canBecomeOrcWarcryer', 'orc-warcryer', 'Стати Warcryer'],
    ['canBecomeOrcDominator', 'orc-dominator', 'Стати Dominator'],
    ['canBecomeOrcDoomcryer', 'orc-doomcryer', 'Стати Doomcryer'],
  ];

  var LABEL_BY_SLUG = Object.create(null);
  PROFESSION_FLAG_CHOICES.forEach(function (row) {
    LABEL_BY_SLUG[row[1]] = row[2];
  });

  var INFO_PLACEHOLDER =
    'Опис професії скоро з\'явиться. Тут буде пояснення гілки та стилю гри.';

  function collectChoices(prof) {
    if (!prof) return [];
    var out = [];
    var seen = Object.create(null);
    var nh = prof.fighterProfessionChoices;
    if (nh && nh.length) {
      nh.forEach(function (ch) {
        if (!ch || !ch.slug) return;
        var slug = String(ch.slug).trim();
        if (!slug || seen[slug]) return;
        seen[slug] = true;
        var label = ch.labelUk && String(ch.labelUk).trim() ? String(ch.labelUk).trim() : slug;
        LABEL_BY_SLUG[slug] = label;
        out.push({ slug: slug, labelUk: label });
      });
    }
    PROFESSION_FLAG_CHOICES.forEach(function (row) {
      if (!prof[row[0]]) return;
      var slug = row[1];
      if (seen[slug]) return;
      seen[slug] = true;
      out.push({ slug: slug, labelUk: row[2] });
    });
    return out;
  }

  function magisterHref(npcId, slug) {
    var q = 'slug=' + encodeURIComponent(slug);
    if (npcId) q += '&npcId=' + encodeURIComponent(npcId);
    return '/magister-profession.html?' + q;
  }

  function magisterBackHref(npcId) {
    return npcId ? '/magister.html?npcId=' + encodeURIComponent(npcId) : '/magister.html';
  }

  function labelUkForSlug(slug, fallback) {
    if (fallback && String(fallback).trim()) return String(fallback).trim();
    return LABEL_BY_SLUG[slug] || slug;
  }

  function infoUkForSlug(slug) {
    var map = global.MAGISTER_PROFESSION_INFO_UK || {};
    var raw = map[slug];
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    return INFO_PLACEHOLDER;
  }

  function renderChoiceList(container, choices, npcId) {
    var ul = document.createElement('ul');
    ul.className = 'l2-magister-profession-list';
    choices.forEach(function (ch) {
      var li = document.createElement('li');
      li.className = 'l2-magister-profession-list__item';
      var a = document.createElement('a');
      a.className = 'l2-magister-profession-link';
      a.href = magisterHref(npcId, ch.slug);
      a.textContent = ch.labelUk;
      li.appendChild(a);
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  function renderProfessionBanner(container, profession, npcId) {
    container.innerHTML = '';
    if (!profession) {
      container.hidden = true;
      return [];
    }
    var choices = collectChoices(profession);
    if (!choices.length) {
      container.hidden = true;
      return [];
    }
    container.hidden = false;
    if (profession.messageUk && String(profession.messageUk).trim()) {
      var msg = document.createElement('p');
      msg.className = 'l2-magister-profession-msg';
      msg.textContent = String(profession.messageUk).trim();
      container.appendChild(msg);
    }
    renderChoiceList(container, choices, npcId);
    return choices;
  }

  function applyPostMutationSnapshot(character) {
    if (!character) return;
    if (global.L2 && typeof global.L2.applyMutationSnapshot === 'function') {
      global.L2.applyMutationSnapshot(character);
      return;
    }
    if (global.L2 && typeof global.L2.applyCharacterSnapshot === 'function') {
      global.L2.applyCharacterSnapshot(character);
    }
  }

  async function postProfessionSlug(slug, opts) {
    opts = opts || {};
    var t = localStorage.getItem('token');
    if (!t) {
      if (opts.onError) opts.onError('Потрібен вхід.', 401);
      return false;
    }
    var snap =
      global.L2 && typeof global.L2.lastSnapshot === 'function'
        ? global.L2.lastSnapshot()
        : null;
    if (!snap || snap.revision == null) {
      if (opts.onError) opts.onError('Немає даних героя — онови сторінку.', 0);
      return false;
    }
    try {
      var r = await fetch('/character/profession/' + encodeURIComponent(slug), {
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
        if (global.L2 && typeof global.L2.setToken === 'function') {
          global.L2.setToken(null);
        } else {
          localStorage.removeItem('token');
        }
        window.location.href = '/';
        return false;
      }
      if (!r.ok) {
        var uk =
          j.messageUk ||
          (j.error === 'revision_conflict'
            ? 'Конфлікт даних — синхронізація…'
            : j.error || 'Помилка зміни профи.');
        if (r.status === 409) {
          if (global.L2 && typeof global.L2.resyncCharacterAfterConflict === 'function') {
            await global.L2.resyncCharacterAfterConflict(j);
          } else if (typeof opts.resync === 'function') {
            await opts.resync();
          }
        }
        if (opts.onError) opts.onError(uk, r.status);
        return false;
      }
      if (j.character) {
        applyPostMutationSnapshot(j.character);
      }
      if (opts.onSuccess) opts.onSuccess(j);
      return true;
    } catch (eNet) {
      if (opts.onError) opts.onError('Мережа або сервер недоступні.', 0);
      return false;
    }
  }

  async function postAcceptFirstProfessionQuest(slug, opts) {
    opts = opts || {};
    var t = localStorage.getItem('token');
    if (!t) {
      if (opts.onError) opts.onError('Потрібен вхід.', 401);
      return false;
    }
    var snap =
      global.L2 && typeof global.L2.lastSnapshot === 'function'
        ? global.L2.lastSnapshot()
        : null;
    if (!snap || snap.revision == null) {
      if (opts.onError) opts.onError('Немає даних героя — онови сторінку.', 0);
      return false;
    }
    try {
      var r = await fetch('/character/profession-quest/accept-first', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({ slug: slug, expectedRevision: snap.revision }),
      });
      var j = await r.json().catch(function () {
        return {};
      });
      if (r.status === 401) {
        if (global.L2 && typeof global.L2.setToken === 'function') {
          global.L2.setToken(null);
        } else {
          localStorage.removeItem('token');
        }
        window.location.href = '/';
        return false;
      }
      if (!r.ok) {
        var uk =
          j.messageUk ||
          (j.error === 'revision_conflict'
            ? 'Конфлікт даних — синхронізація…'
            : j.error || 'Помилка квесту.');
        if (r.status === 409) {
          if (global.L2 && typeof global.L2.resyncCharacterAfterConflict === 'function') {
            await global.L2.resyncCharacterAfterConflict(j);
          } else if (typeof opts.resync === 'function') {
            await opts.resync();
          }
        }
        if (opts.onError) opts.onError(uk, r.status);
        return false;
      }
      if (j.character) {
        applyPostMutationSnapshot(j.character);
      }
      if (opts.onSuccess) opts.onSuccess(j);
      return true;
    } catch (eNet) {
      if (opts.onError) opts.onError('Мережа або сервер недоступні.', 0);
      return false;
    }
  }

  async function postTeleport(teleportId, opts) {
    opts = opts || {};
    var t = localStorage.getItem('token');
    if (!t) {
      if (opts.onError) opts.onError('Потрібен вхід.', 401);
      return false;
    }
    var snap =
      global.L2 && typeof global.L2.lastSnapshot === 'function'
        ? global.L2.lastSnapshot()
        : null;
    if (!snap || snap.revision == null) {
      if (opts.onError) opts.onError('Немає даних героя — онови сторінку.', 0);
      return false;
    }
    try {
      async function callTp(revision) {
        return fetch('/game/teleport', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + t,
          },
          body: JSON.stringify({
            teleportId: teleportId,
            expectedRevision: revision,
          }),
        });
      }
      var r = await callTp(snap.revision);
      if (r.status === 409) {
        if (global.L2 && typeof global.L2.resyncCharacterAfterConflict === 'function') {
          await global.L2.resyncCharacterAfterConflict({});
        } else if (typeof opts.resync === 'function') {
          await opts.resync();
        }
        snap =
          global.L2 && typeof global.L2.lastSnapshot === 'function'
            ? global.L2.lastSnapshot()
            : null;
        if (snap && snap.revision != null) {
          r = await callTp(snap.revision);
        }
      }
      if (r.status === 401) {
        if (global.L2 && typeof global.L2.setToken === 'function') {
          global.L2.setToken(null);
        } else {
          localStorage.removeItem('token');
        }
        window.location.href = '/';
        return false;
      }
      if (!r.ok) {
        var jErr = await r.json().catch(function () {
          return {};
        });
        if (opts.onError) {
          opts.onError(
            (jErr && jErr.messageUk) || 'Не вдалося телепортуватися.',
            r.status
          );
        }
        return false;
      }
      var j = await r.json();
      if (j.character) {
        applyPostMutationSnapshot(j.character);
      }
      if (opts.onSuccess) opts.onSuccess(j);
      return true;
    } catch (eNet) {
      if (opts.onError) opts.onError('Мережа або сервер недоступні.', 0);
      return false;
    }
  }

  global.L2MagisterProfession = {
    collectChoices: collectChoices,
    renderChoiceList: renderChoiceList,
    renderProfessionBanner: renderProfessionBanner,
    magisterHref: magisterHref,
    magisterBackHref: magisterBackHref,
    labelUkForSlug: labelUkForSlug,
    infoUkForSlug: infoUkForSlug,
    postProfessionSlug: postProfessionSlug,
    postAcceptFirstProfessionQuest: postAcceptFirstProfessionQuest,
    postTeleport: postTeleport,
    firstProfQuestTeleportId: 'dion',
    slugToL2Profession: function (slug) {
      return String(slug || '')
        .trim()
        .toLowerCase()
        .replace(/-/g, '_');
    },
    isFirstHumanFighterProfSlug: function (slug) {
      var s = String(slug || '').trim().toLowerCase();
      return s === 'human-warrior' || s === 'human-knight' || s === 'human-rogue';
    },
    firstProfQuestTextUk: function () {
      var raw = global.MAGISTER_FIRST_PROF_QUEST_UK;
      return typeof raw === 'string' && raw.trim() ? raw.trim() : '';
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
