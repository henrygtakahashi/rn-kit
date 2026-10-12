import { commonEn } from '@/core/i18n/locales/common.en';

// Keys are grouped by feature. Add every key to pt-BR.ts as well.
export const en = {
  ...commonEn,
};

type DeepStringRecord<T> = { [K in keyof T]: T[K] extends string ? string : DeepStringRecord<T[K]> };

export type Translation = DeepStringRecord<typeof en>;
