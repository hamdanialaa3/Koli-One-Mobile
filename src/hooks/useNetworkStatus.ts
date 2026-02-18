/**
 * useNetworkStatus.ts — Network connectivity hook
 * Falls back gracefully when @react-native-community/netinfo is not installed.
 */

import { useState, useEffect } from 'react';
import { logger } from '../services/logger-service';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

let NetInfo: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  NetInfo = require('@react-native-community/netinfo').default;
} catch {
  // Package not installed — hook will return online by default
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });

  useEffect(() => {
    if (!NetInfo) {
      logger.info('NetInfo not available — assuming online');
      return;
    }

    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setStatus({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable,
        type: state.type ?? 'unknown',
      });
    });

    return () => unsubscribe();
  }, []);

  return status;
}
