/**
 * Сторінка чату — GET/POST /game/chat, канал «Заг».
 */
(function () {
  var CHAT_ICON = '/assets/assets/photo_2026-07-05_12-52-39.jpg';
  var currentChannel = 'all';
  var currentPage = 1;
  var chatInFlight = false;
  var sendInFlight = false;

  function $(id) {
    return document.getElementById(id);
  }

  function stubTail() {
    return window.L2 && L2.tr ? L2.tr('stub_later') : 'заглушка, з’явиться пізніше.';
  }

  function showStub(label) {
    var msg = $('chat-stub-msg');
    if (!msg) return;
    msg.hidden = false;
    msg.textContent = '«' + label + '» — ' + stubTail();
  }

  function formatAgoUk(iso) {
    var ts = Date.parse(iso);
    if (!Number.isFinite(ts)) return '[—]';
    var diff = Math.max(0, Date.now() - ts);
    var sec = Math.floor(diff / 1000);
    if (sec < 45) return '[щойно]';
    var min = Math.floor(sec / 60);
    if (min < 60) {
      if (min === 1) return '[1 хв тому]';
      return '[' + min + ' хв тому]';
    }
    var hr = Math.floor(min / 60);
    if (hr < 24) {
      if (hr === 1) return '[1 год тому]';
      return '[' + hr + ' год тому]';
    }
    var day = Math.floor(hr / 24);
    if (day === 1) return '[1 день тому]';
    return '[' + day + ' дн тому]';
  }

  function setChannel(channel) {
    currentChannel = channel === 'trade' || channel === 'my' ? channel : 'all';
    currentPage = 1;
    document.querySelectorAll('.l2-chat-tabs__btn').forEach(function (btn) {
      btn.classList.toggle(
        'l2-chat-tabs__btn--active',
        btn.getAttribute('data-channel') === currentChannel
      );
    });
  }

  function wireIcons(root) {
    if (!root) return;
    root.querySelectorAll('.l2-chat-msg__ico').forEach(function (icon) {
      if (icon.dataset.fallbackWired === '1') return;
      icon.dataset.fallbackWired = '1';
      icon.addEventListener('error', function onIconError() {
        icon.removeEventListener('error', onIconError);
        icon.src = '/icons/drops/other.svg';
      });
    });
  }

  function renderMessages(messages) {
    var listEl = $('chat-messages');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (!messages || !messages.length) {
      var empty = document.createElement('p');
      empty.className = 'l2-chat-empty';
      empty.textContent =
        currentChannel === 'all' ? 'Немає повідомлень. Напиши першим.' : 'Канал ще порожній.';
      listEl.appendChild(empty);
      return;
    }

    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      var item = document.createElement('article');
      item.className = 'l2-chat-msg';

      var head = document.createElement('div');
      head.className = 'l2-chat-msg__head';

      var img = document.createElement('img');
      img.className = 'l2-chat-msg__ico';
      img.src = CHAT_ICON;
      img.alt = '';
      img.width = 14;
      img.height = 14;
      img.decoding = 'async';

      var nick = document.createElement('span');
      nick.className = 'l2-chat-msg__nick';
      nick.textContent = String(m.characterName || '—');

      var reply = document.createElement('button');
      reply.type = 'button';
      reply.className = 'l2-chat-msg__reply';
      reply.textContent = '[відповісти]';
      reply.setAttribute('data-stub', 'Відповідь');

      var ago = document.createElement('span');
      ago.className = 'l2-chat-msg__ago';
      ago.textContent = formatAgoUk(m.createdAt);

      head.appendChild(img);
      head.appendChild(nick);
      head.appendChild(reply);
      head.appendChild(ago);

      var text = document.createElement('p');
      text.className = 'l2-chat-msg__text';
      text.textContent = String(m.text || '');

      item.appendChild(head);
      item.appendChild(text);
      listEl.appendChild(item);
    }

    wireIcons(listEl);
    listEl.querySelectorAll('.l2-chat-msg__reply').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showStub(btn.getAttribute('data-stub') || 'Відповідь');
      });
    });
  }

  function renderPages(page, totalPages) {
    var nav = $('chat-pages');
    if (!nav) return;
    nav.innerHTML = '';
    if (!totalPages || totalPages <= 1) {
      nav.hidden = true;
      return;
    }
    nav.hidden = false;

    function addBtn(label, targetPage, active) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'l2-chat-pages__btn' + (active ? ' l2-chat-pages__btn--active' : '');
      b.textContent = label;
      b.addEventListener('click', function () {
        currentPage = targetPage;
        loadChat();
      });
      nav.appendChild(b);
    }

    if (page > 1) {
      addBtn('<<', 1, false);
    }
    for (var p = 1; p <= totalPages; p++) {
      if (totalPages > 5 && p > 2 && p < totalPages - 1 && Math.abs(p - page) > 1) {
        continue;
      }
      addBtn(String(p), p, p === page);
    }
    if (page < totalPages) {
      addBtn('>>', totalPages, false);
    }
  }

  async function loadChat() {
    if (chatInFlight) return;
    var token = localStorage.getItem('token');
    var errEl = $('chat-load-err');
    if (!token) {
      window.location.href = '/';
      return;
    }

    chatInFlight = true;
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }

    try {
      var url =
        '/game/chat?channel=' +
        encodeURIComponent(currentChannel) +
        '&page=' +
        encodeURIComponent(String(currentPage));
      var r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (!r.ok) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося завантажити чат.';
        }
        return;
      }
      var j = await r.json();
      renderMessages(j.messages || []);
      renderPages(Number(j.page) || 1, Number(j.totalPages) || 1);
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити чат.';
      }
    } finally {
      chatInFlight = false;
    }
  }

  async function sendChat() {
    if (sendInFlight) return;
    var input = $('chat-input');
    var token = localStorage.getItem('token');
    if (!input || !token) return;

    if (currentChannel !== 'all') {
      showStub('Надсилання в цьому каналі');
      return;
    }

    var text = String(input.value || '').trim();
    if (!text) return;

    sendInFlight = true;
    var stubEl = $('chat-stub-msg');
    if (stubEl) stubEl.hidden = true;

    try {
      var r = await fetch('/game/chat', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: currentChannel, text: text }),
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      var j = await r.json().catch(function () {
        return {};
      });
      if (!r.ok) {
        showStub(j.messageUk || 'Надсилання повідомлення');
        return;
      }
      input.value = '';
      currentPage = 1;
      await loadChat();
    } catch (_e) {
      showStub('Надсилання повідомлення');
    } finally {
      sendInFlight = false;
    }
  }

  function wireUi() {
    document.querySelectorAll('.l2-chat-tabs__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setChannel(btn.getAttribute('data-channel'));
        loadChat();
      });
    });

    var sendBtn = $('chat-send-btn');
    if (sendBtn) sendBtn.addEventListener('click', sendChat);

    var clearBtn = $('chat-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        var input = $('chat-input');
        if (input) {
          input.value = '';
          input.focus();
        }
        var stubEl = $('chat-stub-msg');
        if (stubEl) stubEl.hidden = true;
      });
    }

    var refreshBtn = $('chat-refresh-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', loadChat);

    var smilesBtn = $('chat-smiles-btn');
    if (smilesBtn) {
      smilesBtn.addEventListener('click', function () {
        showStub(smilesBtn.getAttribute('data-stub') || 'Смайли');
      });
    }

    var input = $('chat-input');
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendChat();
        }
      });
    }
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    wireUi();

    var token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    var r = await fetch('/character', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return;
    }
    if (r.ok) {
      var j = await r.json();
      if (j.character && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(j.character);
      }
      if (j.character && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(j.character);
      }
    }

    var content = $('chat-content');
    if (content) content.hidden = false;
    await loadChat();
  }

  init();
})();
