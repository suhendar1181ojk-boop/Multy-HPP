import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCostTextLocally } from './localParser';

test('parseCostTextLocally parses Indonesian catering story accurately', () => {
  const text =
    'Saya mau buat katering 100 porsi nasi kotak ayam bakar komplit. Butuh beras ramos 12kg @16rb, ayam potong 10 ekor @36rb, bumbu marinasi 125rb, upah masak 2 koki @125rb, gas dan minyak 85rb. Mau margin keuntungan 35%.';

  const result = parseCostTextLocally(text, 'kuliner');

  assert.equal(result.category, 'kuliner');
  assert.equal(result.productionVolume, 100);
  assert.equal(result.volumeUnit, 'porsi');
  assert.equal(result.targetMargin, 35);
  assert.ok(result.items.length >= 4);

  // Check beras ramos item
  const beras = result.items.find((i) => i.name.toLowerCase().includes('beras'));
  assert.ok(beras);
  assert.equal(beras?.type, 'material');
  assert.equal(beras?.quantity, 12);
  assert.equal(beras?.unitPrice, 16000);

  // Check ayam item
  const ayam = result.items.find((i) => i.name.toLowerCase().includes('ayam'));
  assert.ok(ayam);
  assert.equal(ayam?.type, 'material');
  assert.equal(ayam?.quantity, 10);
  assert.equal(ayam?.unitPrice, 36000);

  // Check upah item
  const upah = result.items.find((i) => i.name.toLowerCase().includes('upah'));
  assert.ok(upah);
  assert.equal(upah?.type, 'labor');
  assert.equal(upah?.unitPrice, 125000);
});
