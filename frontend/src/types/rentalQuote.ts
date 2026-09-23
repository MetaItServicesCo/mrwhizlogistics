// src/types/rentalQuote.ts

export type RentalType =
  | "truck-trailer"
  | "sprinter-van-with-lift-gate"
  | "16-feet-enclosed-trailer"
  | "24-feet-enclosed-trailer"
  | "40-feet-flatbed"
  | "20-feet-flatbed";

export type RentalDuration =
  | "daily"
  | "weekly"
  | "monthly"
  | "custom";

export type PreferredContactMethod =
  | "phone"
  | "email"
  | "text"
  | "any";

export type RentalQuoteStatus =
  | "new"
  | "contacted"
  | "quoted"
  | "approved"
  | "declined"
  | "completed"
  | "cancelled";

export type RentalQuoteFormData = {
  // --------------------------------------------------
  // Customer Information
  // --------------------------------------------------

  fullName: string;

  companyName: string;

  email: string;

  phone: string;

  preferredContactMethod: PreferredContactMethod;

  // --------------------------------------------------
  // Rental Information
  // --------------------------------------------------

  rentalSlug: string;

  rentalName: string;

  rentalDuration: RentalDuration;

  startDate: string;

  endDate: string;

  // --------------------------------------------------
  // Pickup / Return
  // --------------------------------------------------

  pickupLocation: string;

  returnLocation: string;

  deliveryRequired: boolean;

  deliveryAddress: string;

  // --------------------------------------------------
  // Load / Usage Information
  // --------------------------------------------------

  intendedUse: string;

  loadDescription: string;

  cargoType: string;

  estimatedWeight: string;

  estimatedMileage: string;

  // --------------------------------------------------
  // Equipment / Requirements
  // --------------------------------------------------

  specialRequirements: string;

  additionalNotes: string;

  // --------------------------------------------------
  // Consent
  // --------------------------------------------------

  agreeToContact: boolean;
};

export type RentalQuotePayload = {
  customer: {
    fullName: string;

    companyName?: string;

    email: string;

    phone: string;

    preferredContactMethod: PreferredContactMethod;
  };

  rental: {
    slug: string;

    name: string;

    duration: RentalDuration;

    startDate: string;

    endDate: string;
  };

  logistics: {
    pickupLocation: string;

    returnLocation: string;

    deliveryRequired: boolean;

    deliveryAddress?: string;
  };

  load: {
    intendedUse: string;

    description: string;

    cargoType: string;

    estimatedWeight?: string;

    estimatedMileage?: string;
  };

  requirements: {
    specialRequirements?: string;

    additionalNotes?: string;
  };

  metadata: {
    source: "website";

    submittedAt: string;

    pageUrl?: string;
  };
};

export type RentalQuoteRecord = RentalQuotePayload & {
  id: string;

  status: RentalQuoteStatus;

  adminNotes?: string;

  createdAt: string;

  updatedAt: string;
};

export const RENTAL_TYPE_OPTIONS: {
  value: RentalType;
  label: string;
}[] = [
  {
    value: "truck-trailer",
    label: "Truck & Trailer",
  },
  {
    value: "sprinter-van-with-lift-gate",
    label: "Sprinter Van with Lift Gate",
  },
  {
    value: "16-feet-enclosed-trailer",
    label: "16 Feet Enclosed Trailer",
  },
  {
    value: "24-feet-enclosed-trailer",
    label: "24 Feet Enclosed Trailer",
  },
  {
    value: "40-feet-flatbed",
    label: "40 Feet Flatbed",
  },
  {
    value: "20-feet-flatbed",
    label: "20 Feet Flatbed",
  },
];

export const RENTAL_DURATION_OPTIONS: {
  value: RentalDuration;
  label: string;
}[] = [
  {
    value: "daily",
    label: "Daily",
  },
  {
    value: "weekly",
    label: "Weekly",
  },
  {
    value: "monthly",
    label: "Monthly",
  },
  {
    value: "custom",
    label: "Custom",
  },
];

export const CONTACT_METHOD_OPTIONS: {
  value: PreferredContactMethod;
  label: string;
}[] = [
  {
    value: "phone",
    label: "Phone Call",
  },
  {
    value: "email",
    label: "Email",
  },
  {
    value: "text",
    label: "Text Message",
  },
  {
    value: "any",
    label: "Any Method",
  },
];