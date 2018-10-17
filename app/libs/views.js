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

//	when day is displayed, automatically load divs for days before and after current date
//	whenever date changes, load the outside divs for days
class WeekView extends View {
	
	refreshHTML(model) {
		//	loads the current day
		//	also loads the divs for the day before, and the day after
		const self = this;
		self._element.innerHTML = "<div class='view-content-wrapper' style='overflow:hidden'><div class='day-info'><div><div class='weekday-list'><div style='color:#bfbfbf'>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div style='color:#bfbfbf'>S</div></div><div class='weekday-numbers'><div></div><div></div><div></div><div class='selected'></div><div></div><div></div><div></div></div><div class='today'>Monday October 15, 2018</div></div></div><div class='swiper-container'><div class='swiper-wrapper'></div></div></div>";
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
	//	store "weekNum" variable in the model (will have to find the weeks of year somehow) 
	generateDayHTML(manager, date){
		const y = date.getFullYear();
		const m = date.getMonth();
		const d = date.getDate();
		
		const div = document.createElement("div");
		div.classList.add("swiper-slide");
		
		div.innerHTML = "<div class='week-wrapper'><div class='week-info'>Date info</div><div class='week'><div class='week-day-titles'><div><p>Sun</p><p>15</p></div><div><p>Mon</p><p>16</p></div><div><p>Tues</p><p>17</p></div><div><p>Wed</p><p>18</p></div><div><p>Thurs</p><p>19</p></div><div><p>Fri</p><p>20</p></div><div><p>Sat</p><p>21</p></div></div><div class='week-events-wrapper'><div class='day-times'></div><div class='week-events'><div><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></div><div class='day-wrapper'></div>";
		
		const dw = div.querySelector(".day-wrapper");
		var html = "";
		for (var i=0;i<24;i++) {
			const ref = i === 0 ? "class='reference-cell'" : "";
			const j = (i >= 12 ) ? i - 12 : i;
			const ap = (i >= 12) ? " PM" : " AM";
			var t; 
			if (j == 0 && i >= 12) {
				t = "noon";
			} else if (j ==0 && i < 12) {
				t = "12";
			}  else {
				t = j;
			}
			const k = t + (t === "noon" ? "" : ap);
			html += "<div class='cell'><div><p>" + k + "</p></div><div " + ref + "></div></div>";
		}
		html += "";
		dw.innerHTML = html;
		
		const refCell = dw.querySelector(".reference-cell");
		const events = manager.eventsForDay(parseInt(y), parseInt(m), parseInt(d));
		
		var map = {};
		
		//	loop through all events for this day
		for (var i=0;i<events.length;i++) {
			const event = new Event(events[i]);
			const eventElement = event.html();
			eventElement.onclick = this.onEventClick(event._id);
			refCell.appendChild(eventElement);
						
			const increments = event.span();
			for (var j=0;j<increments.length;j++) {
				const v = map[increments[j]];
				const nv = v || [];
				nv.push(eventElement);
				map[increments[j]] = nv;
			}
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
					
					const styles = manager.style(e.dataset.numItems, e.dataset.position);
					e.style.width = styles.width;
					e.style.left = styles.left;
				}
		   	}
		}
		return div;
	}
}

class AddEventView extends View {
		
	refreshHTML(model) {
		const self = this;
		var html = "<div class='view-content-wrapper'><h1>add event</h1><div><div><p>Name</p><input type='text' id='event-name' /></div><div><p>Start Date</p><input type='text' id='event-start' /></div><div><p>End Date</p><input type='text' id='event-end' /></div><div><p>Description</p><textarea id='add-event-description'></textarea></div></div><div><button type='button'>Add Event</button</div></div>";
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