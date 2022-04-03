namespace UserSettings
{
	reg data = {"vstPath": "", "auPath": ""};

	// btnSettings
	const btnSettings = Content.getComponent("btnSettings");
	btnSettings.setControlCallback(onbtnSettingsControl);
	
	inline function onbtnSettingsControl(component, value)
	{
		if (value)
			pnlSettings.showControl(value);
	}
	
	// pnlSettings
	const pnlSettings = Content.getComponent("pnlSettings");
	
	pnlSettings.setPaintRoutine(function(g)
	{
		g.fillAll(Colours.withAlpha(Colours.black, 0.8));
	});
	
	// pnlSettingsContainer
	const pnlSettingsContainer = Content.getComponent("pnlSettingsContainer");
	
	pnlSettingsContainer.setPaintRoutine(function(g)
	{
		g.setColour(this.get("bgColour"));
		g.fillRoundedRectangle([0, 0, this.getWidth(), this.getHeight()], 5);
	});
	
	
	// btnSettingsTab, pnlSettingsTab
	const btnSettingsTab = [];
	const pnlSettingsTab = [];
	
	for (i = 0; i < 2; i++)
	{
		btnSettingsTab.push(Content.getComponent("btnSettingsTab" + i));
		btnSettingsTab[i].setControlCallback(onbtnSettingsTabControl);
		pnlSettingsTab.push(Content.getComponent("pnlSettingsTab" + i));
	}
	
	inline function onbtnSettingsTabControl(component, value)
	{
		local index = btnSettingsTab.indexOf(component);
		
		for (i = 0; i < btnSettingsTab.length; i++)
		{
			btnSettingsTab[i].setValue(i == index);
			pnlSettingsTab[i].showControl(i == index);
		}
	}
	
	// pnlSettingsTab0
	pnlSettingsTab[0].setPaintRoutine(function(g)
	{
		g.setColour(this.get("bgColour"));
		g.fillRoundedRectangle([0, 0, this.getWidth(), this.getHeight()], 5);

		LookAndFeel.drawInput(lblVstPath, "");

		if (lblAuPath.get("visible"))
			LookAndFeel.drawInput(lblAuPath, "");
		
		g.setFont("medium", 20);
		g.setColour(this.get("textColour"));
		g.drawAlignedText("VST3 Path", [lblVstPath.get("x") - 115, lblVstPath.get("y") + lblVstPath.getHeight() - lblVstPath.getHeight() / 2 - 14, 100, 30], "left");
		
		if (lblAuPath.get("visible"))
			g.drawAlignedText("AU Path", [lblAuPath.get("x") - 115, lblAuPath.get("y") + lblAuPath.getHeight() - lblAuPath.getHeight() / 2 - 14, 100, 30], "left");

		g.drawAlignedText("Auto Sync", [lblVstPath.get("x") - 115, btnAutoSync.get("y") + btnAutoSync.getHeight() - btnAutoSync.getHeight() / 2 - 16, 100, 30], "left");
		g.drawAlignedText("Manual Install", [lblVstPath.get("x") - 115, btnManualInstall.get("y") + btnManualInstall.getHeight() - btnManualInstall.getHeight() / 2 - 15, 150, 30], "left");
		g.drawAlignedText("Temporary Files", [lblVstPath.get("x") - 115, btnClearTemp.get("y") + btnClearTemp.getHeight() - btnClearTemp.getHeight() / 2 - 15, 150, 30], "left");
		g.drawAlignedText("Sample Quality", [lblVstPath.get("x") - 115, btnBitDepth.get("y") + btnBitDepth.getHeight() - btnBitDepth.getHeight() / 2 - 16, 150, 30], "left");

		g.setFont("medium", 18);
		g.setColour(btnAutoSync.get("textColour"));
		var t = btnAutoSync.getValue() ? "ON" : "OFF";
		g.drawAlignedText(t, [btnAutoSync.get("x") + btnAutoSync.getWidth() + 10, btnAutoSync.get("y"), 75, btnAutoSync.getHeight()], "left");
		
		g.setColour(btnBitDepth.get("textColour"));
		t = btnBitDepth.getValue() ? "24-BIT" : "16-BIT";
		g.drawAlignedText(t, [btnBitDepth.get("x") + btnBitDepth.getWidth() + 10, btnBitDepth.get("y"), 75, btnBitDepth.getHeight()], "left");
	});
	
	// pnlSettingsTab1
	pnlSettingsTab[1].setPaintRoutine(function(g)
	{
		g.setColour(this.get("bgColour"));
		g.fillRoundedRectangle([0, 0, this.getWidth(), this.getHeight()], 5);
	});
	
	// fltEngineSettings
	const fltEngineSettings = Content.getComponent("fltEngineSettings");
	const tileData = {
		"Type": "CustomSettings",
		"Title": "Engine",
		"ColourData": {
			"bgColour": 0x00000000,
			"textColour": 0xFF8C8780
		},
		"Font": "medium",
		"FontSize": 16,
		"Driver": !isPlugin,
		"Device": !isPlugin,
		"Output": !isPlugin,
		"BufferSize": !isPlugin,
		"SampleRate": !isPlugin,
		"GlobalBPM": true,
		"StreamingMode": true,
		"GraphicRendering": true,
		"ScaleFactor": true,
		"SustainCC": false,
		"ClearMidiCC": false,
		"SampleLocation": false,
		"DebugMode": false,
		"ScaleFactorList": [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
	};
	
	fltEngineSettings.setContentData(tileData);
	
	// btnVstPath
	const btnVstPath = Content.getComponent("btnVstPath");
	btnVstPath.setControlCallback(onbtnVstPathControl);
	
	inline function onbtnVstPathControl(component, value)
	{
		if (value)
			setVstPath();
	}
	
	// lblVstPath
	const lblVstPath = Content.getComponent("lblVstPath");
	lblVstPath.set("text", "");
	
	// btnVstPathShow
	const btnVstPathShow = Content.getComponent("btnVstPathShow");
	btnVstPathShow.setControlCallback(onbtnVstPathShowControl);
	
	inline function onbtnVstPathShowControl(component, value)
	{
		if (value)
			openPath(lblVstPath.get("text"));
	}
		
	// btnAuPath
	const btnAuPath = Content.getComponent("btnAuPath");
	btnAuPath.set("enabled", Engine.getOS() == "OSX");
	btnAuPath.setControlCallback(onbtnAuPathControl);
	
	inline function onbtnAuPathControl(component, value)
	{
		if (value)
			setAuPath();
	}
		
	// lblAuPath
	const lblAuPath = Content.getComponent("lblAuPath");
	lblAuPath.set("text", "");	
		
	// btnAuPathShow
	const btnAuPathShow = Content.getComponent("btnAuPathShow");
	btnAuPathShow.set("enabled", Engine.getOS() == "OSX");
	btnAuPathShow.setControlCallback(onbtnAuPathShowControl);

	inline function onbtnAuPathShowControl(component, value)
	{
		if (value)
			openPath(lblAuPath.get("text"));
	}
		
	// btnAutoSync
	const btnAutoSync = Content.getComponent("btnAutoSync");
	btnAutoSync.setControlCallback(onbtnAutoSyncControl);

	inline function onbtnAutoSyncControl(component, value)
	{
		set("autoSync", value);
		pnlSettingsTab[0].repaint();
	}
	
	// btnManualInstall
	const btnManualInstall = Content.getComponent("btnManualInstall");
	btnManualInstall.showControl(!Engine.isPlugin());
	btnManualInstall.setControlCallback(onbtnManualInstallControl);
	
	inline function onbtnManualInstallControl(component, value)
	{
	    if (value)
	    {
		    pnlSettings.showControl(false);
		    Expansions.manualInstall();
	    }
	}
	
	// btnClearTemp
	const btnClearTemp = Content.getComponent("btnClearTemp");
	btnClearTemp.showControl(!Engine.isPlugin());
	btnClearTemp.setControlCallback(onbtnClearTempControl);
	
	inline function onbtnClearTempControl(component, value)
	{
		if (value)
		{
			Engine.showYesNoWindow("Delete Files", "Do you want to delete temporary files?", function(response)
			{
				if (response)
					DownloadManager.clearTempDirectory();
			});
		}
	}
	
	// btnBitDepth
	const btnBitDepth = Content.getComponent("btnBitDepth");
	btnBitDepth.setControlCallback(onbtnBitDepthControl);
	
	inline function onbtnBitDepthControl(component, value)
	{
		set("installFullDynamics", value);
		pnlSettingsTab[0].repaint();
	}
	
	// btnSettingsClose
	const btnSettingsClose = Content.getComponent("btnSettingsClose");
	btnSettingsClose.setControlCallback(onbtnSettingsCloseControl);
	
	inline function onbtnSettingsCloseControl(component, value)
	{
		if (value)
			pnlSettings.showControl(false);
	}
	
	// Functions
	inline function openPath(path)
	{
		if (path != "")
		{
			local f = FileSystem.fromAbsolutePath(path);
			
			if (f.isDirectory())
				f.show();
		}
	}
	
	inline function getVstPath()
	{
		if (isDefined(data.vstPath))
			return data.vstPath
			
		return false;
	}
	
	inline function getAuPath()
	{
		if (isDefined(data.auPath))
			return data.auPath
			
		return false;
	}
	
	inline function setVstPath()
	{
		FileSystem.browseForDirectory(FileSystem.UserHome, function(dir)
		{
			lblVstPath.set("text", dir.toString(File.FullPath));
			data.vstPath = lblVstPath.get("text");
			write();
		});
	}
	
	inline function setAuPath()
	{
		FileSystem.browseForDirectory(FileSystem.UserHome, function(dir)
		{
			lblAuPath.set("text", dir.toString(File.FullPath));
			data.auPath = lblAuPath.get("text");
			write();				
		});
	}
	
	inline function setDefaultPluginPaths()
	{
		if (!arePathsSet())
		{
			local vst = "";
			local au = "";
	
			switch (Engine.getOS())
			{
				case "OSX":
					vst = "Library/Audio/Plug-ins/VST3";
					au = "/Library/Audio/Plug-Ins/Components";
				break;
				
				case "LINUX":
					vst = "~/.vst3";
				break;
				
				case "WIN":
					vst = "C:\Program Files\Common Files\VST3";
				break;
			}
			
			lblVstPath.set("text", vst);
			lblAuPath.set("text", au);
			
			data.vstPath = vst;
			data.auPath = au;
	
			write();
		}
	}
	
	inline function arePathsSet()
	{		
		if (Engine.getOS() == "OSX")
			return data.vstPath != "" && data.auPath != "";
			
		return data.vstPath != "";		
	}
	
	inline function set(field, value)
	{
		data[field] = value;
		write();
	}
	
	inline function get(field)
	{
		if (isDefined(data[field]))
			return data[field];

		return undefined;
	}
	
	inline function write()
	{
		local f = appData.getChildFile("settings.json");
		f.writeObject(data);
	}
	
	inline function read()
	{
		local f = appData.getChildFile("settings.json");
		
		if (f.isFile())
		{
			local d = f.loadAsObject();
			
			if (d != undefined)
			{
				if (isDefined(d.vstPath))
					lblVstPath.set("text", d.vstPath);
				
				if (isDefined(d.auPath))
					lblAuPath.set("text", d.auPath);
					
				if (isDefined(d.autoSync))
					btnAutoSync.setValue(d.autoSync);
			}
			
			data = d;
		}
	}
	
	// Init calls
	read();
	setDefaultPluginPaths();
}