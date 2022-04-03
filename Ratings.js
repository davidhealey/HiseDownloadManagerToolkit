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

namespace Ratings
{
	reg item;

	// pnlRatings
	const pnlRatings = Content.getComponent("pnlRatings");

	pnlRatings.setPaintRoutine(function(g)
	{
		var a = this.getLocalBounds(10);

		LookAndFeel.floatingWindowBackground(g);

		g.setFont("medium", 24);
		g.setColour(this.get("textColour"));
		g.drawAlignedText(this.get("text"), [0, lblReview.get("y") - 45, this.getWidth(), 30], "centred");
	});
	
	// lblReview
	const lblReview = Content.getComponent("lblReview");
	
	// pnlRatingsStars
	const pnlRatingsStars = Content.getComponent("pnlRatingsStars");
	pnlRatingsStars.data.hover = -1;
	pnlRatingsStars.setControlCallback(onpnlRatingsStarsControl);
	
	inline function onpnlRatingsStarsControl(component, value)
	{
		component.repaint();
	}	

	pnlRatingsStars.setPaintRoutine(function(g)
	{
		if (isDefined(item))
		{
			var rating = item.rating;
			var h = this.getWidth() / 5;
			var v = this.getValue();

			for (j = 0; j < 5; j++)
			{
				var x = j * h + (5 * j > 0);
				var y = h / 2 - h / 2;

				if (j <= this.data.hover)
					g.setColour(Colours.withAlpha(this.get("itemColour"), 0.5));
				else
					g.setColour(this.get("bgColour"));

				g.fillPath(Paths.icons.star, [x, y, h, h]);

				if (j < this.getValue())
				{
					g.setColour(Colours.withAlpha(this.get("itemColour"), j == this.data.hover ? 1.0 : 0.9));
					
					if (Math.floor(rating) != rating && j == Math.floor(rating))
						g.fillPath(Paths.icons.halfStar, [x, y, h / 2, h]);
					else
						g.fillPath(Paths.icons.star, [x, y, h, h]);
				}
			}
		}
	});
	
	pnlRatingsStars.setMouseCallback(function(event)
	{
		var value = Math.floor(event.x / this.getWidth() * 5);

		if (event.clicked)
		{
			if (event.rightClick || value == this.getValue() - 1)
				this.setValue(0);
			else
				this.setValue(value + 1);

			this.changed();
		}
		else
		{
			this.data.hover = event.hover ? value : -1;
			this.repaint();
		}		
	});
	
	// btnRatingsCancel
	const btnRatingsCancel = Content.getComponent("btnRatingsCancel");
	btnRatingsCancel.setLocalLookAndFeel(LookAndFeel.iconButton);
	btnRatingsCancel.setControlCallback(onbtnRatingsCancelControl);
	
	inline function onbtnRatingsCancelControl(component, value)
	{
		if (!value)
			hide();
	}	

	// btnRatingsSubmit
	const btnRatingsSubmit = Content.getComponent("btnRatingsSubmit");
	btnRatingsSubmit.setLocalLookAndFeel(LookAndFeel.iconButton);
	btnRatingsSubmit.setControlCallback(onbtnRatingsSubmitControl);
	
	inline function onbtnRatingsSubmitControl(component, value)
	{
		if (!value && isDefined(item.id))
			publish(item.id, pnlRatingsStars.getValue(), lblReview.get("text"));
	}

	// Functions
	inline function show(data)
	{
		item = data;
		pnlRatingsStars.setValue(isDefined(data.userRating) ? parseInt(data.userRating) : 0);
		pnlRatingsStars.data.hover = -1;
		lblReview.set("text", isDefined(data.userReview) ? data.userReview : "");
		pnlRatings.showControl(true);
	}
	
	inline function hide()
	{
		item = undefined;
		pnlRatings.showControl(false);
	}

	inline function publish(productId, rating, review)
	{
		if (pnlRatingsStars.getValue() <= 0)
			return Engine.showMessageBox("Missing Rating", "Please add a star rating.", 1);

		if (lblReview.get("text") == "")
			return Engine.showMessageBox("Missing Review", "Please add a review.", 1);

		if (lblReview.get("text").length < 25)
			return Engine.showMessageBox("Review Too Short", "Your review must be at least 25 characters long.", 1);

		local headers = ["Authorization: Bearer " + UserAccount.getToken()];
		local endpoint = Config.apiPrefix + "create_review";
		local p = {"product_id": productId, "rating": rating, "content": review};

		Server.setHttpHeader(headers.join("\n"));
		Server.setBaseURL(Config.baseURL[Config.MODE]);

		Spinner.show("Communicating with server");

		Server.callWithPOST(endpoint, p, function(status, response)
		{
			Spinner.hide();

			if (status == 200)
			{
				Library.rebuildCache();
			}
			else
			{
				ErrorHandler.serverError(status, response, "");
			}
		});
	}
	
	// Function calls
	hide();
}