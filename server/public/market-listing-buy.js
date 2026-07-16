/**
 * Спільна купівля лоту на ринку (character/market/buy).
 */
(function (global) {
  var buyInFlight = false;

  async function buyMarketListing(listingId, opts) {
    opts = opts || {};
    if (buyInFlight) return { ok: false, reason: 'busy' };
    if (!listingId) return { ok: false, reason: 'invalid' };

    var token = localStorage.getItem('token');
    if (!token) return { ok: false, reason: 'auth' };

    var snap = global.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
    if (!snap || snap.revision == null) {
      return { ok: false, reason: 'revision', messageUk: 'Не вдалося прочитати revision — онови сторінку.' };
    }

    buyInFlight = true;
    var buyBtn = opts.button || null;
    if (buyBtn) buyBtn.disabled = true;
    if (typeof opts.onStart === 'function') opts.onStart();

    try {
      var r = await fetch('/character/market/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          listingId: String(listingId),
          expectedRevision: snap.revision,
          qty: opts.qty != null ? Number(opts.qty) : undefined,
        }),
      });

      if (r.status === 409) {
        if (global.L2 && typeof L2.resyncCharacterAfterConflict === 'function') {
          await L2.resyncCharacterAfterConflict();
        }
        return {
          ok: false,
          reason: 'conflict',
          messageUk: 'Стан оновлено — спробуй ще раз.',
        };
      }

      var j = {};
      try {
        j = await r.json();
      } catch (_) {
        j = {};
      }

      if (!r.ok) {
        return {
          ok: false,
          reason: 'error',
          messageUk: j && j.messageUk ? j.messageUk : 'Не вдалося купити лот.',
        };
      }

      if (j.character) {
        if (global.L2 && typeof L2.applyCharacterSnapshot === 'function') {
          L2.applyCharacterSnapshot(j.character);
        } else if (global.L2) {
          L2.setLastSnapshot(j.character);
          if (typeof L2.applyHudFromSnapshot === 'function') {
            L2.applyHudFromSnapshot(j.character);
          }
        }
      }

      return { ok: true, character: j.character };
    } finally {
      buyInFlight = false;
      if (buyBtn) buyBtn.disabled = false;
    }
  }

  global.L2MarketListingBuy = {
    buy: buyMarketListing,
  };
})(window);
