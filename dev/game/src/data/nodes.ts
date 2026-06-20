// Ресурсные узлы на карте: какой ресурс, сколько в одном, спрайт.
import type { NodeDef } from '../core/types';

export const NODES: Record<string, NodeDef> = {
  forest:  { res: 'wood',  amount: 320, img: 'tree',    label: 'Лес' },
  rocks:   { res: 'stone', amount: 260, img: 'rocks',   label: 'Камни' },
  goldore: { res: 'gold',  amount: 200, img: 'gold',    label: 'Золотая жила' },
  berries: { res: 'food',  amount: 180, img: 'berries', label: 'Ягоды' },
};
