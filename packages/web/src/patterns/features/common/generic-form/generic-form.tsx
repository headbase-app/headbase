import {GenericManagerNavigate} from "../generic-manager/generic-manager.tsx";

export interface GenericFormProps<Data> {
	data: Data;
	onSave: (content: Data) => void;
	onDelete?: () => void;
	navigate: GenericManagerNavigate
}
