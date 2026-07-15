/**
 * Активні квести — спільний рендер для character-quests.html.
 */
(function (global) {
  var FIRST_PROF_TITLE = {
    human_warrior: 'Воїн (Warrior)',
    human_knight: 'Лицар (Human Knight)',
    human_rogue: 'Розбійник (Rogue)',
  };

  function remaining(have, need) {
    var h = Math.max(0, Math.floor(Number(have) || 0));
    var n = Math.max(0, Math.floor(Number(need) || 0));
    return Math.max(0, n - h);
  }

  function buildFirstProfQuest(quest) {
    if (!quest || !quest.accepted) return null;
    var prof = quest.targetProfession ? String(quest.targetProfession) : '';
    var titleUk =
      FIRST_PROF_TITLE[prof] ||
      (prof ? prof.replace(/_/g, ' ') : '1-ша профа');
    var lines = [];
    if (quest.kills && quest.kills.length) {
      quest.kills.forEach(function (k) {
        var left = remaining(k.have, k.need);
        lines.push({
          kind: 'kill',
          text:
            k.nameUk +
            ' — ' +
            k.have +
            ' / ' +
            k.need +
            (left > 0 ? ' (залишилось ' + left + ')' : ' ✓'),
        });
      });
    }
    if (quest.itemNeed > 0) {
      var itemLeft = remaining(quest.itemHave, quest.itemNeed);
      lines.push({
        kind: 'item',
        text:
          (quest.itemNameUk || 'Предмет') +
          ' — ' +
          quest.itemHave +
          ' / ' +
          quest.itemNeed +
          (itemLeft > 0 ? ' (залишилось ' + itemLeft + ')' : ' ✓'),
      });
    }
    return {
      id: 'human_fighter_first_prof',
      titleUk: 'Квест 1-ї профи: ' + titleUk,
      statusUk: quest.ready
        ? 'Готово — здай у магістра (кнопка «Стати …»).'
        : 'У процесі…',
      ready: !!quest.ready,
      lines: lines,
    };
  }

  function collectActiveQuests(snapshot) {
    var out = [];
    if (!snapshot) return out;
    var first = buildFirstProfQuest(snapshot.firstProfessionQuest);
    if (first) out.push(first);
    return out;
  }

  function render(container, snapshot) {
    if (!container) return;
    container.innerHTML = '';
    var quests = collectActiveQuests(snapshot);
    if (!quests.length) {
      var empty = document.createElement('p');
      empty.className = 'l2-character-quests-empty';
      empty.textContent = 'Немає активних квестів.';
      container.appendChild(empty);
      return;
    }
    quests.forEach(function (q) {
      var entry = document.createElement('div');
      entry.className = 'l2-character-quests-entry';
      if (q.ready) entry.classList.add('l2-character-quests-entry--ready');

      var h = document.createElement('h2');
      h.className = 'l2-character-quests-entry__title';
      h.textContent = q.titleUk;
      entry.appendChild(h);

      if (q.lines && q.lines.length) {
        q.lines.forEach(function (line) {
          var row = document.createElement('p');
          row.className = 'l2-character-quests-entry__line';
          row.textContent = line.text;
          entry.appendChild(row);
        });
      }

      var st = document.createElement('p');
      st.className = 'l2-character-quests-entry__status';
      st.textContent = q.statusUk;
      entry.appendChild(st);

      container.appendChild(entry);
    });
  }

  global.L2CharacterActiveQuests = {
    collectActiveQuests: collectActiveQuests,
    render: render,
  };
})(typeof window !== 'undefined' ? window : globalThis);
