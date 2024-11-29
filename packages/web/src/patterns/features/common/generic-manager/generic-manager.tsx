
export type GenericManagerScreens = {
	screen: "list"
} | {
	screen: "new"
} | {
	screen: "edit",
	id: string
}
export type GenericManagerNavigate = (screen: GenericManagerScreens) => void

export interface GenericManagerScreenProps {
	navigate: GenericManagerNavigate
}

export interface GenericManagerContentScreenProps {
	navigate: GenericManagerNavigate
	id: string
}
