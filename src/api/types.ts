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

export type PurchaseSessionState =
  | 'session_created'
  | 'quote_created'
  | 'checkout_created'
  | 'capture_pending'
  | 'captured'
  | string;

export type PurchaseSessionResponse = {
  sessionId: string;
  state: PurchaseSessionState;
  expiresAt: string;
  allowedBookId?: string;
};

export type Country = {
  code: string;
  name: string;
};

export type Subdivision = {
  code: string;
  name: string;
};

export type CountryMetadata = {
  requiresState: boolean;
  stateLabel: string;
  postalCodeLabel: string;
  supportsPostalCode: boolean;
  requiresRecipientTaxId: boolean;
  recipientTaxIdLabel: string;
};

export type AddressMetadataResponse = {
  countries: Country[];
  fields: CountryMetadata & { countryCode: string };
  subdivisions: Subdivision[];
};

export type QuoteAddressInput = {
  name?: string;
  organization?: string;
  title?: 'MR' | 'MISS' | 'MRS' | 'MS' | 'DR';
  email?: string;
  isBusiness?: boolean;
  isPostbox?: boolean;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  state?: string;
  recipientTaxId?: string;
};

export type CreateQuoteRequest = {
  bookId: string;
  address: QuoteAddressInput;
  // Valid phone for shipping country. Prefer E.164 (e.g. +569750804180).
  phone: string;
  name: string;
  email: string;
  quantity: number;
  shippingOption?: string;
  currency?: CurrencyCode;
};

export type CreateShippingOptionsRequest = {
  bookId: string;
  address: QuoteAddressInput;
  quantity: number;
  currency?: CurrencyCode;
};

export type QuoteCosts = {
  product: number;
  shipping: number;
  fulfillment: number;
  handling: number;
  subtotal: number;
  subtotalExclTax?: number;
  tax: number;
  totalExclTax?: number;
  totalInclTax?: number;
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
    name?: string;
    organization?: string;
    title?: 'MR' | 'MISS' | 'MRS' | 'MS' | 'DR';
    email?: string;
    isBusiness?: boolean;
    isPostbox?: boolean;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    recipientTaxId?: string;
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

export type ShippingOption = {
  id: number;
  level: string;
  currency: CurrencyCode;
  costExclTax: string;
  minDeliveryDate: string;
  maxDeliveryDate: string;
  minDispatchDate: string;
  maxDispatchDate: string;
  totalDaysMin: number;
  totalDaysMax: number;
  transitTime: number;
  traceable: boolean;
  postboxOk: boolean;
  businessOnly: boolean;
  homeOnly: boolean;
};

export type ShippingOptionsResponse = {
  quoteId?: string;
  currency: CurrencyCode;
  shippingOptions: ShippingOption[];
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
    // Canonical phone value sent to Lulu. Prefer E.164.
    phoneNumber?: string;
    shippingLevel?: string;
    shippingAddress?: {
      name?: string;
      organization?: string;
      title?: 'MR' | 'MISS' | 'MRS' | 'MS' | 'DR';
      email?: string;
      isBusiness?: boolean;
      isPostbox?: boolean;
      line1?: string;
      line2?: string;
      city?: string;
      stateCode?: string;
      postcode?: string;
      countryCode?: string;
      recipientTaxId?: string;
    };
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

export type ApiErrorDetails = {
  code?: string;
  retryable?: boolean;
  [key: string]: unknown;
};

export type ApiError = {
  status?: number;
  message: string;
  details?: ApiErrorDetails;
};
