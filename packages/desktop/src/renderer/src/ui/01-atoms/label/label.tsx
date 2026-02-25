import { ComponentProps, ReactNode } from "react";
import {clsx} from "clsx";
import { HelpCircleIcon } from "lucide-react"
import {TooltipProps, Tooltip} from "@ui/02-components/tooltip/tooltip";

export interface LabelProps extends ComponentProps<"label"> {
	children: ReactNode;
	hidden?: boolean;
	tooltip?: TooltipProps
}

export function Label(props: LabelProps) {
	const {
		className: suppliedClassName,
		children,
		hidden,
		...htmlProps
	} = props;

	const className = clsx("text-sm font-bold text-navy-white-60 flex items-center gap-2", suppliedClassName, {
		"sr-only": hidden,
		"": props.tooltip
	});

	return (
		<div className={className}>
			<label className="" {...htmlProps}>
				{children}
			</label>
			{props.tooltip &&
				<Tooltip {...props.tooltip}>
					<HelpCircleIcon />
				</Tooltip>
			}
		</div>
	);
}
