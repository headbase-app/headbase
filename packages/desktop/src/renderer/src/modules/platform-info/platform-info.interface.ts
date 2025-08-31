import {Version} from "../../../../contracts/version";

export interface IPlatformInfoService {
	getVersions: () => Promise<Version[]>;
}
