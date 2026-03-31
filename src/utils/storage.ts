const STORAGE_KEY = 'purchase-flow-state';
const ONE_HOUR_MS = 60 * 60 * 1000;

export type PurchaseStorageState = {
  quoteId: string;
  orderId: string;
  paypalOrderId: string;
  savedAt: number;
};

export const savePurchaseState = (
  data: Omit<PurchaseStorageState, 'savedAt'>,
) => {
  const payload: PurchaseStorageState = {
    ...data,
    savedAt: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const getPurchaseState = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PurchaseStorageState;
    if (Date.now() - parsed.savedAt > ONE_HOUR_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearPurchaseState = () => {
  localStorage.removeItem(STORAGE_KEY);
};
