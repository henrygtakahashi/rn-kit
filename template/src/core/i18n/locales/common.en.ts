// Strings used by the kit's shared components and the root layout. Project
// locale files spread these into their own objects.
export const commonEn = {
  common: {
    retry: 'Try again',
    cancel: 'Cancel',
    back: 'Go back',
    offline: "You're offline. Changes will sync when you're back online.",
    syncStatus: {
      pending: 'Waiting to sync',
      synced: 'Synced',
      failed: "Couldn't sync",
    },
  },
  startup: {
    loadingLabel: 'Opening the app',
    errorTitle: "The app couldn't start",
    errorBody: 'Something went wrong while preparing your data. Try again, or restart the app.',
  },
  notFound: {
    title: 'Page not found',
    body: "This page doesn't exist or was moved.",
    action: 'Go to home',
  },
};

type DeepStringRecord<T> = { [K in keyof T]: T[K] extends string ? string : DeepStringRecord<T[K]> };

export type CommonTranslation = DeepStringRecord<typeof commonEn>;
