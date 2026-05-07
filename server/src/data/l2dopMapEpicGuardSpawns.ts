/**
 * Міньйони біля 8 епіків (npc з lineage.sql, клани зон). Точки — хрест навколо координат боса з l2dopMapEpicBossSpawns.
 * kind `epic_guard`: окремий пін на карті, не «епік бос». Біля Валакаса — «Пес Фенрила» (npc 29030–29037, bandersnatch, Family of Valakas; pic 182 у lineage).
 */

import type { MapWorldSpawn } from './mapWorldSpawns.js';

const R = 5800;

/** Чотири точки: вправо, вліво, вгору, вниз (світові координати). */
function cross(ex: number, ey: number, r = R): Array<{ worldX: number; worldY: number }> {
  return [
    { worldX: ex + r, worldY: ey },
    { worldX: ex - r, worldY: ey },
    { worldX: ex, worldY: ey + r },
    { worldX: ex, worldY: ey - r },
  ];
}

export const L2DOP_LINEAGE_EPIC_GUARD_SPAWNS: MapWorldSpawn[] = (() => {
  const out: MapWorldSpawn[] = [];

  const pushRing = (
    epicKey: string,
    npcId: number,
    name: string,
    level: number,
    icon: string | undefined,
    positions: Array<{ worldX: number; worldY: number }>
  ) => {
    positions.forEach((p, i) => {
      out.push({
        id: `l2dop_eg_${epicKey}_${npcId}_${i}`,
        worldX: p.worldX,
        worldY: p.worldY,
        templateId: `l2dop_${npcId}`,
        name,
        level,
        kind: 'epic_guard',
        aggressive: true,
        ...(icon ? { icon } : {}),
      });
    });
  };

  // Королева Муравьев — queen_ant_clan
  const qa = cross(-22332, 192767);
  pushRing('29001', 29002, 'Личинка Королевы Муравьев', 38, '/l2dop-mob/34.png', [qa[0]!]);
  pushRing('29001', 29003, 'Муравей Нянька', 35, '/l2dop-mob/35.png', [qa[1]!]);
  pushRing('29001', 29004, 'Муравей Охранник', 37, '/l2dop-mob/35.png', [qa[2]!]);
  pushRing('29001', 29005, 'Муравей Гвардеец', 39, '/l2dop-mob/35.png', [qa[3]!]);

  // Ядро — curma_core_clan
  const core = cross(17192, 114178);
  pushRing('29006', 29007, 'Рыцарь Смерти', 50, '/l2dop-mob/46.png', [core[0]!]);
  pushRing('29006', 29008, 'Рыцарь Рока', 55, '/l2dop-mob/100.png', [core[1]!]);
  pushRing('29006', 29009, 'Дикор', 47, '/l2dop-mob/64.png', [core[2]!]);
  pushRing('29006', 29011, 'Каменолюд', 49, '/l2dop-mob/103.png', [core[3]!]);

  // Орфен — orfen_clan
  const orf = cross(54370, 20639);
  pushRing('29014', 29015, 'Райкель', 48, '/l2dop-mob/291.png', [orf[0]!]);
  pushRing('29014', 29016, 'Райкель Леос', 49, '/l2dop-mob/291.png', [orf[1]!]);
  pushRing('29014', 29017, 'Риба', 48, '/l2dop-mob/287.png', [orf[2]!]);
  pushRing('29014', 29018, 'Риба Ирен', 49, '/l2dop-mob/287.png', [orf[3]!]);

  // Закен — zaken_clan (інстанс; імена з lineage)
  const zakEx = 52384;
  const zakEy = 220219;
  const tri = [
    { worldX: zakEx + R, worldY: zakEy },
    { worldX: zakEx - R * 0.5, worldY: zakEy + R * 0.866 },
    { worldX: zakEx - R * 0.5, worldY: zakEy - R * 0.866 },
  ];
  pushRing('29022', 20845, 'Капитан Пиратов Зомби', 52, '/l2dop-mob/158.png', [tri[0]!]);
  pushRing('29022', 20846, 'Кукла', 53, '/l2dop-mob/159.png', [tri[1]!]);
  pushRing('29022', 20847, 'Хозяин Долин', 54, undefined, [tri[2]!]);

  // Фринтеза — frintezza_clan (духи зони; pic=0 у 29050 — без l2dop-mob)
  const frin = cross(174228, -88018);
  pushRing('29045', 29050, 'Дыхание Халиша', 85, undefined, frin);

  // Баюм — вартові вежі (tower_guard_clan)
  const bai = cross(115803, 18448);
  pushRing('29020', 20858, 'Ангел', 72, '/l2dop-mob/156.png', [bai[0]!]);
  pushRing('29020', 20859, 'Ангел Хранитель', 72, '/l2dop-mob/156.png', [bai[1]!]);
  pushRing('29020', 20860, 'Ангел Печати', 73, '/l2dop-mob/156.png', [bai[2]!]);
  pushRing('29020', 21062, 'Ангел Посланник', 70, '/l2dop-mob/156.png', [bai[3]!]);

  // Антарас — dragon_clan
  const ant = cross(173235, 218675);
  pushRing('29019', 20137, 'Дрейк', 57, '/l2dop-mob/47.png', ant);

  // Валакас — Пес Фенрила (bandersnatch, двоголові сторожі в даних L2; Family of Valakas)
  const val = cross(212852, -114842);
  pushRing('29028', 29030, 'Пес Фенрила Керин', 81, '/l2dop-mob/182.png', [val[0]!]);
  pushRing('29028', 29033, 'Пес Фенрила Фреки', 82, '/l2dop-mob/182.png', [val[1]!]);
  pushRing('29028', 29036, 'Пес Фенрила Уруз', 83, '/l2dop-mob/182.png', [val[2]!]);
  pushRing('29028', 29037, 'Пес Фенрила Киназ', 84, '/l2dop-mob/182.png', [val[3]!]);

  return out;
})();
