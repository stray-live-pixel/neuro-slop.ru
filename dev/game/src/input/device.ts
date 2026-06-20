// Определение тач-устройства (управление и UI адаптируются под него).
export const IS_TOUCH =
  (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches) ||
  'ontouchstart' in window ||
  (navigator.maxTouchPoints || 0) > 0;
