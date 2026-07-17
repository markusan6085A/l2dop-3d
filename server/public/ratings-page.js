/**
 * Сторінка «Рейтинги» — GET /game/ratings.
 */
(function () {
  var loadInFlight = false;
  var currentType = 'level';
  var currentPage = 1;

  function $(id) {
    return document.getElementById(id);
  }

  function catalog() {
    return window.L2RatingsCatalog || { categories: [] };
  }

  function setQuery(type, page) {
    var url = new URL(window.location.href);
    url.searchParams.set('type', type);
    url.searchParams.set('page', String(page));
    window.history.replaceState(null, '', url.pathname + url.search);
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    currentType = String(params.get('type') || 'level').trim() || 'level';
    currentPage = Math.max(1, Math.floor(Number(params.get('page')) || 1));
  }

  function renderCategories(activeType) {
    var wrap = $('ratings-categories');
    if (!wrap) return;
    wrap.innerHTML = '';
    var cats = catalog().categories || [];
    for (var i = 0; i < cats.length; i++) {
      var cat = cats[i];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'l2-ratings-cat';
      if (cat.id === activeType) btn.classList.add('l2-ratings-cat--active');
      btn.dataset.type = cat.id;
      btn.textContent = cat.labelUk;
      btn.addEventListener('click', function () {
        var t = this.dataset.type || 'level';
        currentType = t;
        currentPage = 1;
        setQuery(currentType, currentPage);
        loadRatings();
        renderCategories(currentType);
      });
      wrap.appendChild(btn);
    }
  }

  function renderRows(payload) {
    var listEl = $('ratings-list');
    var headEl = $('ratings-col-head');
    var typeTitleEl = $('ratings-type-title');
    var stubEl = $('ratings-stub');
    var pagesEl = $('ratings-pages');
    var selfEl = $('ratings-self');
    if (!listEl) return;

    if (typeTitleEl) typeTitleEl.textContent = payload.titleUk || 'Рейтинг';

    if (payload.stub) {
      if (headEl) headEl.hidden = true;
      listEl.innerHTML = '';
      if (pagesEl) pagesEl.innerHTML = '';
      if (selfEl) selfEl.hidden = true;
      if (stubEl) {
        stubEl.hidden = false;
        stubEl.textContent = payload.stubMessageUk || 'Незабаром.';
      }
      return;
    }

    if (stubEl) stubEl.hidden = true;
    if (headEl) headEl.hidden = false;

    var valHead = headEl ? headEl.querySelector('.l2-ratings-col-head__val') : null;
    if (valHead) valHead.textContent = payload.valueColumnUk || 'Значення';

    listEl.innerHTML = '';
    var rows = payload.rows || [];
    if (!rows.length) {
      var empty = document.createElement('p');
      empty.className = 'l2-ratings-empty';
      empty.textContent = 'Поки що немає даних.';
      listEl.appendChild(empty);
    } else {
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var row = document.createElement('article');
        row.className = 'l2-ratings-row';

        var rank = document.createElement('span');
        rank.className = 'l2-ratings-row__rank';
        rank.textContent = String(r.rank);

        var name =
          window.L2 && typeof L2.createPlayerProfileNickEl === 'function'
            ? L2.createPlayerProfileNickEl({
                characterId: r.characterId,
                name: r.name,
                className: 'l2-ratings-row__name',
              })
            : (function () {
                var span = document.createElement('span');
                span.className = 'l2-ratings-row__name';
                span.textContent = String(r.name || '—');
                return span;
              })();

        var prof = document.createElement('span');
        prof.className = 'l2-ratings-row__prof';
        prof.textContent = String(r.professionUk || '—');

        var lvl = document.createElement('span');
        lvl.className = 'l2-ratings-row__lvl';
        lvl.textContent = String(r.level != null ? r.level : '—');

        var val = document.createElement('span');
        val.className = 'l2-ratings-row__val';
        val.textContent = String(r.value != null ? r.value : '0');

        row.appendChild(rank);
        row.appendChild(name);
        row.appendChild(prof);
        row.appendChild(lvl);
        row.appendChild(val);
        listEl.appendChild(row);
      }
    }

    if (pagesEl) {
      pagesEl.innerHTML = '';
      var totalPages = Math.max(1, Math.floor(Number(payload.totalPages) || 1));
      if (totalPages > 1) {
        for (var p = 1; p <= totalPages; p++) {
          var pageBtn = document.createElement('button');
          pageBtn.type = 'button';
          pageBtn.className = 'l2-ratings-page-btn';
          if (p === payload.page) pageBtn.classList.add('l2-ratings-page-btn--active');
          pageBtn.textContent = String(p);
          pageBtn.dataset.page = String(p);
          pageBtn.addEventListener('click', function () {
            currentPage = Math.max(1, Math.floor(Number(this.dataset.page) || 1));
            setQuery(currentType, currentPage);
            loadRatings();
          });
          pagesEl.appendChild(pageBtn);
        }
      }
    }

    if (selfEl) {
      var viewer = payload.viewer;
      if (!viewer) {
        selfEl.hidden = true;
        selfEl.textContent = '';
      } else {
        selfEl.hidden = false;
        var rankText = viewer.rank != null ? String(viewer.rank) : '—';
        var html =
          'Твоє місце: <span class="l2-ratings-self__val">' +
          rankText +
          '</span><br>' +
          'Рівень: <span class="l2-ratings-self__val">' +
          String(viewer.level != null ? viewer.level : '—') +
          '</span><br>';
        if (payload.type === 'level') {
          html +=
            'EXP: <span class="l2-ratings-self__val">' +
            String(viewer.value || '0') +
            '</span>';
        } else {
          html +=
            String(viewer.valueLabelUk || 'Значення') +
            ': <span class="l2-ratings-self__val">' +
            String(viewer.value || '0') +
            '</span>';
        }
        selfEl.innerHTML = html;
      }
    }
  }

  async function loadRatings() {
    if (loadInFlight) return;
    var token = localStorage.getItem('token');
    var errEl = $('ratings-load-err');
    var loadingEl = $('ratings-loading');
    if (!token) {
      window.location.href = '/';
      return;
    }

    loadInFlight = true;
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }
    if (loadingEl) loadingEl.hidden = false;

    try {
      var url =
        '/game/ratings?type=' +
        encodeURIComponent(currentType) +
        '&page=' +
        encodeURIComponent(String(currentPage));
      var r = await fetch(url, {
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
          errEl.textContent = 'Не вдалося завантажити рейтинг.';
        }
        return;
      }
      var payload = await r.json();
      if (payload && payload.page) currentPage = payload.page;
      renderRows(payload);
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити рейтинг.';
      }
    } finally {
      loadInFlight = false;
      if (loadingEl) loadingEl.hidden = true;
    }
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

    readQuery();
    renderCategories(currentType);

    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    var c =
      window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
        ? await L2.resyncCharacterWhenRequired()
        : null;
    if (c && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c);
    }

    await loadRatings();
  }

  init();
})();
