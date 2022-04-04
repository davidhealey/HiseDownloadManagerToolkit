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

namespace Library
{	
	const images = [];
	const items = [];
	
	const appData = FileSystem.getFolder(FileSystem.AppData);
	reg cache = appData.createDirectory("cache");
	reg nest = {}; // Variables used inside nested functions	
	
	// pnlLibrary
	const pnlLibrary = Content.getComponent("pnlLibrary");
	
	pnlLibrary.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
	
		g.fillAll(this.get("bgColour"));
	
		g.setColour(this.get("textColour"));
		g.fillPath(Paths.librewave, [a[2] - 140, a[3] - 31, 128, 15]);
	});
	
	// Functions
	inline function autoSync()
	{
		if ((!Engine.isPlugin() || Config.NETWORK_IN_PLUGIN) && Server.isOnline() && UserAccount.getToken() != false)
		{
			local lastSync = readLastSync();
	
			if (isDefined(lastSync) && typeof lastSync == "string")
			{
				local today = getTimeStampInDays(Engine.getSystemTime(false));
				local lastDays = getTimeStampInDays(lastSync);

				if (Math.abs(today - lastDays) > 6)
					rebuildCache();
			}
		}
	}

	inline function filter(query)
	{
		local result = [];
		local value = LibraryHeader.getFilterValue();
		
		if (isDefined(items))
		{
			for (x in items)
			{
				local tags = x.tags.length > 0 ? x.tags : [""];

				for (i = 0; i < tags.length; i++)
				{
					local t = tags[i];
					local data;

					if (Engine.matchesRegex(t.toLowerCase(), query) || Engine.matchesRegex(x.name.toLowerCase(), query))
					{
						if (value == 1)
						{
							data = x;
						}							
						else if (value == 2 && isDefined(x.installedVersion))
						{
							data = x;
						}
						else if (value == 3)
						{
							if (x.hasLicense && !isDefined(x.installedVersion))
							{
								data = x;
							}
							else if (isDefined(x.variations))
							{
								for (v in x.variations)
								{
									if (v.hasLicense && !isDefined(v.installedVersion))
										data = x; break;
								}
							}
						}
						else if (value == 4 && isDefined(x.hasUpdate) && x.hasUpdate)
						{
							data = x;
						}
						else if (value == 5 && x.regularPrice == "0")
						{
							data = x;
						}

						if (isDefined(data))
							result.push(data);

						break;	
					}
				}
			}

			LibraryList.populateFromArray(result);
		}
	}
		
	inline function uninstall(data)
	{
		local msg = "Are you sure you want to uninstall this product?";
		nest.item = data; // Reg required for scope

		Engine.showYesNoWindow("Confirm Action", msg, function(response)
		{
			if (response)
			{
				nest.result = false;

				if (nest.item.format == "expansion")
					nest.result = Expansions.uninstall(nest.item.name);
				else if (nest.item.format == "plugin" && isDefined(Plugins.uninstall))
					nest.result = Plugins.uninstall(nest.item);

				if (nest.result == true)
					Engine.showMessageBox("Success", "Product was successfully uninstalled.", 0);
				else
					Engine.showMessageBox("Complete", "The uninstall process is complete. Some files may remain on your system.", 1);
				
				updateCatalogue();
			}
		});
	}
				
	inline function getCachedFile(filename)
	{
		local f = cache.getChildFile(filename);

		if (f.isFile())
			return f;

		return false;
	}
		
	inline function show(state)
	{
		pnlLibrary.showControl(state);
	}
		
  	inline function updateCatalogue()
	{
		if (cache.isDirectory())
		{
			items.clear();

			local f = cache.getChildFile("cache.json");
			local cacheData = f.loadEncryptedObject(encryptionKey);
			local installedExpansions = Expansions.getExpansions();

			for (x in installedExpansions)
			{
				local e = installedExpansions[x];

				if (isDefined(Config.EXPANSION_HOST) && Config.EXPANSION_HOST != "" && Config.EXPANSION_HOST != e.projectName) continue;
				items.push(e);
			}

			if (isDefined(cacheData))
			{
				for (x in cacheData)
				{
					local index = items.length;

					if (!isDefined(x.format) || !["expansion", "plugin"].contains(x.format)) continue;
					if (!Config.SHOW_PLUGINS && x.format == "plugin") continue;
					if ((!isDefined(Config.FULL_EXPANSIONS) && !Config.SHOW_PLUGINS) && (isDefined(Config.EXPANSION_HOST) && x.projectName != Config.EXPANSION_HOST || !isDefined(x.projectName))) continue;

					if (isDefined(installedExpansions[x.name]))
					{
						index = items.indexOf(installedExpansions[x.name]);
						x.installedVersion = items[index].installedVersion;
						x.sampleDirectory = items[index].sampleDirectory;
					}
	
					if (isDefined(x.latestVersion) && isDefined(x.installedVersion))
					{
						if ((x.latestVersion > x.installedVersion) && (isDefined(x.hasLicense) && x.hasLicense))
							x.hasUpdate = true;
					}

					items[index] = x;
				}
			}

			filter(LibraryHeader.getSearchQuery());
			Spinner.hide();
		}
	}
		 
	inline function clearCache()
	{
		if (cache.isDirectory())
			cache.deleteFileOrDirectory();

		Server.cleanFinishedDownloads();
		cache = appData.createDirectory("cache");
		LibraryList.clear();
		items.clear();
		images.clear();
	}

	inline function rebuildCache()
	{
		local endpoint = Config.apiPrefix + "get_catalogue";
		local headers = ["Authorization: Bearer " + UserAccount.getToken()];

		Server.setBaseURL(Config.baseURL[Config.MODE]);
		Server.setHttpHeader(headers.join("\n"));

		Spinner.show("Syncing");

		Server.callWithGET(endpoint, {}, function(status, response)
		{
			if (status == 200)
			{
				clearCache();

				nest.f = cache.getChildFile("cache.json");
				nest.f.writeEncryptedObject(response, encryptionKey);

				nest.numItems = response.length;
				images.clear();

				for (x in response)
				{
					if (isDefined(x.image))
					{
						nest.url = x.image.replace(Config.baseURL[Config.MODE], "");
						nest.f = cache.getChildFile(x.id + ".jpg");
						
						Server.downloadFile(nest.url, {}, nest.f, function()
						{
							if (this.data.finished && this.data.success)
							{
								nest.name = this.getDownloadedTarget().toString(1);
	
								if (!images.contains(nest.name))
									images.push(nest.name);
	
								if (images.length >= nest.numItems && Spinner.isVisible())
								{
									checkForAppUpdate();
									updateCatalogue();
								}							
							}
						});
					}
					else
					{
						images.push("placeholder"); // Just a value to fill out the array
					}
				}
			}
			else
			{
				nest.msg = "The server reported an error, please try again or contact support.";
				ErrorHandler.serverError(status, response, msg);
				Spinner.hide();
			}
		});
	}

	inline function writeToCacheFile(productId, field, value)
	{
		local f = cache.getChildFile("cache.json");
		
		if (f.isFile())
		{
			local data = f.loadEncryptedObject(encryptionKey);
			
			for (x in data)
				if (x.id == productId)
					x[field] = value;

			f.writeEncryptedObject(data, encryptionKey);
		}
	}

	inline function checkForAppUpdate()
	{
		local headers = ["Authorization: Bearer " + UserAccount.getToken()];
		local endpoint = Config.apiPrefix + "check_for_app_update";
		local p = {"installed_version": Engine.getVersion(), "user_os": Engine.getOS()};

        Server.setHttpHeader(headers.join("\n"));
		Server.setBaseURL(Config.baseURL[Config.MODE]);
		Server.cleanFinishedDownloads();

		Spinner.show("Syncing");

		Server.callWithGET(endpoint, p, function(status, response)
		{
			if (status == 200)
			{	
				if (response[0] != false)
				{
					var msg = "A new version of " + Engine.getName() + " is available. Would you like to download the installer now?";
					var url = response[0];

					Engine.showYesNoWindow("Update", msg, function(action)
					{
						if (action)
							downloadAppUpdate(url);
					});
				}
			}
			else
			{
				ErrorHandler.serverError(status, response, "");
			}

			Spinner.hide();
		});
	}
		
	inline function downloadAppUpdate(url)
	{
		local filename = url.substring(url.lastIndexOf("/") + 1, url.length);
		nest.dir = FileSystem.getFolder(FileSystem.Downloads);
		nest.f = dir.getChildFile(filename);
		
		Server.setBaseURL(Config.webPrefix[Config.MODE]);
		
		Spinner.show("Downloading Update");
		
		Server.downloadFile(url.replace(Config.webPrefix[Config.MODE]), {}, nest.f, function()
		{
			if (this.data.finished)
			{
				nest.msg = "The download is complete. Would you like to exit and run the update installer?";

				Engine.showYesNoWindow("Success", nest.msg, function(action)
				{
					if (action)
					{
						if (nest.f.setExecutePermission(true))
							nest.f.startAsProcess("");
						else
							nest.dir.show();

						Engine.quit();						
					}
				});

				Spinner.hide();
			}
			else
			{
				Spinner.show("Downloading: " + Math.round(this.getProgress() * 100) + "%");
			}
		});
	}

	inline function postInstall()
	{
		pnlLibrary.set("enabled", true);
		ProgressBar.stop();
		updateCatalogue();
	}
	
	inline function readLastSync()
	{
		local f = appData.getChildFile("synctime.txt");
		
		if (f.isFile())
			return f.loadAsString();

		return false;
	}
	
	inline function getTimeStampInDays(dateString)
	{    
	    local timeStamp = Math.round(dateString.substring(6, 8))           // Days
	                    + Math.round(dateString.substring(4, 6)) * 30      // Months
	                    + Math.round(dateString.substring(0, 4)) * 365;    // Years
	
	    return timeStamp;
	}

	// Function calls
	autoSync();
	updateCatalogue();
}
