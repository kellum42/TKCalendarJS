class Model {
	constructor(){
		this._year;
		this._month;
		this._day;
		
		this._today = new Date();
		this._currentYear = this._today.getFullYear();
		this._currentMonth = this._today.getMonth();
		this._currentDay = this._today.getDate();
		this._events = [];
		this._scrollPosition;
		this._validator = new Validator();
		this._eventManager = new EventManager();
		
		this._wdBreakpoint = 900; // make sure this matches up with the css
		this._abbreviatedMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		this._fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		this._abbreviatedWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		this._fullWeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
	
	getDate(){
		const y = this._year || this._year === 0 ? this._year : this._currentYear;
		const m = this._month || this._month === 0 ? this._month : this._currentMonth;
		const d = this._day || this._day === 0 ? this._day : 1;
		return new Date(y, m, d, 0, 0, 0);
	}
	
	setDate(date){
		this._year = date.getFullYear();
		this._month = date.getMonth();
		this._day = date.getDate();
	}
	
	addDaysToDate(days) {
		const d = this.getDate();
		const n = d.addDays(days);
		this.setDate(n);
		return n;
	}
	
	dateStringFormat(){
		const d = this.getDate();
		if (!d) { return ""; }
		
		return this._fullWeekDays[d.getDay()] + " " + this._fullMonths[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
	}
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
			if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day){
				events.push(e);
			} 
		}
		return events;
	}
	
	guid() {
		function s4() { 
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	  	}
	  	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}
	
	style(numItems, position, format) {
		format = format || "day";
		//	return object with width, left style properties
		//	1-5: 20%, 6: 100/6, 7: 100/7, so on and so forth
		const w = format === "week" ? 100 / numItems : numItems < 6 ? 20 : 100 / numItems;
		const l = (position - 1) * w;
		return {
			width: w + "%",
			left: l + "%" 
		}
	}
}

class Event {
	constructor(obj){
		for (var property in obj) {
		    if (obj.hasOwnProperty(property)) {
		        this["_" + property] = obj[property];
		    }
		}
	}
	
	height(){
		const s = new Date(this._start);
		const e = new Date(this._end);
		const c = 100 /(1000 * 60 * 60);	// convert milliseconds to hours
		const d = (e.getTime() - s.getTime()) * c;
		return d + "%";
	}
	
	top(){
		const s = new Date(this._start);
		const h = s.getHours();
		const m = s.getMinutes();
		const t = 100 * ((h * 60 + m) / 60);
		return t + "%";
	}
	
	startTime(){
		const s = new Date(this._start);
		const h = s.getHours();
		const ap = h >= 12 ? "pm" : "am";
		var hrs = h > 12 ? h - 12 : h;
		hrs = hrs === 0 ? 12 : hrs;
		const min = s.getMinutes();
		const m = min < 10 ? "0" + min: min;	// add leading zero to minutes if needed
		return hrs + ":" + m + " " + ap;
	}
	
	endTime(){
		const e = new Date(this._end);
		const h = e.getHours();
		const min = e.getMinutes();
		const ap = h >= 12 ? "pm" : "am";
		var hrs = h > 12 ? h - 12 : h;
		hrs = hrs === 0 ? 12 : hrs;
		const m = min < 10 ? "0" + min: min;	// add leading zero to minutes if needed
		return hrs + ":" + m + " " + ap;
	}
	
	html(){
		const div = document.createElement("div");
		div.style.height = this.height();
		div.style.top = this.top();
		div.className = "event";
		div.innerHTML = "<p><strong>" + this._name + "</strong></p><p>" + this.startTime() + " - " + this.endTime() + "</p>";
		return div;
	}
	
	span(){
		const length = parseInt(this.height().slice(0,-1));
		const increments = parseInt(length / 25); // number of 15 min increments the event has
		const comps = this.startTime().split(" ");	// components of start time (hours, mins, am/pm)
		var h = parseInt(comps[0].split(":")[0]);
		const m = comps[0].split(":")[1];
		const ap = comps[1];
		h = ap === "pm" && h !== 12 ? h + 12 : h;
		var start = (h * 60 + parseInt(m)) / 60;
		start = start * 4;	// convert to integer -> each 15 mins = 1
		var arr = [];
		for (var i=start;i<start + increments;i++){
			arr.push(i);
		}
		return arr;
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