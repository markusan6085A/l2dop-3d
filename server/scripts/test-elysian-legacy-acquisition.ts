/**
 * Regression: legacy Elysian itemId 290 не видається з acquisition sources.
 * npm run test:elysian-legacy-acquisition
 */
import {
  assertLegacyBlockedExports,
  collectLegacyElysianAcquisitionReferences,
  ELYSIAN_ITEM_ID,
  findGmElysianWeaponRows,
  legacyInventoryRepairSample,
} from './lib/legacyElysianAcquisitionAudit.js';

function expectEq(label: string, actual: unknown, expected: unknown, errors: string[]): void {
  if (actual !== expected) {
    errors.push(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function main(): void {
  const errors: string[] = [...assertLegacyBlockedExports()];

  const refs = collectLegacyElysianAcquisitionReferences();
  if (refs.length > 0) {
    for (const ref of refs) {
      errors.push(`active acquisition ref 290: ${ref.source} — ${ref.detail}`);
    }
  }
  expectEq('active acquisition references itemId 290', refs.length, 0, errors);

  const gmRows = findGmElysianWeaponRows();
  expectEq('GM Elysian search rows', gmRows.length, 1, errors);
  if (gmRows.length === 1) {
    const row = gmRows[0]!;
    expectEq('GM Elysian itemId', row.itemId, ELYSIAN_ITEM_ID, errors);
    expectEq('GM Elysian weaponType', row.weaponType, 'blunt', errors);
    expectEq('GM Elysian blocksShield', row.blocksShield, false, errors);
    expectEq('GM Elysian requiresArrows', row.requiresArrows, false, errors);
  }

  const repaired = legacyInventoryRepairSample();
  expectEq('legacy inventory stack itemId', repaired.stacks[0]?.itemId, ELYSIAN_ITEM_ID, errors);
  expectEq('legacy inventory eq.l1 itemId', repaired.eq.l1, ELYSIAN_ITEM_ID, errors);

  if (errors.length > 0) {
    console.error('Elysian legacy acquisition FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  console.log('Elysian legacy acquisition OK (290 blocked, GM Elysian=164, migration intact)');
}

main();
