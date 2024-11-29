import {
	JTextLinkProps,
	JArrowLinkProps,
	JButtonLinkProps,
	JPillLinkProps,
} from "@ben-ryder/jigsaw-react";
import { Link } from "wouter";

export function SmartLink(
	props: JTextLinkProps | JArrowLinkProps | JButtonLinkProps | JPillLinkProps,
) {
	if (props.href && props.href?.startsWith("/")) {
		const { href, children, ...htmlProps } = props;
		return (
			<>
				<Link to={href || ''} {...htmlProps}>{children}</Link>
			</>
		);
	}

	return <a {...props} />;
}
