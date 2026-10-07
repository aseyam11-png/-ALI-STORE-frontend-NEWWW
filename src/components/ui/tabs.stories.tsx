import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tabs } from "./tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ariaLabel: "Product information",
    items: [
      {
        id: "overview",
        label: "Overview",
        content: (
          <p className="text-body text-foreground">
            Core product information.
          </p>
        ),
      },
      {
        id: "shipping",
        label: "Shipping",
        content: (
          <p className="text-body text-foreground">
            Shipping and delivery information.
          </p>
        ),
      },
      {
        id: "trust",
        label: "Trust",
        content: (
          <p className="text-body text-foreground">
            Verified supplier and trust signals.
          </p>
        ),
      },
    ],
  },
};
