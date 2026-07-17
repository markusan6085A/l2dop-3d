import type { Character, Prisma } from '@prisma/client';
import {
  dailyQuestsJsonChanged,
  parseDailyQuestsJson,
  serializeDailyQuestsJson,
  touchDailyQuestPlayerActivity,
} from '../domain/dailyQuests.js';

export type CharacterMutationResult = {
  changed: boolean;
  data?: Prisma.CharacterUpdateManyMutationInput;
};

export type CharacterMutationSuccess = {
  ok: true;
  changed: boolean;
  character: Character;
};

export type CharacterMutationConflict = {
  ok: false;
  conflict: true;
  serverRevision: number | null;
  character: Character | null;
};

export type CharacterMutationResponse =
  | CharacterMutationSuccess
  | CharacterMutationConflict;

export async function mutateCharacterWithRevision(
  tx: Prisma.TransactionClient,
  characterId: string,
  expectedRevision: number | null,
  buildMutation: (character: Character) => CharacterMutationResult
): Promise<CharacterMutationResponse> {
  const character = await tx.character.findUnique({
    where: { id: characterId },
  });
  if (!character) {
    throw new Error('character_not_found');
  }

  const mutation = buildMutation(character);
  if (expectedRevision != null && character.revision !== expectedRevision) {
    return {
      ok: false,
      conflict: true,
      serverRevision: character.revision,
      character,
    };
  }
  if (!mutation.changed || !mutation.data) {
    return {
      ok: true,
      changed: false,
      character,
    };
  }

  /** Будь-яка мутація гравця (expectedRevision) = активність для «2 год у грі». */
  if (
    expectedRevision != null &&
    mutation.data.dailyQuestsJson === undefined
  ) {
    const nowMs = Date.now();
    const dailyAfter = touchDailyQuestPlayerActivity(
      parseDailyQuestsJson(character.dailyQuestsJson, nowMs),
      nowMs
    );
    if (dailyQuestsJsonChanged(character.dailyQuestsJson, dailyAfter)) {
      mutation.data = {
        ...mutation.data,
        dailyQuestsJson: serializeDailyQuestsJson(
          dailyAfter
        ) as Prisma.InputJsonValue,
      };
    }
  }

  const now = new Date();
  if (expectedRevision == null) {
    const updated = await tx.character.update({
      where: { id: characterId },
      data: {
        ...mutation.data,
        revision: { increment: 1 },
        lastUpdate: now,
      },
    });
    return {
      ok: true,
      changed: true,
      character: updated,
    };
  }

  const updated = await tx.character.updateMany({
    where: {
      id: characterId,
      revision: expectedRevision,
    },
    data: {
      ...mutation.data,
      revision: { increment: 1 },
      lastUpdate: now,
    },
  });
  if (updated.count !== 1) {
    const fresh = await tx.character.findUnique({
      where: { id: characterId },
    });
    return {
      ok: false,
      conflict: true,
      serverRevision: fresh?.revision ?? null,
      character: fresh,
    };
  }

  const fresh = await tx.character.findUnique({
    where: { id: characterId },
  });
  if (!fresh) {
    throw new Error('character_not_found_after_update');
  }
  return {
    ok: true,
    changed: true,
    character: fresh,
  };
}
