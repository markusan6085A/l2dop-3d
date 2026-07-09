/**
 * Legacy-minimal навігація:
 * - верхня сітка вимкнена (мінімум декоративних ассетів),
 * - нижній док лишається компактним і тексто-орієнтованим.
 */
(function (global) {
  var L2 = global.L2 || (global.L2 = {});

  var ASSETS = '/assets/l2dop';

  var TOP = [];

  var BOTTOM = [
    { glyph: '📜', href: null, stubKey: 'nav_mail', i18nKey: 'nav_mail', i18nTitleKey: 'nav_mail_title', lbl: 'p1' },
    { glyph: '💬', href: null, stubKey: 'nav_chat', i18nKey: 'nav_chat', i18nTitleKey: 'nav_chat_title', lbl: 'p2' },
    { glyph: '📜', href: null, stubKey: 'foot_forum', i18nKey: 'foot_forum', title: 'Форум', label: 'Форум', lbl: 'p3' },
    { glyph: '👑', href: null, stubKey: 'nav_clan', i18nKey: 'nav_clan', i18nTitleKey: 'nav_clan_title', lbl: 'p4' },
    { glyph: '✨', href: '/city.html', i18nKey: 'nav_town', i18nTitleKey: 'nav_town_title', title: 'Місто', label: 'Місто', lbl: 'p5' },
    { glyph: '🛡️', href: '/char.html', i18nKey: 'nav_inventory', i18nTitleKey: 'nav_inventory_title', title: 'Інвентар', label: 'Інвентар', lbl: 'p6' },
    { glyph: '👤', href: '/pers.html', i18nKey: 'nav_profile', i18nTitleKey: 'nav_profile_title', title: 'Персонаж', label: 'Персонаж', lbl: 'p7' },
    { glyph: '🏠', href: '/menu.html', i18nKey: 'nav_menu', i18nTitleKey: 'nav_menu_title', title: 'Меню', label: 'Меню', lbl: 'p8' },
  ];

  var mounted = false;
  var stubWired = false;

  function cell(item) {
    var a = document.createElement('a');
    a.className = 'l2-wap-cell';
    var titleKey = item.i18nTitleKey || item.i18nKey;
    a.title = titleKey && L2.tr ? L2.tr(titleKey) : item.title || '';
    if (item.href) {
      a.href = item.href;
    } else {
      a.href = '#';
      if (item.stubKey && L2.tr) {
        a.setAttribute('data-stub', L2.tr(item.stubKey));
      } else if (item.stub) {
        a.setAttribute('data-stub', item.stub);
      }
    }
    var span = document.createElement('span');
    span.className = 'l2-wap-lbl l2-wap-lbl--' + item.lbl;
    span.textContent = item.i18nKey && L2.tr ? L2.tr(item.i18nKey) : item.label || '';
    if (item.glyph) {
      var glyph = document.createElement('span');
      glyph.className = 'l2-wap-glyph';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.textContent = item.glyph;
      a.appendChild(glyph);
    }
    var hasIcon =
      (typeof item.iconPath === 'string' && item.iconPath.length > 0) ||
      (typeof item.icon === 'string' && item.icon.length > 0);
    if (hasIcon) {
      var img = document.createElement('img');
      img.src = item.iconPath ? item.iconPath : ASSETS + '/' + item.icon;
      img.width = 32;
      img.height = 32;
      img.alt = '';
      a.appendChild(img);
    }
    a.appendChild(span);
    return a;
  }

  function renderGrid(items, navId, navClass, ariaLabelKey) {
    var nav = document.createElement('nav');
    nav.className = 'l2-wap-grid ' + navClass;
    nav.id = navId;
    nav.setAttribute(
      'aria-label',
      ariaLabelKey && L2.tr ? L2.tr(ariaLabelKey) : ''
    );
    nav.hidden = false;
    for (var i = 0; i < items.length; i++) {
      nav.appendChild(cell(items[i]));
    }
    return nav;
  }

  function mountInto(placeholderId, navEl) {
    var ph = document.getElementById(placeholderId);
    if (!ph) return false;
    ph.innerHTML = '';
    ph.appendChild(navEl);
    return true;
  }

  /** Рамка 2121 + підписи Lv/клас, два рядки HP і MP (лише числа). */
  function renderTop2121Frame() {
    var frame = document.createElement('div');
    frame.className = 'l2-nav-top-frame2121';
    frame.setAttribute(
      'aria-label',
      L2.tr ? L2.tr('nav_top_strip_aria') : ''
    );
    var meta = document.createElement('div');
    meta.className = 'l2-top-strip-meta';
    meta.innerHTML =
      'Lv. <span id="l2-top-strip-lvl">—</span> · Клас: <span id="l2-top-strip-class">—</span> · Проф.: <span id="l2-top-strip-prof">—</span>';
    var vit = document.createElement('div');
    vit.className = 'l2-top-strip-vitals';
    var hp = document.createElement('div');
    hp.className = 'l2-top-strip-line l2-top-strip-line--hp';
    hp.innerHTML =
      '<span id="l2-top-strip-hp-cur">—</span>/<span id="l2-top-strip-hp-max">—</span>';
    var mp = document.createElement('div');
    mp.className = 'l2-top-strip-line l2-top-strip-line--mp';
    mp.innerHTML =
      '<span id="l2-top-strip-mp-cur">—</span>/<span id="l2-top-strip-mp-max">—</span>';
    vit.appendChild(hp);
    vit.appendChild(mp);
    frame.appendChild(meta);
    frame.appendChild(vit);
    return frame;
  }

  function wireStubHandler(handler) {
    if (!handler || stubWired) return;
    stubWired = true;
    document.querySelectorAll('.l2-wap-grid a[data-stub]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var s = a.getAttribute('data-stub');
        if (s) handler(s);
      });
    });
  }

  function renderTopWrap() {
    var wrap = document.createElement('div');
    wrap.className = 'l2-nav-top-wrap';
    wrap.id = 'wap-top';
    wrap.appendChild(renderTop2121Frame());
    var topNav = renderGrid(
      TOP,
      'l2-wap-top-icons',
      'l2-wap-grid--top l2-wap-grid--7',
      'nav_top_icons_aria'
    );
    wrap.appendChild(topNav);
    return wrap;
  }

  L2.mountL2Nav = function (opts) {
    opts = opts || {};
    if (document && document.body) {
      document.body.classList.add('l2-nav-minimal');
      if (typeof L2.mountStandardHudPanel === 'function') {
        L2.mountStandardHudPanel();
      }
    }
    if (mounted) {
      if (typeof L2.lastSnapshot === 'function' && typeof L2.applyHudFromSnapshot === 'function') {
        var snapAgain = L2.lastSnapshot();
        if (snapAgain) L2.applyHudFromSnapshot(snapAgain);
      }
      wireStubHandler(opts.onStub);
      return;
    }
    var okTop = false;
    var okBot = false;
    if (TOP.length > 0) {
      var topWrap = renderTopWrap();
      okTop = mountInto('l2-nav-top', topWrap);
    } else {
      var phTop = document.getElementById('l2-nav-top');
      if (phTop) {
        phTop.innerHTML = '';
        phTop.hidden = true;
      }
    }
    var bottomNav = renderGrid(
      BOTTOM,
      'wap-bottom',
      'l2-wap-grid--bottom l2-wap-grid--miru',
      'nav_bottom_aria'
    );
    okBot = mountInto('l2-nav-bottom', bottomNav);
    if (okTop || okBot) mounted = true;
    if (typeof L2.lastSnapshot === 'function' && typeof L2.applyHudFromSnapshot === 'function') {
      var snap = L2.lastSnapshot();
      if (snap) L2.applyHudFromSnapshot(snap);
    }
    wireStubHandler(opts.onStub);
  };

  L2.navConfig = {
    assets: ASSETS,
    top: TOP,
    bottom: BOTTOM,
  };
})(typeof window !== 'undefined' ? window : globalThis);
