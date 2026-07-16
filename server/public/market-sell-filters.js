/**
 * Фільтри категорій сумки для market-sell (логіка як у char.js).
 */
(function (global) {
  function itemDisplayName(id) {
    var n = global.L2 && L2.itemNameById && L2.itemNameById[id];
    return n != null ? n : '#' + id;
  }

  function bagEquipSegment(itemId) {
    var sl = global.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (sl === 'rhand') return 'weapon';
    if (sl === 'lhand' || sl === 'shield') return 'shield';
    if (
      sl === 'chest' ||
      sl === 'legs' ||
      sl === 'head' ||
      sl === 'gloves' ||
      sl === 'feet' ||
      sl === 'fullarmor'
    ) {
      return 'armor';
    }
    if (sl === 'ring' || sl === 'neck' || sl === 'earring') return 'accessor';
    return null;
  }

  function nameLooksLikeEquippableGearName(s) {
    if (!s) return false;
    return (
      /\b(shield|armor|breastplate|helmet|boot|boots|gauntlet|gloves|gaiter|gaiters|circlet|robe|tunic|stockings|cloak|jewel)\b/i.test(
        s
      ) ||
      /(щит|броня|шолом|черевик|рукавиц|нагрудник|штани|обладунк|бригантин|діадема|мантія|кольчуг|лат)/i.test(
        s
      )
    );
  }

  function bagInvTabHintFromName(itemId) {
    var name = itemDisplayName(itemId);
    var s = String(name || '');
    if (/^Recipe:/i.test(s) || /^Рецепт/i.test(s)) return 'recipe';
    if (/Scroll:\s*Enchant\s+(Weapon|Armor)/i.test(s)) return 'enchantment';
    if (/Blessed\s+Scroll:\s*Enchant/i.test(s)) return 'enchantment';
    if (/Giant['’]s?\s+Enchant/i.test(s)) return 'enchantment';
    if (/Свиток/i.test(s) && /зачаруван/i.test(s)) return 'enchantment';
    if (/spellbook/i.test(s)) return 'book';
    if (/^quest\s/i.test(s) || /\bquest\s+item\b/i.test(s)) return 'quest';
    if (/soulshot|spiritshot|blessed\s+spiritshot/i.test(s)) return 'consumable';
    if (/potion|elixir|antidote|healing|mana\s+drug|зілл|еліксир|заряд\s+душ/i.test(s))
      return 'consumable';
    if (
      !nameLooksLikeEquippableGearName(s) &&
      /nugget|thread|stem|binder|coal|powder|ore\b|leather|mold\b|cord\b/i.test(s)
    ) {
      return 'resource';
    }
    return null;
  }

  function bagInvTabHint(itemId) {
    var id = Number(itemId);
    var t = global.L2 && L2.itemInventoryTabById && L2.itemInventoryTabById[id];
    if (t != null && String(t).trim() !== '') return String(t);
    return bagInvTabHintFromName(id);
  }

  function bagElementItemGuess(itemId) {
    var name = itemDisplayName(itemId);
    var s = String(name || '');
    var low = s.toLowerCase();
    if (/\b(elemental|attribute)\s+stone\b/i.test(s)) return true;
    if (/камінь\s+стих|стихійн/i.test(s)) return true;
    if (
      /\b(o['’-]?\s*stone|fire\s+stone|water\s+stone|wind\s+stone|earth\s+stone)\b/i.test(low)
    ) {
      return true;
    }
    return false;
  }

  function itemInConsumableBagBucket(itemId) {
    if (bagEquipSegment(itemId) != null) return false;
    var tab = bagInvTabHint(itemId);
    var tabs = ['consumable', 'recipe', 'resource', 'quest', 'book', 'enchantment'];
    if (tab != null && tabs.indexOf(tab) >= 0) return true;
    if (bagElementItemGuess(itemId)) return true;
    return true;
  }

  function itemMatchesInvCat(itemId, cat, showAll) {
    if (showAll || cat === 'all') return true;
    var seg = bagEquipSegment(itemId);
    if (cat === 'weapon') return seg === 'weapon';
    if (cat === 'shield') return seg === 'shield';
    if (cat === 'armor') return seg === 'armor';
    if (cat === 'accessor') return seg === 'accessor';
    if (cat === 'consumable') return itemInConsumableBagBucket(itemId);
    return false;
  }

  global.MarketSellFilters = {
    itemMatchesInvCat: itemMatchesInvCat,
  };
})(window);
