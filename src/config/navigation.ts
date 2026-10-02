export interface NavigationItem {
  label: string;
  href: string;
  description?: string;
}

export const shopNavigation: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
    description: "Store homepage",
  },
  {
    label: "Categories",
    href: "/shop/categories",
    description: "Browse product categories",
  },
  {
    label: "Deals",
    href: "/shop/deals",
    description: "Special offers and deals",
  },
  {
    label: "New Arrivals",
    href: "/shop/new",
    description: "Recently added products",
  },
];

export const platformNavigation: NavigationItem[] = [
  {
    label: "Buyer",
    href: "/buyer",
    description: "Buyer portal",
  },
  {
    label: "Warehouse",
    href: "/warehouse",
    description: "Warehouse operations",
  },
  {
    label: "Finance",
    href: "/admin/finance",
    description: "Financial operations",
  },
  {
    label: "Support",
    href: "/support",
    description: "Customer support",
  },
];