import { ComponentProps, ReactNode } from "react";
import {clsx} from "clsx";

export interface JErrorTextProps extends ComponentProps<"p"> {
	children: ReactNode;
}

export function ErrorText(props: JErrorTextProps) {
	const { className: suppliedClassName, children, ...htmlProps } = props;

	const className = clsx("text-sm text-red-50", suppliedClassName);

	return (
		<p className={className} {...htmlProps}>
			{children}
		</p>
	);
}
