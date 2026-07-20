/**
 * Client smoke: enchant target sync, stat preview, badge helper.
 * npm run test:enchant (chained)
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commonSrc = fs.readFileSync(path.join(__dirname, '../public/common.js'), 'utf8');

function bootCommon() {
  const sandbox = {
    window: {},
    document: {
      createElement: function (tag) {
        return {
          tagName: String(tag || 'div').toUpperCase(),
          className: '',
          classList: {
            _set: new Set(),
            contains(cls) {
              return this._set.has(cls);
            },
            add(cls) {
              this._set.add(cls);
            },
          },
          style: {},
          children: [],
          parentNode: null,
          appendChild(child) {
            this.children.push(child);
            child.parentNode = this;
            return child;
          },
          removeChild(child) {
            var idx = this.children.indexOf(child);
            if (idx >= 0) this.children.splice(idx, 1);
            child.parentNode = null;
            return child;
          },
          querySelector(sel) {
            if (sel === '.l2-item-enchant-badge') {
              return this.children.find(function (c) {
                return c.className === 'l2-item-enchant-badge';
              }) || null;
            }
            return null;
          },
          setAttribute() {},
          textContent: '',
        };
      },
    },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    setTimeout: function () {},
    clearTimeout: function () {},
    console,
  };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  vm.runInNewContext(commonSrc, sandbox, { filename: 'common.js' });
  return sandbox.L2;
}

const L2 = bootCommon();
assert.ok(L2, 'L2 must boot from common.js');

// canonical bonuses (server l2dopEnchant.ts)
assert.equal(L2.weaponPatkEnchantBonus(0), 0);
assert.equal(L2.weaponPatkEnchantBonus(1), 2);
assert.equal(L2.weaponPatkEnchantBonus(3), 6);
assert.equal(L2.weaponMatkEnchantBonus(3), 9);
assert.equal(L2.armorPiecePDefEnchantBonus(3), 3);

// bag target id refresh +0 -> +1 -> +2
assert.equal(L2.mkBagEnchantTargetId(128, 0), 'bag:128:0');
assert.equal(L2.mkBagEnchantTargetId(128, 1), 'bag:128:1');
assert.equal(L2.mkBagEnchantTargetId(128, 2), 'bag:128:2');

var ctx = { targetInstanceId: 'bag:128:0', itemId: 128, enchant: 0 };
var snap1 = {
  inventory: {
    stacks: [{ itemId: 128, qty: 1, enchant: 1 }],
    eq: {},
  },
};
var next1 = L2.syncEnchantTargetFromSnapshot(ctx, snap1, 1);
assert.ok(next1, 'sync after +1 must succeed');
assert.equal(next1.targetInstanceId, 'bag:128:1');
assert.equal(next1.enchant, 1);

ctx.targetInstanceId = next1.targetInstanceId;
ctx.enchant = next1.enchant;
var snap2 = {
  inventory: {
    stacks: [{ itemId: 128, qty: 1, enchant: 2 }],
    eq: {},
  },
};
var next2 = L2.syncEnchantTargetFromSnapshot(ctx, snap2, 2);
assert.ok(next2, 'sync after +2 must succeed');
assert.equal(next2.targetInstanceId, 'bag:128:2');

// failure level also updates target id
ctx.targetInstanceId = 'bag:128:7';
ctx.enchant = 7;
var snapFail = {
  inventory: {
    stacks: [{ itemId: 128, qty: 1, enchant: 6 }],
    eq: {},
  },
};
var nextFail = L2.syncEnchantTargetFromSnapshot(ctx, snapFail, 6);
assert.ok(nextFail);
assert.equal(nextFail.targetInstanceId, 'bag:128:6');

// equipped item keeps eq:<slot>
ctx = { targetInstanceId: 'eq:l1', itemId: 128, enchant: 2 };
var snapEq = {
  inventory: {
    stacks: [],
    eq: { l1: { itemId: 128, enchant: 3 } },
  },
};
var nextEq = L2.syncEnchantTargetFromSnapshot(ctx, snapEq, 3);
assert.ok(nextEq);
assert.equal(nextEq.targetInstanceId, 'eq:l1');
assert.equal(nextEq.enchant, 3);

// final stat display uses base + bonus, not compounding
L2.itemStatsById = { 128: { pAtk: 105, mAtk: 50 } };
L2.itemSlotById = { 128: 'rhand' };
var line = L2.formatEnchantedStatLineUk('Фіз. атака', 105, 3, 'weaponPatk');
assert.equal(line.valueUk, '111 (+6 від заточення)');

var preview = L2.buildEnchantSuccessPreviewLines(128, 3);
assert.ok(preview.length >= 1);
assert.equal(preview[0].currentValue, 111);
assert.equal(preview[0].nextValue, 115);
assert.equal(preview[0].delta, 4);

// badge helper
var parent = {
  child: null,
  insertBefore(node, ref) {
    node.parentNode = this;
    this.child = node;
    if (ref) node.ref = ref;
  },
};
var img = { parentNode: parent, parentElement: parent };
var host = L2.wrapItemIconWithEnchantBadge(img, 3);
assert.ok(host && String(host.className).indexOf('l2-item-icon-badge-host') >= 0);
assert.ok(host.children.some(function (c) {
  return c.className === 'l2-item-enchant-badge' && c.textContent === '+3';
}));

L2.wrapItemIconWithEnchantBadge(img, 0);
assert.ok(
  !host.children.some(function (c) {
    return c.className === 'l2-item-enchant-badge';
  })
);

// compact list stats use final enchanted values (no bonus text)
L2.itemStatsById = { 128: { pAtk: 105, mAtk: 50 } };
L2.itemSlotById = { 128: 'rhand' };
L2.itemWeaponTypeById = { 128: 'bow' };
var compactLines = L2.buildItemEnchantAwareStatLines(128, 7, { compact: true });
var patkLine = compactLines.find(function (ln) {
  return ln.labelUk === 'Фіз. атака';
});
var matkLine = compactLines.find(function (ln) {
  return ln.labelUk === 'Маг. атака';
});
assert.ok(patkLine, 'compact lines must include P.Atk');
assert.equal(patkLine.valueUk, '127');
assert.ok(matkLine, 'compact lines must include M.Atk');
assert.equal(matkLine.valueUk, '83');
assert.ok(
  !String(patkLine.valueUk).includes('від заточення'),
  'compact lines must not include bonus suffix'
);

var detailLines = L2.buildItemEnchantAwareStatLines(128, 7, { compact: false });
var detailPatk = detailLines.find(function (ln) {
  return ln.labelUk === 'Фіз. атака';
});
assert.ok(String(detailPatk.valueUk).includes('від заточення'));

// technical debt note: stacks merge by itemId+enchant (qty), not per physical instance
var dupSnap = {
  inventory: {
    stacks: [{ itemId: 128, qty: 2, enchant: 0 }],
    eq: {},
  },
};
var dupCtx = { targetInstanceId: 'bag:128:0', itemId: 128, enchant: 0 };
assert.ok(L2.syncEnchantTargetFromSnapshot(dupCtx, dupSnap, 0));

console.log('enchant-client-smoke OK');
