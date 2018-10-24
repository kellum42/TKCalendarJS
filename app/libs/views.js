class View {	
	hide(){
		this._element.style.opacity = 0;
	}
	
	show(){
		this._element.style.opacity = 1;
	}
}

class YearsView extends View {
	
	refreshHTML(model){
		var html = "<div class='view-content-wrapper'>";
		for (var i=0;i<model.years().length;i++) {
			const year = model.years()[i];
			
			const selected = parseInt(year) === parseInt(model._currentYear) ? "selected" : "";
			html += "<div class='year'><h3 class='" + selected + "'>" + year + "</h3><div class='months-wrapper'>";
			
			for (var j=0;j<12;j++) {
				const month = j;
				const numDays = new Date(year, month + 1, 0).getDate();
				const offset = new Date(year, month, 1).getDay();
				
				if (!numDays || (!offset && offset !== 0)) {
					continue;
				}
				
				const selectedMonth = year === model._currentYear && model._currentMonth === month ? "selected" : "";
				html += "<a class='month' href='#" + year + "/" + month + "'><h4 class='" + selectedMonth + "'>" + model.monthAbbreviation(month) + "</h4><div class='days'>";
				
				for(let k=0;k<42;k++) {
					const day = (k + 1) - offset;
					const l = (day > 0 && day <= numDays) ? day : "";
					const todayClass = (month === model._currentMonth && year === model._currentYear && model._currentDay === l) ? "class='today'" : "" ;
					html += "<span " + todayClass + ">" + l + "</span>";
				}
				html += "<section style='clear:both'></section></div></a>";
			}
			html += "</div></div>";
		}
		html += "</div>";
		this._element.innerHTML = html;
	}
}

class MonthsView extends View {

	refreshHTML(model){
		
		const year = parseInt(model._year);
		var html = "<div style='overflow-y:hidden' class='view-content-wrapper'>";
		html += "<div class='weekday-list'><div style='color:#bfbfbf'>S<span>unday</span></div><div>M<span>onday</span></div><div>T<span>uesday</span></div><div>W<span>ednesday</span></div><div>T<span>hursday</span></div><div>F<span>riday</span></div><div style='color:#bfbfbf'>S<span>aturday</span></div></div><div id='months-expanded-container'>";
		
		for (var j=0;j<12;j++) {
			const month = j;
			const numDays = new Date(year, month + 1, 0).getDate();
			const offset = new Date(year, month, 1).getDay();
			
			if (!numDays || (!offset && offset !== 0)) {
				continue;
			}
			
			const selectedMonth = year === model._currentYear && model._currentMonth === month ? "selected" : "";
			html += "<div class='month-expanded'><h4 class='" + selectedMonth + "'>" + model.monthAbbreviation(month) + "</h4><div class='days'>";
			
			for(let k=0;k<42;k++) {
				const day = (k + 1) - offset;
				if (day > numDays) { continue; }	// to avoid the extra white space
				const l = (day > 0) ? day : "";
				
				var events = [];
				if (l) {
					events = model._eventManager.eventsForDay(parseInt(year), parseInt(month), parseInt(l));
				}
				
				const dayOfWeek = new Date(year, month, l).getDay();
				const greyClass = (dayOfWeek === 0 || dayOfWeek === 6) ? " grey" : "";
				const todayClass = (year == model._currentYear && month === model._currentMonth && l == model._currentDay) ? "today" : "" ;
				const link = l ? "href='#" + year + "/" + month + "/" + l + "'" : "data-disabled";
				const hasEvents = events.length > 0 ? " data-has-events " : ""
				html += "<a " + link + hasEvents + "><p class=" + todayClass + greyClass + "><span>" + l + "</span></p><div class='events'>";
				
				//	add events here
				for (var i=0;i<events.length;i++) {
					html += "<div class='event purple'><p>" + events[i].name + "</p></div>";
				}	
				
				html += "</div></a>";
			}
			html += "<section style='clear:both'></section></div></div>";
		}
		html += "</div>";
		html += "</div>";
		this._element.innerHTML = html;
		
		//	generate the events
		
		
		//	scroll to selected month functionality
		const month = document.querySelectorAll(".month-expanded")[model._month];
		const offsetY = month.offsetTop - 45 // month y pos - (month heading height + any extra padding)
		this._element.querySelector("#months-expanded-container").scrollTop = offsetY || 0;
	}
}

class WeekView extends View {
	
	constructor(){
		super();
		
		//	callbacks
		self.didTapPrevWeek;
		self.didTapNextWeek;
		self.onEventClick;
	}
	
	refreshHTML(model) {
		//	loads the current day
		//	also loads the divs for the day before, and the day after
		const self = this;
		self._element.innerHTML = "<div class='view-content-wrapper' style='overflow:hidden'><div class='day-info'><div><div class='weekday-list'><div style='color:#bfbfbf'>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div style='color:#bfbfbf'>S</div></div><div class='weekday-numbers'><div></div><div></div><div></div><div class='selected'></div><div></div><div></div><div></div></div><div class='today'></div></div></div><div class='swiper-container'><div class='swiper-wrapper'></div></div></div>";
		self._sliderElement = self._element.querySelector(".swiper-wrapper");
		self._weekdayHeader = self._element.querySelector(".weekday-numbers");
		self._todayElement = self._element.querySelector(".today");
		
		self.setWeekdayNumbers(model);
	}
	
	setWeekdayNumbers(model) {
		const self = this;
		const dayOfWeek = model.getDate().getDay();
		
		self._todayElement.innerHTML = model.dateStringFormat();
			
		const divs = self._weekdayHeader.querySelectorAll("div");
		for (var i=0;i<divs.length;i++) {
			const div = divs[i];
			div.innerHTML = "";
			
			const diff = i - dayOfWeek;
			const nd = model.getDate().addDays(diff);
			const thisDate = nd.getDate();
			const span = document.createElement("span");
			span.innerHTML = thisDate;
			span.classList.add("hover");
			span.onclick = function(){
				if (diff === 0) { return; }
				const d = diff > 0 ? "forward" : "back";
				self.tappedDateInWeekdayList(nd, d);
			}
			div.appendChild(span);
			
			if (i === dayOfWeek) {
				div.classList.add("selected");
			
			} else {
				div.classList.remove("selected");	
			}
		}			
	}
		
	//	generate html for both week and day on every swipe/move
	//	just store them in different wrappers (day vs week)	
	getPageHTML(model, dayDate, weekDate) {
		const self = this;
		weekDate = weekDate || dayDate;
		
		const div = document.createElement("div");
		div.classList.add("swiper-slide");
		
		const weekEl = self.getWeekHTML(model, weekDate);
		const dayEl = self.getDayHTML(model._eventManager, dayDate);
		
		div.appendChild(weekEl);
		div.appendChild(dayEl);
		
		//	set callbacks
		
		//	directional arrows event listeners
		const directions = div.querySelectorAll(".week-info > div > div img");
		directions[0].onclick = function(){
			self.didTapPrevWeek();
		}
		directions[1].onclick = function(){
			self.didTapNextWeek();
		}
		
		//	add event click event listeners
		const events = div.querySelectorAll(".event");
		for (var i=0;i<events.length;i++) {
			events[i].onclick = (function(a){
				return function(){
					self.onEventClick(this.dataset.id);
				}
			}(self))
		}
		
		return div;
	}
	
	getWeekHTML(model, weekDate) {
		const self = this;
		const div = document.createElement("div");
		div.className = "week-wrapper swiper-no-swiping";
		div.innerHTML = "<div class='week-info'><div><span class='today'>TODAY</span><div><img class='hover' src='imgs/grey-back-arrow.svg' /></div><div><img class='hover' src='imgs/grey-next-arrow.svg' /></div><p></p></div></div><div class='week'><div class='week-day-titles'></div><div class='week-events-wrapper'><div class='day-times'></div><div class='week-events'></div></div></div>";

		const day = weekDate.getDay();
		var isCurrentWeek;	// tells if this week is the current week
		var currentMonth = "";
		var currentYear = "";
		
		//	create columns for days of the week
		for (var i=0;i<7;i++) {			
			const offset = i - day;
			const cd = weekDate.addDays(offset);
			const d = document.createElement("div");
			
			//	set the currentMonth and currentYear equal to the first day of the week's month & year
			if (i === 0) {
				currentMonth = model._fullMonths[cd.getMonth()];
				currentYear = cd.getFullYear();
			}
			
			if (cd.isToday()) { 
				d.classList.add("today");
				isCurrentWeek = true; 
			}
			
			//	create cells for each hour of the day
			for (var j=0;j<24;j++) {
				const ref = j === 0 ? "reference-cell" : "";
				d.innerHTML += "<div class='" + ref + " cell'></div>";
			}
			
			div.querySelector(".week-events").appendChild(d);

			//	populate events
			const refCell = d.querySelector(".reference-cell");
			const es = self.eventsInHTMLForDate(cd, model._eventManager, "week");
			for (var j=0;j<es.length;j++) {
				refCell.appendChild(es[j]);
			}
			
			//	the names of the days of the week
			const weekdayTitles = div.querySelector(".week-day-titles");
			const w = document.createElement("div");
			w.innerHTML = "<p>" + model._abbreviatedWeekDays[i] + "</p><p>" + cd.getDate() + "</p>";
			w.className = cd.isToday() ? "today" : "";
			weekdayTitles.appendChild(w);
		}
		div.querySelector(".week-events").innerHTML += "<section style='clear:both'></section>";
		
		//	the times on the side of the columns
		const weekTimes = div.querySelector(".day-times");
		const times = self.dayTimesList();
		for (var i=0;i<times.length;i++) {
			weekTimes.innerHTML += "<div><p>" + times[i] + "</p></div>"
		}
				
		//	set month on top
		div.querySelector(".week-info > div > p").innerText = currentMonth + " " + currentYear;
		
		//	set today label
		div.querySelector(".week-info .today").style.display = isCurrentWeek ? "inline-block" : "none";
				
		return div;
	}
	
	getDayHTML(manager, date) {
		const self = this;
		const div = document.createElement("div");
		div.className = "day-wrapper";

		const times = self.dayTimesList();
		for (var i=0;i<times.length;i++) {
			const ref = i === 0 ? "class='reference-cell'" : "";
			div.innerHTML += "<div class='cell'><div><p>" + times[i] + "</p></div><div " + ref + "></div></div>";
		}
		
		const refCell = div.querySelector(".reference-cell");
		const eventsHTML = self.eventsInHTMLForDate(date, manager);
		for (var i=0;i<eventsHTML.length;i++) {
			refCell.appendChild(eventsHTML[i]);
		}
		
		return div;
	}
		
	eventsInHTMLForDate(date, manager, format) {
		const self = this;
		var eventsArr = [];	// array to hold the events html 
		const year = date.getFullYear();
		const month = date.getMonth();
		const day = date.getDate();
		
		const events = manager.eventsForDay(parseInt(year), parseInt(month), parseInt(day));
		var map = {};
		
		//	loop through all events for this day
		for (var i=0;i<events.length;i++) {
			const event = new Event(events[i]);
			const eventElement = event.html();
			eventElement.dataset.id = event._id;
			
/*
			eventElement.onclick = (function(a){
				return function(){
					console.log(a);
					self.onEventClick(a);
				}
			}(event._id));
*/
						
			const increments = event.span();
			for (var j=0;j<increments.length;j++) {
				const v = map[increments[j]];
				const nv = v || [];
				nv.push(eventElement);
				map[increments[j]] = nv;
			}
			eventsArr.push(eventElement);
		}
				
		//	loop through map
		for (var key in map) {
			if (map.hasOwnProperty(key)) {
				const arr = map[key];	// array of event elements
				const max = arr.length;
				for (var j=0;j<arr.length;j++) {
					const e = arr[j];
					const n = e.dataset.numItems;
					if (n){
						if (max > n) {
							e.dataset.numItems = max;
							e.dataset.position = j + 1;
						}
					} else {
						e.dataset.numItems = 1;
						e.dataset.position = 1;
					}
					
					const styles = manager.style(e.dataset.numItems, e.dataset.position, format);
					e.style.width = styles.width;
					e.style.left = styles.left;
				}
		   	}
		}
		return eventsArr;
	}
		
	dayTimesList(){
		var obj = [];
		for (var i=0;i<24;i++) {
			const j = (i >= 12 ) ? i - 12 : i;
			const ap = (i >= 12) ? " PM" : " AM";
			var t; 
			if (j == 0 && i >= 12) {
				t = "noon";
			} else if (j ==0 && i < 12) {
				t = "12 " + ap;
			}  else {
				t = j + " " + ap;
			}
			obj.push(t);
		}
		return obj;
	}
}

class AddEventView extends View {
		
	refreshHTML(model) {
		const self = this;
		var html = "<div class='view-content-wrapper'><h2>New Event</h2><div><div class='input-group'><p>Name</p><input type='text' id='event-name' /></div><div class='input-group'><p>Start Date</p><input type='text' id='event-start' /></div><div class='input-group'><p>End Date</p><input type='text' id='event-end' /></div><div class='input-group'><p>Description</p><textarea id='add-event-description'></textarea></div></div><div><button type='button' class='button hover'>Add Event</button</div></div>";
		self._element.innerHTML = html;
		
		self._eventName = self._element.querySelector("#event-name");
		self._eventStart = self._element.querySelector("#event-start");
		self._eventEnd = self._element.querySelector("#event-end");
		self._eventDescription = self._element.querySelector("#add-event-description");
		
		const button = self._element.querySelector("button");
		button.onclick = function(){
			return self._onAddEventClicked();
		}
	}
}

class ShowEventView extends View {
	
	refreshHTML(model) {
		const self = this;
		var html = "<div class='view-content-wrapper' style='background:orange'></div>";
		self._element.innerHTML = html;
	}
}