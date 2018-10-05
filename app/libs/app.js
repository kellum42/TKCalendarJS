class App {
	constructor(el) {
		const element = document.querySelector(el);
		
		if (!element) { throw "A real element has to  be passed to instantiate."; }
		
		this._element = element;
		this._stack = [];	// the current stack of controllers
		
		this.presentController = this.presentController.bind(this);
		window.addEventListener('hashchange', this.presentController);
	    window.addEventListener('DOMContentLoaded', this.presentController);
	    
	    this._monthsControllerName = "months-controller";
	    this._yearsControllerName = "years-controller";
	    this._weekControllerName = "week-controller";
	}
	
	push(controller){		
		const currentController = this._stack[this._stack.length - 1];
		currentController._view.hide(); // so it doesn't show under new controller
				
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
	
	staticallyShowController(segments){		
		const model = new Model();
		
		var controllers = [];
		
		if (segments.length >= 1 || segments.length >= 0) {
			const year = parseInt(segments[0]) ||  (new Date).getFullYear(); // defaults to current year
			const years = [year, year + 1, year + 2];
			model._years = years;
			controllers.push(new Controller(this._element, this._yearsControllerName, new YearsView(), model));
		}
		
		if (segments.length >= 2) {
			const year = segments[0];
			const month = segments[1];
			
			if (year && month) {
				model._year = year;
				model._month = month;
				const view = new MonthsView();
				controllers.push(new MonthsController(this._element, this._monthsControllerName, view, model));				
			}
		}
		
		if (segments.length > 2) {
			//	days
			const year = segments[0];
			const month = segments[1];
			const day = segments[2];
			
			model._year = year;
			model._month = month;
			model._day = day;
			const view = new WeekView();
			controllers.push(new WeekController(this._element, this._weekControllerName , view, model));
		}
		
		for (var i=0;i<controllers.length;i++) {
			const controller = controllers[i];
			controller.load();
			this._stack.push(controller);
				
			if (i !== controllers.length - 1) {
				controller._view.hide();
			}
		}
	}
	
	presentController(){
		var controller;
		
		const hash = window.location.hash;
		const hashData = this.parseHash(hash);
		
		
		//	check for adding new event
		if (hash.match(/\?ae/g)){
			const view = new AddEventView();
			const model = new Model();
			const controller = new AddEventController("add-event", view, model);
			this.push(controller);
			return;	
		}
		
		const url = (hash.split("#")) ? hash.split("#")[1] : false;
		var segments = url ? url.split("/") : false;
		segments = segments || [];
		
		
		//	if stack length is zero, we know we are just starting out (the app was just loaded)
		//	don't do any animations? just add controllers to the stack
		if (this._stack.length == 0) {
			this.staticallyShowController(segments);
			return;
		}
		
		//	if they are equal then we are pushing
		//	if its less then we are popping
		//	they should never be equal at this point in the function (unless we are just starting)
		//	at the end of this function, stack length and segments length should always be equal		
		if (segments.length < this._stack.length) {
			this.pop();
			return;
		}

		const model = new Model();

		if (segments.length === 2) {
			const year = segments[0];
			const month = segments[1];
			
			if (year && month) {
				model._year = year;
				model._month = month;
				const view = new MonthsView();
				controller = new MonthsController(this._element, this._monthsControllerName, view, model);
			}
		
		} else {
			//	days controller
			const year = segments[0];
			const month = segments[1];
			const day = segments[2];
			
			model._year = year;
			model._month = month;
			model._day = day;
			const view = new WeekView();
			controller = new WeekController(this._element, this._weekControllerName , view, model);
		}
		
		if (controller) { this.push(controller); }
	}
	
	parseHash(hash){
		var obj = {
			empty_stack: true,
			year: null,
			month: null,
			day: null,
			add_event: false,
			event_open: false
		}
		
		if (!hash) { return obj; }
		
		return obj;
	}
}
