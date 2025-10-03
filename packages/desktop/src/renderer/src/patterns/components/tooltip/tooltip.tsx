import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { PropsWithChildren, ReactNode } from "react";
import {clsx} from "clsx";
import {Prose} from "@renderer/patterns/atoms/prose/prose";

export type TooltipPosition = "top" | "right" | "bottom" | "left";

export type TooltipVariant = 'light' | 'dark'

export interface TooltipProps {
	preferredPosition?: TooltipPosition,
	content: ReactNode,
	renderAsChild?: boolean,
	variant?: TooltipVariant,
	delayDuration?: number
}

export interface TooltipPropsWithChildren extends TooltipProps, PropsWithChildren {}

export function Tooltip(props: TooltipPropsWithChildren) {
	const popupClassName = clsx("j-tooltip__popup", {
		"j-tooltip__popup--dark": props.variant === "dark"
	})

	return (
		<TooltipPrimitive.Provider delayDuration={props.delayDuration ?? 400}>
			<TooltipPrimitive.Root>
				<TooltipPrimitive.Trigger className="j-tooltip" asChild={props.renderAsChild} type='button'>
					{props.children}
				</TooltipPrimitive.Trigger>
				<TooltipPrimitive.Portal>
					<TooltipPrimitive.Content
						className={popupClassName}
						sideOffset={2}
						side={props.preferredPosition}
					>
						<Prose>{props.content}</Prose>
						<TooltipPrimitive.Arrow className="j-tooltip__arrow" />
					</TooltipPrimitive.Content>
				</TooltipPrimitive.Portal>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
}
