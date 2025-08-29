export type SignupType = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: {
    code: string;
    number: string;
  };
  password: string;
  passwordConfirmation: string;
  subscriptionType: "BUSINESS" | "RESIDENTIAL";
  equipmentAgeCategory: string;
  coverageAddress: {
    latitude: string;
    longitude: string;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  acceptTerms: boolean;
  businessName?: string;
};

export type ExtraInfo = {
  subscriptionType: "BUSINESS" | "RESIDENTIAL";
  equipmentAgeCategory: string;
  coverageAddress: {
    latitude: string;
    longitude: string;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  acceptTerms: boolean;
  country: any;
};

export type SubscriptionType = {
  planId: string;
  equipmentAgeRange: string;
  equipmentAge: string;
  subscriptionType: "BUSINESS" | "RESIDENTIAL";
  coverageAddress: {
    latitude: string;
    longitude: string;
    address: string;
    city: string;
    state: string;
    country: string;
  };
};

// {
//     "planId": "68b047c7359e42ee4651a567",
//     "equipmentAgeRange": "3-5",
//     "equipmentAge": 4,
//     "subscriptionType": "Business", // Residential
//     "coverageAddress": {
//         "latitude": "75.309",
//         "longitude": "72.782",
//         "address": "Aba, onitsha way, 11",
//         "city": "Aba",
//         "state": "BC",
//         "country": "Canada"
//     }
// }
