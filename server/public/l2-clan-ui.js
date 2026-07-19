/**
 * Спільні кланові UI-хелпери: стабільний текст, таймери, layout debug.
 */
(function (global) {
  'use strict';

  global.L2 = global.L2 || {};

  function setText(el, text) {
    if (!el) return;
    el.textContent = text == null ? '' : String(text);
  }

  function setBusyButton(btn, busy) {
    if (!btn) return;
    btn.disabled = !!busy;
    btn.setAttribute('aria-busy', busy ? 'true' : 'false');
  }

  function pad2(n) {
    return n < 10 ? '0' + String(n) : String(n);
  }

  function formatCountdownHms(targetMs) {
    var left = Math.max(0, targetMs - Date.now());
    var sec = Math.floor(left / 1000);
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
  }

  function formatKyivDate(iso) {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('uk-UA', {
        timeZone: 'Europe/Kyiv',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(iso));
    } catch (_eFmt) {
      return '—';
    }
  }

  function formatKyivTime(iso) {
    if (!iso) return '—';
    try {
      var parts = new Intl.DateTimeFormat('uk-UA', {
        timeZone: 'Europe/Kyiv',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(new Date(iso));
      var hour = '';
      var minute = '';
      parts.forEach(function (part) {
        if (part.type === 'hour') hour = part.value;
        if (part.type === 'minute') minute = part.value;
      });
      if (!hour || !minute) return '—';
      return hour + ':' + minute;
    } catch (_eFmt2) {
      return '—';
    }
  }

  function formatScheduleRange(startsAt, endsAt) {
    if (!startsAt) return '—';
    var datePart = formatKyivDate(startsAt);
    var startPart = formatKyivTime(startsAt);
    var endPart = endsAt ? formatKyivTime(endsAt) : '—';
    return datePart + ', ' + startPart + '–' + endPart;
  }

  function siegeCityScheduleParts(data) {
    if (!data) {
      return { label: 'Наступна облога', value: '—' };
    }
    if (data.state === 'active' && data.endsAt) {
      return {
        label: 'Облога триває',
        value: 'До завершення: ' + formatCountdownHms(new Date(data.endsAt).getTime()),
        timerTargetMs: new Date(data.endsAt).getTime(),
        timerPrefix: 'До завершення: ',
      };
    }
    if (data.startsAt) {
      return {
        label: 'Наступна облога',
        value: formatScheduleRange(data.startsAt, data.endsAt),
      };
    }
    return { label: 'Наступна облога', value: '—' };
  }

  function participantsFingerprint(parts) {
    if (!parts) return '';
    var ids = [];
    (parts.allies || []).forEach(function (row) {
      ids.push(
        'a' + String(row.characterId || '') + ':' + (row.eliminated ? '1' : '0')
      );
    });
    (parts.enemies || []).forEach(function (row) {
      ids.push(
        'e' + String(row.characterId || '') + ':' + (row.eliminated ? '1' : '0')
      );
    });
    return ids.join('|');
  }

  function initLayoutDebug() {
    try {
      var params = new URLSearchParams(global.location.search);
      if (params.get('debugLayout') !== '1') return;
      if (!('PerformanceObserver' in global)) return;
      var obs = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (!entry.hadRecentInput) {
            console.debug('layout-shift', entry.value, entry.sources);
          }
        });
      });
      obs.observe({ type: 'layout-shift', buffered: true });
    } catch (_eDbg) {
      /* ignore */
    }
  }

  global.L2.clanUi = {
    setText: setText,
    setBusyButton: setBusyButton,
    formatCountdownHms: formatCountdownHms,
    formatKyivDate: formatKyivDate,
    formatKyivTime: formatKyivTime,
    formatScheduleRange: formatScheduleRange,
    siegeCityScheduleParts: siegeCityScheduleParts,
    participantsFingerprint: participantsFingerprint,
    initLayoutDebug: initLayoutDebug,
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initLayoutDebug);
    } else {
      initLayoutDebug();
    }
  }
})(window);
