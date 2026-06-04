export type FormField<T> = {
	value: T
	error?: string
	touched: boolean
	blurred: boolean
	dirty: boolean
	ref?: HTMLInputElement | HTMLTextAreaElement
	errorRef?: HTMLElement
	valueRef?: HTMLElement
}
export type FormErrors<Fields> = {
	root?: string,
	fields?: {
		[key in keyof Fields]?: string
	}
}
export type FormFields<Fields> = {
	[key in keyof Fields]: FormField<Fields[key]>
}

export interface HyperFormConfig<Fields> {
	initialValues: Fields
	onSubmit: (values: Fields) => void
	validator?: (values: Fields) => FormErrors<Fields> | undefined
}

export class HyperForm<Fields> {
	#config: HyperFormConfig<Fields>
	#keys: (keyof Fields)[]
	#fields: FormFields<Fields>
	formRef?: HTMLFormElement

	rootErrorRef?: HTMLElement
	rootError?: string

	constructor(
		config: HyperFormConfig<Fields>,
	) {
		this.#config = {
			...config,
			initialValues: structuredClone(config.initialValues)
		}
		// @ts-ignore
		this.#keys = Object.keys(config.initialValues)
		this.#fields = Object.fromEntries(this.#keys.map((key) => [
			key,
			{
				value: this.#config.initialValues[key],
				blurred: false,
				touched: false,
				dirty: false,
			}
		])) as unknown as FormFields<Fields>
	}

	get values(): Fields {
		return Object.fromEntries(this.#keys.map(key => [key, this.#fields[key].value])) as Fields
	}

	bindForm(form: HTMLFormElement) {
		this.formRef = form
		this.formRef.onsubmit = (e) => this.#submit(e)
	}

	bindInput(key: keyof Fields, input: HTMLInputElement) {
		this.#fields[key].ref = input
		input.oninput = (e: Event) => {
			// @ts-ignore
			this.change(key, e.target!.value)
		}
		input.onblur = () => {this.onBlur(key)}
	}
	bindTextArea(key: keyof Fields, textarea: HTMLTextAreaElement) {
		this.#fields[key].ref = textarea
		textarea.oninput = (e: Event) => {
			// @ts-ignore
			this.change(key, e.target!.value)
		}
		textarea.onblur = () => {this.onBlur(key)}
	}

	bindFieldError(key: keyof Fields, target: HTMLElement) {
		this.#fields[key].errorRef = target
		this.#fields[key].errorRef.style.display = 'none'
	}
	bindRootError(target: HTMLElement) {
		this.rootErrorRef = target
		this.rootErrorRef.style.display = 'none'
	}
	bindFieldValue(key: keyof Fields, target: HTMLElement) {
		this.#fields[key].valueRef = target
		this.#fields[key].valueRef.style.display = 'none'
	}

	change(key: keyof Fields, value: Fields[typeof key]) {
		console.debug("change", key, value)

		this.#fields[key] = {
			...this.#fields[key],
			value,
			error: undefined,
			touched: true,
			dirty: value !== this.#config.initialValues[key]
		}

		this.validate()
	}

	onBlur<Key extends keyof Fields>(key: Key){
		if (!this.#fields[key].blurred) {
			this.#fields[key] = {
				...this.#fields[key],
				blurred: true,
				touched: true,
			}
		}
		this.validate()
	}

	clearErrors() {
		if (this.rootErrorRef) {
			this.rootErrorRef.style.display = 'none'
			this.rootError = undefined
		}
		for (const key of this.#keys) {
			this.#fields[key].error = undefined;
			if (this.#fields[key].errorRef) {
				this.#fields[key].errorRef.style.display = 'none'
			}
		}
	}

	validate() {
		this.clearErrors()

		if (this.#config.validator) {
			const errors = this.#config.validator(this.values)
			if (!errors) return true;

			if (errors?.root) {
				this.rootError = errors.root
				if (this.rootErrorRef) {
					this.rootErrorRef.innerText = errors.root
					this.rootErrorRef.style.display = 'block'
				}
			}
			if (errors?.fields) {
				for (const key of this.#keys) {
					if (errors.fields[key]) {
						this.#fields[key].error = errors.fields[key]

						if (this.#fields[key].errorRef && this.#fields[key].touched && this.#fields[key].blurred) {
							this.#fields[key].errorRef.style.display = 'block'
							this.#fields[key].errorRef.innerText = errors.fields[key]
						}
					}
				}
			}
			return false
		}

		return true
	}

	#submit(e: SubmitEvent) {
		e.preventDefault();
		if (e.target) {
			e.target.disabled = true
		}

		console.debug("Submit", this.values)
		// Automatically set touched/blurred on all fields to help reveal validation errors if consumers are hiding errors behind touched/blurred
		for (const key of this.#keys) {
			this.#fields[key] = {
				...this.#fields[key],
				touched: true,
				blurred: true,
			}
		}

		const isValid = this.validate()
		if (isValid) {
			this.#config.onSubmit(this.values)
		}

		if (e.target) {
			e.target.disabled = false
		}
	}

	reset(fields?: Fields) {
		console.debug("Reset")
		if (fields) {
			this.#config.initialValues = structuredClone(fields)
		}

		for (const key of this.#keys) {
			const value =  this.#config.initialValues[key]
			this.#fields[key] = {
				...this.#fields[key],
				value: value,
				blurred: false,
				dirty: false,
				touched: false,
			};

			if (this.#fields[key].ref) {
				this.#fields[key].ref.value = `${value}`
			}
			if (this.#fields[key].errorRef) {
				console.debug(`reset error ref ${key}`)
				this.#fields[key].errorRef.style.display = 'none'
				this.#fields[key].errorRef.innerText = ''
			}
		}
	}
}
