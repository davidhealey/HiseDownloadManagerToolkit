/*
    Copyright 2022 David Healey

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

namespace ListItem
{
	const USE_LOAD_BUTTON = false;
	
	inline function create(panel, data, imagePath)
	{
		local p = panel.addChildPanel();
		local area = [0, (panel.getChildPanelList().length - 1) * Config.LIST_ROW_HEIGHT, panel.getWidth(), Config.LIST_ROW_HEIGHT];
		
		p.setPosition(area[0], area[1], area[2], area[3]);
		p.set("bgColour", panel.get("bgColour"));
		p.set("itemColour", panel.get("itemColour"));
		p.set("itemColour2", panel.get("itemColour2"));
		p.set("textColour", panel.get("textColour"));
		p.set("text", data.name);
		p.data.item = data;
		p.data.area = area;
		
		if (imagePath != false)
			p.loadImage(imagePath, "image");
		else
			p.loadImage("{PROJECT_FOLDER}placeholder.jpg", "image");

		p.setPaintRoutine(function(g)
		{
			var a = [10, 0, this.getWidth() - 20, this.getHeight() - 20];

			g.drawDropShadow([a[0], a[1] + 5, a[2], a[3] + 5], Colours.withAlpha(Colours.black, 0.1), 10);

			g.setColour(this.get("bgColour"));
			g.fillRoundedRectangle(a, 8);

			g.setColour(Colours.white);
			g.drawImage("image", [a[0] + 15, a[1] + 15, 125, 125], 0, 0);

			g.setColour(this.get("textColour"));

			g.setFont("medium", 24);
			g.drawAlignedText(this.get("text"), [a[0] + 160, a[1] + 10, a[2], 30], "left");
			
			if (isDefined(this.data.item.progress))
			{
				g.setColour(this.get("itemColour"));
				g.fillRoundedRectangle([218, a[3] / 2 - 3, a[2] / 2, 6], 3);
	
				g.setColour(0xffeebd75);

				if (this.data.item.progress.value > 0.0)
					g.fillRoundedRectangle([218, a[3] / 2 - 3, a[2] / 2 * this.data.item.progress.value, 6], 3);
				else if (this.data.item.progress.count > -1)
					g.fillRoundedRectangle([218 + a[2] / 2 * this.data.item.progress.count - a[2] / 2 / 3 * this.data.item.progress.count, a[3] / 2 - 3, a[2] / 2 / 3, 6], 3);
				
				g.setFont("medium", 18);
				g.setColour(this.get("textColour"));
				g.drawAlignedText(this.data.item.progress.action, [218, a[3] / 3.3, a[2] / 2, 30], "centred");
				
				g.setFont("medium", 16);
				g.drawAlignedText(this.data.item.progress.status, [218, a[3] / 1.9, a[2] / 2, 30], "left");
			}
			else
			{
				g.setFont("regular", 16);
				g.drawFittedText(this.data.item.shortDescription, [a[0] + 160, a[1] + 50, a[2] - 200, 65], "left", 3, 1.0);
			}
			
			g.setFont("medium", 16);

			if (isDefined(this.data.item.size))
				g.drawAlignedText(FileSystem.descriptionOfSizeInBytes(this.data.item.size), [a[0] + 15, a[3] - 50, 125, 50], "left");
			
			if (isDefined(this.data.item.installedVersion))
				g.drawAlignedText("v" + this.data.item.installedVersion, [a[0] + 15, a[3] - 50, 125, 50], "right");
		});
		
		addButtons(p);
	}
	
	inline function removeChildren(p)
	{
		for (x in p.getChildPanelList())
			x.removeFromParent();
	}
	
	inline function addButtons(p)
	{
		local data = p.data.item;
		local area = p.data.area;

		// Item buttons
		if (!isDefined(data.progress))
		{
			if (isDefined(data.installedVersion))
			{
				p.data.btnUninstall = createActionButton(p, [area[2] - 125 - 115 * USE_LOAD_BUTTON, Config.LIST_ROW_HEIGHT - 65, 100, 30], "Uninstall", 0xffbb8270);
				p.data.btnUninstall.setControlCallback(LibraryItem.onbtnUninstallControl);
				
				if ((isDefined(data.hasLicense) && data.hasLicense || data.regularPrice == "0") && (isDefined(data.hasUpdate) && data.hasUpdate))
					p.data.btnInstall = createActionButton(p, [area[2] - 240, Config.LIST_ROW_HEIGHT - 65, 100, 30], "Update", 0xffffc061);
					
				if (USE_LOAD_BUTTON && isDefined(Config.FULL_EXPANSIONS) && data.format == "expansion")
				{
					p.data.btnLoad = createActionButton(p, [area[2] - 125, Config.LIST_ROW_HEIGHT - 65, 100, 30], "Load", p.get("itemColour2"));
					p.data.btnLoad.setControlCallback(LibraryItem.onbtnLoadControl);
				}
			}
			else
			{
				if ((isDefined(data.hasLicense) && data.hasLicense) || data.regularPrice == "0")
				{
					p.data.btnInstall = createActionButton(p, [area[2] - 125, Config.LIST_ROW_HEIGHT - 65, 100, 30], "Install", p.get("itemColour2"));
				}
				else if (data.regularPrice != "0" && isDefined(data.url) && data.url != "")
				{
					p.data.btnBuy = createActionButton(p, [area[2] - 125, Config.LIST_ROW_HEIGHT - 65, 100, 30], "Buy", p.get("itemColour2"));
					p.data.btnBuy.set("enabled", UserAccount.isOnlineAndIsLoggedInSilent());
					p.data.btnBuy.setControlCallback(LibraryItem.onbtnBuyControl);
				}
			}

			if (isDefined(p.data.btnInstall))
			{
				p.data.btnInstall.set("enabled", UserAccount.isOnlineAndIsLoggedInSilent() && (!Engine.isPlugin() || Config.NETWORK_IN_PLUGIN));
				p.data.btnInstall.setControlCallback(LibraryItem.onbtnInstallControl);
			}			
		}
		else
		{
			// btnCancel
			p.data.btnCancel = createActionButton(p, [area[2] - 125, Config.LIST_ROW_HEIGHT - 65, 100, 30], "Cancel", 0xffbb8270);
			p.data.btnCancel.setControlCallback(LibraryItem.onbtnCancelControl);
		}
		
		// btnRating
		p.data.btnRating = createRatingButton(p, [area[2] - 105, 15, 80, 25], data);
	}
		
	// createActionButton
	inline function createActionButton(parent, area, text, bgColour)
	{
		local b = parent.addChildPanel();
	
		b.setPosition(area[0], area[1], area[2], area[3]);
		b.set("bgColour", bgColour);
		b.set("text", text);
		b.set("tooltip", text + " " + parent.get("text") + ".");
		b.set("allowCallbacks", "Clicks & Hover");    
	
	    b.setPaintRoutine(function(g)
	    {
			var a = this.getLocalBounds(1);
			
			var c = Colours.withAlpha(this.get("bgColour"), this.data.hover ? 1.0 : 0.8);
			c = this.get("enabled") ? c : Colours.withAlpha(c, 0.3);			
			
			g.setColour(c);
			g.fillRoundedRectangle(a, 5);

			g.setColour(Colours.black);
			g.setFont("medium", 18);
			g.drawAlignedText(this.get("text"), a, "centred");
	    });

		b.setMouseCallback(LibraryItem.momentaryButtonMouseCallback);

		return b;
	}
	
	// createRatingButton
	inline function createRatingButton(parent, area, data)
	{
		local b = parent.addChildPanel();
		
		b.setPosition(area[0], area[1], area[2], area[3]);
		b.set("text", "Leave a Review");
		b.set("bgColour", 0xff242220);
		b.set("itemColour", Colours.gold);
		b.set("allowCallbacks", "Clicks & Hover");
		b.set("enabled", UserAccount.isOnlineAndIsLoggedInSilent());
		b.data.rating = data.rating;

		b.setControlCallback(LibraryItem.onbtnRatingControl);

		b.setPaintRoutine(function(g)
		{
			var w = this.getWidth() / 5;

			for (j = 0; j < 5; j++)
			{
				var x = this.getWidth() / 2 - 5 * w / 2 + (j * w + (5 * j > 0));
				
				g.setColour(Colours.withAlpha(this.get("bgColour"), this.data.hover ? 1.0 : 0.8));
				g.fillPath(Paths.icons.star, [x, 0, w, w]);
				
				g.setColour(Colours.withAlpha(this.get("itemColour"), this.data.hover ? 1.0 : 0.7));
				
				if (j < this.data.rating)
				{
					if (Math.floor(this.data.rating) != this.data.rating && j == Math.floor(this.data.rating))
						g.fillPath(Paths.icons.halfStar, [x, 0, w / 2, w]);
					else
						g.fillPath(Paths.icons.star, [x, 0, w, w]);
				}
			}
		});
		
		if ((isDefined(data.hasLicense) && data.hasLicense) || data.regularPrice == "0" && isDefined(data.installedVersion))
		{
			b.set("tooltip", "Leave a review for " + parent.get("text"));
			b.setMouseCallback(LibraryItem.momentaryButtonMouseCallback);
		}

		return b;
	}
	
	inline function resizePanel(panel)
	{
		local viewport = Content.getAllComponents(panel.get("parentComponent"))[0];

		panel.set("width", viewport.get("width") - parseInt(viewport.get("scrollBarThickness")));
		panel.set("height", panel.getChildPanelList().length * Config.LIST_ROW_HEIGHT);
	}
}
