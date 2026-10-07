import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";

const meta = { title: "UI/Input", component: Input, tags: ["autodocs"] } satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { id: "product-search", label: "Search", placeholder: "Product, SKU or category" } };
export const WithHint: Story = { args: { id: "email", label: "Email", hint: "We will use this for order updates.", placeholder: "you@example.com" } };
export const WithError: Story = { args: { id: "address", label: "Address", error: "Please enter a valid address.", defaultValue: "Invalid" } };
