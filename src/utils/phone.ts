import { AsYouType, getCountryCallingCode, type CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';

const isoCountryCodePattern = /^[A-Z]{2}$/;
const luluPhonePattern = /^\+?[\d\s\-./()]{8,20}$/;

const toCountryCode = (value: string): CountryCode | undefined => {
  const candidate = value.trim().toUpperCase();
  if (!isoCountryCodePattern.test(candidate)) {
    return undefined;
  }
  return candidate as CountryCode;
};

export const formatPhoneForInput = (value: string, country: string) => {
  const countryCode = toCountryCode(country);
  if (value.trim().startsWith('+')) {
    return new AsYouType().input(value);
  }
  if (!countryCode) {
    return value;
  }
  return new AsYouType(countryCode).input(value);
};

export const normalizePhoneToE164 = (value: string, country: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const countryCode = toCountryCode(country);
  const parsed = countryCode
    ? parsePhoneNumberFromString(trimmed, countryCode)
    : parsePhoneNumberFromString(trimmed);

  if (!parsed || !parsed.isValid()) {
    return '';
  }

  return parsed.number;
};

export const getPhonePlaceholderByCountry = (country: string) => {
  const countryCode = country.trim().toUpperCase();
  if (countryCode === 'CL') return '9 7512 3456';
  if (countryCode === 'BR') return '(11) 91234-5678';
  if (countryCode === 'MX') return '55 1234 5678';
  if (countryCode === 'US' || countryCode === 'CA') return '(844) 212-0689';
  return '555 123 4567';
};

export const getPhoneDialCodeByCountry = (country: string) => {
  const countryCode = toCountryCode(country);
  if (!countryCode) {
    return '';
  }

  try {
    return `+${getCountryCallingCode(countryCode)}`;
  } catch {
    return '';
  }
};

export const composePhoneWithDialCode = (value: string, country: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return '';
  }

  if (trimmedValue.startsWith('+')) {
    return trimmedValue;
  }

  const dialCode = getPhoneDialCodeByCountry(country);
  if (!dialCode) {
    return trimmedValue;
  }

  return `${dialCode} ${trimmedValue}`;
};

export const isLuluPhonePatternValid = (value: string, country: string) => {
  const withDialCode = composePhoneWithDialCode(value, country);
  if (!withDialCode) {
    return false;
  }

  return luluPhonePattern.test(withDialCode);
};

export const getPhoneInputMaxLengthByCountry = (country: string) => {
  const countryCode = toCountryCode(country);
  if (!countryCode) {
    return getPhonePlaceholderByCountry(country).length;
  }

  // Feed enough digits so AsYouType reaches the country's formatting template.
  const formatter = new AsYouType(countryCode);
  formatter.input('999999999999999');
  const template = formatter.getTemplate();

  if (!template) {
    return getPhonePlaceholderByCountry(country).length;
  }

  return template.length;
};
