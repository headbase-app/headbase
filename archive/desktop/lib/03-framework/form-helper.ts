import {BehaviorSubject} from "rxjs";

export type FormFieldValues<Fields> = {
	[key in keyof Fields]: Fields[key]
}

export type FormFieldData<T> = {
	value: T
	error?: string
	touched: boolean
	blurred: boolean
	dirty: boolean
}

export type FormFields<Fields> = {
	[key in keyof Fields]: BehaviorSubject<FormFieldData<Fields[key]>>
}

export interface FormRoot {
	error: BehaviorSubject<string | undefined>
}

export type FormErrors<Fields> = {
	root?: string,
	fields: {
		[key in keyof Fields]?: string
	}
}

export interface FormHelperOptions<Fields> {
	validate?: (values: FormFieldValues<Fields>) => void | Partial<FormErrors<Fields>>
	onSubmit?: (values: FormFieldValues<Fields>) => void
}


export class FormHelper<Fields> {
	_initialValues: Fields
	#keys: (keyof Fields)[]
	fields: FormFields<Fields>
	root: FormRoot
	options?: FormHelperOptions<Fields>

	constructor (initialValues: FormFieldValues<Fields>, options?: FormHelperOptions<Fields>) {
		this._initialValues = initialValues
		this.#keys = Object.keys(initialValues) as (keyof Fields)[]
		this.options = options

		this.root = {error: new BehaviorSubject<string | undefined>(undefined)}
		this.fields = Object.fromEntries(this.#keys.map((key) => [
			key,
			new BehaviorSubject({
				value: initialValues[key as keyof Fields],
				touched: false,
				dirty: false,
			})
		])) as unknown as FormFields<Fields>
	}

	get values(): FormFieldValues<Fields> {
		return Object.fromEntries(this.#keys.map(key => [key, this.fields[key].value.value])) as FormFieldValues<Fields>
	}

	setField<Key extends keyof Fields>(key: Key, value: Fields[Key]) {
		this.fields[key].next({
			...this.fields[key].value,
			// Reset error as will be revalidated again
			error: undefined,
			value,
		});

		if (!this.fields[key].value.touched) {
			this.fields[key].next({
				...this.fields[key].value,
				touched: true,
			});
		}

		const isDirty = value !== this._initialValues[key]
		if (isDirty && this.fields[key].value.dirty !== isDirty) {
			this.fields[key].next({
				...this.fields[key].value,
				dirty: true,
			});
		}

		this.validate()
	}

	reset(values?: FormFieldValues<Fields>) {
		if (values) {
			this._initialValues = values
		}

		for (const key of this.#keys) {
			this.fields[key].next({
				blurred: false,
				dirty: false,
				touched: false,
				value: this._initialValues[key],
			});
		}
	}

	onBlur<Key extends keyof Fields>(key: Key){
		if (!this.fields[key].value.blurred) {
			this.fields[key].next({
				...this.fields[key].value,
				blurred: true,
				touched: true,
			})
		}
		this.validate()
	}

	validate(): boolean {
		if (this.options?.validate) {
			const newErrors = this.options.validate(this.values)
			if (newErrors) {
				if (newErrors.root && this.root.error.value !== newErrors.root) {
					this.root.error.next(newErrors.root)
				}

				if (newErrors.fields) {
					for (const key of this.#keys) {
						if (newErrors.fields[key] !== this.fields[key].value.error) {
							this.fields[key].next({
								...this.fields[key].value,
								error: newErrors.fields[key],
							})
						}
					}
				}

				return false;
			}
		}

		return true;
	}

	submit(e: SubmitEvent) {
		e.preventDefault()

		const isValid = this.validate();

		if (isValid) {
			this.options?.onSubmit?.(this.values)
		}
		else {
			// Automatically set touched/blurred on all fields to help reveal validation errors if consumers are hiding errors behind touched/blurred
			for (const key of this.#keys) {
				this.fields[key].next({
					...this.fields[key].value,
					touched: true,
					blurred: true,
				})
			}
		}
	}
}
