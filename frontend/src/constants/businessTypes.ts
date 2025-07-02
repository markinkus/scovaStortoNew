// frontend/src/constants/businessTypes.ts
export const BUSINESS_TYPES = [
  'Ristorante',
  'Bar',
  'Supermercato',
  'Albergo',
  'Macelleria',
  'Pizzeria'
] as const;
export type BusinessType = typeof BUSINESS_TYPES[number];
