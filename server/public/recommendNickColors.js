/**
 * Палітра кольорів ніка для recommend-nick.html (60 кольорів).
 */
(function (global) {
  global.RECOMMEND_NICK_COLORS = [
    '#FF0000',
    '#DC143C',
    '#B22222',
    '#8B0000',
    '#FF4500',
    '#FF6347',
    '#FF7F50',
    '#FF7F00',
    '#FFA500',
    '#FFB347',
    '#FFD700',
    '#FFC107',
    '#FFFF00',
    '#FFF44F',
    '#F0E68C',
    '#ADFF2F',
    '#7FFF00',
    '#9ACD32',
    '#00FF00',
    '#32CD32',
    '#228B22',
    '#006400',
    '#00FA9A',
    '#98FF98',
    '#3CB371',
    '#20B2AA',
    '#40E0D0',
    '#00CED1',
    '#00FFFF',
    '#87CEFA',
    '#87CEEB',
    '#1E90FF',
    '#00BFFF',
    '#4682B4',
    '#4169E1',
    '#0000FF',
    '#00008B',
    '#191970',
    '#4B0082',
    '#6A5ACD',
    '#7B68EE',
    '#8A2BE2',
    '#9400D3',
    '#9932CC',
    '#BA55D3',
    '#DA70D6',
    '#EE82EE',
    '#FF00FF',
    '#C71585',
    '#FF1493',
    '#FF69B4',
    '#FFC0CB',
    '#FFE4E1',
    '#A52A2A',
    '#8B4513',
    '#CD853F',
    '#D2B48C',
    '#808080',
    '#C0C0C0',
    '#FFFFFF',
    '#000000',
  ];

  global.recommendNickIsDarkHex = function recommendNickIsDarkHex(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length !== 6) return false;
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) return false;
    var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum < 0.42;
  };
})(window);
