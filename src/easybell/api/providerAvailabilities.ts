interface ProviderAvailabilities {
  canOrder: boolean;
  address: {
    street: string;
    houseNumer: string;
    zipCode: string;
    city: string;
    wasCorrected: boolean;
    translationKey?: string;
    message?: {
      en: string;
      de: string;
    };
  };
  results: Result[];
  errorMessages: ErrorMessage[];
  availablePlans: AvailablePlans[];
}

interface Result {
  line: string;
  name: string;
  carrier: string;
  bandwidth: {
    upload: {
      maxBandwidthMbit: string;
      typicalBandwidthMbit: string;
      minBandwidthMbit: string;
    };
    dowload: {
      maxBandwidthMbit: string;
      typicalBandwidthMbit: string;
      minBandwidthMbit: string;
    };
  };
}

interface ErrorMessage {
  carrier: string;
  line: string;
  code: number;
  message: {
    en: string;
    de: string;
  };
  translationKey: string;
}

interface AvailablePlans {
  id: number;
  code: string;
  name: string;
  minTotalPrices: {
    monthly: string;
    oneTime: string;
  };
}

export { ProviderAvailabilities };
