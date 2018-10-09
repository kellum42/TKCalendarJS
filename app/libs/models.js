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
	
	constructor(){
		this._identifier = "events";
		this._storage = window.localStorage;
	}
	
	saveEvent(obj){
		if (!obj.name || !obj.start_date || !obj.end_date) {
			//	throw error
			return false;
		}
		const event = {
			id: this.guid(),
			name: obj.name,
			start: obj.start_date,
			end: obj.end_date,
			description: obj.description || ""
		}
		
		var events = this.getEvents() || [];
		events.push(event);
		this._storage.setItem(this._identifier, JSON.stringify(events));
		
		console.log("successful");
	}
	
	getEvents(){
		return JSON.parse(this._storage.getItem(this._identifier)) || [];
	}
	
	eventsForDay(year, month, day) {
		var events = [];
		var allEvents = this.getEvents();
		for (var i=0;i<allEvents.length;i++) {
			const e = allEvents[i];
			const d = new Date(e.start);
			console.log(e);
			console.log("month: " + d.getMonth() + ", day: " + d.getDate() + ", hour: " + d.getHours() + ", min: " + d.getMinutes() + ", secs: " + d.getSeconds());
/*
			if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day){
				events.push(e);
			} 
*/
		}
		return events;
	}
	
	guid() {
		function s4() { 
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	  	}
	  	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
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