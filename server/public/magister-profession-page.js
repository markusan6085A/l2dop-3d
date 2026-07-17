/**
 * Друга сторінка: опис професії + квест + підтвердження «Стати …».
 */
(function () {
  var actionInFlight = false;
  var pageSlug = '';
  var pageBackHref = '/magister.html';

  function $(id) {
    return document.getElementById(id);
  }

  function queryParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  function showErr(text) {
    var el = $('magister-prof-err');
    if (!el) return;
    el.hidden = !text;
    el.textContent = text || '';
  }

  async function ensureSnapshot() {
    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    if (window.L2 && typeof L2.resyncCharacterWhenRequired === 'function') {
      return L2.resyncCharacterWhenRequired();
    }
    return null;
  }

  function applyQuestUi(ch, confirmBtn, questBtn) {
    if (!window.L2MagisterProfession) return;
    var isFirst = L2MagisterProfession.isFirstHumanFighterProfSlug(pageSlug);
    var questHr = $('magister-prof-quest-hr');
    var questBlock = $('magister-prof-quest-block');
    var questHint = $('magister-prof-quest-hint');
    var targetProf = L2MagisterProfession.slugToL2Profession(pageSlug);
    var q = ch && ch.firstProfessionQuest ? ch.firstProfessionQuest : null;

    if (isFirst) {
      var questRequired =
        q && typeof q.questRequired === 'boolean' ? q.questRequired : true;
      if (!questRequired) {
        if (questHr) questHr.hidden = true;
        if (questBlock) questBlock.hidden = true;
        if (questHint) questHint.hidden = true;
        if (questBtn) questBtn.hidden = true;
        var tpBtnOff = $('magister-prof-teleport-dion');
        if (tpBtnOff) tpBtnOff.hidden = true;
        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.title = '';
        }
        return;
      }
    }

    if (!isFirst) {
      if (questHr) questHr.hidden = true;
      if (questBlock) questBlock.hidden = true;
      if (questHint) questHint.hidden = true;
      if (questBtn) questBtn.hidden = true;
      if (confirmBtn) confirmBtn.disabled = false;
      return;
    }

    var questText = L2MagisterProfession.firstProfQuestTextUk();
    if (questHr) questHr.hidden = !questText;
    if (questBlock) {
      questBlock.hidden = !questText;
      questBlock.textContent = questText || '';
    }
    if (questHint) questHint.hidden = !questText;
    if (questBtn) questBtn.hidden = false;

    var acceptedForThis =
      q && q.accepted && q.targetProfession === targetProf;
    var acceptedOther =
      q && q.accepted && q.targetProfession && q.targetProfession !== targetProf;
    var ready = !!(q && q.ready && acceptedForThis);

    if (questBtn) {
      questBtn.disabled = !!(acceptedForThis || acceptedOther);
      questBtn.textContent = acceptedForThis
        ? 'Квест прийнято'
        : acceptedOther
          ? 'Інший квест активний'
          : 'Взяти квест на професію';
    }
    if (confirmBtn) {
      confirmBtn.disabled = !ready;
      confirmBtn.title = ready
        ? ''
        : 'Спочатку візьми квест і виконай умови (моби + шкурки).';
    }
  }

  function wireTeleportDion() {
    var tpBtn = $('magister-prof-teleport-dion');
    if (!tpBtn || !window.L2MagisterProfession) return;
    tpBtn.addEventListener('click', function () {
      if (actionInFlight) return;
      actionInFlight = true;
      showErr('');
      tpBtn.disabled = true;
      var tpId = L2MagisterProfession.firstProfQuestTeleportId || 'dion';
      L2MagisterProfession.postTeleport(tpId, {
        onError: function (msg) {
          showErr(msg);
        },
        onSuccess: function () {
          window.location.href = '/map.html';
        },
        resync: ensureSnapshot,
      }).finally(function () {
        actionInFlight = false;
        tpBtn.disabled = false;
      });
    });
  }

  function initPage() {
    pageSlug = String(queryParam('slug') || '').trim().toLowerCase();
    var npcId = String(queryParam('npcId') || '').trim();
    var loadErr = $('magister-prof-load-err');
    var panel = $('magister-prof-panel');
    var back = $('magister-prof-back');
    var title = $('magister-prof-title');
    var body = $('magister-prof-body');
    var confirmBtn = $('magister-prof-confirm');
    var questBtn = $('magister-prof-quest');

    if (!pageSlug || !window.L2MagisterProfession) {
      if (loadErr) {
        loadErr.hidden = false;
        loadErr.textContent = 'Невідома професія.';
      }
      if (panel) panel.hidden = true;
      return;
    }

    var labelUk = L2MagisterProfession.labelUkForSlug(pageSlug, queryParam('labelUk'));
    var infoUk = L2MagisterProfession.infoUkForSlug(pageSlug);
    pageBackHref = L2MagisterProfession.magisterBackHref(npcId);

    if (back) back.href = pageBackHref;
    if (title) title.textContent = labelUk;
    if (body) body.textContent = infoUk;

    wireTeleportDion();

    if (questBtn) {
      questBtn.addEventListener('click', function () {
        if (actionInFlight || questBtn.disabled) return;
        actionInFlight = true;
        showErr('');
        questBtn.disabled = true;
        L2MagisterProfession.postAcceptFirstProfessionQuest(pageSlug, {
          onError: function (msg) {
            showErr(msg);
          },
          onSuccess: function (j) {
            var ch = j && j.character ? j.character : null;
            applyQuestUi(ch, confirmBtn, questBtn);
          },
          resync: ensureSnapshot,
        }).finally(function () {
          actionInFlight = false;
          ensureSnapshot().then(function (ch) {
            applyQuestUi(ch, confirmBtn, questBtn);
          });
        });
      });
    }

    if (confirmBtn) {
      confirmBtn.hidden = false;
      confirmBtn.textContent = labelUk;
      confirmBtn.addEventListener('click', function () {
        if (actionInFlight || confirmBtn.disabled) return;
        actionInFlight = true;
        showErr('');
        confirmBtn.disabled = true;
        L2MagisterProfession.postProfessionSlug(pageSlug, {
          onError: function (msg) {
            showErr(msg);
          },
          onSuccess: function () {
            window.location.href = pageBackHref;
          },
          resync: ensureSnapshot,
        }).finally(function () {
          actionInFlight = false;
          ensureSnapshot().then(function (ch) {
            applyQuestUi(ch, confirmBtn, questBtn);
          });
        });
      });
    }

    var t = localStorage.getItem('token');
    if (!t) {
      if (loadErr) {
        loadErr.hidden = false;
        loadErr.textContent = 'Потрібен вхід. Перейди на головну.';
      }
      if (panel) panel.hidden = true;
      return;
    }

    if (loadErr) loadErr.hidden = true;
    if (panel) panel.hidden = false;

    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({ onStub: function () {} });
    }
    ensureSnapshot().then(function (ch) {
      if (ch && window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(ch);
      }
      applyQuestUi(ch, confirmBtn, questBtn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
  } else {
    initPage();
  }
})();
