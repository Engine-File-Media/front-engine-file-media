export const hashPayload = (payload: unknown) => JSON.stringify(payload);

export const readCaptchaCode = (details: unknown): string | null => {
  if (!details || typeof details !== 'object') {
    return null;
  }

  const record = details as Record<string, unknown>;
  const candidates = [
    record.code,
    (record.error as Record<string, unknown> | undefined)?.code,
    (record.details as Record<string, unknown> | undefined)?.code,
  ];

  const code = candidates.find((candidate) => typeof candidate === 'string');
  return typeof code === 'string' ? code : null;
};

export const readApiCode = (details: unknown): string | null => {
  if (!details || typeof details !== 'object') {
    return null;
  }

  const record = details as Record<string, unknown>;
  if (typeof record.code === 'string') {
    return record.code;
  }

  return null;
};

export const normalizeRecipientTaxIdForPayload = (countryCode: string, value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (countryCode === 'CL') {
    return trimmed.toUpperCase().replace(/[^0-9K]/g, '');
  }

  if (countryCode === 'BR') {
    return trimmed.replace(/\D/g, '');
  }

  if (countryCode === 'MX') {
    return trimmed.toUpperCase().replace(/\s+/g, '');
  }

  return trimmed;
};