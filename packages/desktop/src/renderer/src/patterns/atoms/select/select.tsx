import { JLabel } from "../label/label.js";
import {ComponentProps, ForwardedRef, forwardRef} from "react";
import {clsx} from "clsx";
import {JTooltipProps} from "@renderer/patterns/components/tooltip/tooltip";
import {ErrorText} from "@renderer/patterns/atoms/error-text/error-text";

export interface OptionData {
	text: string;
	value: string;
}

export interface SelectProps extends ComponentProps<"select"> {
	label: string;
	hideLabel?: boolean;
	options: OptionData[];
	error?: string;
	tooltip?: JTooltipProps;
}

export const Select = forwardRef((props: SelectProps, ref: ForwardedRef<HTMLSelectElement>) => {
	const {label, hideLabel, options, error, tooltip, className: propsClassName ,...htmlProps} = props

	const className = clsx("j-select", {
		"j-select--error": props.error,
		propsClassName
	});

	return (
		<div className={className}>
			<JLabel htmlFor={htmlProps.id} hidden={hideLabel} tooltip={tooltip}>
				{label}
			</JLabel>
			<select
				ref={ref}
				className="j-select__element"
				{...htmlProps}
			>
				{options.map((option) => (
					<option key={option.value} className="j-select__option" value={option.value}>
						{option.text}
					</option>
				))}
			</select>
			{error && <ErrorText>{error}</ErrorText>}
		</div>
	);
})
