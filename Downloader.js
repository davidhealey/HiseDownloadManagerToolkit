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
	reg downloadCount;
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
		downloadCount = 0;
		downloads.clear();

		local headers = ["Authorization: Bearer " + UserAccount.getToken()];

		Server.setHttpHeader(headers.join("\n"));
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

		var speed = FileSystem.descriptionOfSizeInBytes(this.getDownloadSpeed()) + "/s";
		var action = this.getStatusText() + ": " + (downloadCount + 1) + "/" + downloads.length;
		var status = "";
		
		if (isDefined(this.data.numDownloaded))
			status = FileSystem.descriptionOfSizeInBytes(this.data.numDownloaded) + "/" + FileSystem.descriptionOfSizeInBytes(this.data.numTotal);

		ProgressBar.updateItemProgress(this.getProgress(), action, status);

		if (this.data.finished)
		{
			downloadCount++;

			if (this.data.success)
			{
				if (downloadCount >= downloads.length)
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
				
				if (isDefined(Toaster.centre))
					Toaster.centre(msg);
				else
					Engine.showMessageBox("Aborted", msg, 1);

				postDownload("aborted");
				abort = -1;
			}
		}
	}
	
	inline function addToQueue(data)
	{
		nest.queueData = data;

		local headers = ["Authorization: Bearer " + UserAccount.getToken()];
		local endpoint =  Config.apiPrefix + "get_downloads";
		local version = isDefined(data.installedVersion) ? data.installedVersion : 0;
		local id = isDefined(data.variation) ? data.variation : data.id;
		local filter = "";
		local p = {"product_id": id, "user_os": Engine.getOS(), "user_version": version, "filter": filter};

		Server.setHttpHeader(headers.join("\n"));
		Server.setBaseURL(Config.baseURL[Config.MODE]);
		
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

					if (queue.length == 1)
					{
						item = queue[0];
						downloadItem();
					}
				}
				else
				{
					ErrorHandler.serverError(status, response, "Could not find any download links. Please contact support if this issue persists.");
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
		data.progress = undefined;
		queue.remove(data);
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
	
	inline function postDownload(status)
	{
		if (isDefined(item))
		{
			Log.addEntry(item, "install", status);
			removeFromQueue(item);
			item.installedVersion = "temp";
			LibraryList.rebuildChildButtons(item.id);
		}

		ProgressBar.clear();

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

	// Function calls
	if (!Engine.isPlugin() || Config.NETWORK_IN_PLUGIN)
	{
		Server.setNumAllowedDownloads(3);
		Server.cleanFinishedDownloads();
	}
}