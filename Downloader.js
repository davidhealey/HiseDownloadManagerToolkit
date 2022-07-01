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

namespace Downloader
{
	const queue = [];
	const downloads = [];
	
	reg tempDir = FileSystem.getFolder(FileSystem.Temp);
	reg abort = false;
	reg item;
	reg nest = {};

	// clearTempTimer
	const clearTempTimer = Engine.createTimerObject();
	
	clearTempTimer.setTimerCallback(function()
	{
		if (isDefined(item.tempDir) && item.tempDir.isDirectory())
			item.tempDir.deleteFileOrDirectory();
		
		this.stopTimer();
	});
		
	// Functions
	inline function downloadItem()
	{
		abort = false;
		downloads.clear();

		Server.setHttpHeader("");
		Server.setBaseURL(Config.baseURL[Config.MODE]);
		Server.cleanFinishedDownloads();
		
		item.tempDir = tempDir.createDirectory(item.id);
			
		for (x in item.downloads)
		{
			local f = item.tempDir.getChildFile(x.filename);
			local url = x.download_url.replace(Config.baseURL[Config.MODE]);
			downloads.push(Server.downloadFile(url, {}, f, downloadCallback));
		}

		ProgressBar.setItem(item);
		ProgressBar.start();
	}
	
	function downloadCallback()
	{
		if (abort || abort == -1)
			this.abort();
		
		updateProgress(this);

		if (this.data.finished)
		{
			if (this.data.success)
			{
				downloads.remove(this);

				if (downloads.length == 0)
				{
					if (item.format == "expansion")
						Expansions.install(item.expansionName, item.tempDir, item.sampleDirectory);
					else if (item.format == "plugin")
						Plugins.install(item.pluginName, item.tempDir, item.downloads);
				}
			}
			else if (abort != -1)
			{
				var msg = abort ? "The download was cancelled" : "The download failed";

				Notification.show(msg);
				postDownload();
				abort = -1;
			}
		}
	}
	
	inline function updateProgress(download)
	{
		local data = {value: 0, action: "Processing", speed: undefined, status: undefined};
		
		if (download.getProgress() > 0)
		{
			data.value = download.getProgress();
			data.action = "Downloading";
			data.status = "File: " + (item.downloads.length - downloads.length + 1) + "/" + item.downloads.length;

			if (download.getDownloadSpeed() > 0)
				data.speed = FileSystem.descriptionOfSizeInBytes(download.getDownloadSpeed()) + "/s";
		}

		ProgressBar.setProperties(data);		
	}
		
	inline function addToQueue(data)
	{
		nest.queueData = data;

		local headers = ["Authorization: Bearer " + UserAccount.getToken()];
		local endpoint =  Config.apiPrefix + "get_downloads";
		local version = isDefined(data.installedVersion) ? data.installedVersion : 0;
		local id = isDefined(data.variation) ? data.variation : data.id;

		local p = {
			product_id: id,
			user_os: Engine.getOS(),
			user_version: version,
			allow_beta: UserSettings.getValue("beta"),
			filter: ""
		};

		Server.setHttpHeader(headers.join("\n"));
		Server.setBaseURL(Config.baseURL[Config.MODE]);
		Server.cleanFinishedDownloads();
		
		Spinner.show("Verifying license");

		Server.callWithGET(endpoint, p, function(status, response)
		{
			Spinner.hide();

			if (status == 200)
			{
				if (isDefined(response[0]) && response[0] != false)
				{
					nest.queueData.downloads = response;
					queue.push(nest.queueData);
					nest.queueData.progress = ProgressBar.getDefaultProgressObject();
					LibraryList.rebuildChildButtons(nest.queueData.id);
					LibraryHeader.enableButtonsThatInterfereWithDownloads(false);

					if (queue.length == 1)
					{
						item = queue[0];
						downloadItem();
					}
				}
				else
				{
					ErrorHandler.serverError(status, response, "");
				}
			}
			else
			{
				ErrorHandler.serverError(status, response, "");
			}
		});
	}
	
	inline function removeFromQueue(data)
	{
		if (isDefined(data))
		{
			data.progress = undefined;
			
			if (queue.contains(data))
				queue.remove(data);
		}
	}
	
	inline function clearTemp()
	{
		clearTempTimer.startTimer(100);
	}
	
	inline function abortDownloads(data)
	{
		if (item.id == data.id)
			abort = true;

		removeFromQueue(data);
	}
		
	inline function postDownload()
	{
		ProgressBar.clear();

		if (isDefined(item))
		{
			removeFromQueue(item);
			item.installedVersion = "temp";
			LibraryList.rebuildChildButtons(item.id);
		}

		if (queue.length > 0)
		{
			item = queue[0];
			downloadItem();
		}
		else
		{
			queue.clear();
			clearTemp();
			Server.cleanFinishedDownloads();
			Library.updateCatalogue();
			downloads.clear();
			LibraryHeader.enableButtonsThatInterfereWithDownloads(true);
		}
	}
		
	inline function getQueueLength()
	{
		return queue.length;
	}

	inline function checkDiskSpace(f, bytesRequired)
	{
		local msg = "There is not enough space on your system to download and install the files.";
	
		if (f.getBytesFreeOnVolume() - 500000000 < bytesRequired)
			return Engine.showMessageBox("Not enough space", msg, 4);
	
		return true;
	}
	
	inline function isDownloading()
	{
		return queue.length != 0 && downloads.length != 0;
	}

	// Function calls
	if (!Engine.isPlugin() || Config.NETWORK_IN_PLUGIN)
	{
		Server.setNumAllowedDownloads(1);
		Server.cleanFinishedDownloads();
	}
}