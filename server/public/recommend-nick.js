/**
 * recommend-nick.html — обмін рекомендацій на колір ніка / рекомендація іншому гравцю.
 */
(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function fmtInt(n) {
    if (n == null || n === '') return '0';
    var v = Number(n);
    if (!Number.isFinite(v)) return '0';
    return String(Math.trunc(v));
  }

  function parseParams() {
    var params = new URLSearchParams(window.location.search);
    var targetId = params.get('targetId');
    var targetName = params.get('targetName');
    return {
      targetId: targetId && String(targetId).trim() ? String(targetId).trim() : '',
      targetName: targetName && String(targetName).trim() ? String(targetName).trim() : '',
    };
  }

  function backHref(params) {
    if (params.targetId) {
      return '/player.html?id=' + encodeURIComponent(params.targetId);
    }
    if (params.targetName) {
      return '/player.html?name=' + encodeURIComponent(params.targetName);
    }
    return '/character.html';
  }

  function showStub(label) {
    var el = $('recommend-nick-stub');
    if (!el) return;
    el.hidden = false;
    el.textContent = '«' + label + '» — заглушка, з’явиться пізніше.';
  }

  function colorList() {
    return Array.isArray(window.RECOMMEND_NICK_COLORS) ? window.RECOMMEND_NICK_COLORS : [];
  }

  function isDarkHex(hex) {
    if (typeof window.recommendNickIsDarkHex === 'function') {
      return window.recommendNickIsDarkHex(hex);
    }
    return false;
  }

  function renderColorGrid(nickName) {
    var root = $('recommend-nick-colors');
    if (!root) return;

    var grid = document.createElement('div');
    grid.className = 'l2-recommend-nick-colors__grid';
    var nick = nickName != null ? String(nickName) : '—';

    colorList().forEach(function (hex) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'l2-recommend-nick-colors__item';
      item.setAttribute('data-hex', hex);

      var nickEl = document.createElement('span');
      nickEl.className = 'l2-recommend-nick-colors__nick';
      if (isDarkHex(hex)) {
        nickEl.classList.add('l2-recommend-nick-colors__nick--dark');
      }
      nickEl.style.color = hex;
      nickEl.textContent = nick;

      item.appendChild(nickEl);
      grid.appendChild(item);
    });

    root.innerHTML = '';
    root.appendChild(grid);
    root.hidden = false;
  }

  function setNickInColorGrid(nickName) {
    document.querySelectorAll('.l2-recommend-nick-colors__nick').forEach(function (el) {
      el.textContent = nickName;
    });
  }

  function renderGiversList(givers) {
    var root = $('recommend-give-givers');
    if (!root) return;
    root.innerHTML = '';

    var rows = Array.isArray(givers) ? givers : [];
    if (!rows.length) return;

    rows.forEach(function (row) {
      var line = document.createElement('p');
      line.className = 'l2-recommend-nick-givers__row';

      var nameEl = document.createElement('span');
      nameEl.className = 'l2-recommend-nick-givers__name';
      nameEl.textContent = row && row.name != null ? String(row.name) : '—';

      var countEl = document.createElement('span');
      countEl.className = 'l2-recommend-nick-givers__count';
      countEl.textContent = row && row.count != null ? fmtInt(row.count) : '0';

      line.appendChild(nameEl);
      line.appendChild(countEl);
      root.appendChild(line);
    });
  }

  function showSelfView() {
    var selfView = $('recommend-nick-self-view');
    var giveView = $('recommend-nick-give-view');
    if (selfView) selfView.hidden = false;
    if (giveView) giveView.hidden = true;
  }

  function showGiveView() {
    var selfView = $('recommend-nick-self-view');
    var giveView = $('recommend-nick-give-view');
    if (selfView) selfView.hidden = true;
    if (giveView) giveView.hidden = false;
  }

  function applySelfMode(c) {
    showSelfView();

    var title = $('recommend-nick-title');
    var lead = $('recommend-nick-lead');
    var stats = $('recommend-nick-stats');
    var nickName = c && c.name ? String(c.name) : '—';

    if (title) title.textContent = 'Покрасить ник';
    if (lead) lead.textContent = 'Обміняй рекомендації на колір нікнейма.';
    if (stats) {
      var rec = c && c.recommendations != null ? fmtInt(c.recommendations) : '0';
      var left = c && c.recommendationsLeft != null ? fmtInt(c.recommendationsLeft) : '0';
      stats.textContent = 'Рекомендації: ' + rec + '\nДоступно для обміну: ' + left;
    }
    if (!document.querySelector('.l2-recommend-nick-colors__grid')) {
      renderColorGrid(nickName);
    } else {
      setNickInColorGrid(nickName);
      var colorsEl = $('recommend-nick-colors');
      if (colorsEl) colorsEl.hidden = false;
    }
    document.title = 'Покрасить ник — L2WAP';
  }

  function applyRecommendMode(params, selfChar, givers) {
    showGiveView();

    var name = params.targetName || 'гравця';
    var othersEl = $('recommend-give-others');

    if (othersEl) {
      var left =
        selfChar && selfChar.recommendationsLeft != null
          ? fmtInt(selfChar.recommendationsLeft)
          : '0';
      othersEl.textContent = 'Твої рекомендації для інших: ' + left;
    }

    renderGiversList(givers);
    document.title = 'Рекомендовать — ' + name + ' — L2WAP';
  }

  function wireBack(params) {
    var goBack = function () {
      window.location.href = backHref(params);
    };
    var backSelf = $('recommend-nick-back');
    var backGive = $('recommend-give-back');
    if (backSelf) backSelf.addEventListener('click', goBack);
    if (backGive) backGive.addEventListener('click', goBack);
  }

  function wireGiveStub() {
    var btn = $('recommend-give-submit');
    if (!btn) return;
    btn.addEventListener('click', function () {
      showStub('Рекомендовать');
    });
  }

  async function init() {
    if (window.L2 && typeof L2.setUiLang === 'function') {
      L2.setUiLang('uk');
    }
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    var params = parseParams();
    var isRecommend = !!(params.targetId || params.targetName);
    wireBack(params);
    wireGiveStub();

    if (!isRecommend) {
      showSelfView();
      renderColorGrid('—');
    } else {
      applyRecommendMode(params, null, []);
    }

    var token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    var errEl = $('recommend-nick-err');

    try {
      var r = await fetch('/character', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (!r.ok) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося завантажити персонажа.';
        }
        return;
      }

      var j = await r.json();
      var c = j.character;
      if (c && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(c);
      }
      if (c && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(c);
      }

      if (isRecommend) {
        applyRecommendMode(params, c, []);
      } else {
        applySelfMode(c);
      }
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити персонажа.';
      }
    }
  }

  init();
})();
