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

namespace GridItem
{
	inline function create(panel, data, imagePath)
	{
		local p = panel.addChildPanel();

		local index = panel.getChildPanelList().length - 1;		
		local colWidth = panel.getWidth() / Config.GRID_NUM_COLS;
		local rowWidth = colWidth - Config.GRID_MARGIN;
		local rowHeight = colWidth + 30;
		local x = (index % Config.GRID_NUM_COLS) * colWidth + colWidth / 2 - rowWidth / 2;
		local y = Math.floor(index / Config.GRID_NUM_COLS) * rowHeight + Config.GRID_VERTICAL_MARGIN * Math.floor(index / Config.GRID_NUM_COLS);		
		local area = [x, y, rowWidth, rowHeight];

		p.setPosition(area[0], area[1], area[2], area[3]);
		p.set("text", data.name);
		p.set("tooltip", data.shortDescription);
		p.set("bgColour", panel.get("bgColour"));
		p.set("itemColour", panel.get("itemColour"));
		p.set("itemColour2", panel.get("itemColour2"));
		p.set("textColour", panel.get("textColour"));
		p.set("allowCallbacks", "Clicks & Hover");
		p.data.item = data;
		p.data.area = area;

		p.setPaintRoutine(function(g)
		{
			var a = this.getLocalBounds(0);
			
			if (isDefined(this.data.item.installedVersion))
				g.drawDropShadow([a[0], a[1], a[2], a[2]], Colours.withAlpha(Colours.black, 0.6), 20);

			g.setColour(Colours.withAlpha(Colours.white, isDefined(this.data.item.installedVersion) ? 1.0 : 0.4));
			
			if (this.isImageLoaded("image"))
				g.drawImage("image", [a[0], a[1], a[2], a[2]], 0, 0);

			// Progress indicator
			if (isDefined(this.data.item.progress))
			{
				var v = this.data.item.progress.value;
				var diameter = a[2] / 1.4;
				var arcArea = [a[0] + a[2] / 2 - diameter / 2, a[1] + a[2] / 2 - diameter / 2, diameter, diameter];

				g.setColour(Colours.withAlpha(Colours.black, 0.5));
				g.fillRect([a[0], a[1], a[2], a[2]]);

				g.setColour(Colours.withAlpha(0xff3b3635, 0.8));
				g.drawEllipse(arcArea, 13);
				
			    g.setColour(Colours.withAlpha(0xffeebd75, 0.9));
			    var path = Content.createPath();
			    var arcThickness = 0.025;
			    var startOffset = 3.15;
			    var endOffset = -startOffset + 2.0 * startOffset * v;
			    
			    endOffset = Math.max(endOffset, -startOffset + 0.01);
			    path.addArc(arcArea, -startOffset, endOffset);
			
			    g.drawPath(path, pathArea, this.getWidth() * arcThickness);

				g.setFont("semibold", 22);
				g.setColour(this.get("textColour"));
			    g.drawAlignedText(parseInt(Math.ceil(v * 100)) + "%", [a[0], a[1] + a[2] / 2 - 45, a[2], 25], "centred");

				g.setFont("semibold", 16);
				g.drawFittedText(this.data.item.progress.action, [arcArea[0], a[1] + a[2] / 2 - 15, arcArea[2], 30], "centred", 2, 1.0);
				
				g.setFont("semibold", 14);
				g.drawFittedText(this.data.item.progress.status, [arcArea[0], a[1] + a[2] / 2 + 5, arcArea[2], 30], "centred", 2, 1.0);
			}
		});
				
		addButtons(p);

		if (imagePath != false)
			p.loadImage(imagePath, "image");
		else
			p.loadImage("{PROJECT_FOLDER}placeholder.jpg", "image");

		return p;
	}
	
	// Functions
	inline function addButtons(p)
	{
		local data = p.data.item;
		local area = p.data.area;

		if (!isDefined(data.progress))
		{
			if (isDefined(data.installedVersion))
			{
				p.data.btnUninstall = createActionButton(p, [area[2] - 20, area[2] + 10, 17, 19], "trash", "Uninstall");
				p.data.btnUninstall.setControlCallback(LibraryItem.onbtnUninstallControl);
				
				if ((isDefined(data.hasLicense) && data.hasLicense || data.regularPrice == "0") && (isDefined(data.hasUpdate) && data.hasUpdate))
					p.data.btnInstall = createActionButton(p, [area[2] - 90, area[2] + 10, 15, 19], "bell", "Update");

				if ((isDefined(Config.GRID_USE_LOAD_BUTTON) && Config.GRID_USE_LOAD_BUTTON) && isDefined(Config.FULL_EXPANSIONS) && isDefined(data.expansionName))
				{
					if (isDefined(Config.GRID_USE_LOAD_BUTTON) && Config.GRID_USE_LOAD_BUTTON)
						p.data.btnLoad = createActionButton(p, [area[2] - 57, area[2] + 10, 19, 19], "playCircle", "Load");
					else
						p.data.btnLoad = createLoadButton(p, [0, 0, area[2], area[2]]);

					p.data.btnLoad.setControlCallback(LibraryItem.onbtnLoadControl);
				}				
			}
			else 
			{
				if ((isDefined(data.hasLicense) && data.hasLicense) || data.regularPrice == "0")
				{
					p.data.btnInstall = createActionButton(p, [area[2] - 30, area[2] + 10, 16, 20], "download", "Download and install");
				}
				else if (data.regularPrice != "0" && isDefined(data.url) && data.url != "")
				{
					p.data.btnBuy = createActionButton(p, [area[2] - 30, area[2] + 10, 12, 19], "dollar", "Buy");
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
			p.data.btnCancel = createActionButton(p, [area[2] - 25, area[2] + 13, 15, 15], "x", "Cancel");
			p.data.btnCancel.setControlCallback(LibraryItem.onbtnCancelControl);
		}

		// btnRating
		p.data.btnRating = createRatingButton(p, [5, area[2] + 13, 70, 25], data);
	}
	
	inline function createActionButton(parent, area, icon, text)
	{
		local b = parent.addChildPanel();

		b.setPosition(area[0], area[1], area[2], area[3]);
		b.set("bgColour", parent.get("itemColour2"));
		b.set("text", text);
		b.set("tooltip", text + " " + parent.get("text") + ".");
		b.set("allowCallbacks", "Clicks & Hover");
		b.data.icon = icon;

	    b.setPaintRoutine(function(g)
	    {
			var a = this.getLocalBounds(0);

			g.setColour(Colours.withAlpha(this.get("bgColour"), this.data.hover ? 1.0 : 0.8));
			
			if (!this.get("enabled"))
				g.setColour(Colours.withAlpha(this.get("bgColour"), 0.3));
				
			
			g.fillPath(Paths.icons[this.data.icon], a);
	    });

		b.setMouseCallback(LibraryItem.momentaryButtonMouseCallback);
		
		return b;
	}
	
	inline function createLoadButton(parent, area)
	{
		local b = parent.addChildPanel();
		
		b.setPosition(area[0], area[1], area[2], area[3]);
		b.set("bgColour", bgColour);
		b.set("text", text);
		b.set("tooltip", "Load " + parent.get("text") + ".");
		b.set("allowCallbacks", "All Callbacks");
		b.data.icon = icon;
	
	    b.setPaintRoutine(function(g)
	    {
			var a = this.getLocalBounds(0);

			if (this.data.hover && !Downloader.getQueueLength())
			{
				g.setColour(Colours.withAlpha(Colours.black, 0.3));
				g.fillRect(a);

				g.setColour(Colours.withAlpha(Colours.white, this.data.buttonHover ? 1.0 : 0.8));	
				g.fillPath(Paths.icons.playCircle, Rect.reduced(a, a[2] / 4));			
			}
	    });

		b.setMouseCallback(function(event)
		{
			this.data.buttonHover = false;

			if (event.x > this.getWidth() / 4 && event.x < this.getWidth() - this.getWidth() / 4)
				if (event.y > this.getHeight() / 4 && event.y < this.getHeight() - this.getHeight() / 4)	
					this.data.buttonHover = true;

			this.data.hover = event.hover;

			if (event.clicked || event.mouseUp)
			{
				this.setValue(event.clicked && !event.mouseUp);
				this.changed();
			}
			
			this.repaint();
		});
		
		return b;
	}
	
	inline function createRatingButton(parent, area, data)
	{
		local b = parent.addChildPanel();
		
		b.setPosition(area[0], area[1], area[2], area[3]);
		b.set("bgColour", 0xff242220);
		b.set("itemColour", Colours.gold);
		b.set("allowCallbacks", "Clicks & Hover");
		b.set("enabled", UserAccount.isOnlineAndIsLoggedInSilent());
		b.data.rating = data.rating;
		
		if (data.rating >= 1)
			b.set("tooltip", l10n.get("Rating") + ": " + data.rating);
		else
			b.set("tooltip", l10n.get("Rating") + ": " + l10n.get("No ratings yet") + ".");

		b.setControlCallback(LibraryItem.onbtnRatingControl);

		b.setPaintRoutine(function(g)
		{
			var w = this.getWidth() / 5;

			for (j = 0; j < 5; j++)
			{
				var x = this.getWidth() / 2 - 5 * w / 2 + (j * w + (5 * j > 0));
				
				g.setColour(Colours.withAlpha(Colours.grey, this.data.hover ? 1.0 : 0.8));
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
			b.set("tooltip", l10n.get("Leave a review for") + " " + parent.get("text"));
			b.setMouseCallback(LibraryItem.momentaryButtonMouseCallback);
		}			

		return b;
	}
	
	inline function resizePanel(panel)
	{
		local numItems = panel.getChildPanelList().length;
		local viewport = Content.getAllComponents(panel.get("parentComponent"))[0];

		local numRows = Math.ceil(numItems / Config.GRID_NUM_COLS);		

		if (numRows * panel.getWidth() / Config.GRID_NUM_COLS < viewport.getHeight())
			panel.set("width", viewport.get("width"));
		else
			panel.set("width", viewport.get("width") - parseInt(viewport.get("scrollBarThickness")));
		
		local colWidth = panel.getWidth() / Config.GRID_NUM_COLS;
		local rowHeight = colWidth + 30;
		local height = numRows * rowHeight + (Config.GRID_VERTICAL_MARGIN * (numRows - 1));
		
		panel.set("height", height);
	}
}