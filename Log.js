namespace Log
{
	const appData = FileSystem.getFolder(FileSystem.AppData);

	reg nest = {};

	inline function addEntry(item, action, note)
	{
		local data = [];

		if (isDefined(item.id))
		{
			local f = appData.getChildFile("history.json");
			
			if (f.isFile())
				data = f.loadAsObject();
	
			local newEntry = {
				"id" : item.id,
				"name" : item.name,
				"format" : item.format,
				"version": item.version,
				"dateTime": Engine.getSystemTime(true),
				"os": Engine.getOS(),
				"action": action,
				"note": note
			};
	
			data.push(newEntry);
	
			f.writeObject(data);
		}
	}
	
	inline function getMostRecentEntry(id)
	{	
		local f = appData.getChildFile("history.json");
		local result;
		
		if (f.isFile())
		{
			local data = f.loadAsObject();

			for (i = 0; i < data.length; i++)
				if (data[i].id == id || data[i].name == id)
					result = data[i];
		}
	
		return result;
	}
	
	inline function createStatusReport()
	{
		nest.data = {};

		local f = appData.getChildFile("history.json");
		local sys = Engine.getSystemStats();
		local pro = Engine.getProjectInfo();
		local his;
		
		if (f.isFile())
			his = f.loadAsObject();
		
		nest.data.DateTime = Engine.getSystemTime(true);
		nest.data.Uptime = Engine.getUptime();
		nest.data.IsPlugin = Engine.isPlugin();
		nest.data.CurrentPreset = Engine.getCurrentUserPresetName();
		nest.data.Device = Engine.getDeviceType();
		nest.data.ZoomLevel = Engine.getZoomLevel();
		nest.data.HostBpm = Engine.getHostBpm();
		nest.data.sampleRate = Engine.getSampleRate();
		nest.data.Latency = Engine.getLatencySamples();
		nest.data.CpuUsage = Engine.doubleToString(Engine.getCpuUsage(), 2) + "%";
		nest.data.RamUsage = Engine.getMemoryUsage() + "mb";
		nest.data.NumVoices = Engine.getNumVoices();		
		
		for (x in sys)
		{
			if (["LogonName", "FullUserName", "ComputerName", "CpuVendor"].indexOf(x) != -1) continue;
			nest.data[x] = sys[x];
		}			
			
		for (x in pro)
		{
			if (["Company", "CompanyCopyright", "CompanyURL", "LicensedEmail"].indexOf(x) != -1) continue;
			nest.data[x] = pro[x];
		}
		
		nest.data.log = [];
		
		for (x in his)
			nest.data.log.push(his[x]);

		FileSystem.browseForDirectory(FileSystem.UserHome, function(dir)
		{
			if (dir.isDirectory())
			{
				nest.f = dir.getChildFile("status-report-" + Engine.getSystemTime(false) + ".txt");
				nest.f.writeString(trace(nest.data));
			}
		});		
	}
}