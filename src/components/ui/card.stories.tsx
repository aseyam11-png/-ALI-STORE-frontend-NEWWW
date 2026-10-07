import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardContent, CardFooter, CardHeader } from "./card";

const meta = { title: "UI/Card", component: Card, tags: ["autodocs"] } satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-[360px]">
      <CardHeader><h3 className="text-h4 font-medium text-foreground">Product card</h3></CardHeader>
      <CardContent><p className="text-body text-muted-foreground">Shared surface, spacing and elevation primitives.</p></CardContent>
      <CardFooter><span className="text-body-sm text-muted-foreground">ALI STORE</span></CardFooter>
    </Card>
  ),
};
