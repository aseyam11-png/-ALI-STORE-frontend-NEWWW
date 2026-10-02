export interface Product {
  id: string;
  name: string;
  price: number;
  minOrderQuantity: number;
  rating: number;
  reviews: number;
  supplier: string;
  verifiedSupplier: boolean;
  shipping: string;
  discount?: number;
  category: string;
}

// ALI STORE is a B2C single-merchant Fashion + Accessories + Beauty & Care
// store (see features/catalog/data/category-tree.ts) — every record here is
// a direct-retail item (minOrderQuantity: 1, one supplier: "ALI STORE"),
// never a wholesale/B2B listing. `category` is kept in English/ASCII to
// match the existing slugify logic in product.mapper.ts (mapMockProductToSummary
// derives category.slug from this string); Arabic display names live on
// `name` itself, which is what every homepage-facing component renders.
export const featuredProducts: Product[] = [
  {
    id: "prod-001",
    name: "فستان سهرة أحمر طويل",
    price: 349,
    minOrderQuantity: 1,
    rating: 4.8,
    reviews: 312,
    supplier: "ALI STORE",
    verifiedSupplier: true,
    shipping: "شحن مجاني",
    discount: 20,
    category: "Fashion",
  },
  {
    id: "prod-007",
    name: "حقيبة يد جلدية حمراء",
    price: 389,
    minOrderQuantity: 1,
    rating: 4.8,
    reviews: 203,
    supplier: "ALI STORE",
    verifiedSupplier: true,
    shipping: "شحن مجاني",
    discount: 12,
    category: "Accessories",
  },
  {
    id: "prod-006",
    name: "ساعة يد جلدية أنيقة",
    price: 459,
    minOrderQuantity: 1,
    rating: 4.9,
    reviews: 168,
    supplier: "ALI STORE",
    verifiedSupplier: true,
    shipping: "شحن مجاني",
    discount: 10,
    category: "Accessories",
  },
  {
    id: "prod-005",
    name: "نظارة شمسية كلاسيكية",
    price: 189,
    minOrderQuantity: 1,
    rating: 4.7,
    reviews: 254,
    supplier: "ALI STORE",
    verifiedSupplier: true,
    shipping: "شحن سريع",
    category: "Accessories",
  },
  {
    id: "prod-002",
    name: "قميص رجالي قطني أبيض",
    price: 79,
    minOrderQuantity: 1,
    rating: 4.6,
    reviews: 187,
    supplier: "ALI STORE",
    verifiedSupplier: true,
    shipping: "شحن سريع",
    category: "Fashion",
  },
  {
    id: "prod-003",
    name: "حذاء رياضي أحمر",
    price: 259,
    minOrderQuantity: 1,
    rating: 4.7,
    reviews: 421,
    supplier: "ALI STORE",
    verifiedSupplier: true,
    shipping: "شحن مجاني",
    discount: 15,
    category: "Fashion",
  },
  {
    id: "prod-004",
    name: "قبعة كاجوال كلاسيكية",
    price: 65,
    minOrderQuantity: 1,
    rating: 4.4,
    reviews: 96,
    supplier: "ALI STORE",
    verifiedSupplier: true,
    shipping: "شحن سريع",
    category: "Fashion",
  },
  {
    id: "prod-008",
    name: "عقد لؤلؤ أنيق",
    price: 229,
    minOrderQuantity: 1,
    rating: 4.6,
    reviews: 141,
    supplier: "ALI STORE",
    verifiedSupplier: true,
    shipping: "شحن سريع",
    category: "Accessories",
  },
  {
    id: "prod-009",
    name: "حقيبة ظهر عملية",
    price: 159,
    minOrderQuantity: 1,
    rating: 4.5,
    reviews: 178,
    supplier: "ALI STORE",
    verifiedSupplier: true,
    shipping: "شحن سريع",
    category: "Accessories",
  },
  {
    id: "prod-010",
    name: "عطر فاخر للنساء",
    price: 299,
    minOrderQuantity: 1,
    rating: 4.8,
    reviews: 289,
    supplier: "ALI STORE",
    verifiedSupplier: true,
    shipping: "شحن مجاني",
    discount: 18,
    category: "Beauty & Care",
  },
  {
    id: "prod-011",
    name: "مجموعة مكياج احترافية",
    price: 179,
    minOrderQuantity: 1,
    rating: 4.6,
    reviews: 233,
    supplier: "ALI STORE",
    verifiedSupplier: true,
    shipping: "شحن سريع",
    category: "Beauty & Care",
  },
  {
    id: "prod-012",
    name: "كريم عناية بالبشرة",
    price: 99,
    minOrderQuantity: 1,
    rating: 4.5,
    reviews: 156,
    supplier: "ALI STORE",
    verifiedSupplier: true,
    shipping: "شحن سريع",
    discount: 8,
    category: "Beauty & Care",
  },
];
