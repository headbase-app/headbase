import {FieldDto} from "../services/database/tables/fields/dtos.ts";
import {ContentTypeDto} from "../services/database/tables/content-types/dtos.ts";
import {ContentItemDto} from "../services/database/tables/content-items/dtos.ts";
import {ViewDto} from "../services/database/tables/views/dtos.ts";


export interface ExportData {
	exportVersion: "v1";
	hbv: string;
	createdAt: string
	data: {
		fields: FieldDto[]
		contentTypes: ContentTypeDto[]
		contentItems: ContentItemDto[]
		views: ViewDto[]
	}
}
