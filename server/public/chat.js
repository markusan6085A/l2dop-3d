/**
 * Сторінка чату — GET/POST /game/chat, канал «Заг».
 */
(function () {
  var CHAT_ICON = '/assets/assets/photo_2026-07-05_12-52-39.jpg';
  var currentChannel = 'all';
  var currentPage = 1;
  var chatInFlight = false;
  var sendInFlight = false;
  var deleteInFlight = false;
  var myCharacterId = '';
  var replyTarget = null;

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

  function updateReplyHint() {
    var hint = $('chat-reply-hint');
    var nameEl = $('chat-reply-hint-name');
    if (!hint || !nameEl) return;
    if (!replyTarget || !replyTarget.characterName) {
      hint.hidden = true;
      nameEl.textContent = '';
      return;
    }
    hint.hidden = false;
    nameEl.textContent = replyTarget.characterName;
  }

  function setReplyTarget(characterId, characterName) {
    if (!characterId || !characterName) return;
    if (myCharacterId && characterId === myCharacterId) {
      showStub('Не можна відповісти самому собі');
      return;
    }
    replyTarget = {
      characterId: String(characterId),
      characterName: String(characterName),
    };
    updateReplyHint();
    var input = $('chat-input');
    if (input) input.focus();
    var stubEl = $('chat-stub-msg');
    if (stubEl) stubEl.hidden = true;
  }

  function clearReplyTarget() {
    replyTarget = null;
    updateReplyHint();
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

      var nick =
        window.L2 && typeof L2.createPlayerProfileNickEl === 'function'
          ? L2.createPlayerProfileNickEl({
              characterId: m.characterId,
              name: m.characterName,
              className: 'l2-chat-msg__nick',
            })
          : (function () {
              var span = document.createElement('span');
              span.className = 'l2-chat-msg__nick';
              span.textContent = String(m.characterName || '—');
              return span;
            })();

      var reply = document.createElement('button');
      reply.type = 'button';
      reply.className = 'l2-chat-msg__reply';
      reply.textContent = '[відповісти]';
      if (!myCharacterId || m.characterId !== myCharacterId) {
        reply.setAttribute('data-reply-character-id', String(m.characterId || ''));
        reply.setAttribute('data-reply-character-name', String(m.characterName || ''));
      } else {
        reply.hidden = true;
      }

      var ago = document.createElement('span');
      ago.className = 'l2-chat-msg__ago';
      ago.textContent = formatAgoUk(m.createdAt);

      head.appendChild(img);
      head.appendChild(nick);
      head.appendChild(reply);
      head.appendChild(ago);

      if (myCharacterId && m.characterId === myCharacterId) {
        var delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'l2-chat-msg__delete';
        delBtn.setAttribute('aria-label', 'Видалити повідомлення');
        delBtn.title = 'Видалити';
        delBtn.textContent = '×';
        delBtn.setAttribute('data-message-id', String(m.id || ''));
        head.appendChild(delBtn);
      }

      var text = document.createElement('p');
      text.className = 'l2-chat-msg__text';
      if (m.replyToCharacterName) {
        var replyTo = document.createElement('span');
        replyTo.className = 'l2-chat-msg__reply-to';
        if (myCharacterId && m.replyToCharacterId === myCharacterId) {
          replyTo.className += ' l2-chat-msg__reply-to--me';
        }
        replyTo.textContent = String(m.replyToCharacterName) + ', ';
        text.appendChild(replyTo);
      }
      text.appendChild(document.createTextNode(String(m.text || '')));

      item.appendChild(head);
      item.appendChild(text);
      listEl.appendChild(item);
    }

    wireIcons(listEl);
    listEl.querySelectorAll('.l2-chat-msg__reply').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cid = btn.getAttribute('data-reply-character-id');
        var cname = btn.getAttribute('data-reply-character-name');
        if (cid && cname) {
          setReplyTarget(cid, cname);
        }
      });
    });
    listEl.querySelectorAll('.l2-chat-msg__delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-message-id');
        if (id) deleteChatMessage(id);
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
      var payload = { channel: currentChannel, text: text };
      if (replyTarget && replyTarget.characterId) {
        payload.replyToCharacterId = replyTarget.characterId;
      }

      var r = await fetch('/game/chat', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
      clearReplyTarget();
      currentPage = 1;
      await loadChat();
    } catch (_e) {
      showStub('Надсилання повідомлення');
    } finally {
      sendInFlight = false;
    }
  }

  async function deleteChatMessage(messageId) {
    if (deleteInFlight) return;
    var token = localStorage.getItem('token');
    if (!token || !messageId) return;

    deleteInFlight = true;
    var stubEl = $('chat-stub-msg');
    if (stubEl) stubEl.hidden = true;

    try {
      var r = await fetch('/game/chat/' + encodeURIComponent(messageId), {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
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
        showStub(j.messageUk || 'Видалення повідомлення');
        return;
      }
      await loadChat();
    } catch (_e) {
      showStub('Видалення повідомлення');
    } finally {
      deleteInFlight = false;
    }
  }

  async function markChatRepliesRead() {
    var token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch('/game/chat/replies/mark-read', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      });
      if (window.L2ChatReplyNotify && typeof L2ChatReplyNotify.refreshCount === 'function') {
        L2ChatReplyNotify.refreshCount();
      }
    } catch (_e) {
      /* ignore */
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

    var cancelReplyBtn = $('chat-reply-cancel');
    if (cancelReplyBtn) cancelReplyBtn.addEventListener('click', clearReplyTarget);

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
      if (j.character) {
        myCharacterId = j.character.id != null ? String(j.character.id) : '';
      }
      if (j.character && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(j.character);
      }
      if (j.character && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(j.character);
      }
    }

    var content = $('chat-content');
    if (content) content.hidden = false;
    await markChatRepliesRead();
    await loadChat();
  }

  init();
})();
