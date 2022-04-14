namespace UserAccountUI
{	
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
	lblUsername.set("text", "Email");
		
	// lblPassword 
	const lblPassword = Content.getComponent("lblPassword");
	lblPassword.set("text", "");
	lblPassword.set("fontStyle", "Password");
	
	// btnShowPassword
	const btnShowPassword = Content.getComponent("btnShowPassword");
	btnShowPassword.setLocalLookAndFeel(LookAndFeel.iconButton);
	btnShowPassword.setControlCallback(onbtnShowPasswordControl);
	    
	inline function onbtnShowPasswordControl(component, value)
	{
		if (value)
			lblPassword.set("fontStyle", "plain");
		else
			lblPassword.set("fontStyle", "Password");			
	}
	
	// btnLogin
    const btnLogin = Content.getComponent("btnLogin");
    btnLogin.setLocalLookAndFeel(LookAndFeel.textButton);
    btnLogin.setControlCallback(onbtnLoginControl);

    inline function onbtnLoginControl(component, value)
    {
        if (value)
            UserAccount.login(lblUsername.get("text"), lblPassword.get("text"));
    }
    
    // btnLogout
    const btnLogout = Content.getComponent("btnLogout");
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
						UserAccount.logout();
				});
			}
			else
			{
				UserAccount.logout();
			}
    	}    		
    }
        
	// btnRegister
	const btnRegister = Content.getComponent("btnRegister");
	btnRegister.setLocalLookAndFeel(LookAndFeel.textButton);
	btnRegister.setControlCallback(onbtnRegisterControl);
	
	inline function onbtnRegisterControl(component, value)
	{
		if (value)
			pnlRegister.showControl(true);
	}

	// btnLoginRecovery
	const btnLoginRecovery = Content.getComponent("btnLoginRecovery");
	btnLoginRecovery.setLocalLookAndFeel(LookAndFeel.textButton);
	btnLoginRecovery.setControlCallback(onbtnLoginRecoveryControl);

	inline function onbtnLoginRecoveryControl(component, value)
	{
		if (value)
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
		g.drawAlignedText("Create New Account", [lblRegisterEmail.get("x") + 25, lblRegisterEmail.get("y") - 60, lblRegisterEmail.getWidth(), 30], "left");
		
		g.fillPath(Paths.icons["newUser"], [lblRegisterEmail.get("x") - 30, lblRegisterEmail.get("y") - 60, 37, 32]);
		
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

	// btnRegisterViewPolicy
	const btnRegisterViewPolicy = Content.getComponent("btnRegisterViewPolicy");
	btnRegisterViewPolicy.setLocalLookAndFeel(LookAndFeel.empty);
	btnRegisterViewPolicy.setControlCallback(onbtnRegisterViewPolicyControl);

	inline function onbtnRegisterViewPolicyControl(component, value)
	{
		if (value)
			Engine.openWebsite(Config.baseURL[Config.MODE] + "/privacy-policy");
	}

	// btnRegisterCancel
	const btnRegisterCancel = Content.getComponent("btnRegisterCancel");
	btnRegisterCancel.setLocalLookAndFeel(LookAndFeel.textButton);
	btnRegisterCancel.setControlCallback(onbtnRegisterCancelControl);
	
	inline function onbtnRegisterCancelControl(component, value)
	{
		if (value)
			pnlRegister.showControl(false);
	}
	
	// btnRegisterSubmit
	const btnRegisterSubmit = Content.getComponent("btnRegisterSubmit");
	btnRegisterSubmit.setLocalLookAndFeel(LookAndFeel.textButton);
	btnRegisterSubmit.setControlCallback(onbtnRegisterSubmitControl);
	
	inline function onbtnRegisterSubmitControl(component, value)
	{
		if (value)
		{
			if (btnRegisterAcceptPolicy.getValue())
			{
				local email = lblRegisterEmail.get("text");

				if (Server.isEmailAddress(email))
				{
					UserAccount.createAccount(email);
					btnRegisterAcceptPolicy.setValue(false);					
				}
				else 
				{
					Engine.showMessageBox("Email Address", "Please enter a valid email address.", 3);
				}
			}
			else
			{
				Engine.showMessageBox("Privacy Policy", "You must accept the terms of the privacy policy.", 4);
			}
		}
	}		
	     	
	// btnOfflineMode
	const btnOfflineMode = Content.getComponent("btnOfflineMode");
	btnOfflineMode.setLocalLookAndFeel(LookAndFeel.textButton);
	btnOfflineMode.setControlCallback(onbtnOfflineModeControl);
	
	inline function onbtnOfflineModeControl(component, value)
	{
		if (value)
		{
			UserAccount.logout();
			Library.updateCatalogue();
	        hideLoginScreen();
		}
	}
    
    // Functions
	inline function showLoginScreen()
	{
		lblUsername.set("text", "Email");
		lblPassword.set("text", "");
		pnlLogin.showControl(true);
	}
	
	inline function hideLoginScreen()
	{
		pnlLogin.showControl(false);
	}
}