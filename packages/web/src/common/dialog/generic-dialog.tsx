import React, {createContext, useContext, useState} from "react";
import {PropsWithChildren} from "../../utils/children-prop";

export interface DialogContext {
	isOpen: boolean
	setIsOpen: (open: boolean) => void
}

const DefaultDialogContext: DialogContext = {
	isOpen: false,
	setIsOpen: () => {
		throw new Error("Attempted to use dialog context outside its provider")
	}
}

export function createModalContext(){
	const ModalContext = createContext<DialogContext>(DefaultDialogContext)
	const useModalContext = () => useContext(ModalContext)

	function ContentProvider(props: PropsWithChildren) {
		const [isOpen, setIsOpen] = useState<boolean>(false)

		return (
			<ModalContext.Provider
				value={{
					isOpen,
					setIsOpen
				}}
			>
				{props.children}
			</ModalContext.Provider>
		)
	}

	return {
		context: ModalContext,
		useContext: useModalContext,
		provider: ContentProvider
	}
}
