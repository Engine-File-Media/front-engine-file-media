export type FormState = {
  quantity: number;
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  recipientTaxId: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isBusiness: boolean;
  isPostbox: boolean;
  phone: string;
  shippingOption: string;
};

export type FieldErrors = Partial<Record<keyof FormState, string>>;
