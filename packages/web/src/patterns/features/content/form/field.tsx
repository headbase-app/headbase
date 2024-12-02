import {JInput, JLabel, JSelect, JTextArea} from "@ben-ryder/jigsaw-react";
import {ChangeEvent, useCallback} from "react";
import {FieldDto} from "../../../../logic/schemas/fields/dtos.ts";
import {ScaleField} from "../../../components/scale-field/scale-field.tsx";
import {MarkdownEditor} from "../../../components/markdown-editor/markdown-editor.tsx";

export interface FieldProps {
	field: FieldDto
	// todo: look at improving types here
	value?: any
	onChange: (value: any) => void
}

export function CustomField(props: FieldProps) {

	const onChange = useCallback((e: ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
		props.onChange(e.target.value)
	}, [])

	if (props.field.type === 'scale') {
		return (
			<ScaleField field={props.field} value={props.value} onChange={props.onChange} />
		)
	}
	else if (props.field.type === 'select') {
		return (
			<JSelect
				label={props.field.name}
				tooltip={props.field.description ? {content: props.field.description} : undefined}
				options={props.field.settings.options.map(option => ({
					text: option.label,
					value: option.value,
				}))}
				value={props.value || ''}
				onChange={onChange}
			/>
		)
	}
	else if (props.field.type === 'markdown') {
		return (
			<>
				<JLabel htmlFor='markdown' tooltip={props.field.description ? {content: props.field.description} : undefined}>{props.field.name}</JLabel>
				<MarkdownEditor
					id='markdown'
					value={props.value || ''}
					onChange={(value) => {props.onChange(value)}}
				/>
			</>
		)
	}
	else if (props.field.type === 'boolean') {
		return (
			<JInput
				type='checkbox'
				label={props.field.name}
				placeholder={props.field.description || undefined}
				value={props.value || false}
				onChange={onChange}
			/>
		)
	}
	else if (props.field.type === 'timestamp') {
		return (
			<JInput
				type='datetime-local'
				label={props.field.name}
				placeholder={props.field.description || undefined}
				value={props.value || ''}
				onChange={onChange}
			/>
		)
	}
	else if (props.field.type === 'date') {
		return (
			<JInput
				type='date'
				label={props.field.name}
				placeholder={props.field.description || undefined}
				value={props.value || ''}
				onChange={onChange}
			/>
		)
	}
	else if (props.field.type === 'url') {
		return (
			<JInput
				type='url'
				label={props.field.name}
				placeholder={props.field.description || undefined}
				value={props.value || ''}
				onChange={onChange}
			/>
		)
	}
	else if (props.field.type === 'number') {
		return (
			<JInput
				type='number'
				label={props.field.name}
				placeholder={props.field.description || undefined}
				value={props.value || 0}
				onChange={onChange}
			/>
		)
	}
	else if (props.field.type === 'textLong') {
		return (
			<JTextArea
				label={props.field.name}
				placeholder={props.field.description || undefined}
				rows={4}
				value={props.value || ''}
				onChange={onChange}
			/>
		)
	}
	else {
		return (
			<JInput
				label={props.field.name}
				placeholder={props.field.description || undefined}
				value={props.value || ''}
				onChange={onChange}
			/>
		)
	}

}