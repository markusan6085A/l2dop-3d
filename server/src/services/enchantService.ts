import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  addEnchantedToBag,
  parseInventory,
  removeEnchantedFromBag,
  type EqSlotValue,
  type InventoryState,
} from '../data/inventory.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { gameConflictFromMutation } from './charConflict.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import {
  ENCHANT_FAIL_RESET_FROM_LEVEL,
  ENCHANT_FAIL_RESET_TO_LEVEL,
  MAX_ENCHANT_LEVEL,
  clampEnchantLevel,
  getEnchantFailLevel,
  getEnchantSuccessChance,
} from '../data/enchantConfig.js';
import {
  enchantScrollByItemId,
  type EnchantScrollDefinition,
} from '../data/enchantScrollCatalog.js';
import { ITEM_CATALOG, itemGradeForItemId } from '../data/itemsCatalog.js';
import { formatEnchantedItemNameUk } from '../domain/formatEnchantedItemNameUk.js';

export interface EnchantEquipmentInput {
  scrollItemId: number;
  targetInstanceId: string;
}

export interface EnchantEquipmentResult {
  success: boolean;
  previousEnchantLevel: number;
  currentEnchantLevel: number;
  chancePercent: number;
  scrollConsumed: boolean;
  messageUk: string;
  character: CharacterSnapshot;
}

interface EnchantTargetResolved {
  mode: 'bag' | 'eq';
  slot?: string;
  itemId: number;
  enchant: number;
}

interface EnchantMutationOutcome {
  success: boolean;
  previousEnchantLevel: number;
  currentEnchantLevel: number;
  chancePercent: number;
  scrollConsumed: boolean;
  messageUk: string;
}

function normalizePassiveAndMove(row: CharacterRow): CharacterRow {
  return resolveMapMovement(applyPassiveHpRegen(row));
}

function normalizeEqValue(itemId: number, enchant: number): EqSlotValue {
  const en = clampEnchantLevel(enchant);
  if (en > 0) return { itemId, enchant: en };
  return itemId;
}

function resolveTargetFromInventory(
  inv: InventoryState,
  targetInstanceId: string
): EnchantTargetResolved {
  const token = String(targetInstanceId || '').trim();
  if (!token) throw new Error('enchant_target_required');
  if (token.startsWith('eq:')) {
    const slot = token.slice(3).trim();
    if (!slot) throw new Error('enchant_target_required');
    const raw = inv.eq[slot];
    if (!raw) throw new Error('enchant_target_not_found');
    const itemId =
      typeof raw === 'number' && raw > 0
        ? raw
        : typeof raw === 'object' && raw && 'itemId' in raw
          ? Number((raw as { itemId: unknown }).itemId)
          : NaN;
    if (!Number.isFinite(itemId) || itemId <= 0) {
      throw new Error('enchant_target_not_found');
    }
    const enchant =
      typeof raw === 'object' && raw && 'enchant' in raw
        ? clampEnchantLevel((raw as { enchant?: unknown }).enchant ?? 0)
        : 0;
    return { mode: 'eq', slot, itemId, enchant };
  }
  if (token.startsWith('bag:')) {
    const parts = token.split(':');
    const itemId = Number(parts[1]);
    const enchant = clampEnchantLevel(parts[2] ?? 0);
    if (!Number.isFinite(itemId) || itemId <= 0) {
      throw new Error('enchant_target_required');
    }
    const row = inv.stacks.find(
      (stack) =>
        stack.itemId === itemId &&
        clampEnchantLevel(stack.enchant ?? 0) === enchant &&
        Number(stack.qty) > 0
    );
    if (!row) throw new Error('enchant_target_not_found');
    return { mode: 'bag', itemId, enchant };
  }
  throw new Error('enchant_target_required');
}

function assertScrollCompatible(
  scroll: EnchantScrollDefinition,
  target: EnchantTargetResolved
): void {
  const meta = ITEM_CATALOG[target.itemId];
  if (!meta) throw new Error('enchant_target_not_equipment');
  if (meta.slot === 'consumable') throw new Error('enchant_target_not_equipment');
  const grade = itemGradeForItemId(target.itemId);
  if (!grade || grade === 'NG') throw new Error('enchant_grade_mismatch');
  if (grade !== scroll.grade) throw new Error('enchant_grade_mismatch');

  const isWeapon = meta.slot === 'rhand';
  const isArmorLike =
    meta.slot === 'lhand' ||
    meta.slot === 'chest' ||
    meta.slot === 'legs' ||
    meta.slot === 'fullarmor' ||
    meta.slot === 'head' ||
    meta.slot === 'gloves' ||
    meta.slot === 'feet' ||
    meta.slot === 'neck' ||
    meta.slot === 'earring' ||
    meta.slot === 'ring';

  if (scroll.target === 'weapon' && !isWeapon) {
    throw new Error('enchant_target_type_mismatch');
  }
  if (scroll.target === 'armor' && !isArmorLike) {
    throw new Error('enchant_target_type_mismatch');
  }
}

function buildFailMessageUk(previous: number, current: number): string {
  if (previous === current) {
    return `Заточка не вдалася. Рівень предмета залишився +${current}.`;
  }
  if (previous >= ENCHANT_FAIL_RESET_FROM_LEVEL && current === ENCHANT_FAIL_RESET_TO_LEVEL) {
    return `Заточка не вдалася. Рівень предмета скинуто з +${previous} до +${current}.`;
  }
  return `Заточка не вдалася. Рівень предмета знижено з +${previous} до +${current}.`;
}

function buildOutcomeMessageUk(
  targetItemId: number,
  success: boolean,
  previousEnchant: number,
  nextEnchant: number
): string {
  const baseName = ITEM_CATALOG[targetItemId]?.nameUk ?? `Предмет ${targetItemId}`;
  if (success) {
    return `Заточка успішна: ${formatEnchantedItemNameUk(baseName, nextEnchant)}.`;
  }
  void baseName;
  return buildFailMessageUk(previousEnchant, nextEnchant);
}

function applyTargetEnchant(
  inv: InventoryState,
  target: EnchantTargetResolved,
  nextEnchant: number
): InventoryState {
  if (target.mode === 'eq' && target.slot) {
    const nextEq = { ...inv.eq };
    nextEq[target.slot] = normalizeEqValue(target.itemId, nextEnchant);
    return { ...inv, eq: nextEq };
  }
  const removed = removeEnchantedFromBag(inv, target.itemId, 1, target.enchant);
  return addEnchantedToBag(removed, target.itemId, 1, nextEnchant);
}

export async function enchantEquipmentItemForUser(
  userId: string,
  expectedRevision: number,
  input: EnchantEquipmentInput,
  deps?: { rng?: () => number }
): Promise<EnchantEquipmentResult> {
  const scrollItemId = Math.floor(Number(input.scrollItemId));
  if (!Number.isFinite(scrollItemId) || scrollItemId <= 0) {
    throw new Error('enchant_scroll_required');
  }
  const scroll = enchantScrollByItemId(scrollItemId);
  if (!scroll) throw new Error('enchant_scroll_unknown');
  const targetInstanceId = String(input.targetInstanceId || '').trim();
  if (!targetInstanceId) throw new Error('enchant_target_required');
  const rng = deps?.rng ?? Math.random;
  let outcome: EnchantMutationOutcome | null = null;

  const row = await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const inv = parseInventory(base.inventoryJson);
        const scrollStack = inv.stacks.find(
          (stack) => stack.itemId === scroll.itemId && Number(stack.qty) > 0
        );
        if (!scrollStack) throw new Error('enchant_scroll_not_in_bag');
        const target = resolveTargetFromInventory(inv, targetInstanceId);
        assertScrollCompatible(scroll, target);
        if (target.enchant >= MAX_ENCHANT_LEVEL) {
          outcome = {
            success: false,
            previousEnchantLevel: target.enchant,
            currentEnchantLevel: target.enchant,
            chancePercent: 0,
            scrollConsumed: false,
            messageUk: `Предмет уже має максимальну заточку +${MAX_ENCHANT_LEVEL}.`,
          };
          return { changed: false };
        }

        const chancePercent = getEnchantSuccessChance(target.enchant);
        const roll = Number(rng());
        const success = Number.isFinite(roll) && roll < chancePercent / 100;
        const nextEnchant = success
          ? target.enchant + 1
          : getEnchantFailLevel(target.enchant);
        const withoutScroll = removeEnchantedFromBag(inv, scroll.itemId, 1, 0);
        const nextInv = applyTargetEnchant(withoutScroll, target, nextEnchant);

        const invChanged = JSON.stringify(nextInv) !== JSON.stringify(inv);
        const changed =
          base.hp !== current.hp ||
          base.worldX !== current.worldX ||
          base.worldY !== current.worldY ||
          base.targetX !== current.targetX ||
          base.targetY !== current.targetY ||
          (base.moveStartAt?.getTime() ?? 0) !==
            ((current as CharacterRow).moveStartAt?.getTime() ?? 0) ||
          base.moveFromX !== current.moveFromX ||
          base.moveFromY !== current.moveFromY ||
          invChanged;
        outcome = {
          success,
          previousEnchantLevel: target.enchant,
          currentEnchantLevel: nextEnchant,
          chancePercent,
          scrollConsumed: true,
          messageUk: buildOutcomeMessageUk(
            target.itemId,
            success,
            target.enchant,
            nextEnchant
          ),
        };
        if (!changed) return { changed: false };
        return {
          changed: true,
          data: {
            hp: base.hp,
            worldX: base.worldX,
            worldY: base.worldY,
            targetX: base.targetX,
            targetY: base.targetY,
            moveStartAt: base.moveStartAt,
            moveFromX: base.moveFromX,
            moveFromY: base.moveFromY,
            inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return result.character as CharacterRow;
  });

  if (!outcome) throw new Error('enchant_outcome_missing');
  const finalOutcome = outcome as EnchantMutationOutcome;
  const character = await buildCharacterClientSnapshot(row, userId);
  return {
    success: finalOutcome.success,
    previousEnchantLevel: finalOutcome.previousEnchantLevel,
    currentEnchantLevel: finalOutcome.currentEnchantLevel,
    chancePercent: finalOutcome.chancePercent,
    scrollConsumed: finalOutcome.scrollConsumed,
    messageUk: finalOutcome.messageUk,
    character,
  };
}
