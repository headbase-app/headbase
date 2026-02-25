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
				primary: "text-navy-white-60 bg-teal-40 hocus:bg-teal-30",
				secondary: "text-black-10 bg-navy-white-60 hocus:bg-navy-white-40",
				destructive: "text-navy-white-60 bg-red-40 hocus:bg-red-30",
				tertiary: "text-navy-white-60 hocus:text-mono-300 hocus:underline",
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
