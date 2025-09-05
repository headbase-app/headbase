import { ComponentProps } from "react";
import { cva } from "class-variance-authority"
import { twclsx } from "../../../utils/twclsx";
import { Slot } from "@radix-ui/react-slot";

export interface JButtonProps extends ComponentProps<'button'> {
	variant?: "primary" | "secondary" | "tertiary" | "destructive";
	asChild?: boolean;
}

export const buttonStyles = cva(
	[
		"flex items-center gap-3 font-bold p-4 rounded-sm text-sm hover:cursor-pointer",
		"disabled:bg-mono-400 disabled:pointer-events-none",
		"[&_svg]:pointer-events-none [&_svg]:size-(--text-lg)",
	],
	{
		variants: {
			variant: {
				primary: "text-mono-100 bg-teal-500 hocus:bg-teal-700",
				secondary: "text-mono-900 bg-mono-100 hocus:bg-mono-200",
				destructive: "text-mono-100 bg-red-500 hocus:bg-red-700",
				tertiary: "text-mono-100 hocus:text-mono-300 hocus:underline",
			},
		},
	}
)

/**
 *
 */
export function Button({
	variant = "primary",
	asChild = false,
	className: customClassName,
	disabled,
	...htmlProps
}: JButtonProps) {
	const Component = asChild ? Slot : "button"
	const className = buttonStyles({variant })

	return (
		<Component
			className={twclsx(className, customClassName)}
			disabled={disabled}
			{...htmlProps}
		/>
	)
}
