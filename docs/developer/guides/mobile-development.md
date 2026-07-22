# Mobile Development

## Development / Debugging
The easiest way to debug the Capacitor web application running on an emulated device is to visit
`chrome://inspect/#devices` via a Chrome/Chromium browser and inspect.
This will give you access to the chrome developer tools and the ability to interact with the application.

Using this method you can drive the device via this developer tools view while it is still running on the
Android device and able to interact with the operating system. For actual Android interactions, you will still
need to use the emulated device.

The log output in dev tools will include the application logs, and also the native logs which Capacitor
injects from its bridge. You can use the console filtering options to control what you see, such as
using `-VM3` to remove those native Capacitor logs when you don't need to see them.
