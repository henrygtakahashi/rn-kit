import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';
import type { SyncStatus } from '@/shared/types/sync';
import { cva } from 'class-variance-authority';
import { CheckCircle, CloudArrowUp, WarningCircle, type Icon as PhosphorIcon } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

const STATUS_ICON: Record<SyncStatus, PhosphorIcon> = {
  pending: CloudArrowUp,
  synced: CheckCircle,
  failed: WarningCircle,
};

const statusColor = cva('', {
  variants: {
    status: {
      pending: 'text-muted-foreground',
      synced: 'text-muted-foreground',
      failed: 'text-destructive',
    },
  },
});

type SyncStatusBadgeProps = {
  status: SyncStatus;
};

// Icon plus text, so the state never depends on color alone.
function SyncStatusBadge({ status }: SyncStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center gap-1">
      <Icon as={STATUS_ICON[status]} size={16} className={statusColor({ status })} />
      <Text variant="caption" className={statusColor({ status })}>
        {t(`common.syncStatus.${status}`)}
      </Text>
    </View>
  );
}

export { SyncStatusBadge };
