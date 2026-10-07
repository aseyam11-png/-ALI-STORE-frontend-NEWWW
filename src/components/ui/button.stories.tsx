import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "outline", "ghost", "danger"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    loading: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { children: "Add to cart", variant: "primary", size: "md" } };
export const Secondary: Story = { args: { children: "View details", variant: "secondary", size: "md" } };
export const Loading: Story = { args: { children: "Processing", loading: true } };
export const Disabled: Story = { args: { children: "Unavailable", disabled: true } };
