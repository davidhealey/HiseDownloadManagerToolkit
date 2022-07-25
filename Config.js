namespace Config
{
	const MODE = "development";
	const APP_NAME = "Rhapsody";
	const SHOW_SPLASH = false;
	const FULL_EXPANSIONS = true;
	const EXPANSION_HOST = ""; // Only matching expansions will be displayed
	const ENCODE_EXPANSIONS = false;
	const SHOW_PLUGINS = true;
	const NETWORK_IN_PLUGIN = true; // Enable network connection in plugin mode
	const GRID_LAYOUT = true;
	const GRID_NUM_COLS = 4;
	const GRID_MARGIN = 25;
	const GRID_VERTICAL_MARGIN = 5;
	const GRID_USE_LOAD_BUTTON = true;
	const DEV_FOLDER = "/media/dave/Work/Projects/Libre Player/libreplayer mkv";
	
	const apiPrefix = "wp-json/librewave/v1/";
	const encryptionKey = Engine.getProjectInfo().EncryptionKey;

	const baseURL = {
		"development": "http://localhost/wordpress",
		"testing": "https://testing.librewave.com",
		"release": "https://librewave.com"
	};
	
	const supportURL = "/my-tickets/";
	
	const webPrefix = {
		"development": "http://",
		"testing": "https://",
		"release": "https://"
	};
	
	// Functions
	inline function createDefaultLinkFile()
	{
		local filename = "";
		local appData = FileSystem.getFolder(FileSystem.AppData);
				
		switch (Engine.getOS())
		{
			case "OSX": filename = "LinkOSX"; break;
			case "LINUX": filename = "LinkLinux"; break;
			case "WIN": filename = "LinkWindows"; break;
		}

		local f = appData.getChildFile(filename);

		if (!isDefined(f) || !f.isFile())
			f.writeString(appData.toString(appData.FullPath));		
	}

	// Function calls
	createDefaultLinkFile();
}