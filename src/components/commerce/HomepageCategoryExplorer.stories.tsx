import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HomepageCategoryExplorer } from "./HomepageCategoryExplorer";

const meta = {
  title: "Commerce/HomepageCategoryExplorer",
  component: HomepageCategoryExplorer,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HomepageCategoryExplorer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LiveCatalog: Story = {};
