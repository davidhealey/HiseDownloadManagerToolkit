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

namespace LibraryList
{
	const list = [];
	const appData = FileSystem.getFolder(FileSystem.AppData);
	
	reg nest = {};
	reg sortMode = 0;
	reg item;
	
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
	
	// Functions
	inline function addChildPanel(data, img)
	{
		if (!pnlLibraryList.get("visible")) return;

		if (Config.GRID_LAYOUT)
			GridItem.create(pnlLibraryList, data, img);	
		else
			ListItem.create(pnlLibraryList, data, img);
			
		Config.GRID_LAYOUT ? GridItem.resizePanel(pnlLibraryList) : ListItem.resizePanel(pnlLibraryList);	
	}
	
	inline function rebuildChildButtons(id)
	{
		for (c in pnlLibraryList.getChildPanelList())
		{
			if (c.data.item.id == id)
			{
				ListItem.removeChildren(c);
				Config.GRID_LAYOUT ? GridItem.addButtons(c) : ListItem.addButtons(c);				
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
	
	inline function removeAllChildPanels()
	{
		for (x in pnlLibraryList.getChildPanelList())
			x.removeFromParent();
	}
	
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

		if (!UserAccount.isOnlineAndIsLoggedIn())
			return;

		if (item.format == "plugin")
		{
			Downloader.addToQueue(item);
		}
		else
		{
			if ((isDefined(Config.CUSTOM_FILE_PICKER) && Config.CUSTOM_FILE_PICKER) && isDefined(FilePicker.show))
			{
				FilePicker.show({
					startFolder: FileSystem.Samples,
					mode: 1,
					filter: "",
					title: item.name,
					icon: ["hdd", 45, 60],
					message: "Choose a location to install the samples.",
					buttonText: "Install"
				}, true, function(dir)
				{
					item.sampleDirectory = dir;
					Downloader.addToQueue(item);
				});					
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
	}
	
	inline function populateFromArray(data)
	{
		clear();
		sortList(data);

		for (x in data)
			add(x);
			
		pnlLibraryList.repaint();
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
		addChildPanel(item, img);
	}
		
	inline function clear()
	{
		removeAllChildPanels();			
		list.clear();
	}

	inline function repaint()
	{
		pnlLibraryList.repaint();
	}
		
	inline function sortList(data)
	{
		Engine.sortWithFunction(data, function(a, b)
		{
			if (sortMode)
			    if (a.name > b.name) return -1 else return a.name > b.name;
			else
			   if (a.name < b.name) return -1 else return a.name > b.name;
		});
	}
		
	inline function getImagePath(expName, id)
	{
		if (isDefined(id))
		{
			local cache = appData.getChildFile("cache");
			
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
	
	inline function getNumItems()
	{
		return list.length;
	}
}
