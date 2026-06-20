// Тесты цепочки приказов (очередь Shift): какие точки и флажки показываем для
// выделенных юнитов. Чистая логика в грид-координатах — без рендера.
import { describe, it, expect } from 'vitest';
import { orderChainMarkers } from './moveOrders';
import type { Building, ResourceNode, Selectable, Unit } from '../core/types';

function unit(over: Partial<Unit>): Unit {
  return {
    id: 1, kind: 'unit', type: 'peasant', side: 'player', name: 'крестьянин',
    gx: 5, gy: 5, vx: 1, hp: 10, maxhp: 10, def: {} as any,
    order: null, queue: [], path: null, wp: 0,
    cd: 0, anim: 0, guard: { x: 5, y: 5 }, gatherRes: null, carry: 0,
    ...over,
  } as Unit;
}
const building = (cx: number, cy: number): Building => ({ kind: 'building', cx, cy } as Building);
const node = (gx: number, gy: number): ResourceNode => ({ kind: 'node', gx, gy } as ResourceNode);

describe('orderChainMarkers: одиночные приказы', () => {
  it('idle без очереди — маркера нет', () => {
    expect(orderChainMarkers([unit({})])).toEqual([]);
  });

  it('одиночный build (без очереди) не рисуем — цель и так подсвечена', () => {
    const m = orderChainMarkers([unit({ order: { type: 'build', target: building(9, 9) } })]);
    expect(m).toEqual([]);
  });

  it('одиночный move рисуем: флажок в конце пути', () => {
    const u = unit({ order: { type: 'move', gx: 8, gy: 6 }, path: [{ x: 6, y: 5 }, { x: 8, y: 6 }], wp: 0 });
    const [m] = orderChainMarkers([u]);
    expect(m.flags).toEqual([{ x: 8, y: 6 }]);
    expect(m.points[0]).toEqual({ x: 5, y: 5 });                 // от позиции юнита
    expect(m.points[m.points.length - 1]).toEqual({ x: 8, y: 6 });
  });
});

describe('orderChainMarkers: очередь приказов', () => {
  it('флажок на каждый приказ цепочки (текущий + очередь)', () => {
    const u = unit({
      order: { type: 'build', target: building(9, 9) },
      queue: [{ type: 'build', target: building(11, 9) }, { type: 'gather', target: node(14, 7) }],
    });
    const [m] = orderChainMarkers([u]);
    expect(m.flags).toEqual([{ x: 9, y: 9 }, { x: 11, y: 9 }, { x: 14, y: 7 }]);
  });

  it('ломаная идёт позиция → текущая цель → каждая цель очереди по порядку', () => {
    const u = unit({
      gx: 5, gy: 5,
      order: { type: 'build', target: building(9, 9) },
      queue: [{ type: 'build', target: building(11, 9) }],
    });
    const [m] = orderChainMarkers([u]);
    expect(m.points).toEqual([{ x: 5, y: 5 }, { x: 9, y: 9 }, { x: 11, y: 9 }]);
  });

  it('вражеские юниты и здания игнорируются', () => {
    const enemy = unit({ side: 'enemy', order: { type: 'move', gx: 1, gy: 1 }, path: [{ x: 1, y: 1 }] });
    const b = { kind: 'building' } as unknown as Selectable;
    expect(orderChainMarkers([enemy, b])).toEqual([]);
  });
});
