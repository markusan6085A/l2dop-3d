/**
 * Повний аудит 144 канонічних зброї NG→S.
 * npm run audit:all-weapons
 */
import {
  auditAllCanonWeapons,
  formatAuditTable,
  TOTAL_CANON_WEAPONS,
} from './lib/weaponCanonAuditCore.js';

function main(): void {
  const { rows, issues, gradeCounts } = auditAllCanonWeapons();

  console.log('=== ALL WEAPONS AUDIT (NG→S) ===');
  console.log(`Total: ${rows.length} / ${TOTAL_CANON_WEAPONS}`);
  console.log(
    `Grades: NG=${gradeCounts.NG} D=${gradeCounts.D} C=${gradeCounts.C} B=${gradeCounts.B} A=${gradeCounts.A} S=${gradeCounts.S}`,
  );
  console.log('');
  console.log(formatAuditTable(rows));

  if (issues.length > 0) {
    console.error('\n=== AUDIT FAILURES ===');
    const byKind = new Map<string, typeof issues>();
    for (const issue of issues) {
      const list = byKind.get(issue.kind) ?? [];
      list.push(issue);
      byKind.set(issue.kind, list);
    }
    for (const [kind, list] of byKind) {
      console.error(`\n[${kind}] (${list.length})`);
      for (const i of list.slice(0, 20)) {
        console.error(
          `  #${i.itemId} ${i.name}: ${i.detail}`,
        );
      }
      if (list.length > 20) {
        console.error(`  ... and ${list.length - 20} more`);
      }
    }
    console.error(`\naudit:all-weapons FAILED (${issues.length} issues)`);
    process.exit(1);
  }

  console.log('\naudit:all-weapons OK');
}

main();
