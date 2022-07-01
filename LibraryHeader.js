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

namespace LibraryHeader
{
	const appData = FileSystem.getFolder(FileSystem.AppData);

	reg syncCooldown = 0;
	reg syncCount = 0;

	// pnlLibraryHeader
	const pnlLibraryHeader = Content.getComponent("pnlLibraryHeader");
	
	pnlLibraryHeader.setPaintRoutine(function(g)
	{
		g.fillAll(this.get("bgColour"));

		LookAndFeel.drawInput(lblSearch, {"id": "search", "width": 17, "height": 17});		
		LookAndFeel.drawInput(cmbFilter, {"id": "filter", "width": 17, "height": 17});
	});
	
	// btnLogout
	const btnLogout = Content.getComponent("btnLogout");
	
	// btnSync
	const btnSync = Content.getComponent("btnSync");
	btnSync.setLocalLookAndFeel(LookAndFeel.iconButton);
	btnSync.showControl(true);
	btnSync.setControlCallback(onbtnSyncControl);
	
	inline function onbtnSyncControl(component, value)
	{
		if (!value)
		{
			if (!isDefined(UserAccount.isOnlineAndIsLoggedIn()))
				return;
	
			if (syncCount < 10)
			{
				local cooldown = Engine.getUptime() - syncCooldown;

				if (cooldown < 15)
					return Engine.showMessageBox("Cooldown", "Please wait " + parseInt(Math.ceil(15 - cooldown)) + " seconds.", 0);

				if (Content.isCtrlDown())
					Library.clearCache();

				Library.rebuildCache();
				syncCooldown = Engine.getUptime();
				syncCount++;
			}				
			else
			{
				Engine.showMessageBox("Limit Reached", "You've reached the sync limit. Please restart the app if you need to sync again.", 0);
			}
		}
	}
		
	// cmbAdd
	const cmbAdd = Content.getComponent("cmbAdd");
	const cmbAddLaf = Content.createLocalLookAndFeel();
	cmbAdd.setLocalLookAndFeel(cmbAddLaf);
	cmbAdd.setControlCallback(oncmbAddControl);
	
	inline function oncmbAddControl(component, value)
	{
		switch (value)
		{
			case 1:
				if (UserAccount.isOnlineAndIsLoggedIn())
				 	AddLicense.show();

			 	break;
			 	
			case 2:
				Expansions.manualInstall();
				break;
		}

		component.setValue(0);
	}

	cmbAddLaf.registerFunction("drawComboBox", function(g, obj)
	{
		var a = obj.area;

		g.setColour(Colours.withAlpha(obj.itemColour1, obj.hover || !obj.enabled ? 0.7 : 1.0));		 
		g.fillPath(Paths.icons.add, [a[0] + a[2] / 2 - 26 / 2, a[1] + a[3] / 2 - 26 / 2, 26, 26]);	 
		g.fillTriangle([20, 22, 8, 6], Math.toRadians(180)); 
	});

	cmbAddLaf.registerFunction("drawPopupMenuItem", function(g, obj)
	{
		LookAndFeel.drawPopupMenuItem(g, obj);
	});	
	
	cmbAddLaf.registerFunction("getIdealPopupMenuItemSize", function(obj)
	{
		return LookAndFeel.getIdealPopupMenuItemSize(obj);
	});
	
	// btnSupport
	const btnSupport = Content.getComponent("btnSupport");
	btnSupport.setLocalLookAndFeel(LookAndFeel.iconButton);
	btnSupport.setControlCallback(onbtnSupportControl);
		
	inline function onbtnSupportControl(component, value)
	{
		if (!value && UserAccount.isOnlineAndIsLoggedIn())
			Engine.openWebsite(Config.baseURL[Config.MODE] + Config.supportURL);
	}
	
	// btnSettings
	const btnSettings = Content.getComponent("btnSettings");
	btnSettings.setLocalLookAndFeel(LookAndFeel.iconButton);
	btnSettings.setControlCallback(onbtnSettingsControl);
		
	inline function onbtnSettingsControl(component, value)
	{
		if (!value)
			UserSettings.show();
	}
	
	// lblSearch
	const lblSearch = Content.getComponent("lblSearch");
	lblSearch.setControlCallback(onlblSearchControl);
	lblSearch.set("text", "");

	inline function onlblSearchControl(component, value)
	{
		Library.filter(value.toLowerCase());
	}

	// btnClearSearch
	const btnClearSearch = Content.getComponent("btnClearSearch");
	btnClearSearch.setLocalLookAndFeel(LookAndFeel.empty);
	btnClearSearch.setControlCallback(onbtnClearSearchControl);
	
	inline function onbtnClearSearchControl(component, value)
	{
		if (!value)
		{
			lblSearch.set("text", "");
			lblSearch.changed();
		}			
	}
	
	// cmbFilter
	const cmbFilter = Content.getComponent("cmbFilter");
	cmbFilter.setLocalLookAndFeel(LookAndFeel.comboBox);
	cmbFilter.setControlCallback(oncmbFilterControl);

	inline function oncmbFilterControl(component, value)
	{
		if (value > 0)
			Library.filter(lblSearch.get("text"));
	}

	// Functions
	inline function setEnabledStateOfButtons()
	{
		btnSync.set("enabled", UserAccount.isOnlineAndIsLoggedInSilent());
		btnSupport.set("enabled", UserAccount.isOnlineAndIsLoggedInSilent());
	}
	
	inline function enableButtonsThatInterfereWithDownloads(state)
	{
		btnLogout.set("enabled", state);
		btnSync.set("enabled", state && UserAccount.isOnlineAndIsLoggedInSilent());
		cmbAdd.set("enabled", state && UserAccount.isOnlineAndIsLoggedInSilent());
	}
	
	inline function getSearchQuery()
	{
		return lblSearch.get("text");
	}
	
	inline function getFilterValue()
	{
		return cmbFilter.getValue();	
	}
	
	inline function getHeight()
	{
		return pnlLibraryHeader.getHeight();
	}
	
	// Function calls
	setEnabledStateOfButtons();
}
