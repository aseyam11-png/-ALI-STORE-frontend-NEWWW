import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Footprints, Gem, Shirt, Watch } from "lucide-react";

import { HomepageCategorySidebar } from "./HomepageCategorySidebar";

const meta = {
  title: "Commerce/Homepage Category Sidebar",
  component: HomepageCategorySidebar,
  tags: ["autodocs"],
} satisfies Meta<typeof HomepageCategorySidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FourCategories: Story = {
  args: {
    options: [
      {
        key: "clothing",
        title: "الملابس",
        description: "رجال، نساء، وأطفال",
        href: "/shop/categories/fashion",
        available: true,
        Icon: Shirt,
      },
      {
        key: "shoes",
        title: "الأحذية",
        description: "يومي، رياضي، ورسمي",
        href: "/shop/categories/shoes",
        available: true,
        Icon: Footprints,
      },
      {
        key: "watches",
        title: "الساعات",
        description: "تصاميم مختارة",
        href: "/shop/categories/watches",
        available: true,
        Icon: Watch,
      },
      {
        key: "accessories",
        title: "الإكسسوارات",
        description: "حقائب، مجوهرات ونظارات",
        href: "/shop/categories/accessories",
        available: true,
        Icon: Gem,
      },
    ],
  },
};

export const PartialCatalog: Story = {
  args: {
    options: [
      {
        key: "clothing",
        title: "الملابس",
        description: "رجال، نساء، وأطفال",
        href: "/shop/categories/fashion",
        available: true,
        Icon: Shirt,
      },
      {
        key: "shoes",
        title: "الأحذية",
        description: "غير متاح",
        available: false,
        Icon: Footprints,
      },
      {
        key: "watches",
        title: "الساعات",
        description: "تصاميم مختارة",
        href: "/shop/categories/watches",
        available: true,
        Icon: Watch,
      },
      {
        key: "accessories",
        title: "الإكسسوارات",
        description: "حقائب، مجوهرات ونظارات",
        href: "/shop/categories/accessories",
        available: true,
        Icon: Gem,
      },
    ],
  },
};
