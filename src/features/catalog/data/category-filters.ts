import type {
  CategoryFilterConfig,
} from "../types/filter.types";

const commonFilters = [
  {
    id: "brand",
    label: "Brand",
    control: "multi-select" as const,
    options: [
      { label: "Apple", value: "apple" },
      { label: "Samsung", value: "samsung" },
      { label: "Sony", value: "sony" },
      { label: "Xiaomi", value: "xiaomi" },
      { label: "LG", value: "lg" },
    ],
  },
  {
    id: "rating",
    label: "Customer rating",
    control: "select" as const,
    options: [
      { label: "4★ & above", value: "4" },
      { label: "4.5★ & above", value: "4.5" },
      { label: "4.8★ & above", value: "4.8" },
    ],
  },
  {
    id: "availability",
    label: "Availability",
    control: "checkbox" as const,
    options: [
      {
        label: "In stock",
        value: "in-stock",
      },
    ],
  },
  {
    id: "shipping",
    label: "Shipping",
    control: "checkbox" as const,
    options: [
      {
        label: "Free shipping",
        value: "free",
      },
    ],
  },
  {
    id: "discount",
    label: "Deals",
    control: "checkbox" as const,
    options: [
      {
        label: "On sale",
        value: "sale",
      },
    ],
  },
];

// Fashion (clothing) filters — reused across fashion, men, women, kids and
// their clothing subcategories. Beauty-only facets (skin type, shade, ...)
// are deliberately absent: a jeans listing must never show "Skin Type".
const fashionFilters = [
  {
    id: "gender",
    label: "Gender",
    control: "select" as const,
    options: [
      { label: "Men", value: "men" },
      { label: "Women", value: "women" },
      { label: "Kids", value: "kids" },
      { label: "Unisex", value: "unisex" },
    ],
  },
  {
    id: "size",
    label: "Size",
    control: "multi-select" as const,
    options: [
      { label: "XS", value: "xs" },
      { label: "S", value: "s" },
      { label: "M", value: "m" },
      { label: "L", value: "l" },
      { label: "XL", value: "xl" },
      { label: "XXL", value: "xxl" },
    ],
  },
  {
    id: "color",
    label: "Color",
    control: "multi-select" as const,
    options: [
      { label: "Black", value: "black" },
      { label: "White", value: "white" },
      { label: "Blue", value: "blue" },
      { label: "Red", value: "red" },
      { label: "Beige", value: "beige" },
      { label: "Grey", value: "grey" },
    ],
  },
  {
    id: "material",
    label: "Material",
    control: "multi-select" as const,
    options: [
      { label: "Cotton", value: "cotton" },
      { label: "Denim", value: "denim" },
      { label: "Linen", value: "linen" },
      { label: "Wool", value: "wool" },
      { label: "Polyester", value: "polyester" },
    ],
  },
  {
    id: "style",
    label: "Style",
    control: "multi-select" as const,
    options: [
      { label: "Casual", value: "casual" },
      { label: "Formal", value: "formal" },
      { label: "Sport", value: "sport" },
    ],
  },
];

const shoeFilters = [
  {
    id: "size",
    label: "Size",
    control: "multi-select" as const,
    options: [
      { label: "36", value: "36" },
      { label: "37", value: "37" },
      { label: "38", value: "38" },
      { label: "39", value: "39" },
      { label: "40", value: "40" },
      { label: "41", value: "41" },
      { label: "42", value: "42" },
      { label: "43", value: "43" },
      { label: "44", value: "44" },
      { label: "45+", value: "45-plus" },
    ],
  },
  {
    id: "color",
    label: "Color",
    control: "multi-select" as const,
    options: [
      { label: "Black", value: "black" },
      { label: "White", value: "white" },
      { label: "Blue", value: "blue" },
      { label: "Red", value: "red" },
      { label: "Brown", value: "brown" },
    ],
  },
  {
    id: "gender",
    label: "Gender",
    control: "select" as const,
    options: [
      { label: "Men", value: "men" },
      { label: "Women", value: "women" },
      { label: "Kids", value: "kids" },
      { label: "Unisex", value: "unisex" },
    ],
  },
  {
    id: "material",
    label: "Material",
    control: "multi-select" as const,
    options: [
      { label: "Leather", value: "leather" },
      { label: "Mesh", value: "mesh" },
      { label: "Canvas", value: "canvas" },
      { label: "Synthetic", value: "synthetic" },
    ],
  },
];

const accessoryFilters = [
  {
    id: "material",
    label: "Material",
    control: "multi-select" as const,
    options: [
      { label: "Leather", value: "leather" },
      { label: "Metal", value: "metal" },
      { label: "Fabric", value: "fabric" },
      { label: "Gold-plated", value: "gold-plated" },
      { label: "Silver-plated", value: "silver-plated" },
    ],
  },
  {
    id: "color",
    label: "Color",
    control: "multi-select" as const,
    options: [
      { label: "Black", value: "black" },
      { label: "Brown", value: "brown" },
      { label: "Gold", value: "gold" },
      { label: "Silver", value: "silver" },
    ],
  },
  {
    id: "style",
    label: "Style",
    control: "multi-select" as const,
    options: [
      { label: "Casual", value: "casual" },
      { label: "Formal", value: "formal" },
      { label: "Everyday", value: "everyday" },
    ],
  },
];

// Beauty filters — never shown on a fashion/accessories listing.
const beautyFilters = [
  {
    id: "skin-type",
    label: "Skin type",
    control: "multi-select" as const,
    options: [
      { label: "Dry", value: "dry" },
      { label: "Oily", value: "oily" },
      { label: "Combination", value: "combination" },
      { label: "Sensitive", value: "sensitive" },
      { label: "Normal", value: "normal" },
    ],
  },
  {
    id: "concern",
    label: "Concern",
    control: "multi-select" as const,
    options: [
      { label: "Hydration", value: "hydration" },
      { label: "Anti-aging", value: "anti-aging" },
      { label: "Acne", value: "acne" },
      { label: "Brightening", value: "brightening" },
    ],
  },
  {
    id: "finish",
    label: "Finish",
    control: "select" as const,
    options: [
      { label: "Matte", value: "matte" },
      { label: "Dewy", value: "dewy" },
      { label: "Natural", value: "natural" },
    ],
  },
];

const hairCareFilters = [
  {
    id: "hair-type",
    label: "Hair type",
    control: "multi-select" as const,
    options: [
      { label: "Straight", value: "straight" },
      { label: "Wavy", value: "wavy" },
      { label: "Curly", value: "curly" },
      { label: "Coily", value: "coily" },
    ],
  },
  {
    id: "concern",
    label: "Concern",
    control: "multi-select" as const,
    options: [
      { label: "Damage repair", value: "damage-repair" },
      { label: "Volume", value: "volume" },
      { label: "Dandruff", value: "dandruff" },
      { label: "Color protection", value: "color-protection" },
    ],
  },
];

const fragranceFilters = [
  {
    id: "fragrance-family",
    label: "Fragrance family",
    control: "multi-select" as const,
    options: [
      { label: "Floral", value: "floral" },
      { label: "Woody", value: "woody" },
      { label: "Oriental", value: "oriental" },
      { label: "Fresh", value: "fresh" },
    ],
  },
  {
    id: "shade",
    label: "Volume",
    control: "select" as const,
    options: [
      { label: "30ml", value: "30ml" },
      { label: "50ml", value: "50ml" },
      { label: "100ml", value: "100ml" },
    ],
  },
];

export const categoryFilterConfigs:
  CategoryFilterConfig[] = [
    // Fashion — the department and each gender line share the same
    // clothing-facet set; the store's mock catalog has no per-clothing-
    // subcategory (T-Shirts, Dresses, ...) filter needs beyond this.
    { categorySlug: "fashion", filters: [...commonFilters, ...fashionFilters] },
    { categorySlug: "men", filters: [...commonFilters, ...fashionFilters] },
    { categorySlug: "women", filters: [...commonFilters, ...fashionFilters] },
    { categorySlug: "kids", filters: [...commonFilters, ...fashionFilters] },
    { categorySlug: "shoes", filters: [...commonFilters, ...shoeFilters] },
    { categorySlug: "men-shoes", filters: [...commonFilters, ...shoeFilters] },
    { categorySlug: "women-shoes", filters: [...commonFilters, ...shoeFilters] },

    // Accessories — the department and its leaf categories (watches,
    // jewelry, bags, ...) share the same facet set.
    { categorySlug: "accessories", filters: [...commonFilters, ...accessoryFilters] },
    { categorySlug: "watches", filters: [...commonFilters, ...accessoryFilters] },
    { categorySlug: "jewelry", filters: [...commonFilters, ...accessoryFilters] },
    { categorySlug: "bags", filters: [...commonFilters, ...accessoryFilters] },

    // Beauty & Care — skincare/makeup/body-care share the skin-facing
    // facet set; haircare and fragrance each get their own real facets
    // rather than inheriting an irrelevant one (no "Skin Type" on shampoo).
    { categorySlug: "beauty-care", filters: [...commonFilters, ...beautyFilters] },
    { categorySlug: "skincare", filters: [...commonFilters, ...beautyFilters] },
    { categorySlug: "makeup", filters: [...commonFilters, ...beautyFilters] },
    { categorySlug: "body-care", filters: [...commonFilters, ...beautyFilters] },
    { categorySlug: "haircare", filters: [...commonFilters, ...hairCareFilters] },
    { categorySlug: "fragrance", filters: [...commonFilters, ...fragranceFilters] },
  ];