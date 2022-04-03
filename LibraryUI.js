/*
    Copyright 2021, 2022 David Healey

    This file is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This file is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with This file. If not, see <http://www.gnu.org/licenses/>.
*/

namespace LibraryList
{
	const GRID = true;

	const list = [];
	
	reg nest = {};
	reg item;

	// pnlLibrary
	const pnlLibrary = Content.getComponent("pnlLibrary");
	
	pnlLibrary.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
	
		g.fillAll(this.get("bgColour"));
				
		g.setColour(this.get("textColour"));
		g.fillPath(Paths.librewave, [a[2] - 140, a[3] - 29, 128, 15]);
	});

	// vptLibraryList
	const vptLibraryList = Content.getComponent("vptLibraryList");

	// pnlLibraryList
	const pnlLibraryList = Content.getComponent("pnlLibraryList");
	
	pnlLibraryList.setPaintRoutine(function(g)
	{
		g.fillAll(0x00);

		if (!list.length)
		{
			this.set("height", vptLibraryList.getHeight());
			
			g.setFont(vptLibraryList.get("fontName"), vptLibraryList.get("fontSize"));
			g.setColour(Colours.withAlpha(vptLibraryList.get("textColour"), 0.5));
			g.drawAlignedText(vptLibraryList.get("text"), [0, 0, this.getWidth(), this.getHeight() / 1.2], "centred");
		}
	});
	
	// UI Callbacks - for child panels
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
							passToDownloader(item);
					}
				});
			}
			else
			{
				if (isDefined(item.variations) && item.variations.length > 0)
					Variations.getVariation(item);
				else
					passToDownloader(item);			
			}	
		}
	}
	
	// btnUninstall
	inline function onbtnUninstallControl(component, value)
	{
		if (!value)
		{
			local parent = component.getParentPanel();
			item = parent.data.item;

			Engine.showYesNoWindow("Confirm Uninstall", "Do you want to uninstall " + item.name + "?", function(response)
			{
				if (response)
				{
					nest.status = "";

					if (item.format == "expansion")
						nest.status = Expansions.uninstall(item.expansionName);
					else if (item.format == "plugin")
						nest.status = Plugins.uninstall(item);
					
					Log.addEntry(item, "uninstall", nest.status);
					
					if (nest.status != "")
						Engine.showMessageBox("Info", nest.status, 0);

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
			item = parent.data.item;
	
			local msg = "Would you like to visit the " + App.info.Company + " store?";

			Engine.showYesNoWindow("Visit Website", msg, function(response)
			{
				if (response)
					Engine.openWebsite(item.url);
			});
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
					Expansions.setCurrent(item.name);
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

			LibraryList.Ratings.show(item);
		}
	}
	
	// Functions
	inline function buttonPanelMouseCallback()
	{
		var index = Math.floor(event.y / this.getHeight() * list.length);
		
		if (event.clicked && !event.mouseUp)
		{
			this.setValue(index);
			this.changed();
		}
		else
		{
			this.data.hover = event.hover ? index : -1;
			this.repaint();
		}
	}

	inline function passToDownloader(data)
	{
		item = data;

		if (isDefined(item.sampleDirectory) || item.format == "plugin")
		{
			Downloader.addToQueue(item);
		}
		else
		{
			Engine.showYesNoWindow("Install Location", "Choose a location to install the samples.", function(response)
			{
				if (response)
				{
					FileSystem.browseForDirectory(FileSystem.Samples, function(dir)
					{
						if (dir.isDirectory())
						{
							item.sampleDirectory = dir;
							Downloader.addToQueue(item);
						}
					});
				}
			});
		}
	}

	inline function populateFromArray(data)
	{
		clear();
		sortList(data);

		for (x in data)
			add(x);			

		GRID ? GridItem.resizePanel(pnlLibraryList) : ListItem.resizePanel(pnlLibraryList);			
	}

	inline function add(item)
	{
		local img = getImagePath(item.expansionName, item.id);

		if (item.format == "plugin")
		{
			if (Plugins.isInstalled(item.name))
			{
				if (!isDefined(item.installedVersion))
				{
					local logEntry = Log.getMostRecentEntry(item.name);

					if (isDefined(logEntry.version) && logEntry.action == "install")
						item.installedVersion = logEntry.version;
					else
						item.installedVersion = "1.0.0";
				}
			}
		}		

		list.push(item);

		if (GRID)
			GridItem.create(pnlLibraryList, item, img);	
		else
			ListItem.create(pnlLibraryList, item, img);
	}
		
	inline function clear()
	{	
		for (x in pnlLibraryList.getChildPanelList())
			x.removeFromParent();
			
		list.clear();
	}

	inline function repaint()
	{
		pnlLibraryList.repaint();
	}
	
	inline function rebuildChildButtons(id)
	{
		for (c in pnlLibraryList.getChildPanelList())
		{
			if (c.data.item.id == id)
			{
				ListItem.removeChildren(c);
				GRID ? GridItem.addButtons(c) : ListItem.addButtons(c);				
				c.repaint();
				break;
			}				
		}
	}
	
	inline function repaintChild(id)
	{
		for (c in pnlLibraryList.getChildPanelList())
		{
			if (c.data.item.id == id)
			{
				c.repaint();
				break;
			}
		}
	}
	
	inline function sortList(data)
	{
		Engine.sortWithFunction(data, function(a, b)
		{
		    if (a.name < b.name) return -1 else return a.name > b.name;
		});
	}
		
	inline function getImagePath(expName, id)
	{
		if (isDefined(id))
		{
			local cache = App.appData.getChildFile("cache");
			
			if (isDefined(cache) && cache.isDirectory())
			{
				local img = cache.getChildFile(id + ".jpg");
				
				if (isDefined(img) && img.isFile())
					return img.toString(image.FullPath);
			}
		}

		if (isDefined(expName))
			return Expansions.getImagePath(expName, "");

		return false;
	}
	
	inline function getListPosition()
	{
		return [vptLibraryList.get("x"), vptLibraryList.get("y"), vptLibraryList.getWidth(), vptLibraryList.getHeight()];
	}
}
