namespace Config
{
	const MODE = "testing";
	const FULL_EXPANSIONS = true;
	const EXPANSION_HOST = ""; // Only matching expansions will be displayed
	const SHOW_PLUGINS = true;
	const CUSTOM_FILE_PICKER = true;
	const NETWORK_IN_PLUGIN = true; // Enable network connection in plugin mode
	const GRID_LAYOUT = true;
	const LIST_ROW_HEIGHT = 200; // Height of each list item
	const GRID_NUM_COLS = 4;
	const GRID_MARGIN = 25;
	const GRID_VERTICAL_MARGIN = 10;
	const GRID_USE_LOAD_BUTTON = true;
	
	const apiPrefix = "wp-json/librewave/v1/";
	const encryptionKey = 1234;

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