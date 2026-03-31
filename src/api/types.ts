export type OrderStatus =
  | 'created'
  | 'approved'
  | 'paid'
  | 'lulu_pending_payment'
  | 'in_production'
  | 'shipped';

export type CurrencyCode = 'USD' | string;

export type BookPricing = {
  id: string;
  title: string;
  currency: CurrencyCode;
  price: number;
  sale: boolean;
  discount: number;
  effectivePrice: number;
};

export type BooksPricingResponse = {
  books: BookPricing[];
};

export type QuoteAddressInput = {
  line1: string;
  city: string;
  postalCode: string;
  country: string;
  state?: string;
};

export type CreateQuoteRequest = {
  bookId: string;
  address: QuoteAddressInput;
  phone: string;
  name: string;
  email: string;
  quantity: number;
  shippingOption?: string;
  currency?: CurrencyCode;
};

export type QuoteCosts = {
  product: number;
  shipping: number;
  fulfillment: number;
  handling: number;
  subtotal: number;
  tax: number;
  total: number;
};

export type QuoteResponse = {
  quoteId: string;
  expiresAt: string;
  book: {
    id: string;
    title: string;
  };
  pricing: {
    currency: CurrencyCode;
    baseUnitPrice: number;
    effectiveUnitPrice: number;
    sale: boolean;
    discount: number;
  };
  shippingMethod: string;
  address: {
    line1: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  customer: {
    name: string;
    email: string;
  };
  costs: QuoteCosts;
  quantity: number;
  currency: CurrencyCode;
};

export type CreateCheckoutRequest = {
  quoteId: string;
};

export type CheckoutResponse = {
  orderId: string;
  paypalOrderId: string;
  paypalStatus: string;
  approveUrl: string;
  orderStatus: OrderStatus;
};

export type CaptureRequest = {
  orderId?: string;
  lulu?: {
    contactEmail?: string;
    phoneNumber?: string;
    phone?: string;
    phone_number?: string;
    shippingLevel?: string;
    lineItems?: Array<{
      external_id: string;
      title: string;
      cover?: string;
      interior?: string;
      quantity: number;
      pod_package_id?: string;
    }>;
  };
};

export type CaptureResponse = {
  order: {
    id: string;
    status: OrderStatus;
    paypalOrderId: string;
    paypalCaptureId?: string;
    customer: {
      name: string;
      email: string;
    };
    shippingAddress: {
      line1: string;
      city: string;
      postalCode: string;
      country: string;
      state?: string;
      phoneNumber?: string;
    };
    luluJobId?: string;
  };
  paypalCaptureStatus: string;
  luluStatus?: string;
};

export type ApiError = {
  status?: number;
  message: string;
  details?: unknown;
};
