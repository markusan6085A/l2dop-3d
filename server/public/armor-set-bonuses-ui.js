/**
 * Бонуси комплектів броні — дані з сервера (armorSetCatalog у catalog-hints).
 * Без hardcoded bonusText / pieceIds на клієнті.
 */
(function (g) {
  var CLS = 'l2-armor-set-bonuses';

  function catalogByPieceId() {
    return (g.L2 && g.L2.armorSetByPieceId) || {};
  }

  function isArmorSlot(kind) {
    return (
      kind === 'chest' ||
      kind === 'legs' ||
      kind === 'head' ||
      kind === 'gloves' ||
      kind === 'feet' ||
      kind === 'fullarmor'
    );
  }

  function normalizeArmorGrade(raw) {
    if (raw == null) return null;
    var s = String(raw).trim();
    if (!s || s === '—' || s === '-') return null;
    var u = s.toUpperCase();
    if (u.indexOf('NG') === 0) return null;
    var c = u.charAt(0);
    if ('DCBAS'.indexOf(c) >= 0) return c;
    return null;
  }

  function resolveSetForItemId(itemId) {
    if (itemId == null || itemId === '') return null;
    var n = Number(itemId);
    if (!Number.isFinite(n) || n <= 0) return null;
    return catalogByPieceId()[n] || null;
  }

  function buildSetHtml(setInfo, itemId) {
    var gUk = setInfo.grade || 'D';
    var partsHtml = '';
    if (setInfo.pieceNames && setInfo.pieceNames.length) {
      partsHtml =
        '<div class="' +
        CLS +
        '__parts-title">Частини:</div><ul class="' +
        CLS +
        '__parts">';
      for (var pi = 0; pi < setInfo.pieceNames.length; pi++) {
        partsHtml +=
          '<li>' + setInfo.pieceNames[pi] + '</li>';
      }
      partsHtml += '</ul>';
    }
    var stagesHtml = '';
    if (setInfo.stages && setInfo.stages.length) {
      stagesHtml = '<ul class="' + CLS + '__list">';
      for (var si = 0; si < setInfo.stages.length; si++) {
        var st = setInfo.stages[si];
        var label =
          st.requiredCorePieces +
          (st.requiresShield ? ' основні + Hoplon' : ' частини');
        stagesHtml += '<li><strong>' + label + ':</strong><ul>';
        for (var li = 0; li < st.displayLines.length; li++) {
          stagesHtml += '<li>' + st.displayLines[li] + '</li>';
        }
        stagesHtml += '</ul></li>';
      }
      stagesHtml += '</ul>';
    }
    var progressHtml = '';
    var eq = g.L2 && g.L2.getCachedCharacter && g.L2.getCachedCharacter();
    if (eq && eq.inventory && eq.inventory.eq) {
      var worn = {};
      var eqObj = eq.inventory.eq;
      var keys = ['l3', 'l4', 'lh', 'lg', 'lf', 'l2'];
      for (var ki = 0; ki < keys.length; ki++) {
        var slot = eqObj[keys[ki]];
        var id =
          slot && typeof slot === 'object' && slot.itemId
            ? Number(slot.itemId)
            : typeof slot === 'number'
              ? slot
              : 0;
        if (id > 0) worn[id] = true;
      }
      var coreCount = 0;
      if (setInfo.pieceIds) {
        for (var ci = 0; ci < setInfo.pieceIds.length; ci++) {
          if (worn[setInfo.pieceIds[ci]]) coreCount++;
        }
      }
      var total = setInfo.pieceIds ? setInfo.pieceIds.length : 0;
      progressHtml =
        '<div class="' +
        CLS +
        '__progress">Екіпіровано: ' +
        coreCount +
        '/' +
        total;
      if (setInfo.optionalShieldId) {
        progressHtml +=
          ' · Hoplon: ' +
          (worn[setInfo.optionalShieldId] ? 'екіпіровано' : 'не екіпіровано');
      }
      progressHtml += '</div>';
    }
    return (
      '<div class="' +
      CLS +
      '">' +
      '<div class="' +
      CLS +
      '__title">БОНУСИ КОМПЛЕКТУ · ГРЕЙД ' +
      gUk +
      '</div>' +
      '<div class="' +
      CLS +
      '__set-name">' +
      setInfo.name +
      '</div>' +
      partsHtml +
      stagesHtml +
      progressHtml +
      '</div>'
    );
  }

  function showIn(host, _gradeRaw, itemId) {
    if (!host) return;
    var setInfo = resolveSetForItemId(itemId);
    if (!setInfo) {
      host.hidden = true;
      host.innerHTML = '';
      return;
    }
    host.hidden = false;
    host.innerHTML = buildSetHtml(setInfo, itemId);
  }

  function hide(host) {
    if (host) {
      host.hidden = true;
      host.innerHTML = '';
    }
  }

  g.L2ArmorSetBonusesUI = {
    isArmorSlot: isArmorSlot,
    normalizeArmorGrade: normalizeArmorGrade,
    resolveSetForItemId: resolveSetForItemId,
    showIn: showIn,
    hide: hide,
  };
})(typeof window !== 'undefined' ? window : this);
