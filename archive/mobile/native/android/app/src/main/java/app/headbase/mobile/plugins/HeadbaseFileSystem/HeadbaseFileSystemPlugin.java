package app.headbase.mobile.plugins.HeadbaseFileSystem;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.provider.Settings;
import android.util.Log;
import java.util.Objects;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;


@CapacitorPlugin(name = "HeadbaseFileSystem")
public class HeadbaseFileSystemPlugin extends Plugin {
	public static final String LOG_TAG = "HeadbaseFileSystemPlugin";

	/**
	 * Return a path from the given uri.
	 */
	private String getPathFromUri(Uri uri) {
		String authority = uri.getEncodedAuthority();
		if (Objects.equals(authority, "com.android.externalstorage.documents")) {
			String pathWithLocation = uri.getPath();
			if (pathWithLocation != null) {
				String[] parts = pathWithLocation.split(":");
				String location = parts[0];
				String path = parts[1];
				if (location.equals("/tree/primary")) {
					return "/storage/emulated/0/" + path;
				}
				else if (location.startsWith("/tree/")) {
					String locationId = location.replace("/tree/", "");
					return "/storage/" + locationId + "/" + path;
				}
			}
		}

		return uri.toString();
	}

	@PluginMethod()
	public void pickDirectory(PluginCall call) {
		try {
			Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
			startActivityForResult(call, intent, "pickDirectoryResult");
		}
		catch (Exception exception) {
			String message = exception.getMessage();
			Log.e(LOG_TAG, message);
			call.reject(message);
		}
	}

	@ActivityCallback()
	private void pickDirectoryResult(PluginCall call, ActivityResult result) {
		try {
			int resultCode = result.getResultCode();
			switch (resultCode) {
				case Activity.RESULT_OK:
					Intent intent = result.getData();
					if (intent != null) {
						Uri uri = intent.getData();
						if (uri != null) {
							String path = getPathFromUri(uri);
							JSObject callResult = new JSObject();
							callResult.put("value", path);
							call.resolve(callResult);
						}
					}
					break;
				case Activity.RESULT_CANCELED:
					call.reject("cancel");
					break;
				default:
					call.reject("failed");
			}
		} catch (Exception ex) {
			String message = ex.getMessage();
			Log.e(LOG_TAG, message);
			call.reject(message);
		}
	}

	@PluginMethod()
	public void isManageExternalStorageGranted(PluginCall call) {
		JSObject ret = new JSObject();
		boolean isGranted = Environment.isExternalStorageManager();
		ret.put("value", isGranted);
		call.resolve(ret);
	}

	@PluginMethod()
	public void requestManageExternalStorage(PluginCall call) {
		Intent intent = new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
		getActivity().startActivity(intent);
		call.resolve();
	}
}
