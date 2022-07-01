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

namespace AddLicense
{
	// pnlAddLicense
	const pnlAddLicense = Content.getComponent("pnlAddLicense");

	pnlAddLicense.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);
		var lblArea = [lblAddLicense.get("x") - 5, lblAddLicense.get("y"), lblAddLicense.getWidth() + 10, lblAddLicense.getHeight()];

		LookAndFeel.fullPageBackground("Enter License Key", "The license will be added to your account.", ["key", 50, 28]);
	
		g.setColour(lblAddLicense.get("bgColour"));
		g.fillRoundedRectangle(lblArea, 3);
	});

	// lblAddLicense
	const lblAddLicense = Content.getComponent("lblAddLicense");
	
	// btnAddLicenseCancel
	const btnAddLicenseCancel = Content.getComponent("btnAddLicenseCancel");
	btnAddLicenseCancel.setLocalLookAndFeel(LookAndFeel.textButton);
	btnAddLicenseCancel.setControlCallback(onbtnAddLicenseCancelControl);
	
	inline function onbtnAddLicenseCancelControl(component, value)
	{
		if (!value)
			hide();
	}

	// btnAddLicenseSubmit
	const btnAddLicenseSubmit = Content.getComponent("btnAddLicenseSubmit");
	btnAddLicenseSubmit.setLocalLookAndFeel(LookAndFeel.textButton);
	btnAddLicenseSubmit.setControlCallback(onbtnAddLicenseSubmitControl);

	inline function onbtnAddLicenseSubmitControl(component, value)
	{
		if (!value)
		{
			if (!UserAccount.isOnlineAndIsLoggedIn())
				return;
	
			local license = lblAddLicense.get("text");

			if (license != "" && license != "License Key")
			{
				addProductLicenseToAccount(license);
				pnlAddLicense.showControl(false);
				lblAddLicense.set("text", "");
			}
			else
			{
				Engine.showMessageBox("License Error", "Please enter a valid license key.", 1);
			}
		}
	}
	
	// Functions
	inline function addProductLicenseToAccount(licenseKey)
	{
		local headers = ["Authorization: Bearer " + UserAccount.getToken()];
		local endpoint = Config.apiPrefix + "transfer_license";
		local p = {"license_key": licenseKey};

		Server.setHttpHeader(headers.join("\n"));
		Server.setBaseURL(Config.baseURL[Config.MODE]);
		
		Spinner.show("Adding license to your account");
		
		Server.callWithPOST(endpoint, p, function(status, response)
		{
			Spinner.hide();

			if (status == 200)
			{
				if (isDefined(response.status))
				{
					ErrorHandler.serverError(status, response, "");
				}
				else
				{
					Library.rebuildCache();
					Notification.show("The license was successfully added to your account.");
				}
			}
			else
			{
				var msg = "";

				if (isDefined(response.code) && response.code == "rest_invalid_param")
					msg = "The license key you entered was not recognised.";

				ErrorHandler.serverError(status, response, msg);
			}
		});
	}
	
	inline function show()
	{
		lblAddLicense.set("text", "XXXX-XXXX-XXXX-XXXX");
		pnlAddLicense.showControl(true);
	}
	
	inline function hide()
	{
		pnlAddLicense.showControl(false);
	}
	
	// Function calls
	hide();
}