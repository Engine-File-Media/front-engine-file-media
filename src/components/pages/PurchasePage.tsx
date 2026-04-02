import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import bookMockupCovers from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/BOOK-MOCKUP-COVERS.webp';
import indiceImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/INDICE.webp';
import capituloAudiImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/CAPITULO AUDI.webp';
import introduccionImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/introduccion.webp';
import toyotaCelicaImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/TOYOTA-CELICA-ST205.webp';
import { createCheckout, createQuote, getBooksPricing, getShippingOptions } from '../../api/payments';
import type { ApiError, BookPricing, QuoteResponse, ShippingOption } from '../../api/types';
import { savePurchaseState } from '../../utils/storage';

const shippingInputClasses =
  'h-11 w-full border border-black/20 bg-white px-3 text-[14px] text-[#0A0A0A] outline-none transition-colors focus:border-black/45';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const defaultBookId = 'volume-i';
const maxQuantity = 50;

const luluCountries = [
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'AS', label: 'American Samoa' },
  { code: 'AU', label: 'Australia' },
  { code: 'BR', label: 'Brazil' },
  { code: 'CA', label: 'Canada' },
  { code: 'CN', label: 'China' },
  { code: 'CO', label: 'Colombia' },
  { code: 'CR', label: 'Costa Rica' },
  { code: 'KY', label: 'Cayman Islands' },
  { code: 'ES', label: 'Spain' },
  { code: 'FM', label: 'Micronesia' },
  { code: 'HK', label: 'Hong Kong' },
  { code: 'HN', label: 'Honduras' },
  { code: 'ID', label: 'Indonesia' },
  { code: 'IN', label: 'India' },
  { code: 'IQ', label: 'Iraq' },
  { code: 'IT', label: 'Italy' },
  { code: 'JM', label: 'Jamaica' },
  { code: 'JP', label: 'Japan' },
  { code: 'KN', label: 'Saint Kitts and Nevis' },
  { code: 'KR', label: 'Korea' },
  { code: 'MX', label: 'Mexico' },
  { code: 'MH', label: 'Marshall Islands' },
  { code: 'MP', label: 'Northern Mariana Islands' },
  { code: 'NR', label: 'Nauru' },
  { code: 'PW', label: 'Palau' },
  { code: 'PG', label: 'Papua New Guinea' },
  { code: 'PF', label: 'French Polynesia' },
  { code: 'RU', label: 'Russian Federation' },
  { code: 'SV', label: 'El Salvador' },
  { code: 'SO', label: 'Somalia' },
  { code: 'TW', label: 'Taiwan' },
  { code: 'UM', label: 'United States Minor Outlying Islands' },
  { code: 'US', label: 'United States' },
  { code: 'VE', label: 'Venezuela' },
  { code: 'VI', label: 'Virgin Islands, U.S.' },
] as const;

const countriesRequiringStateCode = new Set<string>(['US', 'CA', 'AU', 'BR', 'MX', 'IN', 'CN', 'JP']);
const stateCodePattern = /^[A-Z0-9-]{1,10}$/;
const phoneDashedPattern = /^\d{3}-\d{3}-\d{4}$/;

type SubdivisionOption = {
  code: string;
  name: string;
};

const isoSubdivisionsByCountry: Record<string, readonly SubdivisionOption[]> = {
  US: [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' },
  ],
  MX: [
    { code: 'AGU', name: 'Aguascalientes' },
    { code: 'BCN', name: 'Baja California' },
    { code: 'BCS', name: 'Baja California Sur' },
    { code: 'CAM', name: 'Campeche' },
    { code: 'CHH', name: 'Chihuahua' },
    { code: 'CHP', name: 'Chiapas' },
    { code: 'CMX', name: 'Ciudad de Mexico' },
    { code: 'COA', name: 'Coahuila' },
    { code: 'COL', name: 'Colima' },
    { code: 'DUR', name: 'Durango' },
    { code: 'GRO', name: 'Guerrero' },
    { code: 'GUA', name: 'Guanajuato' },
    { code: 'HID', name: 'Hidalgo' },
    { code: 'JAL', name: 'Jalisco' },
    { code: 'MEX', name: 'Estado de Mexico' },
    { code: 'MIC', name: 'Michoacan' },
    { code: 'MOR', name: 'Morelos' },
    { code: 'NAY', name: 'Nayarit' },
    { code: 'NLE', name: 'Nuevo Leon' },
    { code: 'OAX', name: 'Oaxaca' },
    { code: 'PUE', name: 'Puebla' },
    { code: 'QUE', name: 'Queretaro' },
    { code: 'ROO', name: 'Quintana Roo' },
    { code: 'SIN', name: 'Sinaloa' },
    { code: 'SLP', name: 'San Luis Potosi' },
    { code: 'SON', name: 'Sonora' },
    { code: 'TAB', name: 'Tabasco' },
    { code: 'TAM', name: 'Tamaulipas' },
    { code: 'TLA', name: 'Tlaxcala' },
    { code: 'VER', name: 'Veracruz' },
    { code: 'YUC', name: 'Yucatan' },
    { code: 'ZAC', name: 'Zacatecas' },
  ],
  BR: [
    { code: 'AC', name: 'Acre' },
    { code: 'AL', name: 'Alagoas' },
    { code: 'AP', name: 'Amapa' },
    { code: 'AM', name: 'Amazonas' },
    { code: 'BA', name: 'Bahia' },
    { code: 'CE', name: 'Ceara' },
    { code: 'DF', name: 'Distrito Federal' },
    { code: 'ES', name: 'Espirito Santo' },
    { code: 'GO', name: 'Goias' },
    { code: 'MA', name: 'Maranhao' },
    { code: 'MT', name: 'Mato Grosso' },
    { code: 'MS', name: 'Mato Grosso do Sul' },
    { code: 'MG', name: 'Minas Gerais' },
    { code: 'PA', name: 'Para' },
    { code: 'PB', name: 'Paraiba' },
    { code: 'PR', name: 'Parana' },
    { code: 'PE', name: 'Pernambuco' },
    { code: 'PI', name: 'Piaui' },
    { code: 'RJ', name: 'Rio de Janeiro' },
    { code: 'RN', name: 'Rio Grande do Norte' },
    { code: 'RS', name: 'Rio Grande do Sul' },
    { code: 'RO', name: 'Rondonia' },
    { code: 'RR', name: 'Roraima' },
    { code: 'SC', name: 'Santa Catarina' },
    { code: 'SP', name: 'Sao Paulo' },
    { code: 'SE', name: 'Sergipe' },
    { code: 'TO', name: 'Tocantins' },
  ],
  CA: [
    { code: 'AB', name: 'Alberta' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'NT', name: 'Northwest Territories' },
    { code: 'NU', name: 'Nunavut' },
    { code: 'ON', name: 'Ontario' },
    { code: 'PE', name: 'Prince Edward Island' },
    { code: 'QC', name: 'Quebec' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'YT', name: 'Yukon' },
  ],
  AU: [
    { code: 'ACT', name: 'Australian Capital Territory' },
    { code: 'NSW', name: 'New South Wales' },
    { code: 'NT', name: 'Northern Territory' },
    { code: 'QLD', name: 'Queensland' },
    { code: 'SA', name: 'South Australia' },
    { code: 'TAS', name: 'Tasmania' },
    { code: 'VIC', name: 'Victoria' },
    { code: 'WA', name: 'Western Australia' },
  ],
  ES: [
    { code: 'AN', name: 'Andalucia' },
    { code: 'AR', name: 'Aragon' },
    { code: 'AS', name: 'Asturias' },
    { code: 'IB', name: 'Balearic Islands' },
    { code: 'CN', name: 'Canary Islands' },
    { code: 'CB', name: 'Cantabria' },
    { code: 'CL', name: 'Castile and Leon' },
    { code: 'CM', name: 'Castilla-La Mancha' },
    { code: 'CT', name: 'Catalonia' },
    { code: 'CE', name: 'Ceuta' },
    { code: 'EX', name: 'Extremadura' },
    { code: 'GA', name: 'Galicia' },
    { code: 'RI', name: 'La Rioja' },
    { code: 'MD', name: 'Madrid' },
    { code: 'ML', name: 'Melilla' },
    { code: 'MC', name: 'Murcia' },
    { code: 'NC', name: 'Navarre' },
    { code: 'PV', name: 'Basque Country' },
    { code: 'VC', name: 'Valencian Community' },
  ],
  IT: [
    { code: 'ABR', name: 'Abruzzo' },
    { code: 'BAS', name: 'Basilicata' },
    { code: 'CAL', name: 'Calabria' },
    { code: 'CAM', name: 'Campania' },
    { code: 'EMR', name: 'Emilia-Romagna' },
    { code: 'FVG', name: 'Friuli Venezia Giulia' },
    { code: 'LAZ', name: 'Lazio' },
    { code: 'LIG', name: 'Liguria' },
    { code: 'LOM', name: 'Lombardy' },
    { code: 'MAR', name: 'Marche' },
    { code: 'MOL', name: 'Molise' },
    { code: 'PMN', name: 'Piedmont' },
    { code: 'PUG', name: 'Apulia' },
    { code: 'SAR', name: 'Sardinia' },
    { code: 'SIC', name: 'Sicily' },
    { code: 'TOS', name: 'Tuscany' },
    { code: 'TAA', name: 'Trentino-Alto Adige' },
    { code: 'UMB', name: 'Umbria' },
    { code: 'VDA', name: 'Aosta Valley' },
    { code: 'VEN', name: 'Veneto' },
  ],
  JP: [
    { code: '01', name: 'Hokkaido' },
    { code: '02', name: 'Aomori' },
    { code: '03', name: 'Iwate' },
    { code: '04', name: 'Miyagi' },
    { code: '05', name: 'Akita' },
    { code: '06', name: 'Yamagata' },
    { code: '07', name: 'Fukushima' },
    { code: '08', name: 'Ibaraki' },
    { code: '09', name: 'Tochigi' },
    { code: '10', name: 'Gunma' },
    { code: '11', name: 'Saitama' },
    { code: '12', name: 'Chiba' },
    { code: '13', name: 'Tokyo' },
    { code: '14', name: 'Kanagawa' },
    { code: '15', name: 'Niigata' },
    { code: '16', name: 'Toyama' },
    { code: '17', name: 'Ishikawa' },
    { code: '18', name: 'Fukui' },
    { code: '19', name: 'Yamanashi' },
    { code: '20', name: 'Nagano' },
    { code: '21', name: 'Gifu' },
    { code: '22', name: 'Shizuoka' },
    { code: '23', name: 'Aichi' },
    { code: '24', name: 'Mie' },
    { code: '25', name: 'Shiga' },
    { code: '26', name: 'Kyoto' },
    { code: '27', name: 'Osaka' },
    { code: '28', name: 'Hyogo' },
    { code: '29', name: 'Nara' },
    { code: '30', name: 'Wakayama' },
    { code: '31', name: 'Tottori' },
    { code: '32', name: 'Shimane' },
    { code: '33', name: 'Okayama' },
    { code: '34', name: 'Hiroshima' },
    { code: '35', name: 'Yamaguchi' },
    { code: '36', name: 'Tokushima' },
    { code: '37', name: 'Kagawa' },
    { code: '38', name: 'Ehime' },
    { code: '39', name: 'Kochi' },
    { code: '40', name: 'Fukuoka' },
    { code: '41', name: 'Saga' },
    { code: '42', name: 'Nagasaki' },
    { code: '43', name: 'Kumamoto' },
    { code: '44', name: 'Oita' },
    { code: '45', name: 'Miyazaki' },
    { code: '46', name: 'Kagoshima' },
    { code: '47', name: 'Okinawa' },
  ],
  IN: [
    { code: 'AN', name: 'Andaman and Nicobar Islands' },
    { code: 'AP', name: 'Andhra Pradesh' },
    { code: 'AR', name: 'Arunachal Pradesh' },
    { code: 'AS', name: 'Assam' },
    { code: 'BR', name: 'Bihar' },
    { code: 'CH', name: 'Chandigarh' },
    { code: 'CT', name: 'Chhattisgarh' },
    { code: 'DH', name: 'Dadra and Nagar Haveli and Daman and Diu' },
    { code: 'DL', name: 'Delhi' },
    { code: 'GA', name: 'Goa' },
    { code: 'GJ', name: 'Gujarat' },
    { code: 'HP', name: 'Himachal Pradesh' },
    { code: 'HR', name: 'Haryana' },
    { code: 'JH', name: 'Jharkhand' },
    { code: 'JK', name: 'Jammu and Kashmir' },
    { code: 'KA', name: 'Karnataka' },
    { code: 'KL', name: 'Kerala' },
    { code: 'LA', name: 'Ladakh' },
    { code: 'LD', name: 'Lakshadweep' },
    { code: 'MH', name: 'Maharashtra' },
    { code: 'ML', name: 'Meghalaya' },
    { code: 'MN', name: 'Manipur' },
    { code: 'MP', name: 'Madhya Pradesh' },
    { code: 'MZ', name: 'Mizoram' },
    { code: 'NL', name: 'Nagaland' },
    { code: 'OD', name: 'Odisha' },
    { code: 'PB', name: 'Punjab' },
    { code: 'PY', name: 'Puducherry' },
    { code: 'RJ', name: 'Rajasthan' },
    { code: 'SK', name: 'Sikkim' },
    { code: 'TG', name: 'Telangana' },
    { code: 'TN', name: 'Tamil Nadu' },
    { code: 'TR', name: 'Tripura' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'UT', name: 'Uttarakhand' },
    { code: 'WB', name: 'West Bengal' },
  ],
  CN: [
    { code: '11', name: 'Beijing' },
    { code: '12', name: 'Tianjin' },
    { code: '13', name: 'Hebei' },
    { code: '14', name: 'Shanxi' },
    { code: '15', name: 'Inner Mongolia' },
    { code: '21', name: 'Liaoning' },
    { code: '22', name: 'Jilin' },
    { code: '23', name: 'Heilongjiang' },
    { code: '31', name: 'Shanghai' },
    { code: '32', name: 'Jiangsu' },
    { code: '33', name: 'Zhejiang' },
    { code: '34', name: 'Anhui' },
    { code: '35', name: 'Fujian' },
    { code: '36', name: 'Jiangxi' },
    { code: '37', name: 'Shandong' },
    { code: '41', name: 'Henan' },
    { code: '42', name: 'Hubei' },
    { code: '43', name: 'Hunan' },
    { code: '44', name: 'Guangdong' },
    { code: '45', name: 'Guangxi' },
    { code: '46', name: 'Hainan' },
    { code: '50', name: 'Chongqing' },
    { code: '51', name: 'Sichuan' },
    { code: '52', name: 'Guizhou' },
    { code: '53', name: 'Yunnan' },
    { code: '54', name: 'Xizang' },
    { code: '61', name: 'Shaanxi' },
    { code: '62', name: 'Gansu' },
    { code: '63', name: 'Qinghai' },
    { code: '64', name: 'Ningxia' },
    { code: '65', name: 'Xinjiang' },
  ],
};

const defaultCountryUi = {
  phoneCode: '+',
  phoneExample: '123 456 789',
  stateLabel: 'State / Province',
  statePlaceholder: 'CA, SP, NSW',
  addressLabel: 'Address',
  addressPlaceholder: 'Street and number',
  postalLabel: 'Postal code',
  postalPlaceholder: 'Postal code',
};

const countryUiOverrides: Record<string, Partial<typeof defaultCountryUi>> = {
  AE: { phoneCode: '+971' },
  AS: { phoneCode: '+1' },
  AU: { phoneCode: '+61' },
  BR: { phoneCode: '+55', postalLabel: 'CEP', postalPlaceholder: '01310-100' },
  CA: { phoneCode: '+1', postalPlaceholder: 'M5V 2T6' },
  CN: { phoneCode: '+86' },
  CO: { phoneCode: '+57' },
  CR: { phoneCode: '+506' },
  ES: { phoneCode: '+34', postalPlaceholder: '28001' },
  FM: { phoneCode: '+691' },
  HK: { phoneCode: '+852' },
  HN: { phoneCode: '+504' },
  ID: { phoneCode: '+62' },
  IN: { phoneCode: '+91' },
  IQ: { phoneCode: '+964' },
  IT: { phoneCode: '+39' },
  JM: { phoneCode: '+1' },
  JP: { phoneCode: '+81' },
  KN: { phoneCode: '+1' },
  KR: { phoneCode: '+82' },
  KY: { phoneCode: '+1' },
  MH: { phoneCode: '+692' },
  MP: { phoneCode: '+1' },
  MX: { phoneCode: '+52' },
  NR: { phoneCode: '+674' },
  PF: { phoneCode: '+689' },
  PG: { phoneCode: '+675' },
  PW: { phoneCode: '+680' },
  RU: { phoneCode: '+7' },
  SO: { phoneCode: '+252' },
  SV: { phoneCode: '+503' },
  TW: { phoneCode: '+886' },
  UM: { phoneCode: '+1' },
  US: { phoneCode: '+1', postalLabel: 'ZIP code', postalPlaceholder: '90210', statePlaceholder: 'CA' },
  VE: { phoneCode: '+58' },
  VI: { phoneCode: '+1' },
};

const galleryImages = [
  { src: bookMockupCovers, alt: 'Volume I - Book mockup covers' },
  { src: indiceImage, alt: 'Volume I - Indice spread' },
  { src: capituloAudiImage, alt: 'Volume I - Audi chapter spread' },
  { src: introduccionImage, alt: 'Volume I - Introduction spread' },
  { src: toyotaCelicaImage, alt: 'Volume I - Toyota Celica ST205 spread' },
];

type FormState = {
  quantity: number;
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  shippingOption: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const formatMoney = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);

const clampQuantity = (value: number) => Math.min(maxQuantity, Math.max(1, value));
const normalizePhoneToDashed = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 10) {
    return value.trim();
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

function PurchasePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookPricing | null>(null);
  const [isPricingLoading, setIsPricingLoading] = useState(true);
  const [form, setForm] = useState<FormState>({
    quantity: 1,
    email: '',
    firstName: '',
    lastName: '',
    address1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
    shippingOption: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [lastQuotedFingerprint, setLastQuotedFingerprint] = useState<string | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isShippingOptionsLoading, setIsShippingOptionsLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [apiError, setApiError] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const selectedCountry = {
    ...defaultCountryUi,
    ...(countryUiOverrides[form.country] ?? {}),
  };
  const selectedCountryLabel =
    luluCountries.find((country) => country.code === form.country)?.label ?? 'Selected country';
  const requiresStateCode = countriesRequiringStateCode.has(form.country);
  const selectedSubdivisionCatalog = isoSubdivisionsByCountry[form.country] ?? null;
  const normalizedPhone = useMemo(() => {
    return normalizePhoneToDashed(form.phone);
  }, [form.phone]);

  useEffect(() => {
    const loadPricing = async () => {
      console.log('[PurchasePage] Loading book pricing...');
      try {
        const response = await getBooksPricing();
        const match =
          response.books.find((book) => book.id === defaultBookId) ??
          response.books[0] ??
          null;
        console.log('[PurchasePage] Book pricing loaded:', {
          bookId: match?.id,
          price: match?.price,
          currency: match?.currency,
        });
        setSelectedBook(match);
      } catch (error) {
        const parsedError = error as ApiError;
        console.error('[PurchasePage] Failed to load pricing:', {
          message: parsedError.message,
          status: parsedError.status,
        });
        setApiError(parsedError.message || 'Unable to load pricing.');
      } finally {
        setIsPricingLoading(false);
      }
    };

    void loadPricing();
  }, []);

  const quoteFingerprint = useMemo(
    () =>
      JSON.stringify({
        bookId: selectedBook?.id ?? defaultBookId,
        quantity: form.quantity,
        email: form.email.trim().toLowerCase(),
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        phone: normalizedPhone,
        line1: form.address1.trim(),
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
        postalCode: form.postalCode.trim(),
        country: form.country,
        shippingOption: form.shippingOption,
      }),
    [form, normalizedPhone, selectedBook?.id],
  );

  const displayCurrency = quote?.currency ?? selectedBook?.currency ?? 'USD';
  const unitBasePrice = quote?.pricing.baseUnitPrice ?? selectedBook?.price ?? selectedBook?.effectivePrice ?? 0;
  const unitEffectivePrice =
    quote?.pricing.effectiveUnitPrice ?? selectedBook?.effectivePrice ?? selectedBook?.price ?? 0;
  const saleActive =
    Boolean(quote?.pricing.sale ?? selectedBook?.sale) &&
    (quote?.pricing.discount ?? selectedBook?.discount ?? 0) > 0 &&
    unitBasePrice > unitEffectivePrice;
  const discountPercent = quote?.pricing.discount ?? selectedBook?.discount ?? 0;
  const fallbackProduct = unitEffectivePrice * form.quantity;
  const summaryProduct = quote?.costs.product ?? fallbackProduct;
  const summaryShipping = quote?.costs.shipping ?? 0;
  const summaryFulfillment = quote?.costs.fulfillment ?? 0;
  const summaryHandling = quote?.costs.handling ?? 0;
  const fallbackSubtotal = summaryProduct + summaryShipping + summaryFulfillment + summaryHandling;
  const summarySubtotalExclTax = quote?.costs.subtotalExclTax ?? quote?.costs.subtotal ?? fallbackSubtotal;
  const summaryTax = quote?.costs.tax ?? 0;
  const summaryTotalExclTax = quote?.costs.totalExclTax ?? summarySubtotalExclTax;
  const summaryTotalInclTax = quote?.costs.totalInclTax ?? quote?.costs.total ?? summaryTotalExclTax + summaryTax;
  const summaryTotal = quote?.costs.total ?? summaryTotalInclTax;
  const summaryDiscount = saleActive ? Math.max(unitBasePrice - unitEffectivePrice, 0) * form.quantity : 0;

  const increaseQuantity = () => {
    updateField('quantity', clampQuantity(form.quantity + 1));
  };

  const decreaseQuantity = () => {
    updateField('quantity', clampQuantity(form.quantity - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {};

    if (!form.email.trim() || !emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!form.firstName.trim()) {
      nextErrors.firstName = 'First name is required.';
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = 'Last name is required.';
    }

    if (!form.address1.trim()) {
      nextErrors.address1 = 'Address is required.';
    }

    if (!form.city.trim()) {
      nextErrors.city = 'City is required.';
    }

    if (!form.postalCode.trim()) {
      nextErrors.postalCode = 'Postal code is required.';
    }

    if (requiresStateCode && !form.state.trim()) {
      nextErrors.state = 'State/Province code is required for this destination.';
    }

    const normalizedState = form.state.trim().toUpperCase();
    if (normalizedState && selectedSubdivisionCatalog) {
      const isKnownSubdivision = selectedSubdivisionCatalog.some((item) => item.code === normalizedState);
      if (!isKnownSubdivision) {
        nextErrors.state = `Use a valid ISO-3166-2 code for ${selectedCountryLabel}.`;
      }
    } else if (normalizedState && !stateCodePattern.test(normalizedState)) {
      nextErrors.state = 'Use a valid state/province code (letters, numbers, hyphen).';
    }

    if (!form.country.trim()) {
      nextErrors.country = 'Country is required.';
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone is required.';
    } else if (!phoneDashedPattern.test(normalizedPhone)) {
      nextErrors.phone = 'Phone must use format XXX-XXX-XXXX.';
    }

    if (!Number.isFinite(form.quantity) || form.quantity < 1 || form.quantity > maxQuantity) {
      nextErrors.quantity = `Quantity must be between 1 and ${maxQuantity}.`;
    }

    setErrors(nextErrors);
    const isValid = Object.keys(nextErrors).length === 0;
    
    if (!isValid) {
      console.warn('[PurchasePage] Form validation failed:', {
        failedFields: Object.keys(nextErrors),
        errors: nextErrors,
      });
    } else {
      console.log('[PurchasePage] Form validation passed');
    }
    
    return isValid;
  };

  const canRequestShippingOptions =
    Boolean(selectedBook?.id) &&
    Number.isFinite(form.quantity) &&
    form.quantity > 0 &&
    Boolean(form.address1.trim()) &&
    Boolean(form.city.trim()) &&
    Boolean(form.postalCode.trim()) &&
    Boolean(form.country.trim()) &&
    (!requiresStateCode || Boolean(form.state.trim()));

  const requestShippingOptions = useCallback(async () => {
    if (!canRequestShippingOptions || !selectedBook) {
      return;
    }

    setApiError('');
    setIsShippingOptionsLoading(true);

    try {
      const trimmedState = form.state.trim();
      const response = await getShippingOptions({
        bookId: selectedBook.id,
        address: {
          line1: form.address1.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country,
          ...(trimmedState ? { state: trimmedState.toUpperCase() } : {}),
        },
        quantity: form.quantity,
        currency: selectedBook.currency,
      });

      const fetchedOptions = response.shippingOptions;
      setShippingOptions(fetchedOptions);

      if (fetchedOptions.length > 0 && !fetchedOptions.some((option) => option.level === form.shippingOption)) {
        updateField('shippingOption', fetchedOptions[0].level);
      }
    } catch (error) {
      const parsedError = error as ApiError;
      console.error('[PurchasePage] Shipping options request failed:', {
        message: parsedError.message,
        status: parsedError.status,
        details: parsedError.details,
        requestData: { country: form.country, quantity: form.quantity },
      });
      setShippingOptions([]);
      updateField('shippingOption', '');
      setApiError(parsedError.message || 'Unable to load shipping options.');
    } finally {
      setIsShippingOptionsLoading(false);
    }
  }, [
    canRequestShippingOptions,
    form.address1,
    form.city,
    form.country,
    form.postalCode,
    form.quantity,
    form.shippingOption,
    form.state,
    selectedBook,
  ]);

  useEffect(() => {
    if (!canRequestShippingOptions) {
      setShippingOptions([]);
      if (form.shippingOption) {
        updateField('shippingOption', '');
      }
      return;
    }

    const timer = window.setTimeout(() => {
      void requestShippingOptions();
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    canRequestShippingOptions,
    form.shippingOption,
    requestShippingOptions,
  ]);

  const requestQuote = async () => {
    if (!validateForm()) {
      return null;
    }

    if (!form.shippingOption) {
      setErrors((prev) => ({ ...prev, shippingOption: 'Select a shipping option.' }));
      return null;
    }

    setApiError('');
    setNotice('');
    setIsQuoteLoading(true);

    try {
      const trimmedState = form.state.trim();
      const quoteResponse = await createQuote({
        bookId: selectedBook?.id ?? defaultBookId,
        address: {
          line1: form.address1.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country,
          ...(trimmedState ? { state: trimmedState.toUpperCase() } : {}),
        },
        phone: normalizedPhone,
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.trim(),
        quantity: form.quantity,
        shippingOption: form.shippingOption,
        currency: displayCurrency,
      });

      console.log('[PurchasePage] Quote created successfully:', {
        quoteId: quoteResponse.quoteId,
        total: quoteResponse.costs.total,
      });
      setQuote(quoteResponse);
      setLastQuotedFingerprint(quoteFingerprint);
      setNotice('Quote generated successfully. You can continue to PayPal.');
      return quoteResponse;
    } catch (error) {
      const parsedError = error as ApiError;
      console.error('[PurchasePage] Quote creation failed:', {
        message: parsedError.message,
        status: parsedError.status,
        details: parsedError.details,
      });
      setApiError(parsedError.message || 'Unable to calculate quote.');
      return null;
    } finally {
      setIsQuoteLoading(false);
    }
  };

  const handleCheckoutSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('[PurchasePage] Checkout submit initiated');

    if (isCheckoutLoading) {
      return;
    }

    setApiError('');
    setNotice('');

    let activeQuote = quote;
    if (!activeQuote || lastQuotedFingerprint !== quoteFingerprint) {
      console.log('[PurchasePage] Requesting fresh quote before checkout');
      activeQuote = await requestQuote();
    }

    if (!activeQuote) {
      console.warn('[PurchasePage] No active quote after requestQuote');
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const checkout = await createCheckout(activeQuote.quoteId);
      console.log('[PurchasePage] Checkout created successfully:', {
        quoteId: activeQuote.quoteId,
        paypalOrderId: checkout.paypalOrderId,
      });
      savePurchaseState({
        quoteId: activeQuote.quoteId,
        orderId: checkout.orderId,
        paypalOrderId: checkout.paypalOrderId,
      });
      window.location.assign(checkout.approveUrl);
    } catch (error) {
      const parsedError = error as ApiError;
      console.error('[PurchasePage] Checkout creation failed:', {
        message: parsedError.message,
        status: parsedError.status,
        details: parsedError.details,
        quoteId: activeQuote.quoteId,
      });
      setApiError(parsedError.message || 'Unable to start PayPal checkout.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <main className="w-full bg-white">
      <section className="border-b border-black/10 bg-[#F8F8F6]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-10 md:px-10 md:py-14 xl:px-12">
          <p
            className="text-[12px] font-semibold tracking-[2px] text-[#0A0A0A]/60 uppercase"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Checkout
          </p>
          <h1
            className="text-[35px] leading-[95%] text-[#0A0A0A] md:text-[44px]"
            style={{ fontFamily: 'Crimson Text, serif' }}
          >
            Purchase Volume I
          </h1>
          <p
            className="max-w-3xl text-[16px] leading-[135%] text-[#0A0A0A]/70"
            style={{ fontFamily: 'Crimson Text, serif' }}
          >
            Complete your shipping details, calculate the real shipping cost, and continue to PayPal.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 md:py-14 xl:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <form className="space-y-9" noValidate onSubmit={handleCheckoutSubmit}>
            {(apiError || notice) && (
              <section className="border border-black/10 bg-[#F8F8F6] p-4 md:p-5">
                {apiError && (
                  <p className="text-[14px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {apiError}
                  </p>
                )}
                {notice && (
                  <p className="text-[14px] text-[#0A0A0A]/80" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {notice}
                  </p>
                )}
              </section>
            )}

            <section className="border border-black/10 p-5 md:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-black/10 pb-4">
                <h2
                  className="text-[27px] leading-[1.05] text-[#0A0A0A] md:text-[31px]"
                  style={{ fontFamily: 'Crimson Text, serif' }}
                >
                  Order
                </h2>
                <p
                  className="text-[13px] tracking-[1.4px] text-[#0A0A0A]/60 uppercase"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isPricingLoading ? 'Loading price...' : `${displayCurrency} ${unitEffectivePrice.toFixed(2)} each`}
                </p>
              </div>

              {saleActive && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[13px] text-[#0A0A0A]/50 line-through" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formatMoney(unitBasePrice, displayCurrency)}
                  </span>
                  <span className="text-[14px] font-semibold text-[#0A0A0A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formatMoney(unitEffectivePrice, displayCurrency)}
                  </span>
                  <span className="rounded bg-[#F4E7E7] px-2 py-1 text-[11px] font-semibold tracking-[1px] text-[#7A1E1E] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {discountPercent}% OFF
                  </span>
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2" htmlFor="volumeQty">
                  <span
                    className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Quantity
                  </span>
                  <div className="flex h-11 items-center overflow-hidden border border-black/20 bg-white">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      className="h-full w-11 border-r border-black/20 text-[18px] text-[#0A0A0A] transition-colors hover:bg-black/5"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <input
                      id="volumeQty"
                      name="volumeQty"
                      type="number"
                      min={1}
                      max={maxQuantity}
                      inputMode="numeric"
                      className="h-full w-full bg-white px-3 text-center text-[14px] text-[#0A0A0A] outline-none"
                      value={form.quantity}
                      onChange={(event) => {
                        const parsed = Number(event.target.value);
                        if (Number.isNaN(parsed)) {
                          updateField('quantity', 1);
                          return;
                        }
                        updateField('quantity', clampQuantity(parsed));
                      }}
                    />
                    <button
                      type="button"
                      onClick={increaseQuantity}
                      className="h-full w-11 border-l border-black/20 text-[18px] text-[#0A0A0A] transition-colors hover:bg-black/5"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Max {maxQuantity} volumes per order.
                  </span>
                  {errors.quantity && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.quantity}
                    </span>
                  )}
                </label>

                <div className="flex flex-col justify-end border border-black/10 bg-[#FAFAFA] px-4 py-3">
                  <span
                    className="text-[11px] tracking-[1.2px] text-[#0A0A0A]/60 uppercase"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Estimated total
                  </span>
                  <strong
                    className="mt-1 text-[26px] leading-none text-[#0A0A0A]"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                  >
                    {formatMoney(summaryTotal, displayCurrency)}
                  </strong>
                </div>
              </div>
            </section>

            <section className="border border-black/10 p-5 md:p-7">
              <h2
                className="border-b border-black/10 pb-4 text-[27px] leading-[1.05] text-[#0A0A0A] md:text-[31px]"
                style={{ fontFamily: 'Crimson Text, serif' }}
              >
                Contact & Shipping
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="md:col-span-2 flex flex-col gap-2" htmlFor="email">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Email
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={shippingInputClasses}
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                  />
                  {errors.email && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.email}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2" htmlFor="firstName">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    First name
                  </span>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className={shippingInputClasses}
                    placeholder="Name"
                    value={form.firstName}
                    onChange={(event) => updateField('firstName', event.target.value)}
                  />
                  {errors.firstName && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.firstName}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2" htmlFor="lastName">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Last name
                  </span>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className={shippingInputClasses}
                    placeholder="Surname"
                    value={form.lastName}
                    onChange={(event) => updateField('lastName', event.target.value)}
                  />
                  {errors.lastName && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.lastName}
                    </span>
                  )}
                </label>

                <label className="md:col-span-2 flex flex-col gap-2" htmlFor="address1">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {selectedCountry.addressLabel}
                  </span>
                  <input
                    id="address1"
                    name="address1"
                    type="text"
                    className={shippingInputClasses}
                    placeholder={selectedCountry.addressPlaceholder}
                    value={form.address1}
                    onChange={(event) => updateField('address1', event.target.value)}
                  />
                  {errors.address1 && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.address1}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2" htmlFor="city">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    City / Locality
                  </span>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    className={shippingInputClasses}
                    placeholder="City"
                    value={form.city}
                    onChange={(event) => updateField('city', event.target.value)}
                  />
                  {errors.city && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.city}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2" htmlFor="state">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {selectedCountry.stateLabel}
                  </span>
                  {selectedSubdivisionCatalog ? (
                    <select
                      id="state"
                      name="state"
                      className={shippingInputClasses}
                      value={form.state}
                      onChange={(event) => updateField('state', event.target.value)}
                    >
                      <option value="">Select</option>
                      {selectedSubdivisionCatalog.map((subdivision) => (
                        <option key={subdivision.code} value={subdivision.code}>
                          {subdivision.code} - {subdivision.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="state"
                      name="state"
                      type="text"
                      className={shippingInputClasses}
                      placeholder={selectedCountry.statePlaceholder}
                      value={form.state}
                      onChange={(event) => updateField('state', event.target.value.toUpperCase())}
                    />
                  )}
                  {requiresStateCode && (
                    <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Required for {selectedCountryLabel}.
                    </span>
                  )}
                  {errors.state && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.state}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2" htmlFor="postalCode">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {selectedCountry.postalLabel}
                  </span>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    className={shippingInputClasses}
                    placeholder={selectedCountry.postalPlaceholder}
                    value={form.postalCode}
                    onChange={(event) => updateField('postalCode', event.target.value)}
                  />
                  {errors.postalCode && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.postalCode}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2" htmlFor="country">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Country
                  </span>
                  <select
                    id="country"
                    name="country"
                    className={shippingInputClasses}
                    value={form.country}
                    onChange={(event) => {
                      updateField('country', event.target.value);
                      updateField('state', '');
                      setNotice('');
                    }}
                  >
                    {luluCountries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label} ({country.code})
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.country}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-2" htmlFor="phone">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Phone
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={shippingInputClasses}
                    placeholder="555-123-4567"
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                  />
                  <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                    XXX-XXX-XXXX
                  </span>
                  {errors.phone && (
                    <span className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {errors.phone}
                    </span>
                  )}
                </label>

                <label className="md:col-span-2 flex flex-col gap-2" htmlFor="shippingOption">
                  <span className="text-[12px] font-semibold tracking-[1.2px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Shipping method
                  </span>
                  <select
                    id="shippingOption"
                    name="shippingOption"
                    className={shippingInputClasses}
                    value={form.shippingOption}
                    onChange={(event) => updateField('shippingOption', event.target.value)}
                    disabled={isShippingOptionsLoading || shippingOptions.length === 0}
                  >
                    {isShippingOptionsLoading && <option value="">Loading shipping options...</option>}
                    {!isShippingOptionsLoading && shippingOptions.length === 0 && (
                      <option value="">Fill address to load options</option>
                    )}
                    {shippingOptions.map((option) => {
                      const optionPrice = Number(option.costExclTax);
                      const formattedOptionPrice = Number.isNaN(optionPrice)
                        ? `${option.costExclTax} ${option.currency}`
                        : formatMoney(optionPrice, option.currency);
                      const trackingLabel = option.traceable ? 'Trackable' : 'No tracking';
                      const deliveryLabel = `${option.totalDaysMin}-${option.totalDaysMax} business days`;
                      return (
                        <option key={`${option.id}-${option.level}`} value={option.level}>
                          {`${option.level} | ${formattedOptionPrice} | ${trackingLabel} | ${deliveryLabel}`}
                        </option>
                      );
                    })}
                  </select>
                  {shippingOptions.length > 0 && (
                    <span className="text-[11px] text-[#0A0A0A]/55" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Includes estimated delivery and tracking availability per option.
                    </span>
                  )}
                </label>
              </div>

              <div className="mt-5 border border-black/10 bg-[#F9F9F9] px-4 py-3">
                <p className="text-[13px] leading-[1.4] text-[#0A0A0A]/70" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Shipping options are loaded automatically when the address is complete. Generate the quote to see the full cost breakdown.
                </p>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => void requestQuote()}
                  disabled={isPricingLoading || isQuoteLoading || isCheckoutLoading || !form.shippingOption}
                  className="inline-flex w-full items-center justify-center border border-black/15 bg-white px-6 py-3 text-[13px] font-semibold tracking-[1.6px] text-[#0A0A0A] uppercase disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isQuoteLoading ? 'Calculating...' : 'Calculate total with shipping'}
                </button>
              </div>
            </section>
            <section className="border border-black/10 p-5 md:p-7">
              <h2
                className="border-b border-black/10 pb-4 text-[27px] leading-[1.05] text-[#0A0A0A] md:text-[31px]"
                style={{ fontFamily: 'Crimson Text, serif' }}
              >
                Payment
              </h2>

              <div className="mt-5 space-y-4">
                <label className="flex items-center justify-between gap-3 border border-black/20 bg-[#F9F9F9] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" checked readOnly className="h-4 w-4 accent-black" />
                    <span className="text-[16px] text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                      PayPal
                    </span>
                  </div>
                  <span className="rounded bg-[#FFC439] px-3 py-1 text-[12px] font-bold text-[#111]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    PayPal
                  </span>
                </label>

                <div className="border border-black/10 px-4 py-3">
                  <p className="text-[14px] leading-[1.4] text-[#0A0A0A]/70" style={{ fontFamily: 'Crimson Text, serif' }}>
                    You will be redirected to PayPal to complete the payment.
                  </p>
                  {quote && (
                    <p className="mt-2 text-[13px] leading-[1.4] text-[#0A0A0A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Quote ID: {quote.quoteId}
                    </p>
                  )}
                  {quote && lastQuotedFingerprint !== quoteFingerprint && (
                    <p className="mt-2 text-[13px] leading-[1.4] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Form data changed after quote. Checkout will recalculate totals before redirecting.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPricingLoading || isCheckoutLoading || isQuoteLoading}
                  className="inline-flex w-full items-center justify-center border border-[#030213] bg-[#030213] px-6 py-3 text-[13px] font-semibold tracking-[1.6px] text-white uppercase disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isCheckoutLoading ? 'Redirecting...' : 'Continue to PayPal'}
                </button>
              </div>
            </section>
          </form>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section className="border border-black/10 p-5 md:p-6">
              <h3
                className="text-[26px] leading-none text-[#0A0A0A]"
                style={{ fontFamily: 'Crimson Text, serif' }}
              >
                Volume I Gallery
              </h3>

              <p
                className="mt-2 text-[14px] leading-[1.4] text-[#0A0A0A]/70"
                style={{ fontFamily: 'Crimson Text, serif' }}
              >
                Preview of selected spreads and cover mockups.
              </p>

              <div className="mt-5 space-y-3">
                <div className="relative border border-black/10 bg-[#FAFAFA]">
                  <img
                    src={galleryImages[currentImageIndex].src}
                    alt={galleryImages[currentImageIndex].alt}
                    onClick={() => setIsModalOpen(true)}
                    className="h-96 w-full cursor-pointer object-cover transition-opacity hover:opacity-95 md:h-120 xl:h-136"
                  />
                  <button
                    onClick={handlePrevImage}
                    type="button"
                    className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    aria-label="Previous image"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                    aria-label="Next image"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-[12px] text-[#0A0A0A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {currentImageIndex + 1} / {galleryImages.length}
                  </span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    type="button"
                    className="border-b border-black/10 pb-0.5 text-[12px] text-[#0A0A0A]/60 transition-colors hover:border-black/45 hover:text-[#0A0A0A]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    View fullscreen
                  </button>
                </div>
              </div>
            </section>

            <section className="border border-black/10 p-5 md:p-6">
              <h3 className="text-[26px] leading-none text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                Order Summary
              </h3>

              <div className="mt-5 space-y-3 border-b border-black/10 pb-4 text-[14px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#0A0A0A]/70">Volume I x{form.quantity}</span>
                  <span className="text-[#0A0A0A]">{formatMoney(summaryProduct, displayCurrency)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#0A0A0A]/70">Shipping</span>
                  <span className="text-[#0A0A0A]">{formatMoney(summaryShipping, displayCurrency)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#0A0A0A]/70">Fulfillment</span>
                  <span className="text-[#0A0A0A]">{formatMoney(summaryFulfillment, displayCurrency)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#0A0A0A]/70">Handling</span>
                  <span className="text-[#0A0A0A]">{formatMoney(summaryHandling, displayCurrency)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#0A0A0A]/70">Tax</span>
                  <span className="text-[#0A0A0A]">{formatMoney(summaryTax, displayCurrency)}</span>
                </div>
                {saleActive && summaryDiscount > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#0A0A0A]/70">Discount</span>
                    <span className="text-[#7A1E1E]">-{formatMoney(summaryDiscount, displayCurrency)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-end justify-between">
                <span className="text-[13px] tracking-[1.3px] text-[#0A0A0A]/70 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Total
                </span>
                <strong className="text-[30px] leading-none text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                  {formatMoney(summaryTotal, displayCurrency)}
                </strong>
              </div>
            </section>
          </aside>
        </div>
      </section>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative flex h-full max-h-screen w-full max-w-5xl flex-col items-center justify-center bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-50 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/40"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <img
              src={galleryImages[currentImageIndex].src}
              alt={galleryImages[currentImageIndex].alt}
              className="max-h-full max-w-full object-contain"
            />

            <button
              onClick={handlePrevImage}
              className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/40"
              aria-label="Previous image"
              type="button"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              onClick={handleNextImage}
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/40"
              aria-label="Next image"
              type="button"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[14px] text-white/80" style={{ fontFamily: 'Inter, sans-serif' }}>
              {currentImageIndex + 1} / {galleryImages.length}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default PurchasePage;
