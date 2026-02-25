import {LiveQuerySubscriber, LiveQuerySubscription} from "@contracts/query";
import {FileSystemDirectory} from "@/main/file-system/operations";

export interface IFilesAPI {
	tree: () => Promise<FileSystemDirectory | null>;
	liveTree: (subscriber: LiveQuerySubscriber<FileSystemDirectory | null>) => LiveQuerySubscription;
}
