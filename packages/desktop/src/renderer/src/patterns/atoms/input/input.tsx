import {ComponentProps, ForwardedRef, forwardRef} from "react";
import {clsx} from "clsx";
import { Label } from "../label/label.js";
import {TooltipProps} from "@renderer/patterns/components/tooltip/tooltip";
import {ErrorText} from "@renderer/patterns/atoms/error-text/error-text";

export interface InputProps extends ComponentProps<"input"> {
	label: string;
	error?: string;
	hideLabel?: boolean;
	tooltip?: TooltipProps;
}

export const Input = forwardRef((props: InputProps, ref: ForwardedRef<HTMLInputElement>) => {
	const { label, hideLabel, error, className: propsClassName, ...htmlProps } = props;

	const className = clsx(
		"",
		{
			"j-input--error": error,
		},
		propsClassName
	);

	return (
		<div className={className}>
			<Label htmlFor={props.id} hidden={hideLabel} tooltip={props.tooltip}>
				{label}
			</Label>
			<input ref={ref} className="border-2 border-navy-grey-20 hover:border-navy-grey-40 w-full p-4 rounded-md placeholder:text-navy-grey-10 focus:outline-0 focus:border-teal-40 text-navy-white-40" {...htmlProps} />
			{props.error && <ErrorText>{props.error}</ErrorText>}
		</div>
	);
})
