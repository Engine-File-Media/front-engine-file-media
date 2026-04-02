import { client, toApiError } from './client';
import type {
  BooksPricingResponse,
  CaptureRequest,
  CaptureResponse,
  CheckoutResponse,
  CreateQuoteRequest,
  CreateShippingOptionsRequest,
  QuoteResponse,
  ShippingOptionsResponse,
} from './types';

export const getBooksPricing = async () => {
  console.log('📚 [getBooksPricing] Fetching books pricing...');
  try {
    const { data } = await client.get<BooksPricingResponse>('/books/pricing');
    console.log('✅ [getBooksPricing] Success', data);
    return data;
  } catch (error) {
    console.error('❌ [getBooksPricing] Failed', error);
    throw toApiError(error);
  }
};

export const getShippingOptions = async (payload: CreateShippingOptionsRequest) => {
  console.log('🚚 [getShippingOptions] Requesting shipping options', {
    bookId: payload.bookId,
    quantity: payload.quantity,
    country: payload.address.country,
    state: payload.address.state,
  });
  try {
    const { data } = await client.post<ShippingOptionsResponse>('/shipping-options', payload);
    console.log(`✅ [getShippingOptions] Success - ${data.shippingOptions?.length || 0} options received`, data);
    return data;
  } catch (error) {
    console.error('❌ [getShippingOptions] Failed', error);
    throw toApiError(error);
  }
};

export const createQuote = async (payload: CreateQuoteRequest) => {
  console.log('💰 [createQuote] Creating quote', {
    bookId: payload.bookId,
    quantity: payload.quantity,
    shippingOption: payload.shippingOption,
    country: payload.address.country,
  });
  try {
    const { data } = await client.post<QuoteResponse>('/quotes', payload);
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

export const createCheckout = async (quoteId: string) => {
  console.log('🛒 [createCheckout] Creating checkout for quote', { quoteId });
  try {
    const { data } = await client.post<CheckoutResponse>('/checkouts', { quoteId });
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
) => {
  console.log('🎯 [capturePaypalOrder] Capturing PayPal order', { paypalOrderId });
  try {
    const { data } = await client.post<CaptureResponse>(
      `/paypal/orders/${paypalOrderId}/captures`,
      payload ?? {},
    );
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
