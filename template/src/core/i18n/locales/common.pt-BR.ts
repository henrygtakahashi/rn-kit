import type { CommonTranslation } from '@/core/i18n/locales/common.en';

// Glossary for the shared strings:
//   sync (verb) -> sincronizar      waiting to sync -> aguardando sincronização
//   couldn't sync -> falha ao sincronizar   synced -> sincronização concluída
//   (badge labels never depend on the record's gender)
//   offline -> sem conexão          try again -> tentar de novo
// Address the user as "você".
export const commonPtBR: CommonTranslation = {
  common: {
    retry: 'Tentar de novo',
    cancel: 'Cancelar',
    back: 'Voltar',
    offline: 'Você está sem conexão. Suas alterações serão sincronizadas quando a internet voltar.',
    syncStatus: {
      pending: 'Aguardando sincronização',
      synced: 'Sincronização concluída',
      failed: 'Falha ao sincronizar',
    },
  },
  startup: {
    loadingLabel: 'Abrindo o app',
    errorTitle: 'O app não conseguiu abrir',
    errorBody: 'Algo deu errado ao preparar seus dados. Tente de novo ou reinicie o app.',
  },
  notFound: {
    title: 'Página não encontrada',
    body: 'Esta página não existe ou mudou de lugar.',
    action: 'Ir para o início',
  },
};
