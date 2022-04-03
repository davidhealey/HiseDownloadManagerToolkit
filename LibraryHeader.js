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

	reg syncCount = 0;

	const btnToolbar = [];

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
	btnToolbar.push(btnLogout);
	btnLogout.setLocalLookAndFeel(LookAndFeel.iconButton);
	btnLogout.setControlCallback(onbtnLogoutControl);
	
	inline function onbtnLogoutControl(component, value)
	{
		if (value)
			UserAccount.logout();
	}
		
	// btnSync
	const btnSync = Content.getComponent("btnSync");
	btnSync.set("enabled", UserAccount.isOnlineAndIsLoggedInSilent());
	btnToolbar.push(btnSync);
	btnSync.setLocalLookAndFeel(LookAndFeel.iconButton);
	btnSync.showControl(true);
	btnSync.setControlCallback(onbtnSyncControl);
	
	inline function onbtnSyncControl(component, value)
	{
		if (!value)
		{
			if (!isDefined(UserAccount.isOnlineAndIsLoggedIn()))
				return;
	
			if (syncCount < 4)
				Library.rebuildCache();
			else
				Engine.showMessageBox("Limit Reached", "You've reached the sync limit. Please restart the app if you need to sync again.", 0);

			syncCount++;
			syncCooldown();
			writeLastSync();
		}
	}
	
	// pnlSyncCooldown
	const pnlSyncCooldown = Content.getComponent("pnlSyncCooldown");
	pnlSyncCooldown.setPosition(btnSync.get("x"), btnSync.get("y"), btnSync.getWidth(), btnSync.getHeight());
	pnlSyncCooldown.setValue(0);
	
	pnlSyncCooldown.setTimerCallback(function()
	{
		this.setValue(this.getValue() - 0.5);
		btnSync.showControl(false);
		
		if (this.getValue() <= 0)
		{
			this.stopTimer();
			btnSync.showControl(true);
		}
		
		this.repaint();
	});
	
	pnlSyncCooldown.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
	
		g.setColour(Colours.withAlpha(this.get("bgColour"), this.getValue() / 15));
		g.fillEllipse(a);
		
		g.setColour(Colours.withAlpha(this.get("itemColour"), this.getValue() / 15));
		g.rotate(Math.toRadians(360 - 360 / 1 * this.getValue() / 15), [a[2] / 2, a[3] / 2]);
		g.fillRoundedRectangle([a[0] + a[2] / 2 - 1.5, a[1], 3, a[3] / 3], 1);
	});
	
	// btnAddLicense
	const btnAddLicense = Content.getComponent("btnAddLicense");
	btnToolbar.push(btnAddLicense);
	btnAddLicense.set("enabled", UserAccount.isOnlineAndIsLoggedInSilent());
	btnAddLicense.setLocalLookAndFeel(LookAndFeel.iconButton);
	btnAddLicense.setControlCallback(onbtnAddLicenseControl);
	
	inline function onbtnAddLicenseControl(component, value)
	{
		if (!value)
		{
			if (!UserAccount.isOnlineAndIsLoggedIn())
				return;
	
			if (isDefined(AddLicense.show))
				AddLicense.show();
		}
	}

	// btnManualInstall
	const btnManualInstall = Content.getComponent("btnManualInstall");
	btnToolbar.push(btnManualInstall);
	
	if (isDefined(btnManualInstall))
	{
		btnManualInstall.setLocalLookAndFeel(LookAndFeel.iconButton);
		btnManualInstall.setControlCallback(onbtnManualInstallControl);
		
		inline function onbtnManualInstallControl(component, value)
		{
			if (!value)
				Expansions.manualInstall();
		}		
	}
	
	// btnShop
	const btnShop = Content.getComponent("btnShop");
	btnToolbar.push(btnShop);
	btnShop.set("enabled", Server.isOnline());
	
	if (isDefined(btnShop))
	{
		btnShop.setLocalLookAndFeel(LookAndFeel.iconButton);
		btnShop.setControlCallback(onbtnShopControl);
		
		inline function onbtnShopControl(component, value)
		{
			if (!value && UserAccount.isOnline())
				Engine.openWebsite(Config.baseURL[Config.MODE]);
		}		
	}
	
	// btnSupport
	const btnSupport = Content.getComponent("btnSupport");
	btnToolbar.push(btnSupport);
	btnSupport.set("enabled", UserAccount.isOnlineAndIsLoggedInSilent());
	
	if (isDefined(btnSupport))
	{
		btnSupport.setLocalLookAndFeel(LookAndFeel.iconButton);
		btnSupport.setControlCallback(onbtnSupportControl);
		
		inline function onbtnSupportControl(component, value)
		{
			if (!value && UserAccount.isOnlineAndIsLoggedIn())
				Engine.openWebsite(Config.baseURL[Config.MODE] + Config.supportURL);
		}		
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
	inline function positionButtons()
	{
		for (i = 0; i < btnToolbar.length; i++)
			btnToolbar[i].set("x", 25 + i * 68);
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
	
	inline function writeLastSync()
	{
		local f = appData.getChildFile("synctime.txt");
		f.writeString(Engine.getSystemTime(false).substring(0, 8));
	}
	
	inline function syncCooldown()
	{
		if (isDefined(pnlSyncCooldown))
		{
			pnlSyncCooldown.setValue(15);
			pnlSyncCooldown.startTimer(500);			
		}
	}
	
	// Function calls
	positionButtons();
}
