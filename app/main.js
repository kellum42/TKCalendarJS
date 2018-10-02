// Whenever the model changes, use profixy to update the ui

class App {
	constructor(el) {
		if (!el) {
			throw "An element has to  be passed to instantiate.";
			return;
		}
		
		this._element = document.querySelector(el);
		
		this._controllers = []; // all the controllers 
		this._stack = [];	// the current stack of controllers
		
/*
		this._yearsController =  new Controller("years", new YearsView(defaultYears));
		this._monthsController = new Controller("months", new MonthsView(year, month));
		this._hoursController = "";
*/
	}
	
	push(){
		/*
			this.storage[this.count] = value;
		    this.count++;
		*/
	}
	
	pop(){
		/*	
			if (this.count === 0) {
		        return undefined;
		    }
		
		    this.count--;
		    var result = this.storage[this.count];
		    delete this.storage[this.count];
		    return result;
		*/
	}
	
	initialize(segments){
		var controller;
		console.log(segments);
		if (!segments || segments.length == 0) {
			const year = (new Date).getFullYear();
			const defaultYears = [year, year + 1, year + 2];
			controller = new Controller("years", new YearsView(defaultYears));
		
		} else if (segments.length == 1) {
			
		} else if (segments.length == 2) {
			const year = segments[0];
			const month = segments[1];
			
			if (year && month) {
				controller = new Controller("months", new MonthsView(year, month));
			}
		}
		
		this._element.innerHTML = controller ? controller._view.html() || "<h2>Oops. Error</h2>" : "<h2>Oops. Error</h2>";	
	}
	
	parseHash(segments) {
		// year, month, day
		//	determine push or pop here
		//	assign controllers here and simply pass to push/pop methods
		const pop = segments.length < this._stack.length;
		var controller;
		
		if (!segments || segments.length == 0) {
	// 		go to years page - default year
		
		} else if (segments.length == 1) {
			// year
			const year = segments[0];
			
		
		} else if (segments.length == 2) {
			//	zoom to month
			const year = segments[0];
			const month = segments[1];
			
		} else {
			//	day
		}
		
	}
}

class Controller {
	constructor(name, view, model){
		this._name = name || "";
		this._view = view || {};
		this._model = model || {};
	}
}

class Model {
	
}

class View {
	constructor(){
		const today = new Date();
		this._currentYear = today.getFullYear();
		this._currentMonth = today.getMonth();
		this._currentDay = today.getDate();
	}
	
	monthAbbreviation(month) {
		const list = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		return list[month] || "";
	}
	
	html() {
		return "";	
	}
}

class YearsView extends View {
	constructor(years){
		super();
		this._years = years; 
	}
	
	html(){
		var html = "";
		for (var i=0;i<this._years.length;i++) {
			const year = this._years[i];
			
			html += "<div class='year'><h3>" + year + "</h3><div class='months-wrapper'>";
			
			for (var j=0;j<12;j++) {
				const month = j;
				const numDays = new Date(year, month + 1, 0).getDate();
				const offset = new Date(year, month, 1).getDay();
				
				if (!numDays || (!offset && offset !== 0)) {
					continue;
				}
	
				html += "<a class='month' href='#" + year + "/" + month + "'><h4>" + this.monthAbbreviation(month) + "</h4><div class='days'>";
				
				for(let k=0;k<42;k++) {
					const day = (k + 1) - offset;
					const l = (day > 0 && day <= numDays) ? day : "";
					const todayClass = (month === this._currentMonth && year === this._currentYear && this._currentDay === l) ? "class='today'" : "" ;
					html += "<span " + todayClass + ">" + l + "</span>";
				}
				html += "<section style='clear:both'></section></div></a>";
			}
			html += "</div></div>";
		}
		return html;
	}
}

class MonthsView extends View {
	constructor(year, month){
		super();
		this._year = year; 
		this._month = month;
	}
	
	html(){
		//	scroll to selected month functionality
		const year = this._year;
		var html = "";
		
		for (var j=0;j<12;j++) {
			const month = j;
			const numDays = new Date(year, month + 1, 0).getDate();
			const offset = new Date(year, month, 1).getDay();
			
			if (!numDays || (!offset && offset !== 0)) {
				continue;
			}

			html += "<div class='month-expanded'><h4>" + this.monthAbbreviation(month) + "</h4><div class='days'>";
			
			for(let k=0;k<42;k++) {
				const day = (k + 1) - offset;
				const l = (day > 0 && day <= numDays) ? day : "";
				const todayClass = (month === this._currentMonth && year === this._currentYear && this._currentDay == l) ? "class='today'" : "" ;
				const link = l ? "href='#" + year + "/" + month + "/" + l + "'" : "data-disabled";
				html += "<a " + link + "><p " + todayClass + "><span>" + l + "</span></p><div class='events'></div></a>";
			}
			html += "<section style='clear:both'></section></div></div>";
		}
		return html;
	}
}

class Router {
	constructor(app) {
		this._app = app;
		this.hashChange = this.hashChange.bind(this);
		
		window.addEventListener('hashchange', this.hashChange);
	    window.addEventListener('DOMContentLoaded', this.hashChange);
	}
	
	hashChange(e){
		const hash = window.location.hash;
		const url = (hash.split("#")) ? hash.split("#")[1] : false;
		const segments = url ? url.split("/") : false;
		
		if (e.type == "DOMContentLoaded") {	// initial setting of page
			this._app.initialize(segments);
			
		} else {
			this._app.parseHash(segments);	// will be a push or pop
		}
	}
}

const app = new App('#calendar');
const route = new Router(app);


