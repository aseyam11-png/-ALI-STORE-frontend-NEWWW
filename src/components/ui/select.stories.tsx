import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./select";

const meta = { title: "UI/Select", component: Select, tags: ["autodocs"] } satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: {
    id: "category",
    label: "Category",
    defaultValue: "electronics",
    children: <><option value="electronics">Electronics</option><option value="home">Home & Garden</option><option value="safety">Safety</option></>,
  },
};
