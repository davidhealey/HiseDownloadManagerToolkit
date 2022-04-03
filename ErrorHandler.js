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

namespace ErrorHandler
{
	inline function serverError(status, response, defaultMsg)
	{
		local msg = defaultMsg;
		
		if (isDefined(response.message))
		{
			switch (response.message)
			{
				case "Expired token":
					msg = "Please re-login and try again.";
					UserAccount.logout();
					break;

				default:
					if (msg == "") msg = response.message;
			}
		}
		else
		{
			msg = "###Error " + status + "\n\r";
			
			switch (status)
			{
				case 400:
					msg += "Bad request.";
					break;
					
				case 401:
					msg += "You are not authorized to do that.  Check that you are logged in.";
					break;
					
				case 404: case 410: case 503:
					msg += "The server might be down, please try again later.";
					break;
				case 408: case 504: case 522: case 524:
					msg += "A timeout occurred.";	
					break;
					
				case 429:
					msg += "The server has received too many requests.";
					break;
					
				default:
					if (defaultMsg != "")
						msg = defaultMsg;
					else
						msg += "A server error was encountered.";
			}
			
			if (defaultMsg == "")
				msg += "  If the problem persists, please contact support.";
		}

		if (isDefined(msg))
			Engine.showMessageBox("Server Error " + status, msg, 1);
	}
	
	inline function showError(title, msg)
	{
		Engine.showMessageBox(title, msg, 1);
	}
}