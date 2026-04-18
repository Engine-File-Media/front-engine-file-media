import type { Dispatch, SetStateAction } from 'react';
import type { AddressMetadataResponse, Country, Subdivision } from '../../../api/types';
import PurchaseShippingForm from '../PurchaseShippingForm';
import PurchaseStepContinueButton from './PurchaseStepContinueButton';
import type { FieldErrors, FormState } from '../purchaseTypes';

type PurchaseAddressStepProps = {
  form: FormState;
  errors: FieldErrors;
  shippingInputClasses: string;
  addressMetadata: AddressMetadataResponse | null;
  isMetadataLoading: boolean;
  selectedCountry: Country | null;
  selectedCountryLabel: string;
  requiresStateCode: boolean;
  requiresRecipientTaxId: boolean;
  selectedSubdivisionCatalog: Subdivision[];
  filteredCountries: Country[];
  countryQuery: string;
  isCountryDropdownOpen: boolean;
  stateQuery: string;
  isStateDropdownOpen: boolean;
  setCountryQuery: Dispatch<SetStateAction<string>>;
  setIsCountryDropdownOpen: Dispatch<SetStateAction<boolean>>;
  setStateQuery: Dispatch<SetStateAction<string>>;
  setIsStateDropdownOpen: Dispatch<SetStateAction<boolean>>;
  onUpdateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onHandleCountryChange: (newCountryCode: string) => Promise<void>;
  formatRecipientTaxIdForInput: (countryCode: string, value: string) => string;
  getRecipientTaxIdUxHint: (countryCode: string) => string;
  canContinueCurrentStep: boolean;
  continueButtonLabel: string;
  onContinue: () => void;
};

function PurchaseAddressStep({
  form,
  errors,
  shippingInputClasses,
  addressMetadata,
  isMetadataLoading,
  selectedCountry,
  selectedCountryLabel,
  requiresStateCode,
  requiresRecipientTaxId,
  selectedSubdivisionCatalog,
  filteredCountries,
  countryQuery,
  isCountryDropdownOpen,
  stateQuery,
  isStateDropdownOpen,
  setCountryQuery,
  setIsCountryDropdownOpen,
  setStateQuery,
  setIsStateDropdownOpen,
  onUpdateField,
  onHandleCountryChange,
  formatRecipientTaxIdForInput,
  getRecipientTaxIdUxHint,
  canContinueCurrentStep,
  continueButtonLabel,
  onContinue,
}: PurchaseAddressStepProps) {
  return (
    <>
      <PurchaseShippingForm
        form={form}
        errors={errors}
        shippingInputClasses={shippingInputClasses}
        addressMetadata={addressMetadata}
        isMetadataLoading={isMetadataLoading}
        selectedCountry={selectedCountry}
        selectedCountryLabel={selectedCountryLabel}
        requiresStateCode={requiresStateCode}
        requiresRecipientTaxId={requiresRecipientTaxId}
        selectedSubdivisionCatalog={selectedSubdivisionCatalog}
        filteredCountries={filteredCountries}
        countryQuery={countryQuery}
        isCountryDropdownOpen={isCountryDropdownOpen}
        stateQuery={stateQuery}
        isStateDropdownOpen={isStateDropdownOpen}
        setCountryQuery={setCountryQuery}
        setIsCountryDropdownOpen={setIsCountryDropdownOpen}
        setStateQuery={setStateQuery}
        setIsStateDropdownOpen={setIsStateDropdownOpen}
        onUpdateField={onUpdateField}
        onHandleCountryChange={onHandleCountryChange}
        formatRecipientTaxIdForInput={formatRecipientTaxIdForInput}
        getRecipientTaxIdUxHint={getRecipientTaxIdUxHint}
      />
      <PurchaseStepContinueButton label={continueButtonLabel} disabled={!canContinueCurrentStep} onContinue={onContinue} />
    </>
  );
}

export default PurchaseAddressStep;