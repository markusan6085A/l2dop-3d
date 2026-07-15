import { Prisma } from '@prisma/client';
import { starterInventory, STARTER_ADENA } from '../data/inventory.js';
import { starterWorldForNewCharacter } from '../data/l2dopStarterWorldFromRace.js';
import { defaultFighterBaseProfessionForRace } from '../data/l2dopHumanFighterBattleSkills.js';
import { prisma } from '../lib/prisma.js';
import { signAccessToken } from '../lib/jwt.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { computeStarterVitalsForNewCharacter } from './charStarterVitals.js';
import { mysticStarterLearnedSkillsForRace } from '../data/mysticStarterSkills.js';

const RACES = [
  'Human',
  'Dark Elf',
  'Elf',
  'Orc',
  'Dwarf',
] as const;

const CLASS_BRANCHES = ['fighter', 'mystic'] as const;
const GENDERS = ['male', 'female'] as const;

function normalizeLogin(login: unknown): string | null {
  if (typeof login !== 'string') return null;
  const s = login.trim();
  if (s.length < 3 || s.length > 32) return null;
  return s;
}

function normalizePassword(password: unknown): string | null {
  if (typeof password !== 'string') return null;
  if (password.length < 6 || password.length > 128) return null;
  return password;
}

function normalizeCharacterName(name: unknown): string | null {
  if (typeof name !== 'string') return null;
  const s = name.trim();
  if (s.length < 2 || s.length > 24) return null;
  return s;
}

function normalizeRace(race: unknown): string | null {
  if (typeof race !== 'string') return null;
  const s = race.trim();
  return RACES.includes(s as (typeof RACES)[number]) ? s : null;
}

function normalizeClassBranch(branch: unknown): string | null {
  if (typeof branch !== 'string') return null;
  const s = branch.trim().toLowerCase();
  return CLASS_BRANCHES.includes(s as (typeof CLASS_BRANCHES)[number])
    ? s
    : null;
}

function normalizeGender(gender: unknown): string {
  if (typeof gender !== 'string') return 'male';
  const s = gender.trim().toLowerCase();
  return GENDERS.includes(s as (typeof GENDERS)[number]) ? s : 'male';
}

export async function register(input: {
  login: unknown;
  password: unknown;
  password2: unknown;
  characterName: unknown;
  race: unknown;
  classBranch: unknown;
  gender?: unknown;
}): Promise<{ token: string }> {
  const login = normalizeLogin(input.login);
  const characterName = normalizeCharacterName(input.characterName);
  const race = normalizeRace(input.race);
  const classBranch = normalizeClassBranch(input.classBranch);
  const gender = normalizeGender(input.gender);

  if (
    typeof input.password !== 'string' ||
    typeof input.password2 !== 'string' ||
    input.password !== input.password2
  ) {
    throw new AuthError('invalid_input', 400);
  }

  const password = normalizePassword(input.password);
  if (!login || !password || !characterName || !race || !classBranch) {
    throw new AuthError('invalid_input', 400);
  }
  if (race === 'Dwarf' && classBranch === 'mystic') {
    throw new AuthError('invalid_input', 400);
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          login,
          password: passwordHash,
        },
      });
      const l2Profession =
        classBranch === 'mystic'
          ? race === 'Elf'
            ? 'elf_mage'
            : race === 'Dark Elf'
              ? 'dark_elf_mage'
              : race === 'Orc'
                ? 'orc_mage'
                : 'human_mage'
          : defaultFighterBaseProfessionForRace(race);
      /** Стартові innate-скіли мага за расою (Wind Strike + Spellcraft тощо). */
      const mysticStarterSkills: Prisma.InputJsonValue | undefined =
        classBranch === 'mystic'
          ? (mysticStarterLearnedSkillsForRace(race) as unknown as Prisma.InputJsonValue)
          : undefined;
      const start = starterWorldForNewCharacter(race, classBranch);
      const starterInv = starterInventory(
        classBranch as 'fighter' | 'mystic'
      );
      const starterVitals = computeStarterVitalsForNewCharacter({
        race,
        classBranch,
        l2Profession,
        inventory: starterInv,
        skillsLearnedJson: mysticStarterSkills,
      });
      const charData = {
        name: characterName,
        userId: u.id,
        race,
        classBranch,
        gender,
        l2Profession,
        hp: starterVitals.hp,
        maxHp: starterVitals.maxHp,
        adena: BigInt(STARTER_ADENA),
        cityId: start.cityId,
        worldX: start.worldX,
        worldY: start.worldY,
        moveFromX: start.worldX,
        moveFromY: start.worldY,
        inventoryJson: starterInv as unknown as Prisma.InputJsonValue,
        ...(mysticStarterSkills != null
          ? { skillsLearnedJson: mysticStarterSkills }
          : {}),
      } as unknown as Prisma.CharacterUncheckedCreateInput;
      await tx.character.create({ data: charData });
      return u;
    });

    return { token: signAccessToken(user.id) };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new AuthError('forbidden', 409);
    }
    throw e;
  }
}

export async function login(input: {
  login: unknown;
  password: unknown;
}): Promise<{ token: string }> {
  const loginVal = normalizeLogin(input.login);
  const password = normalizePassword(input.password);
  if (!loginVal || !password) {
    throw new AuthError('invalid_input', 400);
  }

  const user = await prisma.user.findUnique({ where: { login: loginVal } });
  if (!user) {
    throw new AuthError('forbidden', 401);
  }

  const ok = await verifyPassword(password, user.password);
  if (!ok) {
    throw new AuthError('forbidden', 401);
  }

  return { token: signAccessToken(user.id) };
}

export class AuthError extends Error {
  constructor(
    message: string,
    readonly statusCode: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
