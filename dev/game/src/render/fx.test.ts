import { describe, expect, it } from 'vitest';
import { dashedPolylineSegments } from './fx';
import { TILE } from '../data/config';

const iso = (gx: number, gy: number) => ({ x: (gx - gy) * TILE.w / 2, y: (gx + gy) * TILE.h / 2 });

describe('dashedPolylineSegments', () => {
  it('не зацикливается на фазе ровно у границы dash/gap', () => {
    const route = [
      { x: 20.07707716799489, y: 23.968685843422982 },
      { x: 21, y: 23 },
      { x: 21, y: 22 },
      { x: 22, y: 21 },
      { x: 23, y: 21 },
      { x: 24, y: 21 },
      { x: 25, y: 22 },
    ].map(p => iso(p.x, p.y));

    const segments = dashedPolylineSegments(route, 9, 7, 2.6);

    expect(segments.length).toBeGreaterThan(0);
    expect(segments.length).toBeLessThan(100);
    for (const [a, b] of segments) {
      expect(Number.isFinite(a.x)).toBe(true);
      expect(Number.isFinite(a.y)).toBe(true);
      expect(Number.isFinite(b.x)).toBe(true);
      expect(Number.isFinite(b.y)).toBe(true);
    }
  });
});
