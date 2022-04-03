namespace LibraryItem
{
	reg nest = {};
	reg item;

	function momentaryButtonMouseCallback(event)
	{
		this.data.hover = event.hover;
	
		if (event.clicked || event.mouseUp)
		{
			this.setValue(event.clicked && !event.mouseUp);
			this.changed();		
		}
		
		this.repaint();
	}
	
	// btnInstall
	inline function onbtnInstallControl(component, value)
	{
		if (!value)
		{
			local parent = component.getParentPanel();
			item = parent.data.item;
	
			if (isDefined(item.hasUpdate) && item.hasUpdate && isDefined(item.installedVersion))
			{
				Engine.showYesNoWindow("Update", "Do you want to update " + item.name + "?", function(response)
				{
					if (response)
					{
						if (isDefined(item.variations) && item.variations.length > 0)
							Variations.getVariation(item);
						else
							LibraryList.passToDownloader(item);
					}
				});
			}
			else
			{
				if (isDefined(item.variations) && item.variations.length > 0)
					Variations.getVariation(item);
				else
					LibraryList.passToDownloader(item);
			}	
		}
	}
	
	// btnUninstall
	inline function onbtnUninstallControl(component, value)
	{
		if (!value)
		{
			local parent = component.getParentPanel();
			nest.item = parent.data.item.clone();
	
			Engine.showYesNoWindow("Confirm Uninstall", "Do you want to uninstall " + nest.item.name + "?", function(response)
			{
				if (response)
				{
					nest.status = "";

					if (nest.item.format == "expansion" || isDefined(nest.item.expansionName))
						nest.status = Expansions.uninstall(nest.item.expansionName);
					else
						nest.status = Plugins.uninstall(nest.item);
					
					Log.addEntry(nest.item, "uninstall", nest.status);

					if (nest.status != "")
					{
						if (isDefined(Toaster.centre))
							Toaster.centre(nest.status);
						else
							Engine.showMessageBox("Info", nest.status, 0);
					}
	
					Library.updateCatalogue();
				}
			});
		}
	}
	
	// btnBuy
	inline function onbtnBuyControl(component, value)
	{
		if (!value)
		{
			local parent = component.getParentPanel();

			Engine.openWebsite(parent.data.item.url);
		}
	}

	// btnCancel
	inline function onbtnCancelControl(component, value)
	{
		if (!value)
		{
			local parent = component.getParentPanel();
			item = parent.data.item;
	
			Engine.showYesNoWindow("Cancel Download", "Do you want to cancel the download and installation?", function(response)
			{
				if (response)
				{
					Downloader.abortDownloads(item);
					Expansions.abortInstallation();
				}
			});
		}
	}
	
	// btnLoad
	inline function onbtnLoadControl(component, value)
	{
		if (!value && !Downloader.getQueueLength())
		{
			local parent = component.getParentPanel();
			item = parent.data.item;
	
			Engine.showYesNoWindow("Load Library", "Do you want to load " + item.name + "?", function(response)
			{
				if (response)
					Expansions.setCurrent(item.expansionName);
			});
		}
	}
	
	// btnRating
	inline function onbtnRatingControl(component, value)
	{
		if (!value)
		{
			local parent = component.getParentPanel();
			item = parent.data.item;

			if (isDefined(Config.ALLOW_REVIEWS) && Config.ALLOW_REVIEWS)
				Ratings.show(parent.data.item);				
			else
				Engine.openWebsite(item.url);
		}
	}
}