import type { PurchaseSessionState } from '../api/types';

const STORAGE_KEY = 'purchase-flow-state';
const ONE_HOUR_MS = 60 * 60 * 1000;
const PURCHASE_ENTRY_TTL_MS = 30 * 60 * 1000;

export type PurchaseResultStatus = 'pending' | 'captured' | 'cancelled' | 'error';

export type IdempotencyAction = 'quote' | 'checkout' | 'capture';

type IdempotencyBucket = {
  key: string;
  payloadHash: string;
  createdAt: number;
};

type IdempotencyState = Partial<Record<IdempotencyAction, IdempotencyBucket>>;

export type PurchaseSessionStorage = {
  sessionId: string;
  state: PurchaseSessionState;
  expiresAt: string;
  allowedBookId?: string;
};

export type PurchaseStorageState = {
  quoteId?: string;
  orderId?: string;
  paypalOrderId?: string;
  phoneE164?: string;
  contactEmail?: string;
  purchaseSession?: PurchaseSessionStorage;
  idempotency?: IdempotencyState;
  savedAt: number;
  purchaseEntry?: {
    volumeId: string;
    expiresAt: number;
  };
  purchaseResultAccess?: {
    status: PurchaseResultStatus;
    expiresAt: number;
  };
};

const readState = (): PurchaseStorageState | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PurchaseStorageState;
    const now = Date.now();

    if (now - parsed.savedAt > ONE_HOUR_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (parsed.purchaseEntry && parsed.purchaseEntry.expiresAt <= now) {
      delete parsed.purchaseEntry;
    }

    if (parsed.purchaseResultAccess && parsed.purchaseResultAccess.expiresAt <= now) {
      delete parsed.purchaseResultAccess;
    }

    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const writeState = (state: PurchaseStorageState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const savePurchaseState = (
  data: Omit<
    PurchaseStorageState,
    'savedAt' | 'purchaseEntry' | 'purchaseResultAccess'
  >,
) => {
  const previous = readState();
  const payload: PurchaseStorageState = {
    ...previous,
    ...data,
    savedAt: Date.now(),
  };

  writeState(payload);
};

export const getPurchaseState = () => {
  const state = readState();
  if (!state) {
    return null;
  }

  writeState(state);
  return state;
};

export const beginPurchaseEntry = (volumeId: string) => {
  const previous = readState();
  const payload: PurchaseStorageState = {
    ...previous,
    quoteId: undefined,
    orderId: undefined,
    paypalOrderId: undefined,
    phoneE164: undefined,
    contactEmail: undefined,
    purchaseSession: undefined,
    idempotency: undefined,
    savedAt: Date.now(),
    purchaseEntry: {
      volumeId,
      expiresAt: Date.now() + PURCHASE_ENTRY_TTL_MS,
    },
  };

  writeState(payload);
};

export const canAccessPurchase = (volumeId: string) => {
  const state = readState();
  if (!state?.purchaseEntry) {
    return false;
  }

  return state.purchaseEntry.volumeId === volumeId;
};

export const markPurchaseResultPending = () => {
  const previous = readState();
  if (!previous) {
    return;
  }

  const payload: PurchaseStorageState = {
    ...previous,
    savedAt: Date.now(),
    purchaseResultAccess: {
      status: 'pending',
      expiresAt: Date.now() + ONE_HOUR_MS,
    },
  };

  writeState(payload);
};

export const setPurchaseSession = (session: PurchaseSessionStorage) => {
  const previous = readState();
  const payload: PurchaseStorageState = {
    ...previous,
    purchaseSession: session,
    idempotency: {
      ...previous?.idempotency,
      quote: undefined,
      checkout: undefined,
      capture: undefined,
    },
    savedAt: Date.now(),
  };

  writeState(payload);
};

export const getPurchaseSession = () => {
  const state = readState();
  return state?.purchaseSession ?? null;
};

export const clearPurchaseSession = () => {
  const previous = readState();
  if (!previous) {
    return;
  }

  const payload: PurchaseStorageState = {
    ...previous,
    quoteId: undefined,
    orderId: undefined,
    paypalOrderId: undefined,
    purchaseSession: undefined,
    idempotency: undefined,
    savedAt: Date.now(),
  };

  writeState(payload);
};

export const resolveIdempotencyKey = (
  action: IdempotencyAction,
  payloadHash: string,
  scope: string,
) => {
  const previous = readState();
  const currentBucket = previous?.idempotency?.[action];

  if (currentBucket && currentBucket.payloadHash === payloadHash) {
    return currentBucket.key;
  }

  const nonce = Math.random().toString(36).slice(2, 10);
  const nextKey = `${action}-${scope}-${Date.now().toString(36)}-${nonce}`;

  const payload: PurchaseStorageState = {
    ...previous,
    idempotency: {
      ...previous?.idempotency,
      [action]: {
        key: nextKey,
        payloadHash,
        createdAt: Date.now(),
      },
    },
    savedAt: Date.now(),
  };

  writeState(payload);
  return nextKey;
};

export const setPurchaseResultStatus = (status: PurchaseResultStatus) => {
  const previous = readState();
  if (!previous) {
    return;
  }

  const payload: PurchaseStorageState = {
    ...previous,
    quoteId: undefined,
    orderId: undefined,
    paypalOrderId: undefined,
    phoneE164: undefined,
    contactEmail: undefined,
    purchaseSession: undefined,
    idempotency: undefined,
    savedAt: Date.now(),
    purchaseResultAccess: {
      status,
      expiresAt: Date.now() + ONE_HOUR_MS,
    },
  };

  writeState(payload);
};

export const canAccessPurchaseResult = () => {
  const state = readState();
  if (!state?.purchaseResultAccess) {
    return false;
  }

  return true;
};

export const clearPurchaseState = () => {
  localStorage.removeItem(STORAGE_KEY);
};
