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
		this._validator = new Validator();
		this._eventManager = new EventManager();
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
	//	id, name, start date, end date, description,
	
}

class EventManager {
	
	makeEvent(obj){
		if (!obj.name || !obj.startDate || !obj.endDate) {
			//	throw error
		}
	}
}

class Validator {
	
	//	Args - Array of objects
	validate(arr){
		for (var i = 0;i<arr.length;i++) {
			const a = arr[i];
			const el = a.element;
			if (!el) { throw "No element passed to validator"; return; }
			
			if (a.required) {
				if (!el.value || !el.value.trim()) {
					const name = a.name || "";
					return { status: "bad", message: a.name ? a.name + " is a required field." : "Missing required field." };
				}
			}
		}
		return { status: "ok", message: "Everything looks ok." };
	}
}