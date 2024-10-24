import {GenericManagerNavigate} from "../generic-manager/generic-manager";

export interface GenericFormProps<Data> {
	title: string
	data: Data;
	onSave: (content: Data) => void;
	onDelete?: () => void;
	navigate: GenericManagerNavigate
}
