import {JOptionData, JSelect} from "@ben-ryder/jigsaw-react";
import {FieldScale} from "../../../state/schemas/fields/fields";

export interface ScaleFieldProps {
	field: FieldScale
	value: number
	onChange: (value: number) => void
}

export function ScaleField(props: ScaleFieldProps) {

	const options: JOptionData[] = []
	for (let i = 1; i < props.field.scale + 1; i++) {
		let label: string
		if (i === 1) {
			label = `${i} - ${props.field.minLabel}`
		}
		else if (i === props.field.scale) {
			label = `${i} - ${props.field.maxLabel}`
		}
		else {
			label = `${i}`
		}

		options.push({
			text: label,
			value: String(i)
		})
	}

	return (
		<div>
			<JSelect
				label={props.field.label}
				tooltip={props.field.description ? {content: props.field.description} : undefined}
				options={options}
				value={props.value || ''}
				onChange={(e) => {
					props.onChange(parseInt(e.target.value))
				}}
			/>
		</div>
	)
}