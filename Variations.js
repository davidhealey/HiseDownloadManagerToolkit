/*
    Copyright 2021, 2022 David Healey

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

namespace Variations
{
	reg item;

	// pnlVariations
	const pnlVariations = Content.getComponent("pnlVariations");
	
	pnlVariations.setPaintRoutine(function(g)
	{		
		LookAndFeel.fullPageBackground("Edition", "Select the edition to install.", ["codeBranch", 44, 50]);
	});	

	// btnVariationsCancel
	const btnVariationsCancel = Content.getComponent("btnVariationsCancel");
	btnVariationsCancel.setControlCallback(onbtnVariationsCancelControl);
	
	inline function onbtnVariationsCancelControl(component, value)
	{
		if (value)
			hide();
	}

	// btnVariationsSubmit
	const btnVariationsSubmit = Content.getComponent("btnVariationsSubmit");
	btnVariationsSubmit.setControlCallback(onbtnVariationsSubmitControl);
	
	inline function onbtnVariationsSubmitControl(component, value)
	{
		if (value)
		{
			hide();
			item.variation = item.variations[cmbVariations.getValue() - 1].id;
			LibraryList.passToDownloader(item);
		}
	}
	
	// cmbVariations
	const cmbVariations = Content.getComponent("cmbVariations");
	
	// Functions
	inline function populateComboBox(variations)
	{
		local options = [];
		
		for (x in variations)
			options.push(x.edition);			

		cmbVariations.set("items", options.join("\n"));
		cmbVariations.setValue(1);
	}
	
	inline function show()
	{
		pnlVariations.showControl(false);
	}
	
	inline function hide()
	{
		pnlVariations.showControl(true);
	}
	
	inline function getVariation(data)
	{
		item = data;

		if (!isDefined(item.variations)) return;
				
		if (item.variations.length == 1)
		{
			item.variation = item.variations[0].id;
			LibraryList.passToDownloader(item);
		}
		else
		{
			populateComboBox(item.variations);
			show();			
		}
	}
}