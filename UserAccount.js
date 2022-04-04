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
	reg online = Server.isOnline();;
    
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
        local p = {"username": username.trim(), "password": password};
        
        if (!isDefined(username) || username == "" || username == "Email")
			return Engine.showMessageBox("Invalid Email", "Please enter a valid email address or username.", 3);

		if (!isDefined(password) || password == "")
			return Engine.showMessageBox("Invalid Password", "Please enter a valid password.", 3);
        
        Server.setHttpHeader("");
		Server.setBaseURL(Config.baseURL[Config.MODE]);
        
        Spinner.show("Logging In");
        
		Server.callWithPOST("wp-json/jwt-auth/v1/token", p, function(status, response)
		{
			Spinner.hide();

			if (status == 200 && isDefined(response.token))
		    {
				storeToken(response.token);
		        Library.clearCache();
		        Library.rebuildCache();
		        Engine.rebuildCachedPools();
		        UserAccountUI.hideLoginScreen();
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
		UserAccountUI.showLoginScreen();
		deleteCredentials();
		Library.clearCache();
	}

   	inline function deleteCredentials()
	{
		local f = appData.getChildFile("credentials.json");
		authToken = false;

		if (f.isFile())
			f.deleteFileOrDirectory();
	}
        
	inline function storeToken(token)
     {
		local data = {"token": token};
		local f = appData.getChildFile("credentials.json");
		
		authToken = token;
		f.writeEncryptedObject(data, encryptionKey);
     }
    
	inline function loadToken()
	{
		local f = appData.getChildFile("credentials.json");
		local data = f.loadEncryptedObject(encryptionKey);

		if (f.isFile())
			return data.token;

		return false;
	}

	inline function getToken()
	{
		return authToken;
	}
	
	inline function isLoggedIn()
	{
		return isDefined(getToken());
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
		return isDefined(getToken()) && online;
	}
	
	inline function isOnlineAndIsLoggedIn()
	{
		online = Server.isOnline();

		if (!online)
			return Engine.showMessageBox("Offline Mode", "An internet connection is required.", 1);
			
		if (!isDefined(getToken()))
			return Engine.showMessageBox("Login Required", "You need to login to use this feature.", 1);
			
		if (Engine.isPlugin() && !Config.NETWORK_IN_PLUGIN)
			return Engine.showMessageBox("Standalone Only", "This feature is only available in the standalone application.", 1);
		
		return true;
	}
}