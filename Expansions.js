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

namespace Expansions
{
	const expHandler = Engine.createExpansionHandler();
	const appData = FileSystem.getFolder(FileSystem.AppData);

	reg nest = {};
	reg expList = expHandler.getExpansionList();
	reg zips;
	reg abortInstall;
	reg extractionCount = 0;

	// Functions
	inline function install(expName, origin, sampleDir)
	{		
		if (appData.isDirectory() && origin.isDirectory() && sampleDir.isDirectory())
		{
			abortInstall = false;
			nest.expName = expName;
			zips = FileSystem.findFiles(origin, "*.zip", false);
			createExpansionDirectory(expName, sampleDir);
			unload(expName);
			unpackZips(sampleDir);
		}
	}

	inline function unload(expName)
	{
		for (e in expList)
		{
			if (e.getProperties().Name == expName)
				e.unloadExpansion();
		}
	}

	inline function manualInstall()
	{
		FilePicker.show({
			startFolder: FileSystem.getFolder(FileSystem.Downloads),
			mode: 0,
			filter: "*.zip",
			title: "Install from Zip Files",
			icon: ["zipFile", 45, 60],
			message: "Select the hxi zip file.",
			buttonText: "Next"
		}, selectHxiCallback);
	}

	function selectHxiCallback(f)
	{
		if (isDefined(f) && f.isFile())
		{
			if (f.toString(f.NoExtension).indexOf("_hxi_") == -1)
			{
				Engine.showMessageBox("Incorrect File Selected", "Please select the zip file that includes 'hxi' in its name.", 1);
			}
			else
			{
				nest.expName = getExpansionNameFromFilename(f.toString(f.NoExtension));
				
				if (isDefined(nest.expName))
				{
					nest.path = f.toString(f.FullPath);
					nest.origin = FileSystem.fromAbsolutePath(nest.path.substring(0, nest.path.lastIndexOf("/")));
					zips = FileSystem.findFiles(nest.origin, nest.expName.toLowerCase().replace(" ", "_") + "*.zip", false);
					nest.startFolder = getSampleFolder(nest.expName);
					
					if (zips.length > 0)
					{							
						FilePicker.show(
						{
							startFolder: UserSettings.getDefaultSampleFolder(),
							mode: 1,
							filter: "",
							title: "Install from Zip Files",
							icon: ["hdd", 60, 60],
							message: "Choose a location to install the samples.",
							buttonText: "Install"
						}, selectSampleInstallLocationCallback);
					}
					else
					{
						Engine.showMessageBox("Missing Samples", "No zip files containing samples for " + nest.expName.capitalize() + " were found.", 1);
					}
				}
			}
		}
	};

	function selectSampleInstallLocationCallback(sampleDir)
	{
		if (isDefined(sampleDir) && sampleDir.isDirectory())
		{
			if (!sampleDir.hasWriteAccess())
				return ErrorHandler.showError("Unwritable Directory", "You do not have write permission for the selected directory. Please choose a different one.");

			createExpansionDirectory(nest.expName, sampleDir);
			Spinner.show("Installing");
			unpackZips(sampleDir);
		}
	};		
		
	inline function getExpansionNameFromFilename(filename)
	{
		local result = "";
		local matches = Engine.getRegexMatches(filename, ".+hxi|.+dat|.+samples");
		
		if (isDefined(matches))
			result = matches[0].replace("_hxi").replace("_dat").replace("_samples").replace("_", " ").trim().capitalize();

		return result;
	}

	inline function batchInstall()
	{
		Engine.showYesNoWindow("Select Folder", "Select the folder containing library zip files.", function(response)
		{
			if (response)
			{
				FileSystem.browseForDirectory(FileSystem.Downloads, function(dir)
				{
					if (isDefined(dir) && dir.isDirectory())
					{
						nest.origin = dir;
						
						Engine.showYesNoWindow("Install Location", "Choose a location to install the samples.", function(response) 
						{
							FileSystem.browseForDirectory(nest.origin, function(sampleDir)
							{
								if (isDefined(sampleDir) && sampleDir.isDirectory())
								{
									zips = FileSystem.findFiles(nest.origin, "*.zip", false);
									nest.expNames = getExpansionNamesFromZips();

									if (zips.length > 0)
									{
										for (x in nest.expNames)
											createExpansionDirectory(x, sampleDir);							
	
										Spinner.show("Installing");
										unpackZips(sampleDir);										
									}
									else
									{
										Engine.showMessageBox("No Files", "No zip files where found in the selected folder.", 0);
									}
								}
							});
						});
					}
				});
			}
		});
	}

	inline function refreshExpansions()
	{
		expHandler.refreshExpansions();
		expList = expHandler.getExpansionList();

		for (e in expList)
			e.rebuildUserPresets();
	}

	inline function sortFiles(a, b)
	{
		if (a.toString(a.Filename) < b.toString(b.Filename))
			return -1;
		else
			return a.toString(a.Filename) > b.toString(b.Filename);
	}

	inline function unpackZips(sampleDir)
	{
		extractionCount = 0;

		Engine.sortWithFunction(zips, sortFiles);

		for (z in zips)
		{
			local filename = z.toString(z.Filename).toLowerCase();			
			local expName = getExpansionNameFromFilename(filename).capitalize();
			local expDir = getExpansionDirectory(expName);
			local sampleTarget = sampleDir.getChildFile(expName);

			if (isDefined(expDir) && isDefined(sampleTarget))
			{
				local target = filename.indexOf("_samples") != -1 ? sampleTarget : expDir;
				z.extractZipFile(target, true, extractionCallback);
			}
		}
	}
	
	inline function extractionCallback(obj)
	{
		if (obj.Error != "" || abortInstall)
			obj.Cancel = true;

		if (obj.Status == 1)
			updateProgressBar(obj);

		if (obj.Status == 2)
		{
			extractionCount++;
		
			if (extractionCount >= zips.length)
			{
				if (obj.Error != "")
					Engine.showMessageBox("Install Error", obj.Error, 3);
				else
					Notification.show("The installation is complete.");
				
				if (isDefined(Config.ENCODE_EXPANSIONS) && Config.ENCODE_EXPANSIONS)
					Expansions.encodeExpansion(nest.expName);
				else
					refreshExpansions();
				
				Downloader.postDownload();
				
				Spinner.hide();
			}
		}
	}

	inline function updateProgressBar(obj)
	{
		local currentFile = obj.CurrentFile;
	
		local action = "Extracting: " + (extractionCount + 1) + "/" + zips.length;
		local status = "";

		if (isDefined(obj.NumBytesWritten))
			status = FileSystem.descriptionOfSizeInBytes(obj.NumBytesWritten);
	
		ProgressBar.updateItemProgress(obj.Progress, action, status);
		Spinner.setMessage(action + " " + Math.round(obj.Progress * 100) + "%");
	}

	inline function encodeExpansion(expName)
	{
		local hxiFile = appData.getChildFile("Expansions").getChildFile(expName).getChildFile("info.hxi");

		if (Config.MODE == "development")
			hxiFile = FileSystem.fromAbsolutePath(Config.DEV_FOLDER).getChildFile("Expansions").getChildFile(expName).getChildFile("info.hxi");

		if (isDefined(hxiFile))
		{
			local result = expHandler.encodeWithCredentials(hxiFile);

			if (result)
			{
				hxiFile.deleteFileOrDirectory();
				refreshExpansions();
			}
		}
		else
		{
			Engine.showMessageBox("Error", "The installation was not successful. Please contact support", 1);
			uninstall(expName);
		}
	}

	inline function getExpansionDirectory(expName)
	{
		local expansions = appData.getChildFile("Expansions");

		if (Config.MODE == "development")
			expansions = FileSystem.fromAbsolutePath(Config.DEV_FOLDER).getChildFile("Expansions");

		return expansions.getChildFile(expName);
	}

	inline function getExpansionNamesFromZips()
	{
		local result = [];

		for (z in zips)
		{
			local filename = z.toString(z.Filename).toLowerCase();
			local name = getExpansionNameFromFilename(filename);
			
			if (isDefined(name) && !result.contains(name))
				result.push(name);
		}

		return result;
	}

	inline function createExpansionDirectory(expName, sampleTarget)
	{		
		if (isDefined(appData) && appData.isDirectory() && sampleTarget.isDirectory())
		{
			local expansions = appData.getChildFile("Expansions");
			
			if (Config.MODE == "development")
				expansions = FileSystem.fromAbsolutePath("/media/dave/Work/Projects/Libre Player/libreplayer mkv/Expansions");

			if (!isDefined(expansions) || !expansions.isDirectory())
				expansions = appData.createDirectory("Expansions");

			local expDir = expansions.getChildFile(expName);

			if (!isDefined(expDir) || !expDir.isDirectory())
				expDir = expansions.createDirectory(expName);

			local samplesDir = expDir.getChildFile("Samples");
			
			if (!isDefined(samplesDir) || !samplesDir.isDirectory())
				samplesDir = expDir.createDirectory("Samples");
			
			local samplesTargetSubDir = sampleTarget;
			
			if (sampleTarget.toString(sampleTarget.NoExtension) != expName)
				samplesTargetSubDir = sampleTarget.createDirectory(expName);

			createLinkFile(samplesDir, samplesTargetSubDir);

			return expDir;
		}
	}
	
	inline function createLinkFile(dir, target)
	{
		local filename = "";

		switch (Engine.getOS())
		{
			case "OSX": filename = "LinkOSX"; break;
			case "LINUX": filename = "LinkLinux"; break;
			case "WIN": filename = "LinkWindows"; break;
		}
	
		local f = dir.getChildFile(filename);
		
		if (target.isDirectory())
			f.writeString(target.toString(f.FullPath));
	}

	inline function uninstall(expName)
	{
		local result = false;
		local msg = "";
		local e = expHandler.getExpansion(expName);

		if (isDefined(e))
		{
			local rootFolder = e.getRootFolder();
			local sampleFolder = e.getSampleFolder();

			if (rootFolder.isDirectory())
			{
				local hxi = rootFolder.getChildFile("info.hxi");

				if (hxi.isFile())
					result = hxi.deleteFileOrDirectory();
				else
					msg = "The expansion data file was not found.";
			}

			if (sampleFolder.isDirectory())
			{
				local samples = FileSystem.findFiles(sampleFolder, "*.ch*", false);

				for (ch in samples)
					ch.deleteFileOrDirectory();

				// Delete samples folder if empty
				local files = FileSystem.findFiles(sampleFolder, "*", true);
				
				if (!files.length)
					sampleFolder.deleteFileOrDirectory();

				result = true;
			}
			else
			{
				msg = "The uninstallation completed but the sample directory could not be found.";
			}
			
			e.unloadExpansion();
		}
		else
		{
			msg = "The library was not found on your system.";
		}

		if (result)
			msg = "The uninstallation completed successfully.";

		expHandler.refreshExpansions();

		return msg;
	}

	inline function getExpansions()
	{
		local result = {};
		
		for (e in expHandler.getExpansionList())
		{
			local props = e.getProperties();

			local item = {
				"name": props.Name,
				"projectName": props.ProjectName,
				"expansionName": props.Name,
				"format": "expansion",
				"installedVersion": props.Version,
				"sampleDirectory": e.getSampleFolder()
			};

			result[props.Name] = item;
		}

		return result;
	}
	
	inline function setCurrent(expName)
	{
		expHandler.setCurrentExpansion(expName);
		Spinner.show("Loading");
	}
	
	inline function getCurrent()
	{
		expHandler.getCurrentExpansion();
	}
	
	inline function getVersion(expName)
	{
		local e = expHandler.getExpansion(expName);
		
		if (isDefined(e))
			return e.getProperties().Version;
		
		return undefined;
	}
	
	inline function getByName(expName)
	{
		return expHandler.getExpansion(expName);
	}
	
	inline function abortInstallation()
	{
		abortInstall = true;
	}
	
	inline function getSampleFolder(expName)
	{
		local e = expHandler.getExpansion(expName);
		
		if (isDefined(e))
			return e.getSampleFolder();
			
		return undefined;
	}

	inline function getImagePath(expName, imgName)
	{
		local e = expHandler.getExpansion(expName);

		if (isDefined(e))
		{
			if (imgName == "Icon.png")
				return e.getWildcardReference(imgName);				

			local images = e.getImageList();

			if (images.length > 0)
			{
				local index = images.indexOf(e.getWildcardReference(imgName));
					
				if (index != -1)
					return images[index];
			}
		}
		
		return undefined;
	}
	
	inline function setCredentials(value)
	{
		if (!isDefined(Config.ENCODE_EXPANSIONS) && Config.ENCODE_EXPANSIONS) return;

		if (isDefined(value))
			expHandler.setCredentials({"username": value});
	}
		
	inline function getCurrent()
	{
		return expHandler.getCurrentExpansion();
	}

	// Function calls
	setCredentials(FileSystem.getSystemId());
}
