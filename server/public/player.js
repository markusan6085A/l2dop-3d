/**
 * Сторінка «Профіль гравця»: GET /game/player/:id/profile або by-name.
 */
(function () {
  var viewedProfile = null;
  var selfCharacter = null;
  var clanInviteInFlight = false;
  var partyInviteInFlight = false;
  var selfParty = null;

  function $(id) {
    return document.getElementById(id);
  }

  function formatRegisteredUk(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var yyyy = d.getFullYear();
    return dd + '.' + mm + '.' + yyyy;
  }

  function fmtNum(s) {
    if (s == null || s === '') return '0';
    try {
      return BigInt(String(s)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
    } catch (_e) {
      return String(s);
    }
  }

  function fmtInt(n) {
    if (n == null || n === '') return '0';
    var v = Number(n);
    if (!Number.isFinite(v)) return '0';
    return String(Math.trunc(v));
  }

  function formatHeroPower(n) {
    var v = Number(n);
    if (!Number.isFinite(v)) return '1\u202f000';
    return String(Math.trunc(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
  }

  function professionLabel(p) {
    if (window.L2 && typeof L2.hudL2ProfessionUkFromSnapshot === 'function') {
      return L2.hudL2ProfessionUkFromSnapshot(p);
    }
    if (!p || p.l2Profession == null) return '—';
    return String(p.l2Profession);
  }

  function formatLastSeenUk(iso) {
    if (!iso) return 'Офлайн';
    var then = Date.parse(String(iso));
    if (!Number.isFinite(then)) return 'Офлайн';
    var diffMs = Math.max(0, Date.now() - then);
    var sec = Math.floor(diffMs / 1000);
    if (sec < 45) return 'був у мережі щойно';
    var min = Math.floor(sec / 60);
    if (min < 60) return 'був у мережі ' + min + ' хв тому';
    var hr = Math.floor(min / 60);
    var minRem = min % 60;
    if (hr < 24) {
      if (minRem === 0) return 'був у мережі ' + hr + ' год тому';
      return 'був у мережі ' + hr + ' год ' + minRem + ' хв тому';
    }
    var days = Math.floor(hr / 24);
    return 'був у мережі ' + days + ' дн тому';
  }

  function canInviteToParty(viewed, selfPartyState) {
    if (!viewed || !selfCharacter) return false;
    if (String(viewed.id || '') === String(selfCharacter.id || '')) {
      return false;
    }
    if (selfPartyState && !selfPartyState.viewerIsLeader) return false;
    if (
      selfPartyState &&
      selfPartyState.memberCount >= selfPartyState.maxMembers
    ) {
      return false;
    }
    return true;
  }

  function partyInviteMessageUk(j, fallback) {
    if (j && j.messageUk) return String(j.messageUk);
    var code = j && j.error ? String(j.error) : '';
    if (code === 'party_target_in_party') return 'Цей гравець уже в паті.';
    if (code === 'party_full') return 'Паті заповнене';
    if (code === 'party_invite_exists') return 'Запрошення вже надіслано';
    if (code === 'party_invite_leader_only') return 'Запрошувати може лише лідер';
    return fallback || 'Не вдалося надіслати запрошення.';
  }

  async function reloadSelfParty(token) {
    try {
      var partyRes = await fetch('/game/party', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (partyRes.ok) {
        var partyJson = await partyRes.json();
        selfParty = partyJson && partyJson.party ? partyJson.party : null;
      }
    } catch (_eParty) {
      selfParty = null;
    }
  }

  function canInviteToClan(viewed, self) {
    if (!viewed || !self) return false;
    if (String(viewed.id || '') === String(self.id || '')) return false;
    if (viewed.clanName) return false;
    if (!self.clanId) return false;
    return true;
  }

  function applyOnlineLine(p) {
    var el = $('player-online-text');
    if (!el || !p) return;
    el.classList.remove('l2-player-online--online', 'l2-player-online--offline');
    if (p.isOnline) {
      el.textContent = 'Онлайн';
      el.classList.add('l2-player-online--online');
      return;
    }
    el.textContent = formatLastSeenUk(p.lastSeenAt || p.registeredAt);
    el.classList.add('l2-player-online--offline');
  }

  function profileApiUrl() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    var name = params.get('name');
    if (id && String(id).trim()) {
      return '/game/player/' + encodeURIComponent(String(id).trim()) + '/profile';
    }
    if (name && String(name).trim()) {
      return (
        '/game/player/by-name/' + encodeURIComponent(String(name).trim()) + '/profile'
      );
    }
    return null;
  }

  function showClanInviteMsg(text, isError) {
    var el = $('player-clan-invite-msg');
    if (!el) return;
    el.hidden = false;
    el.textContent = text;
    el.classList.toggle('l2-player-clan-invite-msg--error', !!isError);
  }

  function renderViewedEquipment(p) {
    var frame = $('player-equip-frame');
    if (!frame || !window.L2CharEquipFrame) return;
    var eq = p && p.equipment && typeof p.equipment === 'object' ? p.equipment : {};
    L2CharEquipFrame.renderEquipSlots({ eq: eq }, frame);
  }

  function wireViewedEquipment() {
    var frame = $('player-equip-frame');
    if (!frame || !window.L2CharEquipFrame) return;
    L2CharEquipFrame.wireEquipSlotView(frame, function () {
      return viewedProfile && viewedProfile.equipment ? viewedProfile.equipment : {};
    });
  }

  function showSocialMsg(text, isError) {
    showClanInviteMsg(text, isError);
  }

  function patchPartyInviteUi() {
    if (!viewedProfile) return;
    var btn = $('player-party-action');
    if (!btn) return;
    btn.removeAttribute('data-stub');
    if (
      String(viewedProfile.id || '') ===
      String((selfCharacter && selfCharacter.id) || '')
    ) {
      btn.hidden = true;
      return;
    }
    btn.hidden = false;
    if (selfParty && !selfParty.viewerIsLeader) {
      btn.textContent = 'Запросити в паті';
      btn.disabled = true;
      btn.title = 'Запрошувати може лише лідер';
      return;
    }
    btn.disabled = false;
    btn.title = '';
    btn.textContent = 'Запросити в паті';
  }

  function patchClanInviteUi() {
    if (!viewedProfile) return;
    var clanBtn = $('player-clan-action');
    var clanInviteMsg = $('player-clan-invite-msg');
    if (clanInviteMsg) {
      clanInviteMsg.hidden = true;
      clanInviteMsg.textContent = '';
      clanInviteMsg.classList.remove('l2-player-clan-invite-msg--error');
    }
    if (!clanBtn) return;
    clanBtn.removeAttribute('data-stub');
    if (viewedProfile.clanName) {
      clanBtn.textContent = '';
      if (window.L2 && typeof L2.renderClanIdentity === 'function') {
        clanBtn.appendChild(document.createTextNode('Клан: '));
        clanBtn.appendChild(
          L2.renderClanIdentity({
            name: viewedProfile.clanName,
            emblemId: viewedProfile.clanEmblemId,
            emblemSize: 16,
          })
        );
      } else {
        clanBtn.textContent = 'Клан: ' + String(viewedProfile.clanName);
      }
      clanBtn.disabled = true;
    } else if (canInviteToClan(viewedProfile, selfCharacter)) {
      clanBtn.textContent = 'Запросити в клан';
      clanBtn.disabled = false;
    } else {
      clanBtn.textContent = 'Запросити в клан';
      clanBtn.disabled = false;
      clanBtn.setAttribute('data-stub', 'Запросити в клан');
    }
  }

  function applyProfile(p) {
    viewedProfile = p;
    var headline = $('player-headline');
    if (headline) {
      headline.textContent = '';
      if (window.L2 && typeof L2.renderPlayerIdentity === 'function') {
        headline.appendChild(
          L2.renderPlayerIdentity({
            name: p.name,
            clanEmblemId: p.clanEmblemId,
            emblemSize: 16,
          })
        );
      } else {
        headline.appendChild(document.createTextNode(String(p.name || '—')));
      }
      headline.appendChild(
        document.createTextNode(
          ' — ' + String(p.level != null ? p.level : '—') + ' ур.'
        )
      );
    }

    var statusEl = $('player-status');
    if (statusEl) {
      statusEl.textContent =
        p.profileStatus != null && String(p.profileStatus).trim()
          ? String(p.profileStatus).trim()
          : 'Немає статусу';
    }

    if (window.L2CharHero && typeof L2CharHero.renderPortrait === 'function') {
      L2CharHero.renderPortrait(p, {
        imgId: 'player-hero-img',
        stageId: 'player-hero-stage',
        bgSelector: '#player-equip-frame .l2-char-equip-bg',
      });
    }

    renderViewedEquipment(p);

    patchClanInviteUi();
    patchPartyInviteUi();

    var set = function (id, txt) {
      var el = $(id);
      if (el) el.textContent = txt != null ? String(txt) : '—';
    };

    set('player-karma', p.karma != null ? p.karma : 0);
    set('player-pk', p.pk != null ? p.pk : 0);
    set('player-rec', p.recommendations != null ? p.recommendations : 0);

    var recNickLink = $('player-rec-nick-link');
    if (recNickLink) {
      var q =
        '/recommend-nick.html?targetId=' +
        encodeURIComponent(String(p.id || '')) +
        '&targetName=' +
        encodeURIComponent(String(p.name || ''));
      recNickLink.href = q;
      recNickLink.textContent = 'Рекомендовать';
    }
    set('player-mobs', p.mobsKilled != null ? p.mobsKilled : 0);
    set(
      'player-pvp',
      String(p.pvpWins != null ? p.pvpWins : 0) +
        '/' +
        String(p.pvpLosses != null ? p.pvpLosses : 0)
    );

    var locEl = $('player-location');
    if (locEl) {
      var city = p.cityLabelUk || p.cityId || '—';
      locEl.textContent = 'У ' + city;
    }

    applyOnlineLine(p);

    var powerEl = $('player-hero-power');
    if (powerEl) {
      powerEl.textContent = formatHeroPower(p.heroPower);
    }

    var levelEl = $('player-level');
    if (levelEl) levelEl.textContent = p.level != null ? fmtInt(p.level) : '—';
    set('player-adena', p.adena != null ? fmtNum(p.adena) : '0');
    set('player-coin-luck', p.coinOfLuck != null ? fmtNum(p.coinOfLuck) : '0');
    set('player-exp', p.exp != null ? fmtNum(p.exp) : '0');
    set('player-sp', p.sp != null ? fmtInt(p.sp) : '0');
    set('player-profession', professionLabel(p));

    var regEl = $('player-registered');
    if (regEl) {
      regEl.textContent = 'Рег-я: ' + formatRegisteredUk(p.registeredAt);
    }

    document.title = String(p.name || 'Гравець') + ' — L2WAP';
  }

  function wireStubs() {
    var statsRoot = $('player-stats');
    if (statsRoot) {
      statsRoot.querySelectorAll('.l2-character-row__ico').forEach(function (icon) {
        if (icon.dataset.fallbackWired === '1') return;
        icon.dataset.fallbackWired = '1';
        icon.addEventListener('error', function onIconError() {
          icon.removeEventListener('error', onIconError);
          icon.src = '/icons/drops/other.svg';
        });
      });
    }

    document.querySelectorAll('[data-stub]').forEach(function (btn) {
      if (btn.dataset.stubWired === '1') return;
      btn.dataset.stubWired = '1';
      btn.addEventListener('click', function () {
        var stub = $('player-stub-msg');
        if (stub) {
          stub.hidden = false;
          stub.textContent = btn.getAttribute('data-stub') + ' — заглушка, з’явиться пізніше.';
        }
      });
    });
  }

  function wirePartyInvite(token) {
    var btn = $('player-party-action');
    if (!btn || btn.dataset.partyInviteWired === '1') return;
    btn.dataset.partyInviteWired = '1';
    btn.addEventListener('click', async function () {
      if (partyInviteInFlight) return;
      if (!viewedProfile || !selfCharacter) return;
      if (
        String(viewedProfile.id || '') === String(selfCharacter.id || '')
      ) {
        return;
      }
      if (selfParty && !selfParty.viewerIsLeader) {
        showSocialMsg('Запрошувати може лише лідер', true);
        return;
      }
      partyInviteInFlight = true;
      try {
        var r = await fetch('/game/party/invite-player', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            targetCharacterId: String(viewedProfile.id || ''),
          }),
        });
        if (r.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return;
        }
        var j = null;
        try {
          j = await r.json();
        } catch (_eJson) {
          j = null;
        }
        if (r.ok) {
          await reloadSelfParty(token);
          patchPartyInviteUi();
          if (window.L2 && typeof L2.refreshPartyHud === 'function') {
            L2.refreshPartyHud();
          }
          var targetName = String(viewedProfile.name || '').trim() || 'гравця';
          var sentMsg = 'Запрошення надіслано гравцю ' + targetName;
          if (
            window.L2PartyHud &&
            typeof L2PartyHud.showFlash === 'function'
          ) {
            L2PartyHud.showFlash(sentMsg);
          }
          showSocialMsg(sentMsg, false);
          return;
        }
        showSocialMsg(
          partyInviteMessageUk(j, 'Не вдалося надіслати запрошення.'),
          true
        );
      } catch (_e) {
        showSocialMsg('Не вдалося надіслати запрошення.', true);
      } finally {
        partyInviteInFlight = false;
      }
    });
  }

  function wireClanInvite(token) {
    var btn = $('player-clan-action');
    if (!btn || btn.dataset.clanInviteWired === '1') return;
    btn.dataset.clanInviteWired = '1';
    btn.addEventListener('click', async function () {
      if (!canInviteToClan(viewedProfile, selfCharacter)) return;
      if (clanInviteInFlight) return;
      clanInviteInFlight = true;
      try {
        var r = await fetch('/game/clans/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            targetCharacterId: String(viewedProfile.id || ''),
          }),
        });
        if (r.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return;
        }
        var j = null;
        try {
          j = await r.json();
        } catch (_eJson) {
          j = null;
        }
        if (r.ok) {
          showClanInviteMsg('Ви надіслали гравцеві запрошення вступити до клану.', false);
          return;
        }
        var errMsg =
          j && j.messageUk
            ? String(j.messageUk)
            : 'Не вдалося надіслати запрошення в клан.';
        showClanInviteMsg(errMsg, true);
      } catch (_e) {
        showClanInviteMsg('Не вдалося надіслати запрошення в клан.', true);
      } finally {
        clanInviteInFlight = false;
      }
    });
  }

  function revealPlayerPanel() {
    var content = $('player-content');
    if (content) content.classList.remove('l2-player-panel--loading');
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    var token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    var errEl = $('player-load-err');
    var apiUrl = profileApiUrl();
    if (!apiUrl) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вказано гравця.';
      }
      return;
    }

    try {
      if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
        L2.renderCharacterFromCache();
      }

      selfCharacter =
        window.L2 && typeof L2.getCachedCharacter === 'function'
          ? L2.getCachedCharacter()
          : null;

      if (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function') {
        void L2.resyncCharacterWhenRequired()
          .then(function (c) {
            if (c) {
              selfCharacter = c;
              if (typeof L2.applyMutationSnapshot === 'function') {
                L2.applyMutationSnapshot(c);
              }
              patchClanInviteUi();
              patchPartyInviteUi();
            } else if (!selfCharacter) {
              window.location.href = '/';
            }
          })
          .catch(function () {
            /* resync optional for profile reveal */
          });
      }
      try {
        await reloadSelfParty(token);
      } catch (_ePartyLoad) {
        selfParty = null;
      }
      if (window.L2 && typeof L2.fetchCatalogHints === 'function') {
        void L2.fetchCatalogHints().catch(function () {
          return false;
        });
      }

      var r = await fetch(apiUrl, {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (r.status === 404) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Гравця не знайдено.';
        }
        return;
      }
      if (!r.ok) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося завантажити профіль.';
        }
        return;
      }

      var j = await r.json();
      if (!j || !j.profile) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося завантажити профіль.';
        }
        return;
      }

      applyProfile(j.profile);
      wireViewedEquipment();
      revealPlayerPanel();
      wireClanInvite(token);
      wirePartyInvite(token);
      wireStubs();
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити профіль.';
      }
    }
  }

  init();
})();
