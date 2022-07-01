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

namespace ProgressBar
{
	reg item;
	
	// progressTimer
	const progressTimer = Engine.createTimerObject();

	progressTimer.setTimerCallback(function()
	{
		if (isDefined(item.progress))
		{
			item.progress.count = Math.abs(item.progress.counter++ % 20 - 10) / 10;	
			LibraryList.repaintChild(item.id);
		}
		else
		{
			this.stopTimer();
		}

		LibraryList.repaint();
	});

	// Functions
	inline function start()
	{
		progressTimer.startTimer(100);	
	}
	
	inline function stop()
	{
		if (isDefined(item))
			item.progress = getDefaultProgressObject();

		progressTimer.stopTimer();
	}
	
	inline function clear()
	{
		if (isDefined(item))
			item.progress = undefined;

		progressTimer.stopTimer();
	}
	
	inline function setItem(data)
	{
		item = data;
		
		if (isDefined(item.progress.value))
			item.progress.value = 0.0;
		else
			item.progress = getDefaultProgressObject();
	}
	
	inline function updateItemProgress(value, action, status)
	{
		if (!isDefined(item.progress)) return;

		item.progress.value = value;
		item.progress.action = action;
		item.progress.status = status;
	}
	
	inline function setProperties(data)
	{
		if (!isDefined(item.progress)) return;

		for (x in data)
			item.progress[x] = data[x];
	}	
	
	inline function getDefaultProgressObject()
	{
		return {"value": 0.0, "count": -1, "counter": 5, "action": "Pending", "status": ""};
	}
	
	inline function isRunning()
	{
		return progressTimer.isTimerRunning();
	}
}