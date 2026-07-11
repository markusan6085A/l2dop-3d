/**
 * Чат-смайли: /ref/chat-smiles/1.gif … N.gif
 * Код у повідомленні: :1: :2: …
 */
(function (global) {
  var COUNT = 199;
  var BASE = '/ref/chat-smiles/';
  var ASSET_VER = 'orig199v2';
  var LARGE_SCALE = 1.05;
  var BOOST_SCALE = 1.3;
  var LARGE_CODES = {
    '25': 1,
    '28': 1,
    '46': 1,
    '71': 1,
    '72': 1,
    '95': 1,
    '97': 1,
    '118': 1,
    '124': 1,
    '125': 1,
    '136': 1,
    '137': 1,
    '138': 1,
    '139': 1,
    '140': 1,
    '141': 1,
    '146': 1,
    '148': 1,
    '149': 1,
    '186': 1,
    '197': 1,
  };
  var BOOST_CODES = {
    '118': 1,
    '139': 1,
    '146': 1,
    '148': 1,
    '149': 1,
    '186': 1,
  };
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
    largeCodes: LARGE_CODES,
    isLarge: function (code) {
      return !!LARGE_CODES[String(code || '').trim()];
    },
    scaleFor: function (code) {
      var key = String(code || '').trim();
      if (BOOST_CODES[key]) return BOOST_SCALE;
      if (LARGE_CODES[key]) return LARGE_SCALE;
      return 1;
    },
    tokenFor: function (code) {
      return ':' + String(code || '').trim() + ':';
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
