import { registerPlugin } from '@capacitor/core';

// todo: add docs comments, add returns for cancelled actions etc
export interface HeadbaseFileSystemPlugin {
	requestManageExternalStorage: () => Promise<{ value: boolean }>
	isManageExternalStorageGranted: () => Promise<{ value: boolean }>
	pickDirectory: () => Promise<{ value: string }>
}

export const HeadbaseFileSystem  = registerPlugin<HeadbaseFileSystemPlugin>('HeadbaseFileSystem');
