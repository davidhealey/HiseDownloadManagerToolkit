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
	inline function create(panel, data, img)
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
		p.set("bgColour", 0x0);
		p.set("itemColour", 0x0);
		p.set("itemColour2", 0x0);
		p.set("textColour", 0x0);
		p.data.item = data;
		p.data.area = area;
		p.data.img = img;

		addButtons(p);

		return p;
	}
	
	inline function addButtons(p)
	{
		local data = p.data.item;
		local area = p.data.area;
		p.data.buttons = [];

		if (!isDefined(data.progress))
		{
			if (isDefined(data.installedVersion))
			{
				p.data.btnUninstall = createActionButton(p, [area[2] - 20, area[2] + 10, 17, 19], "trash", "Uninstall");
				p.data.btnUninstall.setControlCallback(LibraryItem.onbtnUninstallControl);
				p.data.buttons.push(p.data.btnUninstall);

				if ((isDefined(data.hasLicense) && data.hasLicense || data.regularPrice == "0") && (isDefined(data.hasUpdate) && data.hasUpdate))
					p.data.btnInstall = createActionButton(p, [area[2] - 90, area[2] + 10, 15, 19], "bell", "Update");

				if ((isDefined(Config.GRID_USE_LOAD_BUTTON) && Config.GRID_USE_LOAD_BUTTON) && isDefined(Config.FULL_EXPANSIONS) && isDefined(data.expansionName))
				{
					p.data.btnLoad = createActionButton(p, [area[2] - 57, area[2] + 10, 19, 19], "playCircle", "Load");
					p.data.btnLoad.setControlCallback(LibraryItem.onbtnLoadControl);
					p.data.buttons.push(p.data.btnLoad);
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
					p.data.buttons.push(p.data.btnBuy);
				}
			}

			if (isDefined(p.data.btnInstall))
			{
				p.data.btnInstall.set("enabled", UserAccount.isOnlineAndIsLoggedInSilent() && (!Engine.isPlugin() || Config.NETWORK_IN_PLUGIN));
				p.data.btnInstall.setControlCallback(LibraryItem.onbtnInstallControl);
				p.data.buttons.push(p.data.btnInstall);
			}
		}
		else
		{
			// btnCancel
			p.data.btnCancel = createActionButton(p, [area[2] - 25, area[2] + 13, 15, 15], "x", "Cancel");
			p.data.btnCancel.setControlCallback(LibraryItem.onbtnCancelControl);
			p.data.buttons.push(p.data.btnCancel);
		}

		// btnRating
		if (isDefined(Config.SHOW_PRODUCT_RATING) && Config.SHOW_PRODUCT_RATING && UserAccount.isOnlineAndIsLoggedInSilent())
			p.data.btnRating = createRatingButton(p, [5, area[2] + 13, 70, 25], data);
	}
	
	inline function createActionButton(parent, area, icon, text)
	{
		local b = parent.addChildPanel();

		b.setPosition(area[0], area[1], area[2], area[3]);
		b.set("bgColour", 0x0);
		b.set("itemColour", 0x0);
		b.set("itemColour2", 0x0);
		b.set("textColour", 0x0);
		b.set("tooltip", text + " " + parent.get("text") + ".");
		b.set("allowCallbacks", "Clicks & Hover");
		b.data.icon = icon;
		b.data.area = area;

		b.setMouseCallback(LibraryItem.momentaryButtonMouseCallback);
		
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
		local colWidth = panel.getWidth() / Config.GRID_NUM_COLS;
		local rowHeight = colWidth + 30;
		local height = numRows * rowHeight + (Config.GRID_VERTICAL_MARGIN * (numRows - 1));

		if (!numItems)
			height = viewport.getHeight();

		panel.set("height", height);
	}
	
	inline function paint(p)
	{
		local a = [p.get("x"), p.get("y"), p.getWidth(), p.getHeight()];
		local style = Theme.getProperty("libraryItem");
		local textColour = LookAndFeel.formatColour(style.textColour);

		g.drawDropShadow([a[0], a[1], a[2], a[2]], Colours.withAlpha(Colours.black, 0.6), 20);
	
		g.setColour(Colours.withAlpha(Colours.white, isDefined(p.data.item.installedVersion) ? 1.0 : 0.7));
	
		if (this.isImageLoaded(p.data.item.name))
		{
			g.drawImage(p.data.item.name, [a[0], a[1], a[2], a[2]], 0, 0);

			if (p.data.img.indexOf("placeholder") != -1)
			{
				g.setColour(textColour);
				g.setFont("medium", 22 - Config.GRID_NUM_COLS);
				g.drawFittedText(p.data.item.name, [a[0] + a[2] / 15, a[1] + a[2] / 3, a[2] - a[2] / 15 * 2, a[2] - a[2] / 3 * 2], "centred", 2, 1);				
			}			
		}
		
		// Progress indicator
		if (isDefined(p.data.item.progress))
		{
			local v = p.data.item.progress.value;
			local diameter = a[2] / 1.4;
			local arcArea = [a[0] + a[2] / 2 - diameter / 2, a[1] + a[2] / 2 - diameter / 2, diameter, diameter];
			
			g.setColour(Colours.withAlpha(Colours.black, 0.5));
			g.fillRect([a[0], a[1], a[2], a[2]]);
			
			g.setColour(Colours.withAlpha(LookAndFeel.formatColour(style.progressBg), 0.8));
			g.drawEllipse(arcArea, 13);
	
		    g.setColour(Colours.withAlpha(LookAndFeel.formatColour(style.progressFg), 1.0));
		    
		    local path = Content.createPath();
		    local arcThickness = 0.05;
		    local startOffset = 3.15;
		    local endOffset = -startOffset + 2.0 * startOffset * v;
		    
		    endOffset = Math.max(endOffset, -startOffset + 0.01);
		    path.addArc(arcArea, -startOffset, endOffset);
		
		    g.drawPath(path, pathArea, p.getWidth() * arcThickness);
			
			g.setFont("semibold", 22);
			g.setColour(textColour);
		    g.drawAlignedText(parseInt(Math.ceil(v * 100)) + "%", [a[0], a[1] + a[2] / 2 - 50, a[2], 25], "centred");
			
			g.setFont("semibold", 16);
			g.drawFittedText(p.data.item.progress.action, [arcArea[0], a[1] + a[2] / 2 - 27, arcArea[2], 30], "centred", 1, 1.0);
			
			g.setFont("regular", 16);
			
			if (isDefined(p.data.item.progress.status))
				g.drawFittedText(p.data.item.progress.status, [arcArea[0], a[1] + a[2] / 2 - 3, arcArea[2], 30], "centred", 1, 1.0);
			
			g.setFont("semibold", 14);
			
			if (isDefined(p.data.item.progress.speed))
				g.drawFittedText(p.data.item.progress.speed, [arcArea[0], a[1] + a[2] / 2 + 20, arcArea[2], 30], "centred", 1, 1.0);
		}
	
		g.setFont("medium", 18);
		g.setColour(Colours.withAlpha(textColour, isDefined(p.data.item.installedVersion) ? 1.0 : 0.8));

		if (isDefined(p.data.item.displayName))
			g.drawMultiLineText(p.data.item.displayName, [a[0], a[1] + a[3] - 30], a[2] - 75 - (25 * isDefined(p.data.item.hasUpdate)), "left", 1.0);
		else
			g.drawMultiLineText(p.data.item.name, [a[0], a[1] + a[3] - 30], a[2] - 75 - (25 * isDefined(p.data.item.hasUpdate)), "left", 1.0);

		// Paint buttons
		if (isDefined(p.data.buttons))
			for (b in p.data.buttons)
				paintButton(p, b);
	}
	
	inline function paintButton(p, b)
	{
		local a = [p.get("x") + b.data.area[0], p.get("y") + b.data.area[1], b.data.area[2], b.data.area[3]];
	
		g.setColour(Colours.withAlpha(this.get("textColour"), b.data.hover ? 1.0 : 0.7));
		
		if (!this.get("enabled"))
			g.setColour(Colours.withAlpha(this.get("textColour"), 0.3));
	
		g.fillPath(Paths.icons[b.data.icon], a);
	}
}