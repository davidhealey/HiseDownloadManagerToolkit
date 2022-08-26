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

namespace UserAccount
{
	const appData = FileSystem.getFolder(FileSystem.AppData);

	reg authToken = loadToken();
	reg online = Server.isOnline();
	reg nest = {};

    // pnlLogin
    const pnlLogin = Content.getComponent("pnlLogin");
    
    pnlLogin.setPaintRoutine(function(g)
    {
    	var a = this.getLocalBounds(0);

    	g.setColour(this.get("bgColour"));
    	g.fillRoundedRectangle(a, 5);
    
    	g.setColour(this.get("itemColour"));
    	g.fillRoundedRectangle([a[0], a[1], a[2], 150], 3);
    	
    	g.setFont("medium", 26);
    	g.setColour(this.get("textColour"));
    	g.drawAlignedText("Login", [a[0] + 15, 0, a[2], 150], "centred");
    	
    	g.setColour(this.get("itemColour2"));
    	g.fillPath(Paths.icons["user"], [a[0] + a[2] / 2 - 50, 150 / 2 - 15, 21, 30]);
    	
    	LookAndFeel.drawInput(lblUsername, {id: "email", width: 18, height: 14});
    	LookAndFeel.drawInput(lblPassword, {id: "lock", width: 18, height: 20});
    });
    
    // lblUsername
    const lblUsername = Content.getComponent("lblUsername");

    // lblPassword 
    const lblPassword = Content.getComponent("lblPassword");
    lblPassword.set("fontStyle", "Password");
    
    lblPassword.setKeyPressCallback(function(event)
    {
    	if (event.keyCode == 13 || event.description == "return")
			lblPasswordTimer.startTimer(11);
    });
    
    // lblPasswordTimer - to handle return key action
    const lblPasswordTimer = Engine.createTimerObject();

    lblPasswordTimer.setTimerCallback(function()
    {
		login(lblUsername.get("text"), lblPassword.get("text"));
	   	this.stopTimer();
    });

    // btnShowPassword
    const btnShowPassword = Content.getComponent("btnShowPassword");
    btnShowPassword.setLocalLookAndFeel(LookAndFeel.iconButton);
    btnShowPassword.setControlCallback(onbtnShowPasswordControl);
        
    inline function onbtnShowPasswordControl(component, value)
    {
   		lblPassword.set("fontStyle", value ? "plain" : "Password");
    }
    
    // btnLogin
	const btnLogin = Content.getComponent("btnLogin");
	btnLogin.setLocalLookAndFeel(LookAndFeel.textButton);
	btnLogin.setControlCallback(onbtnLoginControl);

	inline function onbtnLoginControl(component, value)
	{
		if (!value)
			login(lblUsername.get("text"), lblPassword.get("text"));
	}
        
	// btnLogout
	const btnLogout = Content.getComponent("btnLogout");
	btnLogout.set("enabled", true);
	btnLogout.setLocalLookAndFeel(LookAndFeel.iconButton);
	btnLogout.setControlCallback(onbtnLogoutControl);
        
	inline function onbtnLogoutControl(component, value)
	{
		if (!value)
		{
			if (UserAccount.isLoggedIn() == true)
			{
				Engine.showYesNoWindow("Confirm Logout", "Do you want to logout?", function(response)
				{
					if (response)
						logout();
				});
			}
			else
			{
				logout();
			}
		}    		
	}
            
    // btnRegister
    const btnRegister = Content.getComponent("btnRegister");
    btnRegister.setLocalLookAndFeel(LookAndFeel.textButton);
    btnRegister.setControlCallback(onbtnRegisterControl);
    
    inline function onbtnRegisterControl(component, value)
    {
    	if (!value)
    	{
    		btnRegisterAcceptPolicy.setValue(false);
    		pnlRegister.showControl(true);
    	}			
    }
    
    // btnLoginRecovery
    const btnLoginRecovery = Content.getComponent("btnLoginRecovery");
    btnLoginRecovery.setLocalLookAndFeel(LookAndFeel.textButton);
    btnLoginRecovery.setControlCallback(onbtnLoginRecoveryControl);
    
    inline function onbtnLoginRecoveryControl(component, value)
    {
    	if (!value)
    		Engine.openWebsite(Config.baseURL[Config.MODE] + "/my-account/lost-password/");
    }
    
    // pnlRegister
    const pnlRegister = Content.getComponent("pnlRegister");
    
    pnlRegister.setPaintRoutine(function(g)
    {
    	var a = this.getLocalBounds(0);
    
    	g.setColour(this.get("bgColour"));
    	g.fillRoundedRectangle(a, 5);

    	g.setFont("medium", 26);
    	g.setColour(this.get("textColour"));
    	g.drawAlignedText("Create New Account", [a[0], lblRegisterEmail.get("y") - 60, a[2], 30], "centred");
    	
    	g.fillPath(Paths.icons["newUser"], [lblRegisterEmail.get("x") - 20, lblRegisterEmail.get("y") - 62, 37, 32]);
    	
    	g.setFont("medium", 18);
    	g.drawAlignedText("Accept", [lblRegisterEmail.get("x") - 10, lblRegisterEmail.get("y") + 40, 50, 30], "left");
    	
    	g.setColour(this.get("itemColour2"));
    	g.drawAlignedText("Privacy Policy", [lblRegisterEmail.get("x") + 42, lblRegisterEmail.get("y") + 40, 100, 30], "left");
    	g.drawHorizontalLine(btnRegisterViewPolicy.get("y") + btnRegisterViewPolicy.getHeight(), btnRegisterViewPolicy.get("x"), btnRegisterViewPolicy.get("x") + btnRegisterViewPolicy.getWidth());
    
    	LookAndFeel.drawInput(lblRegisterEmail, {id: "email", width: 18, height: 14});
    });
    
    // lblRegisterEmail
    const lblRegisterEmail = Content.getComponent("lblRegisterEmail");
    lblRegisterEmail.set("text", "Email");	
    
    // btnRegisterAcceptPolicy
    const btnRegisterAcceptPolicy = Content.getComponent("btnRegisterAcceptPolicy");
    btnRegisterAcceptPolicy.setLocalLookAndFeel(LookAndFeel.checkBox);
    btnRegisterAcceptPolicy.setControlCallback(onbtnRegisterAcceptPolicyControl);
    
    inline function onbtnRegisterAcceptPolicyControl(component, value)
    {
    	btnRegisterSubmit.set("enabled", value);
    }
    
    // btnRegisterViewPolicy
    const btnRegisterViewPolicy = Content.getComponent("btnRegisterViewPolicy");
    btnRegisterViewPolicy.setLocalLookAndFeel(LookAndFeel.empty);
    btnRegisterViewPolicy.setControlCallback(onbtnRegisterViewPolicyControl);
    
    inline function onbtnRegisterViewPolicyControl(component, value)
    {
    	if (!value)
    		Engine.openWebsite(Config.baseURL[Config.MODE] + "/privacy-policy");
    }
    
    // btnRegisterCancel
    const btnRegisterCancel = Content.getComponent("btnRegisterCancel");
    btnRegisterCancel.setLocalLookAndFeel(LookAndFeel.textButton);
    btnRegisterCancel.setControlCallback(onbtnRegisterCancelControl);
    
    inline function onbtnRegisterCancelControl(component, value)
    {
    	if (!value)
    		pnlRegister.showControl(false);
    }
    
    // btnRegisterSubmit
    const btnRegisterSubmit = Content.getComponent("btnRegisterSubmit");
    btnRegisterSubmit.set("enabled", false);
    btnRegisterSubmit.setLocalLookAndFeel(LookAndFeel.textButton);
    btnRegisterSubmit.setControlCallback(onbtnRegisterSubmitControl);
    
    inline function onbtnRegisterSubmitControl(component, value)
    {
    	if (!value)
    	{
    		local email = lblRegisterEmail.get("text");
    
    		if (Server.isEmailAddress(email))
    			createAccount(email);	
    		else 
    			Engine.showMessageBox("Email Address", "Please enter a valid email address.", 3);
    	}
    }		
         	
    // btnOfflineMode
    const btnOfflineMode = Content.getComponent("btnOfflineMode");
    btnOfflineMode.setLocalLookAndFeel(LookAndFeel.textButton);
    btnOfflineMode.setControlCallback(onbtnOfflineModeControl);
    
    inline function onbtnOfflineModeControl(component, value)
    {
    	if (!value)
    	{
    		logout();
    		LibraryHeader.setEnabledStateOfButtons();
    		LibraryList.show();
    		Library.updateCatalogue();
            hide();
    	}
    }
    
	// Functions
	inline function createAccount(email)
	{		
		local endpoint = Config.apiPrefix + "create_account";
		local p = {"email": email.trim()};

		Server.setHttpHeader("");
		Server.setBaseURL(Config.baseURL[Config.MODE]);
		
		Spinner.show("Communicating with server");

		Server.callWithPOST(endpoint, p, function(status, response)
		{
			Spinner.hide();

			if (status == 200)
			{
				if (response[0] == true)
				{
					pnlRegister.showControl(false);
					lblRegisterEmail.set("text", "");
					Engine.showMessageBox("Success", "An email has been sent to you, please follow its instructions.  Check your junk/spam folder if it's not in your inbox.", 0);
				}
				else if (isDefined(response.status) && response.status == "error")
				{
					Engine.showErrorMessage(response.msg, false);
				}
			}
			else
			{
				ErrorHandler.serverError(status, response, "");
			}
		});		
	}
	
	inline function login(username, password)
    {
        nest.p = {"username": username.trim(), "password": password};
        
        if (!isDefined(username) || username == "" || username == "Email")
			return Engine.showMessageBox("Invalid Email", "Please enter a valid email address or username.", 3);

		if (!isDefined(password) || password == "")
			return Engine.showMessageBox("Invalid Password", "Please enter a valid password.", 3);

        Server.setHttpHeader("");
		Server.setBaseURL(Config.baseURL[Config.MODE]);
        
        Spinner.show("Logging In");
        
		Server.callWithPOST("wp-json/jwt-auth/v1/token", nest.p, function(status, response)
		{
			Spinner.hide();

			if (status == 200 && isDefined(response.token))
		    {
				storeCredentials(nest.p.username, response.token);
		        Library.clearCache();
		        Library.rebuildCache();
		        LibraryHeader.setEnabledStateOfButtons();
		        hide();
		        LibraryList.show();
		    }
		    else
		    {
				reg msg = "A server error was detected. Please try again later.";

				if (isDefined(response.message))
				{
					msg = response.message.replace("Error").replace("<strong>").replace("</strong>").replace(": ");
					msg = msg.replace(msg.substring(msg.lastIndexOf(". "), msg.length));
		
					reg firstChar = msg.substring(0, 1).toUpperCase();
					msg = firstChar + msg.substring(1, msg.length);
					
					if (msg.substring(msg.length - 1, msg.length) != ".")
						msg += ".";
				}
				
		        Engine.showMessageBox("Log in failure", msg, 1);
		    }
		});
	}
		         
	inline function logout()
	{
		showLoginScreen();
		deleteCredentials();
		Library.clearCache();
	}

   	inline function deleteCredentials()
	{
		local f = appData.getChildFile("credentials.json");
		authToken = undefined;

		if (f.isFile())
			f.deleteFileOrDirectory();
	}
        
	inline function storeCredentials(username, token)
     {
		local data = {"username": username, "token": token};
		local f = appData.getChildFile("credentials.json");

		authToken = token;
		f.writeEncryptedObject(data, parseInt(Config.encryptionKey));
     }
    
	inline function loadToken()
	{
		local f = appData.getChildFile("credentials.json");

		if (isDefined(f) && f.isFile())
		{
			local data = f.loadEncryptedObject(parseInt(Config.encryptionKey));			
			return data.token;
		}

		return undefined;
	}

	inline function getToken()
	{
		return authToken;
	}
	
	inline function isLoggedIn()
	{
		return isDefined(authToken);
	}
	
	inline function isOnline()
	{
		online = Server.isOnline();
		
		if (!online)
			return Engine.showMessageBox("Offline Mode", "An internet connection is required.", 1);
			
		return true;
	}
	
	inline function isOnlineAndIsLoggedInSilent()
	{
		return isDefined(authToken) && online;
	}
	
	inline function isOnlineAndIsLoggedIn()
	{
		online = Server.isOnline();

		if (!online)
			return Engine.showMessageBox("Offline Mode", "An internet connection is required.", 1);

		if (!isDefined(authToken))
			return Engine.showMessageBox("Login Required", "You need to login to use this feature.", 1);
				
		if (Engine.isPlugin() && !Config.NETWORK_IN_PLUGIN)
			return Engine.showMessageBox("Standalone Only", "This feature is only available in the standalone application.", 1);
		
		return true;
	}
	
	inline function hide()
	{
		pnlRegister.showControl(false);
		pnlLogin.showControl(false);
	}
	
	inline function showLoginScreen()
	{
		lblUsername.set("text", "");
		lblPassword.set("text", "");
		pnlRegister.showControl(false);
		pnlLogin.showControl(true);
	}
	
	inline function hideLoginScreen()
	{
		pnlLogin.showControl(false);
	}

	// Function calls
	if (!isDefined(UserAccount.getToken()))
		showLoginScreen();
	else
		hide();
}