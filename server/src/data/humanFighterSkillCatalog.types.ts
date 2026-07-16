/** `toggle` — стійки (MP у такті); у магістрі як окремий рядок підказки. */
export type HumanFighterSkillKind = 'battle' | 'passive' | 'toggle';

export interface HumanFighterSkillCatalogEntry {
  battleId: string;
  l2SkillId: number;
  minLevel: number;
  spCost: number;
  nameUk: string;
  hintUk: string;
  kind: HumanFighterSkillKind;
  /**
   * null — база Fighter; human_warrior — після 1-ї профи (Warrior), обидві гілки;
   * human_warlord — лише гілка алебарди (Warlord + Dreadnought);
   * human_warlord_shared — 2-й рівень обох гілок (детекти тощо): Warlord/Dreadnought і Gladiator/Duelist;
   * human_gladiator — 2–3 профа гілки подвійних мечів (Gladiator + Duelist);
   * human_dreadnought — лише Dreadnought; human_dreadnought_or_duelist — обидві 3-ті профи (Око тощо).
   */
  /** КД у секундах (як у згенерованих расових каталогах); відсутнє — без КД на панелі. */
  cooldownSec?: number | null;
  professionReq:
    | 'human_warrior'
    | 'human_warlord'
    | 'human_warlord_shared'
    | 'human_gladiator'
    | 'human_duelist'
    | 'human_dreadnought'
    | 'human_dreadnought_or_duelist'
    /** Dreadnought, Duelist, Phoenix або Hell Knight (328–329, Parry 339 тощо). */
    | 'human_dreadnought_or_duelist_or_phoenix_or_hell'
    /** Паладин і фінал гілки лицаря (Paladin → Phoenix Knight). */
    | 'human_paladin_track'
    /** Knight, Dark Avenger, Hell Knight — Drain Health (70). */
    | 'human_knight_drain_track'
    /** Knight (1-ша профа лицаря) — Aggression, Ultimate Defense тощо. */
    | 'human_knight'
    /** Shield Stun (92): Knight → Paladin → Phoenix Knight. */
    | 'human_knight_paladin_track'
    /** Majesty (82): 1 р. — Knight; 2–3 р. — Paladin / Dark Avenger. */
    | 'human_knight_majesty_track'
    /** Knight, Paladin, Dark Avenger — Magic Resistance (147). */
    | 'human_knight_resistance_track'
    /** Темний месник і фінал темної гілки (Dark Avenger → Hell Knight). */
    | 'human_dark_avenger_track'
    /** Фортеця щита (322): світла або темна 2–3 профа лицаря. */
    | 'human_knight_shield_fortress'
    /** Спільні скіли 3-ї профи: Phoenix Knight або Hell Knight (335, 350, 368). */
    | 'human_phoenix_or_hell_knight'
    /** Лише Phoenix Knight (3-тя профа світлої гілки). */
    | 'human_phoenix_knight'
    /** Лише Hell Knight (3-тя профа темної гілки). */
    | 'human_hell_knight'
    /** Стійки 256/312: воїнська гілка або розбійник. */
    | 'human_warrior_or_rogue_track'
    /** Rogue → Treasure Hunter → Adventurer. */
    | 'human_rogue_track'
    /** Treasure Hunter → Adventurer. */
    | 'human_treasure_hunter_track'
    /** Лише Adventurer (3-тя профа гілки розбійника). */
    | 'human_adventurer'
    /** Hawkeye → Sagittarius (2–3 профа лучника). */
    | 'human_hawkeye_track'
    /** Лише Sagittarius (3-тя профа лучника). */
    | 'human_sagittarius'
    | null;
}

/** Вивчений скіл: battleId + ранг 1..max (як у L2; далі підвищення з магістра). */
export interface LearnedSkillEntry {
  battleId: string;
  /** Поточний ранг; 0 — не вивчено (у БД не зберігаємо). */
  level: number;
}
