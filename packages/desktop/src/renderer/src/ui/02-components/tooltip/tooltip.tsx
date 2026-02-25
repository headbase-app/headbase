import {Button, OverlayArrow, Tooltip as TooltipContent, TooltipTrigger} from 'react-aria-components';
import { PropsWithChildren, ReactNode } from "react";
import {Prose} from "@ui/01-atoms/prose/prose";

export type TooltipPosition = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
	preferredPosition?: TooltipPosition,
	content: ReactNode,
	renderAsChild?: boolean,
	delayDuration?: number
}

export interface TooltipPropsWithChildren extends TooltipProps, PropsWithChildren {}

export function Tooltip(props: TooltipPropsWithChildren) {
	console.debug(props.content)
	return (
		<TooltipTrigger delay={props.delayDuration}>
			<Button>{props.children}</Button>
			<TooltipContent>
				<OverlayArrow>
				</OverlayArrow>
				<Prose className="text-navy-white-40">{props.content}</Prose>
			</TooltipContent>
		</TooltipTrigger>
	)

	// return (
	// 	<TooltipPrimitive.Provider delayDuration={props.delayDuration ?? 400}>
	// 		<TooltipPrimitive.Root>
	// 			<TooltipPrimitive.Trigger className="j-tooltip" asChild={props.renderAsChild} type='button'>
	// 				{props.children}
	// 			</TooltipPrimitive.Trigger>
	// 			<TooltipPrimitive.Portal>
	// 				<TooltipPrimitive.Content
	// 					className="bg-navy-10 text-navy-white-40 rounded-md p-2 max-w-[300px]"
	// 					sideOffset={2}
	// 					side={props.preferredPosition}
	// 				>
	// 					<Prose className="text-navy-white-40">{props.content}</Prose>
	// 					<TooltipPrimitive.Arrow className="fill-navy-10" />
	// 				</TooltipPrimitive.Content>
	// 			</TooltipPrimitive.Portal>
	// 		</TooltipPrimitive.Root>
	// 	</TooltipPrimitive.Provider>
	// );
}
