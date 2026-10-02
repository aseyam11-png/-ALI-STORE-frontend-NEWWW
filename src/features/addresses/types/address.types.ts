export interface CustomerAddress {
  id: string;

  customerId: string;

  label: string;

  recipientName: string;

  phone: string;

  country: string;
  city: string;
  area: string;

  street: string;

  building?: string;
  apartment?: string;

  postalCode?: string;

  notes?: string;

  isDefault: boolean;
}