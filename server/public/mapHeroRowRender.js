/**
 * Shared nearby-hero row renderer for map.html (server showPkButton is source of truth).
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

    var li = document.createElement('li');
    li.className = 'l2-map-hero-item';
    var main = document.createElement('div');
    main.className = 'l2-map-hero-item__main';
    main.style.setProperty('--l2-map-hero-nick-color', heroNickHex(h) || '#bfa88a');

    var titleLine = document.createElement('div');
    titleLine.className = 'l2-map-hero-item__title';

    appendHeroNameEl(titleLine, h, L2);

    var levelSpan = document.createElement('span');
    levelSpan.className = 'l2-map-hero-level';
    levelSpan.textContent = heroLevelPart(h);
    titleLine.appendChild(levelSpan);

    if (heroShowsPkButton(h)) {
      var pkBtn = document.createElement('button');
      pkBtn.type = 'button';
      pkBtn.className = 'l2-map-hero-link__pk';
      pkBtn.textContent = '[PK]';
      pkBtn.setAttribute('aria-label', 'Атакувати ' + (h.name || ''));
      if (onPkClick) {
        pkBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var cid = h.characterId || '';
          if (cid) onPkClick(cid);
        });
      }
      titleLine.appendChild(pkBtn);
    }

    if (h.isPartyMember) {
      var partyTag = document.createElement('span');
      partyTag.className = 'l2-map-hero-party-tag';
      partyTag.textContent = h.isPartyLeader ? ' · Паті★' : ' · Паті';
      partyTag.title = h.isPartyLeader ? 'Лідер паті' : 'Член паті';
      titleLine.appendChild(partyTag);
    }

    main.appendChild(titleLine);
    li.appendChild(main);
    listEl.appendChild(li);
    return li;
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
    appendHeroRow: appendHeroRow,
    renderHeroRowHtml: renderHeroRowHtml,
    compactHeroPkSig: compactHeroPkSig,
  };

  global.L2MapHeroRowRender = api;
})(typeof window !== 'undefined' ? window : globalThis);
