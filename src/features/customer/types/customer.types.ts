export interface CustomerAddress {
  id: string;

  label: string;

  fullName: string;
  phone: string;

  addressLine1: string;
  addressLine2?: string;

  city: string;
  country: string;
  postalCode?: string;

  isDefault: boolean;
}