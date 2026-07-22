/**
 * Місто: snapshot, заглушки сервісів.
 * Телепорт — окрема сторінка /teleport.html.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  var siegeCityData = null;
  var siegeCityTimer = null;
  var siegeCityTimerTargetMs = 0;
  var siegeCityTimerPrefix = '';

  function showStub(msg) {
    var el = $('city-stub-msg');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
  }

  function showStubI18n(key) {
    if (!key || !window.L2 || !L2.tr) return;
    showStub('«' + L2.tr(key) + '» — ' + L2.tr('stub_later'));
  }

  function wireMiruIcons() {
    document.querySelectorAll('.l2-town-miru-ico, .l2-town-miru-loc-pin').forEach(function (icon) {
      if (icon.dataset.fallbackWired === '1') return;
      icon.dataset.fallbackWired = '1';
      icon.addEventListener('error', function onIconError() {
        icon.removeEventListener('error', onIconError);
        icon.src = '/icons/drops/other.svg';
      });
    });
  }

  var SIEGE_CITY_IDS = {
    l2dop_oren: 1,
    l2dop_giran: 1,
    l2dop_aden: 1,
    l2dop_goddard: 1,
    l2dop_rune: 1,
    l2dop_gludio: 1,
    l2dop_dion: 1,
    l2dop_schuttgart: 1,
  };

  function isSiegeCityId(id) {
    return !!SIEGE_CITY_IDS[String(id || '').trim()];
  }

  function setSiegeCardVisible(visible) {
    var card = $('city-siege-card');
    if (card) card.hidden = !visible;
  }

  function setSiegeCardBusy(busy) {
    var card = $('city-siege-card');
    if (!card) return;
    card.setAttribute('aria-busy', busy ? 'true' : 'false');
  }

  function stopSiegeCityTimer() {
    if (siegeCityTimer) {
      clearInterval(siegeCityTimer);
      siegeCityTimer = null;
    }
    siegeCityTimerTargetMs = 0;
    siegeCityTimerPrefix = '';
  }

  function tickSiegeCityTimer() {
    var textEl = $('city-siege-schedule-text');
    if (!textEl || !siegeCityTimerTargetMs) return;
    var fmt =
      window.L2 && L2.clanUi && typeof L2.clanUi.formatCountdownHms === 'function'
        ? L2.clanUi.formatCountdownHms
        : null;
    var left = fmt
      ? fmt(siegeCityTimerTargetMs)
      : String(Math.max(0, siegeCityTimerTargetMs - Date.now()));
    textEl.textContent = siegeCityTimerPrefix + left;
  }

  function startSiegeCityTimer(targetMs, prefix) {
    stopSiegeCityTimer();
    if (!targetMs) return;
    siegeCityTimerTargetMs = targetMs;
    siegeCityTimerPrefix = prefix || '';
    tickSiegeCityTimer();
    siegeCityTimer = setInterval(tickSiegeCityTimer, 1000);
  }

  function renderSiegeSchedule(data) {
    var labelEl = $('city-siege-schedule-label');
    var textEl = $('city-siege-schedule-text');
    if (!textEl) return;

    stopSiegeCityTimer();

    var parts =
      window.L2 && L2.clanUi && typeof L2.clanUi.siegeCityScheduleParts === 'function'
        ? L2.clanUi.siegeCityScheduleParts(data)
        : { label: 'Наступна облога', value: '—' };

    if (labelEl) labelEl.textContent = parts.label || 'Наступна облога';
    textEl.textContent = parts.value || '—';

    if (parts.timerTargetMs) {
      startSiegeCityTimer(parts.timerTargetMs, parts.timerPrefix || '');
    }
  }

  function renderSiegeOwnerName(ownerClan) {
    var ownerName = $('city-siege-owner-name');
    if (!ownerName) return;
    ownerName.textContent = '';
    if (window.L2 && typeof L2.renderClanIdentity === 'function') {
      ownerName.appendChild(
        L2.renderClanIdentity({
          name: ownerClan && ownerClan.name ? ownerClan.name : 'Немає',
          emblemId: ownerClan && ownerClan.emblemId != null ? ownerClan.emblemId : null,
          emblemSize: 16,
        })
      );
      return;
    }
    ownerName.textContent =
      ownerClan && ownerClan.name ? String(ownerClan.name) : 'Немає';
  }

  function prepareSiegeCityCard(cityId) {
    if (!isSiegeCityId(cityId)) {
      setSiegeCardVisible(false);
      stopSiegeCityTimer();
      return;
    }

    setSiegeCardVisible(true);
    setSiegeCardBusy(true);
    stopSiegeCityTimer();
    var labelEl = $('city-siege-schedule-label');
    var scheduleText = $('city-siege-schedule-text');
    var ownerName = $('city-siege-owner-name');
    if (labelEl) labelEl.textContent = 'Наступна облога';
    if (scheduleText) scheduleText.textContent = 'Завантаження…';
    if (ownerName) ownerName.textContent = 'Завантаження…';
  }

  async function loadSiegeCityOwner(cityId) {
    if (!isSiegeCityId(cityId)) {
      setSiegeCardVisible(false);
      stopSiegeCityTimer();
      return;
    }

    prepareSiegeCityCard(cityId);

    var t = localStorage.getItem('token');
    if (!t) {
      setSiegeCardBusy(false);
      return;
    }

    try {
      var r = await fetch(
        '/game/siege/' + encodeURIComponent(String(cityId)) + '/state',
        { headers: { Authorization: 'Bearer ' + t } }
      );
      if (!r.ok) {
        setSiegeCardBusy(false);
        return;
      }
      var data = await r.json();
      siegeCityData = data;
      renderSiegeOwnerName(data.ownerClan);
      renderSiegeSchedule(data);
      setSiegeCardBusy(false);
    } catch (_eNet) {
      setSiegeCardBusy(false);
    }
  }

  function applyCityLocation(c) {
    var locTitle = document.querySelector('#city-loc-name .l2-town-miru-loc-title');
    if (!locTitle || !c) return;
    var name =
      window.L2 && typeof L2.cityDisplayName === 'function'
        ? L2.cityDisplayName(c.cityId)
        : String(c.cityId || '—');
    var cityId = String(c.cityId || '').trim();
    var existing = locTitle.querySelector('.l2-town-miru-loc-text, .l2-town-miru-loc-link');
    var pin = locTitle.querySelector('.l2-town-miru-loc-pin');

    if (isSiegeCityId(cityId)) {
      prepareSiegeCityCard(cityId);
      var link = existing && existing.tagName === 'A' ? existing : document.createElement('a');
      link.className = 'l2-town-miru-loc-text l2-town-miru-loc-link';
      link.href = '/siege.html?cityId=' + encodeURIComponent(cityId);
      link.textContent = name;
      if (!existing || existing.tagName !== 'A') {
        if (existing) existing.remove();
        if (pin && pin.nextSibling) {
          locTitle.insertBefore(link, pin.nextSibling);
        } else {
          locTitle.appendChild(link);
        }
      } else if (existing.textContent !== name) {
        existing.textContent = name;
      }
      void loadSiegeCityOwner(cityId);
      return;
    }

    setSiegeCardVisible(false);
    stopSiegeCityTimer();
    if (existing && existing.tagName === 'A') {
      existing.remove();
      existing = null;
    }
    var textEl = existing || document.createElement('span');
    textEl.className = 'l2-town-miru-loc-text';
    textEl.textContent = name;
    if (!existing) {
      if (pin && pin.nextSibling) {
        locTitle.insertBefore(textEl, pin.nextSibling);
      } else {
        locTitle.appendChild(textEl);
      }
    }
  }

  function wireStubs() {
    var root = $('city-services');
    if (root) {
      root.querySelectorAll('.l2-town-miru-item[data-i18n-stub]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var k = btn.getAttribute('data-i18n-stub');
          if (k) showStubI18n(k);
        });
      });
    }
    var foot = $('l2-foot-links');
    if (foot) {
      foot.querySelectorAll('[data-stub]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var name = btn.getAttribute('data-stub') || '';
          showStub(
            '«' + name + '» — ' + (window.L2 && L2.tr ? L2.tr('stub_later') : '…')
          );
        });
      });
    }
  }

  function setHudLoading() {
    var nick = $('l2-hud-nick');
    if (nick) {
      nick.textContent =
        window.L2 && L2.tr ? L2.tr('city_loading') : 'Завантаження…';
    }
  }

  async function enterCityHubOnServer(snapshot) {
    if (!snapshot || snapshot.revision == null) return snapshot;
    var t = localStorage.getItem('token');
    if (!t) return snapshot;
    try {
      var r = await fetch('/game/world/enter-city', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({ expectedRevision: snapshot.revision }),
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return null;
      }
      if (r.status === 409 && window.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
        await L2.resyncCharacterAfterConflict(null, await r.json().catch(function () { return null; }));
        var snap2 = window.L2.lastSnapshot ? L2.lastSnapshot() : null;
        if (snap2) return enterCityHubOnServer(snap2);
        return snapshot;
      }
      if (!r.ok) return snapshot;
      var j = await r.json();
      return j.character || snapshot;
    } catch (eEnter) {
      return snapshot;
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function (label) {
          showStub('«' + label + '» — заглушка, з’явиться пізніше.');
        },
      });
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    wireStubs();
    wireMiruIcons();

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') {
        stopSiegeCityTimer();
        return;
      }
      if (siegeCityData && siegeCityData.state === 'active' && siegeCityData.endsAt) {
        var parts =
          window.L2 && L2.clanUi && typeof L2.clanUi.siegeCityScheduleParts === 'function'
            ? L2.clanUi.siegeCityScheduleParts(siegeCityData)
            : null;
        if (parts && parts.timerTargetMs) {
          startSiegeCityTimer(parts.timerTargetMs, parts.timerPrefix || '');
        }
      }
    });

    var t = localStorage.getItem('token');
    var errEl = $('city-load-err');
    var services = $('city-services');
    var wapTop = $('wap-top');
    var wapBottom = $('wap-bottom');

    if (t && services) services.removeAttribute('hidden');

    if (!t) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent =
          window.L2 && L2.tr ? L2.tr('city_need_login') : 'Потрібен вхід. Перейди на головну.';
      }
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      if (services) services.hidden = true;
      if (wapTop) wapTop.hidden = true;
      if (wapBottom) wapBottom.hidden = true;
      return;
    }

    setHudLoading();

    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    var c =
      window.L2 && typeof L2.claimWorldMapSession === 'function'
        ? await L2.claimWorldMapSession()
        : window.L2 && typeof L2.fetchSnapshot === 'function'
          ? await L2.fetchSnapshot({ claimWorld: true })
          : null;
    if (!c) {
      var errMsg =
        window.L2 && L2.tr
          ? L2.tr('city_load_hero_fail')
          : 'Не вдалося завантажити героя.';
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = errMsg;
      }
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      if (wapTop) wapTop.hidden = true;
      if (wapBottom) wapBottom.hidden = true;
      return;
    }
    if (window.L2 && typeof L2.fetchCatalogHints === 'function') {
      await L2.fetchCatalogHints();
    }
    if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c);
    }
    c = (await enterCityHubOnServer(c)) || c;
    if (!c) return;
    if (window.L2 && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c);
    }
    applyCityLocation(c);

    if (services) services.removeAttribute('hidden');
    if (wapTop) wapTop.hidden = false;
    if (wapBottom) wapBottom.hidden = false;
  }

  init();
})();
