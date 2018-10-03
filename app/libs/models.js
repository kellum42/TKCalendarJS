class Model {
	constructor(){
		this._years;
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
}