type BffHeaderOptions = {
  sessionId?: string;
  idempotencyKey?: string;
  captchaToken?: string;
};

export function buildBffHeaders(options: BffHeaderOptions = {}) {
  const headers: Record<string, string> = {};

  if (options.sessionId) {
    headers['X-Purchase-Session'] = options.sessionId;
  }

  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  if (options.captchaToken) {
    headers['X-Captcha-Token'] = options.captchaToken;
  }

  return headers;
}

export default buildBffHeaders;
