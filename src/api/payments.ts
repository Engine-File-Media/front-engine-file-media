import { bffClient } from './bff-client';
import { toApiError } from './client';
import { buildBffHeaders } from './bff-headers';
import type {
  AddressMetadataResponse,
  BooksPricingResponse,
  CaptureRequest,
  CaptureResponse,
  CheckoutResponse,
  CreateQuoteRequest,
  PurchaseSessionResponse,
  CreateShippingOptionsRequest,
  QuoteResponse,
  ShippingOptionsResponse,
} from './types';

type SecurePurchaseHeaders = {
  purchaseSessionId: string;
  idempotencyKey: string;
  captchaToken: string;
};

type CaptureHeaders = {
  purchaseSessionId?: string;
  idempotencyKey?: string;
};

export const getBooksPricing = async () => {
  console.log('📚 [getBooksPricing] Fetching books pricing...');
  try {
    const { data } = await bffClient.get<BooksPricingResponse>('/books/pricing');
    console.log('✅ [getBooksPricing] Success', data);
    return data;
  } catch (error) {
    console.error('❌ [getBooksPricing] Failed', error);
    throw toApiError(error);
  }
};

export const getAddressMetadata = async (countryCode?: string) => {
  const query = countryCode ? `?country=${countryCode}` : '';
  console.log('🌍 [getAddressMetadata] Fetching address metadata', { countryCode });
  try {
    const { data } = await bffClient.get<AddressMetadataResponse>(`/address/metadata${query}`);
    console.log('✅ [getAddressMetadata] Success', {
      countryCode: data.fields.countryCode,
      countriesCount: data.countries.length,
      subdivisionsCount: data.subdivisions.length,
    });
    return data;
  } catch (error) {
    console.error('❌ [getAddressMetadata] Failed', error);
    throw toApiError(error);
  }
};

export const getShippingOptions = async (payload: CreateShippingOptionsRequest, purchaseSessionId?: string) => {
  console.log('🚚 [getShippingOptions] Requesting shipping options', {
    bookId: payload.bookId,
    quantity: payload.quantity,
    country: payload.address.country,
    state: payload.address.state,
  });
  try {
    const { data } = await bffClient.post<ShippingOptionsResponse>('/shipping-options', payload, {
      headers: buildBffHeaders({ sessionId: purchaseSessionId }),
    });
    console.log(`✅ [getShippingOptions] Success - ${data.shippingOptions?.length || 0} options received`, data);
    return data;
  } catch (error) {
    console.error('❌ [getShippingOptions] Failed', error);
    throw toApiError(error);
  }
};

export const createPurchaseSession = async (bookId: string) => {
  console.log('🔐 [createPurchaseSession] Creating purchase session', { bookId });
  try {
    const { data } = await bffClient.post<PurchaseSessionResponse>('/purchase-sessions', { bookId });
    console.log('✅ [createPurchaseSession] Success', {
      sessionId: data.sessionId,
      state: data.state,
      expiresAt: data.expiresAt,
      allowedBookId: data.allowedBookId,
    });
    return data;
  } catch (error) {
    console.error('❌ [createPurchaseSession] Failed', error);
    throw toApiError(error);
  }
};

export const createQuote = async (payload: CreateQuoteRequest, secureHeaders: SecurePurchaseHeaders) => {
  console.log('💰 [createQuote] Creating quote', {
    bookId: payload.bookId,
    quantity: payload.quantity,
    shippingOption: payload.shippingOption,
    country: payload.address.country,
  });
  try {
    const { data } = await bffClient.post<QuoteResponse>('/quotes', payload, {
      headers: buildBffHeaders({
        sessionId: secureHeaders.purchaseSessionId,
        idempotencyKey: secureHeaders.idempotencyKey,
        captchaToken: secureHeaders.captchaToken,
      }),
    });
    console.log('✅ [createQuote] Success', {
      quoteId: data.quoteId,
      total: data.costs.total,
      currency: data.currency,
    });
    return data;
  } catch (error) {
    console.error('❌ [createQuote] Failed', error);
    throw toApiError(error);
  }
};

export const createCheckout = async (quoteId: string, secureHeaders: SecurePurchaseHeaders) => {
  console.log('🛒 [createCheckout] Creating checkout for quote', { quoteId });
  try {
    const { data } = await bffClient.post<CheckoutResponse>('/checkouts', { quoteId }, {
      headers: buildBffHeaders({
        sessionId: secureHeaders.purchaseSessionId,
        idempotencyKey: secureHeaders.idempotencyKey,
        captchaToken: secureHeaders.captchaToken,
      }),
    });
    console.log('✅ [createCheckout] Success', {
      approveUrl: data.approveUrl?.substring(0, 50) + '...',
      paypalOrderId: data.paypalOrderId,
    });
    return data;
  } catch (error) {
    console.error('❌ [createCheckout] Failed', error);
    throw toApiError(error);
  }
};

export const capturePaypalOrder = async (
  paypalOrderId: string,
  payload?: CaptureRequest,
  secureHeaders?: CaptureHeaders,
) => {
  console.log('🎯 [capturePaypalOrder] Capturing PayPal order', { paypalOrderId });
  try {
    const { data } = await bffClient.post<CaptureResponse>(`/paypal/orders/${paypalOrderId}/captures`, payload ?? {}, {
      headers: buildBffHeaders({
        sessionId: secureHeaders?.purchaseSessionId,
        idempotencyKey: secureHeaders?.idempotencyKey,
      }),
    });
    console.log('✅ [capturePaypalOrder] Success', {
      orderStatus: data.order.status,
      orderId: data.order.id,
    });
    return data;
  } catch (error) {
    console.error('❌ [capturePaypalOrder] Failed', error);
    throw toApiError(error);
  }
};
