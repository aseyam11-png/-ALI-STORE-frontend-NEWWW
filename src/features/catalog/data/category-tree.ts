import type { CategoryNode } from "../types/category.types";

// ALI STORE is a B2C single-merchant Fashion + Accessories + Beauty & Care
// store — these three departments are the entire taxonomy. This is a
// navigable structure (dynamic routing lives at /shop/categories/[slug] and
// reads this tree through category.service.ts), not a product catalog: leaf
// nodes exist so the store's information architecture is complete and
// browsable even where no mock product currently sits in them.
const menClothing: CategoryNode = {
  id: "men-clothing",
  slug: "men-clothing",
  name: "Clothing",
  parentSlug: "men",
  description: "Everyday and occasion clothing for men.",
  productCount: 0,
  children: [
    { id: "men-tshirts", slug: "men-tshirts", name: "T-Shirts", parentSlug: "men-clothing", description: "Men's T-shirts.", children: [], productCount: 0 },
    { id: "men-shirts", slug: "men-shirts", name: "Shirts", parentSlug: "men-clothing", description: "Men's shirts.", children: [], productCount: 0 },
    { id: "men-pants", slug: "men-pants", name: "Pants", parentSlug: "men-clothing", description: "Men's pants.", children: [], productCount: 0 },
    { id: "men-jeans", slug: "men-jeans", name: "Jeans", parentSlug: "men-clothing", description: "Men's jeans.", children: [], productCount: 0 },
    { id: "men-jackets", slug: "men-jackets", name: "Jackets", parentSlug: "men-clothing", description: "Men's jackets and coats.", children: [], productCount: 0 },
    { id: "men-hoodies", slug: "men-hoodies", name: "Hoodies", parentSlug: "men-clothing", description: "Men's hoodies and sweatshirts.", children: [], productCount: 0 },
    { id: "men-sweaters", slug: "men-sweaters", name: "Sweaters", parentSlug: "men-clothing", description: "Men's sweaters and knitwear.", children: [], productCount: 0 },
    { id: "men-activewear", slug: "men-activewear", name: "Activewear", parentSlug: "men-clothing", description: "Men's sportswear and activewear.", children: [], productCount: 0 },
    { id: "men-formalwear", slug: "men-formalwear", name: "Formalwear", parentSlug: "men-clothing", description: "Men's suits and formalwear.", children: [], productCount: 0 },
    { id: "men-underwear", slug: "men-underwear", name: "Underwear", parentSlug: "men-clothing", description: "Men's underwear.", children: [], productCount: 0 },
    { id: "men-sleepwear", slug: "men-sleepwear", name: "Sleepwear", parentSlug: "men-clothing", description: "Men's sleepwear and loungewear.", children: [], productCount: 0 },
  ],
};

const menShoes: CategoryNode = {
  id: "men-shoes",
  slug: "men-shoes",
  name: "Shoes",
  parentSlug: "men",
  description: "Sneakers, formal shoes, boots and sandals for men.",
  children: [],
  productCount: 0,
};

const menAccessories: CategoryNode = {
  id: "men-accessories",
  slug: "men-accessories",
  name: "Accessories",
  parentSlug: "men",
  description: "Men's accessories.",
  children: [],
  productCount: 0,
};

const womenClothing: CategoryNode = {
  id: "women-clothing",
  slug: "women-clothing",
  name: "Clothing",
  parentSlug: "women",
  description: "Everyday and occasion clothing for women.",
  productCount: 0,
  children: [
    { id: "women-dresses", slug: "women-dresses", name: "Dresses", parentSlug: "women-clothing", description: "Women's dresses.", children: [], productCount: 0 },
    { id: "women-tops", slug: "women-tops", name: "Tops", parentSlug: "women-clothing", description: "Women's tops and blouses.", children: [], productCount: 0 },
    { id: "women-bottoms", slug: "women-bottoms", name: "Bottoms", parentSlug: "women-clothing", description: "Women's skirts and trousers.", children: [], productCount: 0 },
    { id: "women-jeans", slug: "women-jeans", name: "Jeans", parentSlug: "women-clothing", description: "Women's jeans.", children: [], productCount: 0 },
    { id: "women-jackets", slug: "women-jackets", name: "Jackets", parentSlug: "women-clothing", description: "Women's jackets and coats.", children: [], productCount: 0 },
    { id: "women-activewear", slug: "women-activewear", name: "Activewear", parentSlug: "women-clothing", description: "Women's sportswear and activewear.", children: [], productCount: 0 },
    { id: "women-sleepwear", slug: "women-sleepwear", name: "Sleepwear", parentSlug: "women-clothing", description: "Women's sleepwear and loungewear.", children: [], productCount: 0 },
    { id: "women-underwear", slug: "women-underwear", name: "Underwear", parentSlug: "women-clothing", description: "Women's underwear.", children: [], productCount: 0 },
  ],
};

const womenShoes: CategoryNode = {
  id: "women-shoes",
  slug: "women-shoes",
  name: "Shoes",
  parentSlug: "women",
  description: "Heels, flats, sneakers, boots and sandals for women.",
  children: [],
  productCount: 0,
};

const womenBags: CategoryNode = {
  id: "women-bags",
  slug: "women-bags",
  name: "Bags",
  parentSlug: "women",
  description: "Handbags, totes and clutches.",
  children: [],
  productCount: 0,
};

const womenAccessories: CategoryNode = {
  id: "women-accessories",
  slug: "women-accessories",
  name: "Accessories",
  parentSlug: "women",
  description: "Women's accessories.",
  children: [],
  productCount: 0,
};

function kidsGroup(
  group: "boys" | "girls" | "baby",
  name: string,
  description: string,
): CategoryNode {
  return {
    id: group,
    slug: group,
    name,
    parentSlug: "kids",
    description,
    productCount: 0,
    children: [
      { id: `${group}-clothing`, slug: `${group}-clothing`, name: "Clothing", parentSlug: group, description: `${name}'s clothing.`, children: [], productCount: 0 },
      { id: `${group}-shoes`, slug: `${group}-shoes`, name: "Shoes", parentSlug: group, description: `${name}'s shoes.`, children: [], productCount: 0 },
      { id: `${group}-accessories`, slug: `${group}-accessories`, name: "Accessories", parentSlug: group, description: `${name}'s accessories.`, children: [], productCount: 0 },
    ],
  };
}

export const categoryTree: CategoryNode[] = [
  {
    id: "fashion",
    slug: "fashion",
    name: "Fashion",
    description: "Clothing, shoes and accessories for men, women and kids.",
    productCount: 0,
    children: [
      {
        id: "men",
        slug: "men",
        name: "Men",
        parentSlug: "fashion",
        description: "Men's clothing, shoes and accessories.",
        productCount: 0,
        children: [menClothing, menShoes, menAccessories],
      },
      {
        id: "women",
        slug: "women",
        name: "Women",
        parentSlug: "fashion",
        description: "Women's clothing, shoes, bags and accessories.",
        productCount: 0,
        children: [womenClothing, womenShoes, womenBags, womenAccessories],
      },
      {
        id: "kids",
        slug: "kids",
        name: "Kids",
        parentSlug: "fashion",
        description: "Clothing, shoes and accessories for boys, girls and baby.",
        productCount: 0,
        children: [
          kidsGroup("boys", "Boys", "Boys' clothing, shoes and accessories."),
          kidsGroup("girls", "Girls", "Girls' clothing, shoes and accessories."),
          kidsGroup("baby", "Baby", "Baby clothing, shoes and accessories."),
        ],
      },
    ],
  },

  {
    id: "accessories",
    slug: "accessories",
    name: "Accessories",
    description: "Watches, jewelry, bags and everyday accessories.",
    productCount: 0,
    children: [
      { id: "watches", slug: "watches", name: "Watches", parentSlug: "accessories", description: "Watches.", children: [], productCount: 0 },
      { id: "jewelry", slug: "jewelry", name: "Jewelry", parentSlug: "accessories", description: "Jewelry.", children: [], productCount: 0 },
      { id: "sunglasses", slug: "sunglasses", name: "Sunglasses", parentSlug: "accessories", description: "Sunglasses.", children: [], productCount: 0 },
      { id: "belts", slug: "belts", name: "Belts", parentSlug: "accessories", description: "Belts.", children: [], productCount: 0 },
      { id: "hats", slug: "hats", name: "Hats", parentSlug: "accessories", description: "Hats and caps.", children: [], productCount: 0 },
      { id: "wallets", slug: "wallets", name: "Wallets", parentSlug: "accessories", description: "Wallets.", children: [], productCount: 0 },
      { id: "accessory-bags", slug: "accessory-bags", name: "Bags", parentSlug: "accessories", description: "Bags.", children: [], productCount: 0 },
      { id: "backpacks", slug: "backpacks", name: "Backpacks", parentSlug: "accessories", description: "Backpacks.", children: [], productCount: 0 },
      { id: "hair-accessories", slug: "hair-accessories", name: "Hair Accessories", parentSlug: "accessories", description: "Hair accessories.", children: [], productCount: 0 },
    ],
  },

  {
    id: "beauty-care",
    slug: "beauty-care",
    name: "Beauty & Care",
    description: "Skincare, haircare, makeup, body care and fragrance.",
    productCount: 0,
    children: [
      {
        id: "skincare",
        slug: "skincare",
        name: "Skincare",
        parentSlug: "beauty-care",
        description: "Cleansers, moisturizers, serums, sunscreen and masks.",
        productCount: 0,
        children: [
          { id: "cleansers", slug: "cleansers", name: "Cleansers", parentSlug: "skincare", description: "Cleansers.", children: [], productCount: 0 },
          { id: "moisturizers", slug: "moisturizers", name: "Moisturizers", parentSlug: "skincare", description: "Moisturizers.", children: [], productCount: 0 },
          { id: "serums", slug: "serums", name: "Serums", parentSlug: "skincare", description: "Serums.", children: [], productCount: 0 },
          { id: "sunscreen", slug: "sunscreen", name: "Sunscreen", parentSlug: "skincare", description: "Sunscreen.", children: [], productCount: 0 },
          { id: "masks", slug: "masks", name: "Masks", parentSlug: "skincare", description: "Face masks.", children: [], productCount: 0 },
        ],
      },
      {
        id: "haircare",
        slug: "haircare",
        name: "Haircare",
        parentSlug: "beauty-care",
        description: "Shampoo, conditioner, treatments and styling.",
        productCount: 0,
        children: [
          { id: "shampoo", slug: "shampoo", name: "Shampoo", parentSlug: "haircare", description: "Shampoo.", children: [], productCount: 0 },
          { id: "conditioner", slug: "conditioner", name: "Conditioner", parentSlug: "haircare", description: "Conditioner.", children: [], productCount: 0 },
          { id: "hair-treatments", slug: "hair-treatments", name: "Treatments", parentSlug: "haircare", description: "Hair treatments.", children: [], productCount: 0 },
          { id: "hair-styling", slug: "hair-styling", name: "Styling", parentSlug: "haircare", description: "Hair styling products.", children: [], productCount: 0 },
        ],
      },
      {
        id: "makeup",
        slug: "makeup",
        name: "Makeup",
        parentSlug: "beauty-care",
        description: "Face, eyes and lips.",
        productCount: 0,
        children: [
          { id: "makeup-face", slug: "makeup-face", name: "Face", parentSlug: "makeup", description: "Face makeup.", children: [], productCount: 0 },
          { id: "makeup-eyes", slug: "makeup-eyes", name: "Eyes", parentSlug: "makeup", description: "Eye makeup.", children: [], productCount: 0 },
          { id: "makeup-lips", slug: "makeup-lips", name: "Lips", parentSlug: "makeup", description: "Lip makeup.", children: [], productCount: 0 },
        ],
      },
      {
        id: "body-care",
        slug: "body-care",
        name: "Body Care",
        parentSlug: "beauty-care",
        description: "Body wash, lotions and deodorant.",
        productCount: 0,
        children: [
          { id: "body-wash", slug: "body-wash", name: "Body Wash", parentSlug: "body-care", description: "Body wash.", children: [], productCount: 0 },
          { id: "lotions", slug: "lotions", name: "Lotions", parentSlug: "body-care", description: "Body lotions.", children: [], productCount: 0 },
          { id: "deodorant", slug: "deodorant", name: "Deodorant", parentSlug: "body-care", description: "Deodorant.", children: [], productCount: 0 },
        ],
      },
      {
        id: "fragrance",
        slug: "fragrance",
        name: "Fragrance",
        parentSlug: "beauty-care",
        description: "Perfume and body mist.",
        productCount: 0,
        children: [
          { id: "perfume", slug: "perfume", name: "Perfume", parentSlug: "fragrance", description: "Perfume.", children: [], productCount: 0 },
          { id: "body-mist", slug: "body-mist", name: "Body Mist", parentSlug: "fragrance", description: "Body mist.", children: [], productCount: 0 },
        ],
      },
    ],
  },
];
