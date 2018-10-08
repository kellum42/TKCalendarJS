class Model {
	constructor(){
		this._year;
		this._month;
		
		const today = new Date();
		this._currentYear = today.getFullYear();
		this._currentMonth = today.getMonth();
		this._currentDay = today.getDate();
		this._events = [];
		this._scrollPosition;
	}
	
	monthAbbreviation(month) {
		const list = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		return list[month] || "";
	}
	
	viewWidth(){
		return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	}
	
	years(){
		const year = parseInt(this._year || this._currentYear);
		return [year, year + 1, year + 2];
	}
	
	//	events structure
	//	id, name, day, month, year, description, time
}

class Event {
	constructor(){
		
	}
}