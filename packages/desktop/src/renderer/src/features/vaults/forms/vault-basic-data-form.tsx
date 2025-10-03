import {ReactNode, useCallback} from "react";
import {Controller, useForm} from "react-hook-form";
import {Button} from "@renderer/patterns/atoms/button/button";
import {zodResolver} from "@hookform/resolvers/zod";
import {CreateVaultDto} from "../../../../../contracts/vaults";
import {Input} from "@renderer/patterns/atoms/input/input";

export interface VaultBasicDataFormProps {
	initialData?: CreateVaultDto
	saveText?: string
	onSave: (fields: CreateVaultDto) => void;
	extraButtons?: ReactNode;
}

export function VaultBasicDataForm(props: VaultBasicDataFormProps) {
	const {
		handleSubmit,
		control,
		formState: {errors}
	} = useForm<CreateVaultDto>({
		resolver: zodResolver(CreateVaultDto),
		defaultValues: {
			displayName: props.initialData?.displayName || '',
			path: props.initialData?.path ?? '',
		}
	})

	const onSubmit = useCallback((data: CreateVaultDto) => {
		props.onSave(data)
	}, [props])

	return (
		<form className="database-form" onSubmit={handleSubmit(onSubmit)} noValidate>
			<div className="database-form__header">
				{errors.root?.message && (
					<p>{errors.root.message}</p>
				)}
			</div>
			<div>
				<div>
					<Controller
						name='displayName'
						control={control}
						render={({ field: { ...rest } }) => (
							<Input
								label="Name"
								id="name"
								type="text"
								placeholder="your vault display name..."
								error={errors.displayName?.message}
								tooltip={{
									content: <p>This text will be saved unencrypted so you can identify databases before unlocking them.</p>
								}}
								required={true}
								{...rest}
							/>
						)}
					/>
				</div>
				<div>
					<Controller
						name='path'
						control={control}
						render={({ field: { ...rest } }) => (
							<Input
								label="Folder Path"
								id="path"
								type="text"
								placeholder="your vault folder path..."
								error={errors.path?.message}
								tooltip={{
									content: <p>The root folder location of your vault.</p>
								}}
								required={true}
								{...rest}
							/>
						)}
					/>
				</div>
			</div>

			<div>
				<div>
					{props.extraButtons && props.extraButtons}
					<Button type="submit">{props.saveText || 'Save'}</Button>
				</div>
			</div>
		</form>
	);
}
