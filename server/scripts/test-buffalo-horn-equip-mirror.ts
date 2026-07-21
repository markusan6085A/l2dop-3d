/**
 * Browser-level regression: equip mirror render for Buffalo's Horn (308).
 * npm run test:buffalo-horn-equip-mirror
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { itemBlocksShieldHintsForClient } from '../src/data/l2dopTwoHandedWeapon.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const framePath = path.join(__dirname, '../public/charEquipFrame.js');
const frameSrc = fs.readFileSync(framePath, 'utf8');

type MockSlot = {
  ui: string;
  classList: { add(c: string): void; remove(c: string): void };
  attrs: Record<string, string>;
  src: string;
  setAttribute(k: string, v: string): void;
  removeAttribute(k: string): void;
  getAttribute(k: string): string | null;
};

function loadCharEquipFrame(l2State: { L2: Record<string, unknown> }) {
  const sandbox: Record<string, unknown> = {
    window: {},
    console: { log: function () {} },
  };
  sandbox.window = sandbox;
  sandbox.global = sandbox.window;
  (sandbox.window as Record<string, unknown>).L2 = l2State.L2;
  vm.runInNewContext(frameSrc, sandbox, { filename: 'charEquipFrame.js' });
  return (sandbox.window as { L2CharEquipFrame: Record<string, (...args: unknown[]) => unknown> })
    .L2CharEquipFrame;
}

function expectEq(label: string, actual: unknown, expected: unknown, errors: string[]): void {
  if (actual !== expected) {
    errors.push(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function mockScope() {
  const slots: Record<string, MockSlot> = {};
  return {
    querySelector(sel: string) {
      const m = /data-l2-slot="([^"]+)"/.exec(sel);
      if (!m) return null;
      const ui = m[1];
      if (!slots[ui]) {
        slots[ui] = {
          ui,
          classList: {
            add(c: string) {},
            remove(_c: string) {},
          },
          attrs: {},
          src: '',
          setAttribute(k: string, v: string) {
            this.attrs[k] = String(v);
          },
          removeAttribute(k: string) {
            delete this.attrs[k];
          },
          getAttribute(k: string) {
            return this.attrs[k] ?? null;
          },
        };
      }
      return slots[ui];
    },
    slots,
  };
}

function main(): void {
  const errors: string[] = [];
  const hints = itemBlocksShieldHintsForClient();

  expectEq('server hint 308', hints[308], false, errors);
  expectEq('server hint 253 fist', hints[253], true, errors);

  const frame = loadCharEquipFrame({
    L2: {
      itemBlocksShieldById: { 308: false, 253: true, 628: false },
      gearCatalogById: {
        308: { itemId: 308, blocksShield: false, weaponType: 'blunt' },
        253: { itemId: 253, blocksShield: true, weaponType: 'fist' },
      },
      resolveItemIconUrl: (id: number) => '/icon/' + id,
      setItemIconWithEnchantBadge: (el: MockSlot, id: number) => {
        el.src = '/icon/' + id;
      },
      wrapItemIconWithEnchantBadge: () => {},
    },
  });

  expectEq('weaponBlocksShieldForUi(308)', frame.weaponBlocksShieldForUi(308), false, errors);
  expectEq('weaponBlocksShieldForUi(253)', frame.weaponBlocksShieldForUi(253), true, errors);
  expectEq('resolveMirrorTwoHand buffalo', frame.resolveMirrorTwoHand(308, null), false, errors);
  expectEq('resolveMirrorTwoHand spike gloves', frame.resolveMirrorTwoHand(253, null), true, errors);
  expectEq('resolveMirrorTwoHand with shield', frame.resolveMirrorTwoHand(253, 628), false, errors);

  const scope = mockScope();
  frame.renderEquipSlots({ eq: { l1: 308, l2: null } }, scope);
  expectEq('l1 shows 308', scope.slots.weapon?.src, '/icon/308', errors);
  expectEq('l2 empty', scope.slots.shield?.src, '/icons/slot_shield.png', errors);
  expectEq('l2 no mirror attr', scope.slots.shield?.getAttribute('data-l2-mirror-twohand'), null, errors);

  const scope2 = mockScope();
  frame.renderEquipSlots({ eq: { l1: 308, l2: 628 } }, scope2);
  expectEq('l1 buffalo with shield', scope2.slots.weapon?.src, '/icon/308', errors);
  expectEq('l2 real shield', scope2.slots.shield?.src, '/icon/628', errors);

  const scope3 = mockScope();
  frame.renderEquipSlots({ eq: { l1: 253, l2: null } }, scope3);
  expectEq('spike mirror l2', scope3.slots.shield?.src, '/icon/253', errors);
  expectEq(
    'spike mirror flag',
    scope3.slots.shield?.getAttribute('data-l2-mirror-twohand'),
    '1',
    errors,
  );

  const staleFrame = loadCharEquipFrame({
    L2: {
      itemBlocksShieldById: { 308: true },
      gearCatalogById: { 308: { blocksShield: false } },
    },
  });
  expectEq(
    'stale hint true returns true from weaponBlocksShieldForUi',
    staleFrame.weaponBlocksShieldForUi(308),
    true,
    errors,
  );
  expectEq(
    '308 guard blocks mirror with stale hint',
    staleFrame.resolveMirrorTwoHand(308, null),
    false,
    errors,
  );

  const src = fs.readFileSync(framePath, 'utf8');
  if (!src.includes('Number(wId) !== 308')) {
    errors.push('charEquipFrame.js missing Number(wId) !== 308 guard');
  }
  if (!src.includes('[EQUIP_MIRROR_DEBUG]')) {
    errors.push('charEquipFrame.js missing EQUIP_MIRROR_DEBUG log');
  }

  if (errors.length) {
    console.error(
      'Buffalo horn equip mirror FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'),
    );
    process.exit(1);
  }
  console.log('Buffalo horn equip mirror OK (browser-level render)');
}

main();
