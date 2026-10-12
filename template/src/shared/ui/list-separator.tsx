import { View } from 'react-native';

// Virtualized lists cannot use `gap`; cards in a list sit 8 apart.
function ListSeparator() {
  return <View className="h-2" />;
}

export { ListSeparator };
