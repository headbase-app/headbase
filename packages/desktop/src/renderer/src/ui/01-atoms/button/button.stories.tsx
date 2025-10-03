import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import {Button} from './button';
import { CalendarIcon, Loader2Icon } from "lucide-react";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
	title: 'Atoms/Button',
	component: Button,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
	// argTypes: {
	//   backgroundColor: { control: 'color' },
	// },
	// Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
	args: {
		onClick: fn(),
		disabled: false
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: 'Example button',
	},
};

export const Disabled: Story = {
	args: {
		children: 'Example button',
		disabled: true
	},
};

export const WithIconBefore: Story = {
	args: {
		children: <><CalendarIcon/> Example Button</>,
	},
};

export const WithIconAfter: Story = {
	args: {
		children: <>Example Button <Loader2Icon className="animate-spin"/></>,
		disabled: true
	},
};

export const AsAnchor: Story = {
	args: {
		asChild: true,
		children: (
			<a href="#">Example Link</a>
		),
	},
};
