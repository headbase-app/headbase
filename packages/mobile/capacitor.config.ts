import type { CapacitorConfig } from '@capacitor/cli';
import {join} from "node:path"

const config: CapacitorConfig = {
  appId: 'app.headbase.mobile',
  appName: 'Headbase',
  webDir: 'dist',
	android: {
		path: join(__dirname, "native/android")
	},
	ios: {
		path: join(__dirname, "native/ios")
	},
	plugins: {
		SystemBars: {
			insetsHandling: "css",
		},
		CapacitorSQLite: {
			iosIsEncryption: false,
			androidIsEncryption: false,
		}
	}
};

export default config;
