namespace UserSettings
{
	const NUM_TABS = 2;
	const appData = FileSystem.getFolder(FileSystem.AppData);
	
	reg data = {};

	// pnlSettings
	const pnlSettings = Content.getComponent("pnlSettings");

	pnlSettings.setPaintRoutine(function(g)
	{
		g.fillAll(this.get("bgColour"));
	});
		
	// btnSettingsClose
	const btnSettingsClose = Content.getComponent("btnSettingsClose");
	btnSettingsClose.setLocalLookAndFeel(LookAndFeel.textButton);
	btnSettingsClose.setControlCallback(onbtnSettingsCloseControl);
	
	inline function onbtnSettingsCloseControl(component, value)
	{
		if (!value)
			saveAndExit();
	}
	
	// btnSettingsTab
	const btnSettingsTab = [];
	
	for (i = 0; i < NUM_TABS; i++)
	{
		btnSettingsTab.push(Content.getComponent("btnSettingsTab" + i));
		btnSettingsTab[i].setLocalLookAndFeel(LookAndFeel.textToggleButton);
		btnSettingsTab[i].setControlCallback(onbtnSettingsTabControl);
	}
	
	inline function onbtnSettingsTabControl(component, value)
	{
		local index = btnSettingsTab.indexOf(component);
		
		for (i = 0; i < btnSettingsTab.length; i++)
			btnSettingsTab[i].setValue(i == index);
		
		changeTab(index);
	}
	
	// pnlSettingsTab
	const pnlSettingsTab = [];
	
	for (i = 0; i < NUM_TABS; i++)
	{
		pnlSettingsTab.push(Content.getComponent("pnlSettingsTab" + i));
		pnlSettingsTab[i].showControl(btnSettingsTab[i].getValue());
	}
	
	// pnlSettingsTab0 - Library
	pnlSettingsTab[0].setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);

		var lblArea = [lblSamplePath.get("x") - 5, lblSamplePath.get("y"), lblSamplePath.getWidth() + 40, lblSamplePath.getHeight()];
		
		g.setColour(lblSamplePath.get("bgColour"));
		g.fillRoundedRectangle(lblArea, 3);
		
		lblArea = [lblVst3Path.get("x") - 5, lblVst3Path.get("y"), lblVst3Path.getWidth() + 40, lblVst3Path.getHeight()];
		
		g.setColour(lblVst3Path.get("bgColour"));
		g.fillRoundedRectangle(lblArea, 3);
		
		if (lblAuPath.get("visible"))
		{
			lblArea = [lblAuPath.get("x") - 5, lblAuPath.get("y"), lblAuPath.getWidth() + 40, lblAuPath.getHeight()];
			
			g.setColour(lblAuPath.get("bgColour"));
			g.fillRoundedRectangle(lblArea, 3);
		}

		// Labels
		g.setColour(lblSamplePath.get("textColour"));
		g.setFont("medium", 18);

		g.drawAlignedText("Default Sample Path", [40, lblSamplePath.get("y"), 200, 30], "left");
		g.drawAlignedText("VST3 Path", [40, lblVst3Path.get("y"), 200, 30], "left");

		if (lblAuPath.get("visible"))
			g.drawAlignedText("AU Path", [40, lblAuPath.get("y"), 200, 30], "left");

		g.drawAlignedText("Auto Sync", [40, btnAutoSync.get("y"), 200, btnAutoSync.getHeight()], "left");
		g.drawAlignedText(["Off", "On"][btnAutoSync.getValue()], [btnAutoSync.get("x") + btnAutoSync.getWidth() + 15, btnAutoSync.get("y"), 200, btnAutoSync.getHeight()], "left");
		
		g.drawAlignedText("Beta Updates", [40, btnBeta.get("y"), 200, btnBeta.getHeight()], "left");
		g.drawAlignedText(["Off", "On"][btnBeta.getValue()], [btnBeta.get("x") + btnBeta.getWidth() + 15, btnBeta.get("y"), 200, btnBeta.getHeight()], "left");
	});

	// btnAutoSync
	const btnAutoSync = Content.getComponent("btnAutoSync");
	btnAutoSync.setLocalLookAndFeel(LookAndFeel.toggleButton);
	btnAutoSync.setControlCallback(onbtnAutoSyncControl);

	inline function onbtnAutoSyncControl(component, value)
	{
		pnlSettingsTab[0].repaint();
	}
	
	// btnBeta
	const btnBeta = Content.getComponent("btnBeta");
	btnBeta.setLocalLookAndFeel(LookAndFeel.toggleButton);
	btnBeta.setControlCallback(onbtnBetaControl);
	
	inline function onbtnBetaControl(component, value)
	{
		pnlSettingsTab[0].repaint();
	}

	// lblSamplePath
	const lblSamplePath = Content.getComponent("lblSamplePath");
	lblSamplePath.set("text", "");

	// lblVst3Path
	const lblVst3Path = Content.getComponent("lblVst3Path");
	
	// lblAuPath
	const lblAuPath = Content.getComponent("lblAuPath");
	lblAuPath.showControl(Engine.getOS() == "OSX");
	
	// btnSamplePath
	const btnSamplePath = Content.getComponent("btnSamplePath");
	btnSamplePath.setLocalLookAndFeel(LookAndFeel.iconButton);
	btnSamplePath.setControlCallback(onbtnSamplePathControl);
	
	inline function onbtnSamplePathControl(component, value)
	{
		if (!value)
			selectSamplePath();
	}
			
	// pnlSettingsTab1 - Engine
	pnlSettingsTab[1].setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(0);

		// Labels
		g.setColour(this.get("textColour"));
		g.setFont("medium", 18);

		g.drawAlignedText("UI Scaling", [40, cmbZoom.get("y"), 200, 30], "left");
		g.drawAlignedText("Open GL", [40, cmbOpenGl.get("y"), 200, 30], "left");
		g.drawAlignedText("Disk Streaming", [40, cmbStreaming.get("y"), 200, 30], "left");

		if (cmbTheme.get("visible"))
			g.drawAlignedText("UI Theme", [40, cmbTheme.get("y"), 200, 30], "left");
	});
	
	// cmbZoom
	const cmbZoom = Content.getComponent("cmbZoom");
	cmbZoom.setLocalLookAndFeel(LookAndFeel.comboBox);
	cmbZoom.setControlCallback(oncmbZoomControl);
	
	inline function oncmbZoomControl(component, value)
	{
		local zl = parseFloat(component.getItemText()) / 100;
		Settings.setZoomLevel(zl);
	}

	// cmbOpenGl
	const cmbOpenGl = Content.getComponent("cmbOpenGl");
	cmbOpenGl.setLocalLookAndFeel(LookAndFeel.comboBox);
	cmbOpenGl.setControlCallback(oncmbOpenGlControl);
	
	inline function oncmbOpenGlControl(component, value)
	{
		Settings.setEnableOpenGL(value == 1);
	}
	
	// cmbStreaming
	const cmbStreaming = Content.getComponent("cmbStreaming");
	cmbStreaming.setLocalLookAndFeel(LookAndFeel.comboBox);
	cmbStreaming.setControlCallback(oncmbStreamingControl);

	inline function oncmbStreamingControl(component, value)
	{
		Settings.setDiskMode(value == 1);
	}
	
	// cmbTheme
	const cmbTheme = Content.getComponent("cmbTheme");
	cmbTheme.setLocalLookAndFeel(LookAndFeel.comboBox);
	cmbTheme.setControlCallback(oncmbThemeControl);
	cmbTheme.set("items", Theme.getIds().join("\n"));
	
	inline function oncmbThemeControl(component, value)
	{
		Theme.setStyle(value - 1);
	}

	// Functions
	inline function selectSamplePath()
	{
		local startFolder;
		
		if (isDefined(data.samplePath) && data.samplePath != "")
			startFolder = FileSystem.fromAbsolutePath(data.samplePath);
			
		if (!isDefined(startFolder))
			startFolder = FileSystem.Desktop;
 
		FileSystem.browseForDirectory(startFolder, function(dir)
		{
			if (isDefined(dir) && dir.isDirectory())
			{
				if (!dir.hasWriteAccess())
					ErrorHandler.showError("Unwritable Directory", "You do not have write permission for the selected directory. Please choose a different one.");
				else
					lblSamplePath.set("text", dir.toString(dir.FullPath));	
			}
		});
	}

	inline function changeTab(index)
	{
		for (i = 0; i < NUM_TABS; i++)
			pnlSettingsTab[i].showControl(i == index);
	}
	
	inline function setPathLabelText()
	{
		switch (Engine.getOS())
		{
			case "LINUX":
				lblVst3Path.set("text", "~/.vst3");
				lblAuPath.set("text", "");
				break;

			case "OSX":
				lblVst3Path.set("text", "Library/Audio/Plug-ins/VST3");
				lblAuPath.set("text", "Library/Audio/Plug-ins/Components");
				break;

			case "WIN":
				lblVst3Path.set("text", "C:\\Program Files\\Common Files\\VST3");
				lblAuPath.set("text", "");
				break;
		}
	}
	
	inline function saveAndExit()
	{
		local f = appData.getChildFile("userSettings.json");
		
		if (isDefined(f) && f.isFile())
			data = f.loadAsObject();
			
		data.autoSync = btnAutoSync.getValue();
		data.beta = btnBeta.getValue();
		data.samplePath = lblSamplePath.get("text");
		data.zoom = cmbZoom.getValue();
		data.openGl = cmbOpenGl.getValue();
		data.streaming = cmbStreaming.getValue();
		data.theme = cmbTheme.getValue();
		
		f.writeObject(data);

		hide();
	}
	
	inline function restoreSettings()
	{
		local f = appData.getChildFile("userSettings.json");

		if (isDefined(f) && f.isFile())
		{
			data = f.loadAsObject();

			if (isDefined(data.autoSync)) btnAutoSync.setValue(data.autoSync);
			if (isDefined(data.beta)) btnBeta.setValue(data.beta);
			if (isDefined(data.samplePath)) lblSamplePath.set("text", data.samplePath);
			if (isDefined(data.zoom)) cmbZoom.setValue(data.zoom);
			if (isDefined(data.openGl)) cmbOpenGl.setValue(data.openGl);
			if (isDefined(data.streaming)) cmbStreaming.setValue(data.streaming);

			if (isDefined(data.theme))
			{
				cmbTheme.setValue(data.theme);
				Theme.setStyle(data.theme - 1);
			}
		}
	}
	
	inline function setValue(key, value)
	{
		local f = appData.getChildFile("userSettings.json");
		
		if (isDefined(f) && f.isFile())
			data = f.loadAsObject();
			
		data[key] = value;

		return f.writeObject(data);		
	}
	
	inline function getValue(key)
	{
		if (!isDefined(data[key]))
			return undefined;

		return data[key];
	}
	
	inline function show()
	{
		pnlSettings.showControl(true);
	}
	
	inline function hide()
	{
		pnlSettings.showControl(false);
	}
	
	inline function getDefaultSampleFolder()
	{
		local path = data.samplePath;
		local f;
	
		if (isDefined(path))
			f = FileSystem.fromAbsolutePath(path);
	
		if (isDefined(f) && f.isDirectory())
			return f;

		return undefined;
	}
	
	// Function calls
	restoreSettings();
	setPathLabelText();
}