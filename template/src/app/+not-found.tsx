import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { Link } from 'expo-router';
import { MapTrifold } from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <EmptyState icon={MapTrifold} title={t('notFound.title')} description={t('notFound.body')}>
        <Link href="/" asChild>
          <Button accessibilityLabel={t('notFound.action')}>
            <Text>{t('notFound.action')}</Text>
          </Button>
        </Link>
      </EmptyState>
    </Screen>
  );
}
