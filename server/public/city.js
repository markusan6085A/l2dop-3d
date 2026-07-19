/**
 * Місто: snapshot, заглушки сервісів.
 * Телепорт — окрема сторінка /teleport.html.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

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
      }
      return;
    }

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
    applyCityLocation(c);

    if (services) services.removeAttribute('hidden');
    if (wapTop) wapTop.hidden = false;
    if (wapBottom) wapBottom.hidden = false;
  }

  init();
})();
