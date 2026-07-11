/**
 * Чат-смайли: /ref/chat-smiles/1.gif … N.gif
 * Код у повідомленні: :1: :2: …
 */
(function (global) {
  var COUNT = 199;
  var BASE = '/ref/chat-smiles/';
  var ASSET_VER = 'orig199v1';
  var LIST = [];
  var byCode = Object.create(null);

  for (var i = 1; i <= COUNT; i++) {
    var code = String(i);
    var item = {
      code: code,
      src: BASE + code + '.gif?v=' + ASSET_VER,
      title: code,
    };
    LIST.push(item);
    byCode[code] = item;
  }

  global.L2ChatSmiles = {
    count: COUNT,
    list: LIST,
    byCode: byCode,
    tokenFor: function (code) {
      return ':' + String(code || '').trim() + ':';
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
