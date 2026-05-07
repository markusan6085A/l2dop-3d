/**
 * Крафт: l2Profession у БД (dwarf_scavenger / _artisan / _maestro).
 * classBranch лишається «fighter» для гнома — перевірка тільки по l2Profession.
 */
(function (global) {
  var L2 = global.L2 || (global.L2 = {});
  var CRAFT_L2 = ['dwarf_scavenger', 'dwarf_artisan', 'dwarf_maestro'];
  L2.CRAFT_L2_PROFESSIONS = CRAFT_L2;
  /** Застаріло: раніше перевіряли classBranch; лишено для сумісності. */
  L2.CRAFT_CLASS_BRANCHES = [];

  function profAllowed(p) {
    return CRAFT_L2.indexOf(String(p || '').trim()) !== -1;
  }

  /**
   * `char` — об’єкт snapshot з /character; або рядок l2Profession для тестів.
   */
  L2.canOpenCraft = function (charOrProf) {
    if (charOrProf != null && typeof charOrProf === 'object') {
      var c = charOrProf;
      if (profAllowed(c.l2Profession)) return true;
      if (profAllowed(c.classBranch)) return true;
      return false;
    }
    return profAllowed(charOrProf);
  };
})(typeof window !== 'undefined' ? window : globalThis);
