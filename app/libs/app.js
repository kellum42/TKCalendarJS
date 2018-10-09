class App {
	constructor(el) {
		const element = document.querySelector(el);
		
		if (!element) { throw "A real element has to  be passed to instantiate."; }
		
		this._element = element;
		this._stack = [];	// the current stack of controllers
		
		this.initApp = this.initApp.bind(this);
		this.presentController = this.presentController.bind(this);
		window.addEventListener('hashchange', this.presentController);
	    window.addEventListener('DOMContentLoaded', this.initApp);
	    
	    this._monthsControllerName = "months-controller";
	    this._yearsControllerName = "years-controller";
	    this._weekControllerName = "week-controller";
	    this._addEventControllerName = "add-event-controller";
	}
	
	push(controller){		
		const currentController = this._stack[this._stack.length - 1];
		if (controller._name !== this._addEventControllerName) {
			currentController._view.hide(); // so it doesn't show under new controller	
		}
				
		this._stack.push(controller);
		controller.load();	
	}
	
	pop(){	
		if (this._stack.length < 2) { return; } // sanity check
		
		this._stack[this._stack.length - 1].dismiss(); // remove view from DOM
	    this._stack.pop(); // remove from stack
	    
	    const controller = this._stack[this._stack.length - 1];
	    controller.setHeaderFooterItems(); // reset header and footer icons
	    controller._view.show();
	}
	
	initApp(){		
		const hashData = this.parseHash(window.location.hash);
		const model = new Model();
		model._year = hashData.year;
		model._month = hashData.month;
		model._day = hashData.day;
		
		const names = ["year", "month", "week"];
		
		for (var i=0;i<names.length;i++) {
			var controller;
			if (i === 0 ) {
				controller = new Controller(this._element, this._yearsControllerName, new YearsView(), model);
			} else if (i === 1) {
				controller = new MonthsController(this._element, this._monthsControllerName, new MonthsView(), model);
			} else {
				controller = new WeekController(this._element, this._weekControllerName , new WeekView(), model);
			}
			controller.load();
			this._stack.push(controller);
		
			if (names[i] === hashData.controller) {
				break; // stop loop here
			
			} else {
				controller._view.hide();
			}
		}
		
		if (hashData.add_event) {
			this.push(new AddEventPopup(this._element, this._addEventControllerName, new AddEventView(), model));
		}
	}
	
	presentController(){
		const hashData = this.parseHash(window.location.hash);
		
		//	if they are equal then we are pushing
		//	if its less then we are popping
		//	they should never be equal at this point in the function (unless we are just starting)
		//	at the end of this function, stack length and segments length should always be equal	
		if (hashData.segment_count < this._stack.length) {
			this.pop();
			return;
		}
		
		var controller;
		
		const model = new Model();
		model._year = hashData.year;
		model._month = hashData.month;
		model._day = hashData.day;
		
		if (hashData.add_event){
			controller = new AddEventPopup(this._element, this._addEventControllerName, new AddEventView(), model);
		
		} else if (hashData.controller === "week"){
			controller = new WeekController(this._element, this._weekControllerName , new WeekView(), model);
		
		} else {
			controller = new MonthsController(this._element, this._monthsControllerName, new MonthsView(), model);
		}
		this.push(controller);
	}
	
	parseHash(hash){
		var obj = {
			year: null,
			month: null,
			day: null,
			add_event: false,
			event_open: false,
			segment_count: 0,
			controller: "year"
		};
		
		if (hash.match(/\?ae/g)) {
			obj.add_event = true;
			hash = hash.split("?")[0];
		}
		
		hash = hash || "";
		hash = hash.split("#")[1] || "";  
		var segments = hash.split("/") || [];
		obj.segment_count = segments.length;
		obj.year = segments[0] || (new Date).getFullYear();
		obj.month = segments[1] || null;
		obj.day = segments[2] || null;
		obj.controller = (obj.day ? "week": null) || (obj.month ? "month" : null) || "year";
		return obj;
	}
}
