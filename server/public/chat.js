/**
 * Сторінка чату — GET/POST /game/chat, канал «Заг».
 * Оновлення списку — лише вручну («Оновити», send, delete, зміна каналу/сторінки).
 * GET /game/chat повертає повну сторінку (до 15 повідомлень), не delta.
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
  var smilesOpen = false;
  var smilesPage = 0;
  var smilesRendered = false;
  var SMILE_COLS = 8;
  var SMILE_ROWS = 3;
  var SMILE_PAGE_SIZE = SMILE_COLS * SMILE_ROWS;
  var SMILE_TOKEN_RE = /:([0-9]+|[a-z0-9_]+):/gi;

  var chatLoadedOnce = false;
  var currentMessages = [];
  var lastMessagesSignature = '';
  var chatRequestSeq = 0;
  var scrollDebug = false;
  var messageNodesById = Object.create(null);
  var NEAR_NEWEST_THRESHOLD = 80;

  function getSmilePageSize() {
    return SMILE_PAGE_SIZE;
  }

  function getSmilesCatalog() {
    return window.L2ChatSmiles && L2ChatSmiles.byCode ? L2ChatSmiles.byCode : {};
  }

  function $(id) {
    return document.getElementById(id);
  }

  function isScrollDebugEnabled() {
    try {
      return (
        /(?:^|[?&])(?:layoutDebug|chatScrollDebug)=1(?:&|$)/.test(
          String(location.search || '')
        ) || localStorage.getItem('l2-layout-debug') === '1'
      );
    } catch (_e) {
      return false;
    }
  }

  function getMessagesEl() {
    return $('chat-messages');
  }

  function distanceFromBottom(listEl) {
    if (!listEl) return null;
    return listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight;
  }

  function wasNearNewest(listEl) {
    if (!listEl) return true;
    return listEl.scrollTop <= NEAR_NEWEST_THRESHOLD;
  }

  function logChatScroll(phase, extra) {
    if (!scrollDebug) return;
    var messagesEl = getMessagesEl();
    var payload = {
      phase: phase,
      windowScrollY: window.scrollY,
      listScrollTop: messagesEl ? messagesEl.scrollTop : null,
      listScrollHeight: messagesEl ? messagesEl.scrollHeight : null,
      listClientHeight: messagesEl ? messagesEl.clientHeight : null,
      distanceFromBottom: distanceFromBottom(messagesEl),
      messageCount: currentMessages ? currentMessages.length : 0,
      activeElement:
        document.activeElement && document.activeElement.id
          ? document.activeElement.id
          : document.activeElement
            ? document.activeElement.tagName
            : null,
    };
    if (extra && typeof extra === 'object') {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) payload[k] = extra[k];
      }
    }
    console.log('[chat-scroll]', payload);
  }

  function focusInput(input, fromUserAction) {
    if (!input || typeof input.focus !== 'function') return;
    if (fromUserAction && typeof input.focus === 'function') {
      try {
        input.focus({ preventScroll: true });
        return;
      } catch (_e) {
        /* fallback below */
      }
    }
    input.focus();
  }

  function insertSmileToken(code) {
    var input = $('chat-input');
    if (!input || !code) return;
    var catalog = getSmilesCatalog();
    var key = String(code).trim().toLowerCase();
    if (!catalog[key]) return;

    var token =
      window.L2ChatSmiles && typeof L2ChatSmiles.tokenFor === 'function'
        ? L2ChatSmiles.tokenFor(key)
        : ':' + key + ':';

    var start = input.selectionStart != null ? input.selectionStart : input.value.length;
    var end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
    var before = input.value.slice(0, start);
    var after = input.value.slice(end);
    var spacerBefore = before && !/\s$/.test(before) ? ' ' : '';
    var spacerAfter = after && !/^\s/.test(after) ? ' ' : '';
    input.value = before + spacerBefore + token + spacerAfter + after;
    var caret = (before + spacerBefore + token + spacerAfter).length;
    if (input.setSelectionRange) input.setSelectionRange(caret, caret);
    focusInput(input, true);

    var stubEl = $('chat-stub-msg');
    if (stubEl) stubEl.hidden = true;
  }

  function smileScaleFor(code) {
    return window.L2ChatSmiles && typeof L2ChatSmiles.scaleFor === 'function'
      ? L2ChatSmiles.scaleFor(code)
      : 1;
  }

  function applySmileImgScale(img, code, basePx) {
    var scale = smileScaleFor(code);
    if (!img || scale === 1) return scale;
    var px = Math.round(basePx * scale);
    var maxW = Math.round(basePx * 1.95 * scale);
    img.style.setProperty('height', px + 'px', 'important');
    img.style.setProperty('max-height', px + 'px', 'important');
    img.style.setProperty('max-width', maxW + 'px', 'important');
    return scale;
  }

  function appendMessageTextWithSmiles(container, rawText) {
    var text = String(rawText || '');
    if (!text) return;

    var catalog = getSmilesCatalog();
    var lastIndex = 0;
    var re = new RegExp(SMILE_TOKEN_RE.source, 'gi');
    var match;

    while ((match = re.exec(text)) !== null) {
      if (match.index > lastIndex) {
        container.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      var code = String(match[1] || '').toLowerCase();
      var smile = catalog[code];
      if (smile && smile.src) {
        var tokenText = match[0];
        var img = document.createElement('img');
        img.className = 'l2-chat-smile';
        if (smileScaleFor(code) > 1) {
          img.className += ' l2-chat-smile--scaled';
        }
        img.src = smile.src;
        img.alt = tokenText;
        img.loading = 'lazy';
        img.decoding = 'async';
        applySmileImgScale(img, code, 20);
        img.addEventListener('error', function onSmileError() {
          img.removeEventListener('error', onSmileError);
          var fallback = document.createTextNode(tokenText);
          img.replaceWith(fallback);
        });
        container.appendChild(img);
      } else {
        container.appendChild(document.createTextNode(match[0]));
      }
      lastIndex = re.lastIndex;
    }

    if (lastIndex < text.length) {
      container.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
  }

  function getSmilesList() {
    return window.L2ChatSmiles && Array.isArray(L2ChatSmiles.list) ? L2ChatSmiles.list : [];
  }

  function renderSmilesPickerPage() {
    var grid = $('chat-smiles-grid');
    var pager = $('chat-smiles-pager');
    var prevBtn = $('chat-smiles-prev');
    var nextBtn = $('chat-smiles-next');
    var list = getSmilesList();
    if (!grid) return;

    grid.innerHTML = '';
    if (!list.length) {
      grid.hidden = true;
      if (pager) pager.hidden = true;
      return;
    }

    var pageSize = getSmilePageSize();
    var totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    if (smilesPage >= totalPages) smilesPage = totalPages - 1;
    if (smilesPage < 0) smilesPage = 0;

    var start = smilesPage * pageSize;
    var slice = list.slice(start, start + pageSize);

    grid.hidden = false;
    for (var i = 0; i < slice.length; i++) {
      (function (item) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'l2-chat-smiles__item';
        btn.setAttribute('role', 'listitem');
        btn.title = item.title || item.code;
        btn.setAttribute('aria-label', item.title || item.code);

        var img = document.createElement('img');
        img.className = 'l2-chat-smiles__img';
        img.src = item.src;
        img.alt = '';
        img.width = 20;
        img.height = 20;
        img.loading = 'lazy';
        img.decoding = 'async';

        btn.appendChild(img);
        btn.addEventListener('click', function () {
          insertSmileToken(item.code);
        });
        grid.appendChild(btn);
      })(slice[i]);
    }

    if (pager) pager.hidden = totalPages <= 1;
    if (prevBtn) prevBtn.disabled = smilesPage <= 0;
    if (nextBtn) nextBtn.disabled = smilesPage >= totalPages - 1;
  }

  function wireSmilesPager() {
    var prevBtn = $('chat-smiles-prev');
    var nextBtn = $('chat-smiles-next');
    if (prevBtn && prevBtn.dataset.wired !== '1') {
      prevBtn.dataset.wired = '1';
      prevBtn.addEventListener('click', function () {
        if (smilesPage <= 0) return;
        smilesPage--;
        renderSmilesPickerPage();
      });
    }
    if (nextBtn && nextBtn.dataset.wired !== '1') {
      nextBtn.dataset.wired = '1';
      nextBtn.addEventListener('click', function () {
        var list = getSmilesList();
        var pageSize = getSmilePageSize();
        var totalPages = Math.max(1, Math.ceil(list.length / pageSize));
        if (smilesPage >= totalPages - 1) return;
        smilesPage++;
        renderSmilesPickerPage();
      });
    }
  }

  function setSmilesPanelOpen(open) {
    smilesOpen = !!open;
    var panel = $('chat-smiles-panel');
    var btn = $('chat-smiles-btn');
    if (panel) panel.hidden = !smilesOpen;
    if (btn) btn.setAttribute('aria-expanded', smilesOpen ? 'true' : 'false');
    if (smilesOpen) {
      smilesPage = 0;
      if (!smilesRendered) {
        smilesRendered = true;
        wireSmilesPager();
      }
      renderSmilesPickerPage();
    }
  }

  function toggleSmilesPanel() {
    setSmilesPanelOpen(!smilesOpen);
    var stubEl = $('chat-stub-msg');
    if (stubEl && smilesOpen) stubEl.hidden = true;
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
    logChatScroll('reply-' + (replyTarget ? 'open' : 'close'));
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
    focusInput($('chat-input'), true);
    var stubEl = $('chat-stub-msg');
    if (stubEl) stubEl.hidden = true;
  }

  function clearReplyTarget() {
    replyTarget = null;
    updateReplyHint();
  }

  function showNewMessagesButton(show) {
    var btn = $('chat-new-msgs');
    if (!btn) return;
    btn.hidden = !show;
  }

  function scrollListToNewest(listEl) {
    if (!listEl) return;
    listEl.scrollTop = 0;
    showNewMessagesButton(false);
    logChatScroll('after-autoscroll', { mode: 'newest-top' });
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

  function messageSignature(m) {
    if (!m) return '';
    return [
      String(m.id || ''),
      String(m.text || ''),
      String(m.characterId || ''),
      String(m.characterName || ''),
      String(m.channel || ''),
      String(m.replyToCharacterId || ''),
      String(m.replyToCharacterName || ''),
      String(m.createdAt || ''),
      String(m.editedAt || ''),
      String(m.updatedAt || ''),
      String(m.deletedAt || ''),
      m.deleted === true ? '1' : m.deleted === false ? '0' : '',
      String(m.moderationState || m.moderated || ''),
      String(m.clanId || ''),
      String(m.clanTag || ''),
      String(m.clanName || ''),
      String(m.iconUrl || ''),
    ].join('\0');
  }

  function messagesListSignature(messages) {
    if (!messages || !messages.length) return '';
    var parts = [];
    for (var i = 0; i < messages.length; i++) {
      parts.push(messageSignature(messages[i]));
    }
    return parts.join('\n');
  }

  function escapeMessageIdForSelector(id) {
    var s = String(id || '');
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
      return CSS.escape(s);
    }
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function captureScrollAnchor(listEl) {
    if (!listEl || wasNearNewest(listEl)) return null;
    var listRect = listEl.getBoundingClientRect();
    var items = listEl.querySelectorAll('.l2-chat-msg');
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      var rect = el.getBoundingClientRect();
      if (rect.bottom > listRect.top + 2 && rect.top < listRect.bottom - 2) {
        return {
          messageId: String(el.getAttribute('data-message-id') || ''),
          viewportOffset: rect.top - listRect.top,
        };
      }
    }
    return null;
  }

  function captureScrollState(listEl) {
    return {
      wasNearNewest: wasNearNewest(listEl),
      oldScrollTop: listEl.scrollTop,
      oldScrollHeight: listEl.scrollHeight,
      anchor: captureScrollAnchor(listEl),
    };
  }

  function restoreScrollAnchor(listEl, anchor) {
    if (!listEl || !anchor || !anchor.messageId) return false;
    var el = listEl.querySelector(
      '.l2-chat-msg[data-message-id="' + escapeMessageIdForSelector(anchor.messageId) + '"]'
    );
    if (!el) return false;
    var listRect = listEl.getBoundingClientRect();
    var rect = el.getBoundingClientRect();
    var currentOffset = rect.top - listRect.top;
    listEl.scrollTop += currentOffset - anchor.viewportOffset;
    return true;
  }

  function hasNewMessagesAtTop(prevMessages, messages) {
    if (!prevMessages || !prevMessages.length || !messages || !messages.length) return false;
    if (messages.length <= prevMessages.length) return false;
    var prevFirstId = String(prevMessages[0].id);
    var nextFirstId = String(messages[0].id);
    if (prevFirstId === nextFirstId) return false;
    for (var i = 0; i < messages.length; i++) {
      if (String(messages[i].id) === prevFirstId) {
        return i > 0;
      }
    }
    return true;
  }

  function applyScrollAfterUpdate(listEl, scrollState, opts) {
    opts = opts || {};
    if (!listEl || !scrollState) return;

    if (opts.scrollToNewest === true || scrollState.wasNearNewest) {
      scrollListToNewest(listEl);
      return;
    }

    if (scrollState.anchor && restoreScrollAnchor(listEl, scrollState.anchor)) {
      if (opts.hasNewAtTop) showNewMessagesButton(true);
      logChatScroll('after-autoscroll', {
        mode: 'anchor-restore',
        messageId: scrollState.anchor.messageId,
      });
      return;
    }

    listEl.scrollTop =
      scrollState.oldScrollTop + (listEl.scrollHeight - scrollState.oldScrollHeight);
    if (opts.hasNewAtTop) showNewMessagesButton(true);
    logChatScroll('after-autoscroll', { mode: 'scrollHeight-fallback' });
  }

  function clearMessageIndex() {
    messageNodesById = Object.create(null);
  }

  function applyAuthorBreakClass(item, m, prevMessage) {
    item.classList.remove('l2-chat-msg--author-break');
    var charId = String(m.characterId || '');
    var prevId = String(prevMessage && prevMessage.characterId ? prevMessage.characterId : '');
    if (charId && prevId && charId !== prevId) {
      item.classList.add('l2-chat-msg--author-break');
    }
  }

  function setMessageTextContent(textEl, m) {
    textEl.innerHTML = '';
    if (m.replyToCharacterName) {
      var replyTo = document.createElement('span');
      replyTo.className = 'l2-chat-msg__reply-to';
      if (myCharacterId && m.replyToCharacterId === myCharacterId) {
        replyTo.className += ' l2-chat-msg__reply-to--me';
      }
      replyTo.textContent = String(m.replyToCharacterName) + ', ';
      textEl.appendChild(replyTo);
    }
    appendMessageTextWithSmiles(textEl, m.text);
  }

  function createMessageElement(m, prevMessage) {
    var item = document.createElement('article');
    item.className = 'l2-chat-msg';
    item.setAttribute('data-message-id', String(m.id || ''));
    var charId = String(m.characterId || '');
    var isMine = !!(myCharacterId && charId && charId === myCharacterId);
    if (isMine) item.classList.add('l2-chat-msg--mine');
    applyAuthorBreakClass(item, m, prevMessage);

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
            clanEmblemId: m.clanEmblemId,
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
    setMessageTextContent(text, m);
    item.appendChild(head);
    item.appendChild(text);
    return item;
  }

  function patchMessageElement(item, m, prevMessage) {
    if (!item) return;
    item.setAttribute('data-message-id', String(m.id || ''));
    applyAuthorBreakClass(item, m, prevMessage);

    var ago = item.querySelector('.l2-chat-msg__ago');
    if (ago) ago.textContent = formatAgoUk(m.createdAt);

    var text = item.querySelector('.l2-chat-msg__text');
    if (text) setMessageTextContent(text, m);
  }

  function renderEmptyList(listEl) {
    if (!listEl) return;
    listEl.innerHTML = '';
    var empty = document.createElement('p');
    empty.className = 'l2-chat-empty';
    empty.textContent =
      currentChannel === 'all' ? 'Немає повідомлень. Напиши першим.' : 'Канал ще порожній.';
    listEl.appendChild(empty);
    clearMessageIndex();
  }

  function replaceListWithFragment(listEl, frag) {
    listEl.innerHTML = '';
    listEl.appendChild(frag);
  }

  function reorderMessagesPreserveNodes(listEl, messages) {
    var oldNodes = messageNodesById;
    var frag = document.createDocumentFragment();
    var prevMsg = null;
    messageNodesById = Object.create(null);

    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      var mid = String(m.id || '');
      var sig = messageSignature(m);
      var existing = oldNodes[mid];
      var el;

      if (existing && existing.el && existing.sig === sig) {
        el = existing.el;
      } else if (existing && existing.el) {
        el = existing.el;
        patchMessageElement(el, m, prevMsg);
      } else {
        el = createMessageElement(m, prevMsg);
      }

      messageNodesById[mid] = { el: el, sig: sig };
      frag.appendChild(el);
      prevMsg = m;
    }

    replaceListWithFragment(listEl, frag);
    wireIcons(listEl);
  }

  function idsEqual(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (String(a[i]) !== String(b[i])) return false;
    }
    return true;
  }

  function syncMessages(messages, opts) {
    opts = opts || {};
    var listEl = getMessagesEl();
    if (!listEl) return;

    logChatScroll('before-render', {
      mode: opts.mode || 'sync',
      incomingCount: messages ? messages.length : 0,
      listClientHeight: listEl.clientHeight,
    });

    if (!messages || !messages.length) {
      if (!chatLoadedOnce || opts.forceFull) {
        renderEmptyList(listEl);
        chatLoadedOnce = true;
        currentMessages = [];
        lastMessagesSignature = '';
      }
      logChatScroll('after-render', { mode: 'empty', listClientHeight: listEl.clientHeight });
      return;
    }

    var nextSignature = messagesListSignature(messages);
    if (!opts.forceFull && chatLoadedOnce && nextSignature === lastMessagesSignature) {
      logChatScroll('after-render', { skipped: true });
      return;
    }

    var prevMessages = currentMessages || [];
    var scrollState = chatLoadedOnce && !opts.forceFull ? captureScrollState(listEl) : null;
    var hasNewAtTop = hasNewMessagesAtTop(prevMessages, messages);

    if (!chatLoadedOnce || opts.forceFull) {
      reorderMessagesPreserveNodes(listEl, messages);
      chatLoadedOnce = true;
      currentMessages = messages.slice();
      lastMessagesSignature = nextSignature;
      if (opts.scrollToNewest !== false) {
        scrollListToNewest(listEl);
      }
      logChatScroll('after-render', {
        mode: 'full',
        listClientHeight: listEl.clientHeight,
      });
      return;
    }

    var prevIds = prevMessages.map(function (m) {
      return String(m.id);
    });
    var nextIds = messages.map(function (m) {
      return String(m.id);
    });
    var renderMode = 'reorder';

    if (idsEqual(prevIds, nextIds)) {
      renderMode = 'patch-same-order';
      for (var i = 0; i < messages.length; i++) {
        var mid = nextIds[i];
        var nodeEntry = messageNodesById[mid];
        if (nodeEntry && nodeEntry.el) {
          patchMessageElement(nodeEntry.el, messages[i], i > 0 ? messages[i - 1] : null);
          nodeEntry.sig = messageSignature(messages[i]);
        }
      }
    } else {
      reorderMessagesPreserveNodes(listEl, messages);
    }

    currentMessages = messages.slice();
    lastMessagesSignature = nextSignature;

    applyScrollAfterUpdate(listEl, scrollState, {
      scrollToNewest: opts.scrollToNewest,
      hasNewAtTop: hasNewAtTop,
    });

    logChatScroll('after-render', {
      mode: renderMode,
      listClientHeight: listEl.clientHeight,
      anchorMessageId: scrollState && scrollState.anchor ? scrollState.anchor.messageId : null,
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
        loadChat({ reason: 'page', forceFull: true, scrollToNewest: false });
      });
      nav.appendChild(b);
    }

    if (page > 1) addBtn('<<', 1, false);
    for (var p = 1; p <= totalPages; p++) {
      if (totalPages > 5 && p > 2 && p < totalPages - 1 && Math.abs(p - page) > 1) {
        continue;
      }
      addBtn(String(p), p, p === page);
    }
    if (page < totalPages) addBtn('>>', totalPages, false);
  }

  async function fetchChatPayload(token) {
    var url =
      '/game/chat?channel=' +
      encodeURIComponent(currentChannel) +
      '&page=' +
      encodeURIComponent(String(currentPage));
    var r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
    if (r.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      return null;
    }
    if (!r.ok) throw new Error('chat_load_fail');
    return r.json();
  }

  async function loadChat(opts) {
    opts = opts || {};
    if (chatInFlight) return false;
    var token = localStorage.getItem('token');
    var errEl = $('chat-load-err');
    if (!token) {
      window.location.href = '/';
      return false;
    }

    var requestSeq = ++chatRequestSeq;
    chatInFlight = true;
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }

    logChatScroll('before-fetch', { reason: opts.reason || 'load', requestSeq: requestSeq });

    try {
      var j = await fetchChatPayload(token);
      if (!j) return false;
      if (requestSeq !== chatRequestSeq) {
        logChatScroll('after-fetch', { stale: true, requestSeq: requestSeq });
        return false;
      }

      logChatScroll('after-fetch', {
        reason: opts.reason || 'load',
        requestSeq: requestSeq,
        incomingCount: j.messages ? j.messages.length : 0,
      });

      syncMessages(j.messages || [], {
        forceFull: !!opts.forceFull,
        scrollToNewest: opts.scrollToNewest,
        mode: opts.reason || 'load',
      });
      renderPages(Number(j.page) || 1, Number(j.totalPages) || 1);
      return true;
    } catch (_e) {
      if (requestSeq !== chatRequestSeq) return false;
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити чат.';
      }
      logChatScroll('after-fetch', { error: true, requestSeq: requestSeq });
      return false;
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
      await loadChat({ reason: 'send', scrollToNewest: true });
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
      await loadChat({ reason: 'delete' });
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

  function wireMessageListDelegation() {
    var listEl = getMessagesEl();
    if (!listEl || listEl.dataset.chatDelegated === '1') return;
    listEl.dataset.chatDelegated = '1';
    listEl.addEventListener('click', function (e) {
      var replyBtn =
        e.target && e.target.closest ? e.target.closest('.l2-chat-msg__reply') : null;
      if (replyBtn) {
        var cid = replyBtn.getAttribute('data-reply-character-id');
        var cname = replyBtn.getAttribute('data-reply-character-name');
        if (cid && cname) setReplyTarget(cid, cname);
        return;
      }
      var delBtn =
        e.target && e.target.closest ? e.target.closest('.l2-chat-msg__delete') : null;
      if (delBtn) {
        var id = delBtn.getAttribute('data-message-id');
        if (id) deleteChatMessage(id);
      }
    });
  }

  function wireUi() {
    document.querySelectorAll('.l2-chat-tabs__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setChannel(btn.getAttribute('data-channel'));
        loadChat({ reason: 'channel', forceFull: true, scrollToNewest: true });
      });
    });

    var sendBtn = $('chat-send-btn');
    if (sendBtn) sendBtn.addEventListener('click', sendChat);

    var cancelReplyBtn = $('chat-reply-cancel');
    if (cancelReplyBtn) cancelReplyBtn.addEventListener('click', clearReplyTarget);

    var refreshBtn = $('chat-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        loadChat({ reason: 'refresh', scrollToNewest: false });
      });
    }

    var newMsgsBtn = $('chat-new-msgs');
    if (newMsgsBtn) {
      newMsgsBtn.addEventListener('click', function () {
        scrollListToNewest(getMessagesEl());
      });
    }

    var smilesBtn = $('chat-smiles-btn');
    if (smilesBtn) smilesBtn.addEventListener('click', toggleSmilesPanel);

    var input = $('chat-input');
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendChat();
        }
      });
      input.addEventListener(
        'focus',
        function () {
          logChatScroll('input-focus');
        },
        true
      );
    }

    wireMessageListDelegation();
  }

  async function init() {
    scrollDebug = isScrollDebugEnabled();
    logChatScroll('init');

    var token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }

    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({});
    }

    wireUi();

    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }

    if (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function') {
      void L2.resyncCharacterWhenRequired()
        .then(function (snap) {
          if (snap && snap.id != null) {
            myCharacterId = String(snap.id);
            if (typeof L2.applyMutationSnapshot === 'function') {
              L2.applyMutationSnapshot(snap);
            }
          }
        })
        .catch(function () {
          /* optional for chat reveal */
        });
    }

    var cached =
      window.L2 && typeof L2.getCachedCharacter === 'function'
        ? L2.getCachedCharacter()
        : null;
    if (cached && cached.id != null) {
      myCharacterId = String(cached.id);
    }

    void markChatRepliesRead();
    await loadChat({ reason: 'init', scrollToNewest: true });
  }

  init();
})();
