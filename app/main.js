// Whenever the model changes, use profixy to update the ui

function App(el) {
	if (!el) {
		throw "An element has to  be passed to instantiate.";
		return;
	}
	
	this._element = document.querySelector(el);
	this._controllers = [];
	this._stack = [];
}

/*
App.prototype.addView = function(view){
	this._view = view;
}
*/

/*
App.prototype.updateView = function(){
	this._element.innerHTML = this._view.html();
}
*/

App.prototype.push = function(controller) {
	
}

App.prototype.pop = function(){
	
}

App.prototype.parseHash = function(segments){
	// year, month, day
	//	determine push or pop here
	//	assign controllers here and simply pass to push/pop methods
	if (!segments) { return; }
	
	if (segments.length < 2) {
		// year
		const year = (segments.length > 0) ? segments[0] : false;
	
	} else if (segments.length == 2) {
		//	zoom to month
		const year = segments[0];
		const month = segments[1];
		
	} else if (segments.length > 2) {
		//	month
	}
}


function View(){
	
}

function YearsCalendarView(years){
	this._years = years || 3;
	this._html = "";
	
	const today = new Date();
	this._currentYear = today.getFullYear();
	this._currentMonth = today.getMonth();
	this._currentDay = today.getDate();
}

YearsCalendarView.prototype.monthAbbreviation = function(month){
	const list = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	return list[month] || "";
}

YearsCalendarView.prototype.html = function(){
	
	var html = "";
	for (var i=0;i<this._years;i++) {
		const year = this._currentYear + i;
		
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
				const todayClass = (month === this._currentMonth && year === this._currentYear && this._currentDay === day) ? "class='today'" : "" ;
				html += "<span " + todayClass + ">" + l + "</span>";
			}
			html += "<section style='clear:both'></section></div></a>";
		}
		html += "</div></div>";
	}
	return html;
}



function Router(app) {
	this._app = app;
	this._routes = [];
	this.hashChange = this.hashChange.bind(this);
	
	window.addEventListener('hashchange', this.hashChange);
    window.addEventListener('DOMContentLoaded', this.hashChange);
}

Router.prototype.addRoute = function(name, url) {
	this._routes.push({ name, url });
}

Router.prototype.hashChange = function(){
	const hash = window.location.hash;
//     const route = this._routes.filter(route => hash.match(new RegExp(route.url)))[0];
	
	this._app.parseHash(hash.split("#")[1].split("/"));
/*
    if (route) {
     	this.params = new RegExp(route.url).exec(hash);
	 	this.app.showComponent(route.name);
    
    } else {
      this.app.showComponent();
    }
*/
}

const app = new App('#calendar');
const route = new Router(app);

/*
const yearsView = new YearsCalendarView();

app.addView(yearsView);
app.updateView();
*/
