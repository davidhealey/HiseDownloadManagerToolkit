namespace LibraryManagerUIFactory
{
	inline function create(area)
	{
		// pnlLibrary
		Content.addPanel("pnlLibrary", 0, 0);
		Content.setPropertiesFromJSON("pnlLibrary", {
			"x": area[0], "y": area[1], "width": area[2], "height": area[3],
		});
		
		createLibraryHeader(area[2]);
		createLibraryList(area);
		createLogin(area);
		createRegister(area);
				
		// pnlModalBackground
		Content.addPanel("pnlModalBackground", 0, 0);
		Content.setPropertiesFromJSON("pnlModalBackground", {
			"x": area[0], "y": area[1], "width": area[2], "height": area[3],
			"parentComponent": "pnlLibrary",
			"itemColour": 0x30000000,
			"itemColour2": 0x30000000,
			"visible": false
		});
		
		createVariations(area);
		createAddLicense(area);
		createRatings(area);
		
		// pnlSpinner
		Content.addPanel("pnlSpinner", 0, 0);
		Content.setPropertiesFromJSON("pnlSpinner", {
			"x": area[0], "y": area[1], "width": area[2], "height": area[3],
			"itemColour": 0x30000000,
			"itemColour2": 0x30000000,
			"visible": false
		});
	}
	
	inline function createLibraryHeader(width)
	{
		Content.addPanel("pnlLibraryHeader", 0, 0);
		Content.setPropertiesFromJSON("pnlLibraryHeader", {
			"x": 0, "y": 0, "width": width, "height": 60,
			"parentComponent": "pnlLibrary"
		});

		Content.addButton("btnLogout", 0, 0);
		Content.setPropertiesFromJSON("btnLogout", {
			"x": 15, "y": 15, "width": 30, "height": 30,
			"parentComponent": "pnlLibraryHeader",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
		
		Content.addButton("btnSync", 0, 0);
		Content.setPropertiesFromJSON("btnSync", {
			"x": 55, "y": 15, "width": 30, "height": 30,
			"parentComponent": "pnlLibraryHeader",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
		
		Content.addButton("btnAddLicense", 0, 0);
		Content.setPropertiesFromJSON("btnAddLicense", {
			"x": 95, "y": 15, "width": 30, "height": 30,
			"parentComponent": "pnlLibraryHeader",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
		
		Content.addComboBox("cmbFilter", 0, 0);
		Content.setPropertiesFromJSON("cmbFilter", {
			"x": 135, "y": 15, "width": 150, "height": 30,
			"parentComponent": "pnlLibraryHeader",
			"saveInPreset": true,
			"items": "All\nInstalled\nLicensed\nUpdates\n$0"
		});
		
		Content.addLabel("lblSearch", 0, 0);
		Content.setPropertiesFromJSON("lblSearch", {
			"x": 335, "y": 15, "width": 150, "height": 30,
			"parentComponent": "pnlLibraryHeader",
			"editable": true
		});

		Content.addButton("btnClearSearch", 0, 0);
		Content.setPropertiesFromJSON("btnClearSearch", {
			"x": 295, "y": 15, "width": 30, "height": 30,
			"parentComponent": "pnlLibraryHeader",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
	}
	
	inline function createLibraryList(a)
	{
		Content.addViewport("vptLibraryList", 0, 0);
		Content.setPropertiesFromJSON("vptLibraryList", {
			"x": 0, "y": 65, "width": a[2], "height": a[3] - 100,
			"parentComponent": "pnlLibrary",
			"saveInPreset": false
		});
		
		Content.addPanel("pnlLibraryList", 0, 0);
		Content.setPropertiesFromJSON("pnlLibraryList", {
			"x": 0, "y": 0, "width": a[2] - 16, "height": a[3],
			"parentComponent": "vptLibraryList",
			"saveInPreset": false
		});		
	}
	
	inline function createLogin(a)
	{
		Content.addPanel("pnlLogin", 0, 0);
		Content.setPropertiesFromJSON("pnlLogin", {
			"x": 0, "y": 0, "width": a[2], "height": a[3],
			"parentComponent": "pnlLibrary",
			"saveInPreset": false,
			"visible": false
		});
		
		Content.addLabel("lblUsername", 0, 0);
		Content.setPropertiesFromJSON("lblUsername", {
			"x": 20, "y": 120, "width": 200, "height": 30,
			"parentComponent": "pnlLogin",
			"bgColour": Colours.black,
			"saveInPreset": false,
			"editable": true
		});
		
		Content.addLabel("lblPassword", 0, 0);
		Content.setPropertiesFromJSON("lblPassword", {
			"x": 20, "y": 160, "width": 200, "height": 30,
			"parentComponent": "pnlLogin",
			"bgColour": Colours.black,
			"saveInPreset": false,
			"editable": true,
			"fontStyle": "Password"
		});
		
		Content.addButton("btnShowPassword", 0, 0);
		Content.setPropertiesFromJSON("btnShowPassword", {
			"x": 240, "y": 160, "width": 30, "height": 30,
			"parentComponent": "pnlLogin",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});

		Content.addButton("btnLogin", 0, 0);
		Content.setPropertiesFromJSON("btnLogin", {
			"x": 20, "y": 220, "width": 70, "height": 30,
			"parentComponent": "pnlLogin",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
		
		Content.addButton("btnLoginRecovery", 0, 0);
		Content.setPropertiesFromJSON("btnLoginRecovery", {
			"x": 20, "y": 320, "width": 100, "height": 30,
			"parentComponent": "pnlLogin",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
		
		Content.addButton("btnRegister", 0, 0);
		Content.setPropertiesFromJSON("btnRegister", {
			"x": 20, "y": 360, "width": 100, "height": 30,
			"parentComponent": "pnlLogin",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
		
		Content.addButton("btnOfflineMode", 0, 0);
		Content.setPropertiesFromJSON("btnOfflineMode", {
			"x": 20, "y": 400, "width": 100, "height": 30,
			"parentComponent": "pnlLogin",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});		
	}
	
	inline function createRegister(a)
	{
		Content.addPanel("pnlRegister", 0, 0);
		Content.setPropertiesFromJSON("pnlRegister", {
			"x": 0, "y": 0, "width": a[2], "height": a[3],
			"parentComponent": "pnlLibrary",
			"saveInPreset": false,
			"visible": false
		});
		
		Content.addLabel("lblRegisterEmail", 0, 0);
		Content.setPropertiesFromJSON("lblRegisterEmail", {
			"x": 20, "y": 120, "width": 200, "height": 30,
			"parentComponent": "pnlRegister",
			"bgColour": Colours.black,
			"saveInPreset": false,
			"editable": true
		});
		
		Content.addButton("btnRegisterSubmit", 0, 0);
		Content.setPropertiesFromJSON("btnRegisterSubmit", {
			"x": 20, "y": 160, "width": 70, "height": 30,
			"parentComponent": "pnlRegister",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
		
		Content.addButton("btnRegisterCancel", 0, 0);
		Content.setPropertiesFromJSON("btnRegisterCancel", {
			"x": 100, "y": 160, "width": 70, "height": 30,
			"parentComponent": "pnlRegister",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
		
		Content.addButton("btnRegisterAcceptPolicy", 0, 0);
		Content.setPropertiesFromJSON("btnRegisterAcceptPolicy", {
			"x": 20, "y": 260, "width": 100, "height": 30,
			"parentComponent": "pnlRegister",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
		
		Content.addButton("btnRegisterViewPolicy", 0, 0);
		Content.setPropertiesFromJSON("btnRegisterViewPolicy", {
			"x": 20, "y": 300, "width": 100, "height": 30,
			"parentComponent": "pnlRegister",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
	}

	inline function createVariations(a)
	{
		Content.addPanel("pnlVariations", 0, 0);
		Content.setPropertiesFromJSON("pnlVariations", {
			"x": 0, "y": 60, "width": a[2], "height": a[3] - 60,
			"parentComponent": "pnlLibrary",
			"saveInPreset": false,
			"visible": false
		});
		
		Content.addComboBox("cmbVariations", 0, 0);
		Content.setPropertiesFromJSON("cmbVariations", {
			"x": 20, "y": 15, "width": 150, "height": 30,
			"parentComponent": "pnlVariations",
			"saveInPreset": false,
			"items": ""
		});
		
		Content.addButton("btnVariationsCancel", 0, 0);
		Content.setPropertiesFromJSON("btnVariationsCancel", {
			"x": 20, "y": 100, "width": 100, "height": 30,
			"parentComponent": "pnlVariations",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
		
		Content.addButton("btnVariationsSubmit", 0, 0);
		Content.setPropertiesFromJSON("btnVariationsSubmit", {
			"x": 140, "y": 100, "width": 100, "height": 30,
			"parentComponent": "pnlVariations",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
	}
	
	inline function createAddLicense(a)
	{
		Content.addPanel("pnlAddLicense", 0, 0);
		Content.setPropertiesFromJSON("pnlAddLicense", {
			"x": 0, "y": 60, "width": a[2], "height": a[3] - 60,
			"parentComponent": "pnlLibrary",
			"saveInPreset": false,
			"visible": false
		});
		
		Content.addLabel("lblAddLicense", 0, 0);
		Content.setPropertiesFromJSON("lblAddLicense", {
			"x": 20, "y": 15, "width": 150, "height": 30,
			"parentComponent": "pnlAddLicense",
			"saveInPreset": false,
			"editable": true
		});
		
		Content.addButton("btnAddLicenseCancel", 0, 0);
		Content.setPropertiesFromJSON("btnAddLicenseCancel", {
			"x": 20, "y": 100, "width": 100, "height": 30,
			"parentComponent": "pnlAddLicense",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
		
		Content.addButton("btnAddLicenseSubmit", 0, 0);
		Content.setPropertiesFromJSON("btnAddLicenseSubmit", {
			"x": 140, "y": 100, "width": 100, "height": 30,
			"parentComponent": "pnlAddLicense",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
	}
	
	inline function createRatings(a)
	{
		Content.addPanel("pnlRatings", 0, 0);
		Content.setPropertiesFromJSON("pnlRatings", {
			"x": 0, "y": 60, "width": a[2], "height": a[3] - 60,
			"parentComponent": "pnlLibrary",
			"saveInPreset": false,
			"visible": true
		});
		
		Content.addLabel("lblReview", 0, 0);
		Content.setPropertiesFromJSON("lblReview", {
			"x": 20, "y": 15, "width": 150, "height": 90,
			"parentComponent": "pnlRatings",
			"saveInPreset": false,
			"editable": true,
			"multiline": true
		});
		
		Content.addButton("btnRatingsCancel", 0, 0);
		Content.setPropertiesFromJSON("btnRatingsCancel", {
			"x": 20, "y": 150, "width": 100, "height": 30,
			"parentComponent": "pnlRatings",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
		
		Content.addButton("btnRatingsSubmit", 0, 0);
		Content.setPropertiesFromJSON("btnRatingsSubmit", {
			"x": 140, "y": 150, "width": 100, "height": 30,
			"parentComponent": "pnlRatings",
			"saveInPreset": false,
			"isMomentary": true,
			"enableMidiLearn": false
		});
		
		Content.addPanel("pnlRatingsStars", 0, 0);
		Content.setPropertiesFromJSON("pnlRatingsStars", {
			"x": 20, "y": 200, "width": 100, "height": 30,
			"parentComponent": "pnlRatings",
			"saveInPreset": false,
			"allowedCallbacks": "All Callbacks"
		});
	}
}