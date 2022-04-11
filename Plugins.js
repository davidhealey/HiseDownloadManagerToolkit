/*
    Copyright 2021, 2022 David Healey

    This file is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This file is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with This file. If not, see <http://www.gnu.org/licenses/>.
*/

namespace Plugins
{
	const unzipTimer = Engine.createTimerObject();
	const appData = FileSystem.getFolder(FileSystem.AppData);

	reg nest = {};
	reg extractionCount;

	unzipTimer.setTimerCallback(function()
	{
		var progress = Engine.getPreloadProgress();

		if (Spinner.isVisible())
			Spinner.setMessage("Installing " + Engine.doubleToString(progress * 100, 0) + "%");
	});

	// Functions
	inline function install(pluginName, origin, data)
	{
		extractionCount = 0;

		for (x in data)
		{
			local f = origin.getChildFile(x.filename);
			
			if (isDefined(f) && f.isFile())
			{
				local path;
				local os = Engine.getOS().toLowerCase();
				nest.fileCount = data.length;

				if (x.filename.toLowerCase().indexOf(os) == -1 && x.filename.toLowerCase().indexOf("_dat") == -1)
					return Engine.showMessageBox("OS Mismatch", "The downloaded file is not for this OS. Please contact support.", 1);

				if (x.filename.toLowerCase().indexOf("_vst") != -1)
					path = getVst3Path();
				
				if (x.filename.toLowerCase().indexOf("_au") != -1)
					path = getAuPath();
					
				if (x.filename.toLowerCase().indexOf("_dat") != -1)
					path = getDataPath(pluginName);

				if (isDefined(path))
				{
					local target = FileSystem.fromAbsolutePath(path);

					if (!target.isDirectory())
					{
						Engine.showMessageBox("Missing Directory", "The plugin directory at " + path  + " was not found. Please verify this directory exists and try again.", 4);
						Downloader.postDownload("Error: Missing Directory");
					}
					else 
					{
						f.extractZipFile(target, true, function(obj)
						{
							if (obj.Error != "")
								obj.Cancel = true;

							if (obj.Status == 1 && Spinner.isVisible())
								unzipTimer.startTimer(100);
								
							if (obj.Status == 1)
								updateProgressBar(obj);
							
							if (obj.Status == 2)
							{
								extractionCount++;
								
								unzipTimer.stopTimer();
								
								if (extractionCount >= nest.fileCount)
								{
									if (obj.Error != "")
										Engine.showMessageBox("Installation Error", obj.Error, 3);										

									Downloader.postDownload(obj.Error);
									Spinner.hide();
								}
							}							
						});
					}
				}
				else 
				{
					Engine.showMessageBox("Undefined Path", "The plugin path could not be found.", 1);
				}			
			}
		}
	}
	
	inline function uninstall(data)
	{
		local msg = "";
		local result = false;

		if (!isDefined(data.pluginName) && isDefined(data.name))
			data.pluginName = data.name;

		if (isDefined(data.pluginName))
		{
			if (data.pluginName == "")
				data.pluginName = data.name;

			local dataPath = getDataPath(data.pluginName);
			local dataDir = FileSystem.fromAbsolutePath(dataPath);

			if (isDefined(dataDir) && dataDir.isDirectory())
			{
				local audioData = dataDir.getChildFile("AudioResources.dat");
				result = audioData.deleteFileOrDirectory();
			}

			local vstPath = getVst3Path();

			if (vstPath != false)
			{
				local vstDir = FileSystem.fromAbsolutePath(vstPath);
				local vstPlugin = vstDir.getChildFile(data.pluginName + ".vst3");

				if (vstPlugin.isFile() || vstPlugin.isDirectory())
					result = vstPlugin.deleteFileOrDirectory();
				else 
					msg = "VST plugin not found at " + vstPath;
			}

			if (Engine.getOS() == "OSX")
			{
				local auPath = getAuPath();

				if (auPath != false)
				{
					local auDir = FileSystem.fromAbsolutePath(auPath);
					local auPlugin = vstDir.getChildFile(data.pluginName + ".component");

					if (auPlugin.isFile() || auPlugin.isDirectory())
						result = auPlugin.deleteFileOrDirectory();
					else 
						msg += "AU plugin not found at " + auPath;
				}
			}
		}
		else
		{
			msg = "Invalid plugin name.";
		}

		if (!result)
			msg = "Failed: " + msg;

		return msg;
	}
	
	inline function updateProgressBar(obj)
	{
		local currentFile = obj.CurrentFile;
			
		local action = "Extracting: " + currentFile;
		local status = "";
	
		if (isDefined(obj.NumBytesWritten))
			status = FileSystem.descriptionOfSizeInBytes(obj.NumBytesWritten);
	
		ProgressBar.updateItemProgress(obj.Progress, action, status);
	}

	inline function isInstalled(name)
	{
		local vstPath = FileSystem.fromAbsolutePath(getVst3Path());
		local auPath = FileSystem.fromAbsolutePath(getAUPath());

		local f = FileSystem.findFiles(vstPath, name + ".*", true)[0];

		if (isDefined(f))
		{
			return true;
		}
		else if (Engine.getOS() == "OSX")
		{
			f = FileSystem.findFiles(auPath, name + ".*", true)[0];				
			return isDefined(f) && f.isDirectory();
		}
		
		return false;
	}

	inline function getVst3Path()
	{
		switch (Engine.getOS())
		{
			case "LINUX": return "~/.vst3";
			case "OSX": return "/Library/Audio/Plug-ins/VST3";
			case "WIN": return "C:\Program Files\Common Files\VST3";
		}
	}
	
	inline function getAUPath()
	{
		return "/Library/Audio/Plug-Ins/Components";
	}
	
	inline function getDataPath(pluginName)
	{
		local f = appData.getParentDirectory().getChildFile(pluginName);
	
		if (f == undefined || !f.isDirectory())
			f = appData.getParentDirectory().createDirectory(pluginName);

		return f.toString(f.FullPath);
	}
	
}