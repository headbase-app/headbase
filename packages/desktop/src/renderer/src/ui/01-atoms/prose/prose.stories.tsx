import type { Meta, StoryObj } from '@storybook/react';
import {Prose} from './prose';

const meta = {
	title: 'Atoms/Prose',
	component: Prose,
	tags: ['autodocs'],
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * HTML can be passed via regular React children.
 */
export const Children: Story = {
	args: {
		children: (
			<>
				<h1>Hello world</h1>
				<p>Using children, quo usque tandem abutere, Catilina, patientia nostra?</p>
			</>
		),
	},
};

/**
 * A raw HTML string can be rendered via "dangerouslySetInnerHTML". This is useful
 * for content from being pulled from places like a CMS.
 */
export const HTMLString: Story = {
	args: {
		html: '<h1>Hello world</h1><p>Using string content, quo usque tandem abutere, Catilina, patientia nostra?</p>',
	},
};
