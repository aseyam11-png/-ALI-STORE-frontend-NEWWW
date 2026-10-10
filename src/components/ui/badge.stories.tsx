import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "success",
        "warning",
        "danger",
        "discount",
        "info",
      ],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Verified" },
};

export const Success: Story = {
  args: { children: "In stock", variant: "success" },
};

export const Discount: Story = {
  args: { children: "10% OFF", variant: "discount" },
};

export const Warning: Story = {
  args: { children: "Low stock", variant: "warning" },
};
