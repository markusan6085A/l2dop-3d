/**
 * Shared nearby-hero list + row renderer for map.html (server showPkButton is source of truth).
 */
(function (global) {
  'use strict';

  function heroLevelPart(h) {
    var lv = Number(h && h.level);
    return Number.isFinite(lv) ? ' · ур. ' + Math.floor(lv) : '';
  }

  function heroNickHex(h) {
    if (!h) return null;
    if (h.pvpNickColor === 'pk') return '#e85840';
    if (h.pvpNickColor === 'aggressor') return '#a060d8';
    return null;
  }

  /** Server-authoritative PK action flag (boolean true from /game/map/sync). */
  function heroShowsPkButton(h) {
    if (!h) return false;
    return h.showPkButton === true;
  }

  function profileOnNameClick(h) {
    return !!(h && h.profileOnNameClick === true);
  }

  /** Preserve PK flags from /game/map/sync JSON (strict boolean true). */
  function normalizeNearbyHeroEntry(raw) {
    if (!raw || typeof raw !== 'object') return raw;
    return {
      characterId: raw.characterId,
      name: raw.name,
      level: raw.level,
      worldX: raw.worldX,
      worldY: raw.worldY,
      distance: raw.distance,
      pvpNickColor: raw.pvpNickColor,
      pvpEligibilityCode: raw.pvpEligibilityCode,
      pvpBlockedReasonUk: raw.pvpBlockedReasonUk,
      pvpAllowed: raw.pvpAllowed,
      activeBattle: raw.activeBattle,
      targetLocationKey: raw.targetLocationKey,
      viewerLevelUsed: raw.viewerLevelUsed,
      clanEmblemId: raw.clanEmblemId,
      isPartyMember: raw.isPartyMember,
      isPartyLeader: raw.isPartyLeader,
      showPkButton: raw.showPkButton === true,
      profileOnNameClick: raw.profileOnNameClick === true,
    };
  }

  function normalizeNearbyHeroes(rawList) {
    if (!rawList || !rawList.length) return [];
    var out = [];
    for (var i = 0; i < rawList.length; i++) {
      out.push(normalizeNearbyHeroEntry(rawList[i]));
    }
    return out;
  }

  function compactHeroSig(heroes) {
    if (!heroes || !heroes.length) return '0';
    var hp = [];
    for (var j = 0; j < heroes.length; j++) {
      var h = heroes[j];
      hp.push(
        String(h.characterId || '') +
          ':' +
          String(h.worldX != null ? h.worldX : '') +
          ':' +
          String(h.worldY != null ? h.worldY : '') +
          ':' +
          String(h.distance != null ? h.distance : '') +
          ':' +
          String(h.pvpNickColor || '') +
          ':' +
          String(heroShowsPkButton(h) ? 1 : 0) +
          ':' +
          String(profileOnNameClick(h) ? 1 : 0) +
          ':' +
          String(h.pvpEligibilityCode || '') +
          ':' +
          String(h.isPartyMember ? 1 : 0)
      );
    }
    return String(heroes.length) + '|' + hp.join(',');
  }

  function heroListDomMatchesPayload(listEl, heroes) {
    if (!listEl) return true;
    if (!heroes || !heroes.length) return listEl.children.length === 0;
    if (listEl.children.length !== heroes.length) return false;
    for (var i = 0; i < heroes.length; i++) {
      var h = heroes[i];
      if (!heroShowsPkButton(h)) continue;
      var row = listEl.children[i];
      if (!row || !row.querySelector('.l2-map-hero-link__pk')) return false;
    }
    return true;
  }

  function appendHeroNameEl(titleLine, h, L2) {
    var profileOnName = profileOnNameClick(h);
    var nameClass = 'l2-map-hero-name-link';
    if (h.pvpNickColor === 'pk') nameClass += ' l2-pvp-nick--pk';
    else if (h.pvpNickColor === 'aggressor') nameClass += ' l2-pvp-nick--aggressor';

    if (L2 && typeof L2.renderPlayerIdentity === 'function') {
      var identity = L2.renderPlayerIdentity({
        name: h.name,
        characterId: h.characterId,
        clanEmblemId: h.clanEmblemId,
        emblemSize: 16,
        pvpNickColor: h.pvpNickColor,
        linkProfile: profileOnName,
        nickClassName: 'l2-map-hero-name-link',
      });
      titleLine.appendChild(identity);
      return;
    }

    if (profileOnName) {
      var plainLink = document.createElement('a');
      plainLink.className = nameClass;
      plainLink.href = '/player.html?name=' + encodeURIComponent(h.name || '');
      plainLink.textContent = h.name || '—';
      titleLine.appendChild(plainLink);
    } else {
      var plainSpan = document.createElement('span');
      plainSpan.className = nameClass;
      plainSpan.textContent = h.name || '—';
      titleLine.appendChild(plainSpan);
    }
  }

  function appendHeroRow(listEl, h, opts) {
    opts = opts || {};
    var L2 = opts.L2 || (typeof global.L2 !== 'undefined' ? global.L2 : null);
    var onPkClick = typeof opts.onPkClick === 'function' ? opts.onPkClick : null;
    var hero = normalizeNearbyHeroEntry(h);

    var li = document.createElement('li');
    li.className = 'l2-map-hero-item';
    var main = document.createElement('div');
    main.className = 'l2-map-hero-item__main';
    main.style.setProperty('--l2-map-hero-nick-color', heroNickHex(hero) || '#bfa88a');

    var titleLine = document.createElement('div');
    titleLine.className = 'l2-map-hero-item__title';

    appendHeroNameEl(titleLine, hero, L2);

    var levelSpan = document.createElement('span');
    levelSpan.className = 'l2-map-hero-level';
    levelSpan.textContent = heroLevelPart(hero);
    titleLine.appendChild(levelSpan);

    var pkBtn = null;
    if (heroShowsPkButton(hero)) {
      pkBtn = document.createElement('button');
      pkBtn.type = 'button';
      pkBtn.className = 'l2-map-hero-link__pk';
      pkBtn.textContent = '[PK]';
      pkBtn.setAttribute('aria-label', 'Атакувати ' + (hero.name || ''));
      if (onPkClick) {
        pkBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var cid = hero.characterId || '';
          if (cid) onPkClick(cid);
        });
      }
      titleLine.appendChild(pkBtn);
    }

    if (hero.isPartyMember) {
      var partyTag = document.createElement('span');
      partyTag.className = 'l2-map-hero-party-tag';
      partyTag.textContent = hero.isPartyLeader ? ' · Паті★' : ' · Паті';
      partyTag.title = hero.isPartyLeader ? 'Лідер паті' : 'Член паті';
      titleLine.appendChild(partyTag);
    }

    main.appendChild(titleLine);
    li.appendChild(main);
    listEl.appendChild(li);
    return li;
  }

  function renderHeroList(around, listEl, sectionEl, opts) {
    opts = opts || {};
    if (!listEl) return;
    var L2 = opts.L2 || (typeof global.L2 !== 'undefined' ? global.L2 : null);
    var onPkClick = typeof opts.onPkClick === 'function' ? opts.onPkClick : null;
    var heroes = normalizeNearbyHeroes(around && around.nearbyHeroes ? around.nearbyHeroes : []);
    var sig = compactHeroSig(heroes);
    if (listEl.dataset.l2HeroListSig === sig && heroListDomMatchesPayload(listEl, heroes)) {
      if (sectionEl) sectionEl.hidden = !heroes.length;
      return;
    }
    listEl.dataset.l2HeroListSig = sig;
    if (typeof listEl.replaceChildren === 'function') {
      listEl.replaceChildren();
    } else {
      listEl.innerHTML = '';
    }
    if (sectionEl) sectionEl.hidden = !heroes.length;
    if (!heroes.length) return;
    for (var hi = 0; hi < heroes.length; hi++) {
      appendHeroRow(listEl, heroes[hi], { L2: L2, onPkClick: onPkClick });
    }
  }

  function renderHeroRowHtml(h, opts) {
    var listEl = document.createElement('ul');
    appendHeroRow(listEl, h, opts);
    return listEl.innerHTML;
  }

  function compactHeroPkSig(h) {
    return String(heroShowsPkButton(h) ? 1 : 0) + ':' + String(profileOnNameClick(h) ? 1 : 0);
  }

  var api = {
    heroLevelPart: heroLevelPart,
    heroNickHex: heroNickHex,
    heroShowsPkButton: heroShowsPkButton,
    profileOnNameClick: profileOnNameClick,
    normalizeNearbyHeroEntry: normalizeNearbyHeroEntry,
    normalizeNearbyHeroes: normalizeNearbyHeroes,
    compactHeroSig: compactHeroSig,
    heroListDomMatchesPayload: heroListDomMatchesPayload,
    appendHeroRow: appendHeroRow,
    renderHeroList: renderHeroList,
    renderHeroRowHtml: renderHeroRowHtml,
    compactHeroPkSig: compactHeroPkSig,
  };

  global.L2MapHeroRowRender = api;
})(typeof window !== 'undefined' ? window : globalThis);
