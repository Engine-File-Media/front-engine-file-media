import { useCallback, useEffect, useState } from 'react';
import { createPurchaseSession } from '../../api/payments';
import type { ApiError } from '../../api/types';
import {
  clearPurchaseSession,
  getPurchaseSession,
  setPurchaseSession,
} from '../../utils/storage';

type UsePurchaseSessionResult = {
  purchaseSessionId: string;
  isSessionBootstrapping: boolean;
  bootstrapPurchaseSession: (force?: boolean) => Promise<string | null>;
  clearPurchaseSessionContext: () => void;
};

export const usePurchaseSession = (
  bookId: string,
  onError: (message: string) => void,
): UsePurchaseSessionResult => {
  const [purchaseSessionId, setPurchaseSessionId] = useState('');
  const [isSessionBootstrapping, setIsSessionBootstrapping] = useState(true);

  const clearPurchaseSessionContext = useCallback(() => {
    clearPurchaseSession();
    setPurchaseSessionId('');
  }, []);

  const bootstrapPurchaseSession = useCallback(
    async (force = false) => {
      setIsSessionBootstrapping(true);
      onError('');

      if (!force) {
        const cachedSession = getPurchaseSession();
        if (cachedSession?.sessionId) {
          setPurchaseSessionId(cachedSession.sessionId);
          setIsSessionBootstrapping(false);
          return cachedSession.sessionId;
        }
      }

      setPurchaseSessionId('');

      try {
        const session = await createPurchaseSession(bookId);

        if (session.allowedBookId && session.allowedBookId !== bookId) {
          clearPurchaseSessionContext();
          onError('This purchase session is not valid for the selected book. Please restart purchase.');
          return null;
        }

        setPurchaseSession({
          sessionId: session.sessionId,
          state: session.state,
          expiresAt: session.expiresAt,
          ...(session.allowedBookId ? { allowedBookId: session.allowedBookId } : {}),
        });
        setPurchaseSessionId(session.sessionId);
        return session.sessionId;
      } catch (error) {
        const parsedError = error as ApiError;
        setPurchaseSessionId('');
        onError(parsedError.message || 'Unable to start secure purchase session. Please try again.');
        return null;
      } finally {
        setIsSessionBootstrapping(false);
      }
    },
    [bookId, clearPurchaseSessionContext, onError],
  );

  useEffect(() => {
    void bootstrapPurchaseSession();
  }, [bootstrapPurchaseSession]);

  return {
    purchaseSessionId,
    isSessionBootstrapping,
    bootstrapPurchaseSession,
    clearPurchaseSessionContext,
  };
};