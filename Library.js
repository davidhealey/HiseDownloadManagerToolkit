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
	reg appDownload;
	
	// Flags
	reg syncing = false;
	reg downloading = false;
	reg abort = false;
	reg autoSyncing = false;
	
	// pnlLibrary
	const pnlLibrary = Content.getComponent("pnlLibrary");
	
	pnlLibrary.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
		g.fillAll(this.get("bgColour"));
	});
	
	// btnCancelAppUpdate
	const btnCancelAppUpdate = Content.getComponent("btnCancelAppUpdate");
	btnCancelAppUpdate.showControl(false);
	btnCancelAppUpdate.setLocalLookAndFeel(LookAndFeel.textButton);
	btnCancelAppUpdate.setControlCallback(onbtnCancelAppUpdateControl);
	
	inline function onbtnCancelAppUpdateControl(component, value)
	{
		if (!value)
			cancelAppUpdate();
	}

	// Functions
	inline function autoSync()
	{
		if ((!Engine.isPlugin() || Config.NETWORK_IN_PLUGIN) && Server.isOnline() && isDefined(UserAccount.getToken()) && UserSettings.getValue("autoSync"))
		{
			local lastSync = UserSettings.getValue("synctime");
			local today = Engine.getSystemTime(false).substring(0, 8);

			if (lastSync != today)
			{
				autoSyncing = true;
				rebuildCache();
			}				

			UserSettings.setValue("synctime", today);
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
							else if (x.regularPrice == "0")
							{
								data = x;
							}
						}
						else if (value == 4 && isDefined(x.hasUpdate) && x.hasUpdate)
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
			
			local cacheData = undefined;

			if (isDefined(f) && f.isFile())
				cacheData = f.loadEncryptedObject(encryptionKey);

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
					if ((!isDefined(Config.FULL_EXPANSIONS) && !Config.SHOW_PLUGINS) && (isDefined(Config.EXPANSION_HOST) && Config.EXPANSION_HOST != "" && (x.ProjectName != Config.EXPANSION_HOST || !isDefined(x.ProjectName)))) continue;

					if (isDefined(installedExpansions[x.expansionName]))
					{
						index = items.indexOf(installedExpansions[x.expansionName]);
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
		if (isDefined(cache) && cache.isDirectory())
			cache.deleteFileOrDirectory();

		Server.cleanFinishedDownloads();
		cache = appData.createDirectory("cache");
		LibraryList.clear();
		items.clear();
		images.clear();
	}
	
	inline function getCachedImageNames()
	{
		local result = [];

		if (isDefined(cache) && cache.isDirectory())
		{
			local files = FileSystem.findFiles(cache, "*.jpg", false);

			for (x in files)
				result.push(x.toString(x.NoExtension));
		}

		return result;
	}

	inline function rebuildCache()
	{
		local endpoint = Config.apiPrefix + "get_catalogue";
		local headers = ["Authorization: Bearer " + UserAccount.getToken()];

		Server.setBaseURL(Config.baseURL[Config.MODE]);
		Server.setHttpHeader(headers.join("\n"));

		Spinner.show("Syncing");
		syncing = true;

		Server.callWithGET(endpoint, {}, function(status, response)
		{
			if (status == 200)
			{
				images.clear();

				nest.f = cache.getChildFile("cache.json");
				nest.f.writeEncryptedObject(response, encryptionKey);
				nest.numItems = response.length;				
				nest.cachedImages = getCachedImageNames();

				for (x in response)
				{
					if (nest.cachedImages.indexOf(x.id) != -1)
					{
						if (!images.contains(x.id))
							images.push(x.id);
					}
					else if (isDefined(x.image))
					{
						nest.url = x.image.replace(Config.baseURL[Config.MODE], "");
						nest.f = cache.getChildFile(x.id + ".jpg");
							
						Server.downloadFile(nest.url, {}, nest.f, function()
						{
							if (this.data.finished && this.data.success)
							{
								nest.img = this.getDownloadedTarget();
								nest.name = nest.img.toString(nest.img.NoExtension);
		
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
						images.push(""); // Just a value to fill out the array
					}

					if (images.length >= nest.numItems && Spinner.isVisible())
					{
						checkForAppUpdate();
						updateCatalogue();
					}
				}
			}
			else
			{
				if (!autoSyncing)
					ErrorHandler.serverError(status, response, l10n.get("The server reported an error, please try again later or contact support."));

				Spinner.hide();
				syncing = false;
			}

			autoSyncing = false;
		});
	}

	inline function writeToCacheFile(productId, field, value)
	{
		local f = cache.getChildFile("cache.json");
		
		if (isDefined(f) && f.isFile())
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

		local p = {
			app_name: Config.APP_NAME,
			user_version: Engine.getVersion(),
			user_os: Engine.getOS(),
			allow_beta: UserSettings.getValue("beta")
		};

        Server.setHttpHeader(headers.join("\n"));
		Server.setBaseURL(Config.baseURL[Config.MODE]);

		Spinner.show("Syncing");
		syncing = true;

		Server.callWithGET(endpoint, p, function(status, response)
		{
			if (status == 200)
			{
				if (response[0] != false)
				{
					var msg = "A new version of " + Engine.getName() + " is available. Would you like to download the installer now?";
					nest.url = response[0];
					nest.filename = response[1];

					Engine.showYesNoWindow("Update", msg, function(action)
					{
						if (action)
							downloadAppUpdate(nest.url, nest.filename);
						else
							syncing = false;
					});
				}
			}
			else
			{
				ErrorHandler.serverError(status, response, "");
				syncing = false;
			}

			Spinner.hide();
		});
	}
		
	inline function downloadAppUpdate(url, filename)
	{
		nest.f = FileSystem.getFolder(FileSystem.Downloads).getChildFile(filename);
		local prefix = url.substring(0, url.indexOf("://") + 3);

		Server.setHttpHeader("");
		Server.setBaseURL(prefix);
		Server.cleanFinishedDownloads();

		Spinner.show(l10n.get("Downloading Update"));
		downloading = true;
		btnCancelAppUpdate.showControl(true);

		abort = false;

		appDownload = Server.downloadFile(url.replace(prefix), {}, nest.f, function()
		{
			if (this.data.finished)
			{
				if (this.data.success)
				{
					Engine.showYesNoWindow(l10n.get("Success"), l10n.get("The download is complete. Would you like to exit and run the update installer?"), function(action)
					{
						if (action)
						{
							if (nest.f.setExecutePermission(true) && Engine.getOS() != "LINUX")
								nest.f.startAsProcess("");								
							else
								FileSystem.fromAbsolutePath(nest.f.toString(nest.f.FullPath)).show();

							Engine.quit();
						}
						else
						{
							syncing = false;
						}
					});
					
					downloading = false;
				}
				else
				{
					if (abort == false)
						Engine.showMessageBox("Error", "The download was unsuccessful.", 3);

					syncing = false;
					downloading = false;
				}

				appDownload = undefined;
				Spinner.hide();
				btnCancelAppUpdate.showControl(false);
			}
			else
			{
				var text = l10n.get("Downloading Update: " + Math.round(this.getProgress() * 100) + "%");

				if (Splash.isVisible())
				{
					Splash.setText(text);
					Splash.setProgress(this.getProgress());
				}
				else
				{
					Spinner.show(text);
				}				
			}
		});
	}
	
	inline function cancelAppUpdate()
	{			
		Engine.showYesNoWindow("Cancel", l10n.get("Are you sure you want to cancel the update?"), function(response)
		{
			if (response && isDefined(appDownload))
			{
				abort = true;
				appDownload.abort();
				Spinner.hide();
				syncing = false;
				downloading = false;
				btnCancelAppUpdate.showControl(false);
			}
		});
	}

	inline function postInstall()
	{
		pnlLibrary.set("enabled", true);
		ProgressBar.stop();
		updateCatalogue();
	}
	
	inline function isSyncing()
	{
		return syncing;
	}
	
	inline function isDownloading()
	{
		return downloading;
	}

	// Function calls
	updateCatalogue();
}
