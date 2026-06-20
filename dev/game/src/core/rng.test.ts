// Тесты сид-able RNG: один и тот же сид даёт один и тот же поток чисел
// (воспроизводимость партии), разные сиды — разные потоки.
import { describe, it, expect } from 'vitest';
import { seedRng, getSeed, rng, rndInt, pick } from './rng';

const draw = (seed: number, n: number) => {
  seedRng(seed);
  return Array.from({ length: n }, () => rng());
};

describe('rng: воспроизводимость по сиду', () => {
  it('один сид → одинаковый поток', () => {
    expect(draw(12345, 8)).toEqual(draw(12345, 8));
  });

  it('разные сиды → разные потоки', () => {
    expect(draw(1, 8)).not.toEqual(draw(2, 8));
  });

  it('seedRng сбрасывает поток в начало', () => {
    seedRng(777);
    const first = [rng(), rng(), rng()];
    seedRng(777);
    expect([rng(), rng(), rng()]).toEqual(first);
  });

  it('getSeed возвращает заданный сид', () => {
    seedRng(42);
    expect(getSeed()).toBe(42);
  });
});

describe('rng: диапазоны helper-ов', () => {
  it('rng() всегда в [0, 1)', () => {
    seedRng(99);
    for (let i = 0; i < 1000; i++) { const v = rng(); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); }
  });

  it('rndInt(n) всегда в [0, n)', () => {
    seedRng(99);
    for (let i = 0; i < 1000; i++) { const v = rndInt(6); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(6); expect(v).toBe(v | 0); }
  });

  it('pick возвращает элемент массива, детерминированно по сиду', () => {
    const arr = ['a', 'b', 'c', 'd'];
    seedRng(5); const a = [pick(arr), pick(arr), pick(arr)];
    seedRng(5); const b = [pick(arr), pick(arr), pick(arr)];
    expect(a).toEqual(b);
    a.forEach(x => expect(arr).toContain(x));
  });
});
