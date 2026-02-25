package app.headbase.mobile;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

import app.headbase.mobile.plugins.HeadbaseFileSystem.HeadbaseFileSystemPlugin;

public class MainActivity extends BridgeActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		registerPlugin(HeadbaseFileSystemPlugin.class);
		super.onCreate(savedInstanceState);
	}
}
