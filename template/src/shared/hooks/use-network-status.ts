import { useNetworkState } from 'expo-network';

// Unknown counts as online, so the offline strip never flashes at startup.
export function useNetworkStatus() {
  const { isConnected, isInternetReachable } = useNetworkState();
  const isOffline = isConnected === false || isInternetReachable === false;
  return { isOffline };
}
