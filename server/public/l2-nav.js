/**
 * Верхня й нижня сітки іконок. Підписи — L2.tr (ui-i18n.js після common.js).
 * Верх: рамка /ref/2121.png (Lv · клас, HP/MP на мапі) + ряд іконок /ref/35–41.png.
 * Низ (док): /ref/8484541 · 985952 · 59621 · 5885582 · 424524 · 222414.png —
 * Профіль, Магія, Місто, Меню, Маммон, Опції.
 */
(function (global) {
  var L2 = global.L2 || (global.L2 = {});

  var ASSETS = '/assets/l2dop';

  var TOP = [
    {
      iconPath: '/ref/35.png',
      href: null,
      stubKey: 'nav_chat',
      i18nKey: 'nav_chat',
      i18nTitleKey: 'nav_chat_title',
      lbl: 't1',
    },
    {
      iconPath: '/ref/39.png',
      href: '/char.html',
      stub: null,
      i18nKey: 'nav_pers',
      i18nTitleKey: 'nav_pers_title',
      lbl: 't2',
    },
    {
      iconPath: '/ref/38.png',
      href: '/map.html',
      stub: null,
      i18nKey: 'nav_top_map',
      i18nTitleKey: 'nav_top_map_title',
      lbl: 't3',
    },
    {
      iconPath: '/ref/40.png',
      href: '/donate.html',
      stub: null,
      i18nKey: 'nav_top_donate',
      i18nTitleKey: 'nav_donate_title',
      lbl: 't4',
    },
    {
      iconPath: '/ref/37.png',
      href: null,
      stubKey: 'nav_quests',
      i18nKey: 'nav_quests',
      i18nTitleKey: 'nav_quests_title',
      lbl: 't5',
    },
    {
      iconPath: '/ref/36.png',
      href: null,
      stubKey: 'nav_clan',
      i18nKey: 'nav_clan',
      i18nTitleKey: 'nav_clan_title',
      lbl: 't6',
    },
    {
      iconPath: '/ref/41.png',
      href: null,
      stubKey: 'nav_market',
      i18nKey: 'nav_market',
      i18nTitleKey: 'nav_market_title',
      lbl: 't7',
    },
  ];

  var BOTTOM = [
    {
      iconPath: '/ref/8484541.png',
      href: '/pers.html',
      stub: null,
      i18nKey: 'nav_profile',
      i18nTitleKey: 'nav_profile_title',
      lbl: 'p1',
    },
    {
      iconPath: '/ref/985952.png',
      href: '/magisters.html',
      stub: null,
      i18nKey: 'nav_magic',
      i18nTitleKey: 'nav_magic_title',
      lbl: 'p2',
    },
    {
      iconPath: '/ref/59621.png',
      href: '/city.html',
      stub: null,
      i18nKey: 'nav_town',
      i18nTitleKey: 'nav_town_title',
      lbl: 'p3',
    },
    {
      iconPath: '/ref/5885582.png',
      href: '/menu.html',
      stub: null,
      i18nKey: 'nav_menu',
      i18nTitleKey: 'nav_menu_title',
      lbl: 'p4',
    },
    {
      iconPath: '/ref/424524.png',
      href: '/mammon.html',
      stub: null,
      i18nKey: 'nav_mammon',
      i18nTitleKey: 'nav_mammon_title',
      lbl: 'p5',
    },
    {
      iconPath: '/ref/222414.png',
      href: '/options.html',
      stub: null,
      i18nKey: 'nav_options',
      i18nTitleKey: 'nav_options_title',
      lbl: 'p7',
    },
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
    var img = document.createElement('img');
    img.src = item.iconPath ? item.iconPath : ASSETS + '/' + item.icon;
    img.width = 32;
    img.height = 32;
    img.alt = '';
    var span = document.createElement('span');
    span.className = 'l2-wap-lbl l2-wap-lbl--' + item.lbl;
    span.textContent = item.i18nKey && L2.tr ? L2.tr(item.i18nKey) : item.label || '';
    a.appendChild(img);
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
    if (mounted) {
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
      'l2-wap-grid--bottom',
      'nav_bottom_aria'
    );
    okBot = mountInto('l2-nav-bottom', bottomNav);
    if (okTop || okBot) mounted = true;
    wireStubHandler(opts.onStub);
  };

  L2.navConfig = {
    assets: ASSETS,
    top: TOP,
    bottom: BOTTOM,
  };
})(typeof window !== 'undefined' ? window : globalThis);
