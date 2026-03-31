import { client, toApiError } from './client';
import type {
  BooksPricingResponse,
  CaptureRequest,
  CaptureResponse,
  CheckoutResponse,
  CreateQuoteRequest,
  QuoteResponse,
} from './types';

export const getBooksPricing = async () => {
  try {
    const { data } = await client.get<BooksPricingResponse>('/books/pricing');
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const createQuote = async (payload: CreateQuoteRequest) => {
  try {
    const { data } = await client.post<QuoteResponse>('/quotes', payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const createCheckout = async (quoteId: string) => {
  try {
    const { data } = await client.post<CheckoutResponse>('/checkouts', { quoteId });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const capturePaypalOrder = async (
  paypalOrderId: string,
  payload?: CaptureRequest,
) => {
  try {
    const { data } = await client.post<CaptureResponse>(
      `/paypal/orders/${paypalOrderId}/captures`,
      payload ?? {},
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
