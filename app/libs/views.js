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
			
			html += "<div class='year'><h3>" + year + "</h3><div class='months-wrapper'>";
			
			for (var j=0;j<12;j++) {
				const month = j;
				const numDays = new Date(year, month + 1, 0).getDate();
				const offset = new Date(year, month, 1).getDay();
				
				if (!numDays || (!offset && offset !== 0)) {
					continue;
				}
	
				html += "<a class='month' href='#" + year + "/" + month + "'><h4>" + model.monthAbbreviation(month) + "</h4><div class='days'>";
				
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
		html += "</div>";
		this._element.innerHTML = html;
	}
}

class MonthsView extends View {

	refreshHTML(model){
		
		const year = model._year;
		var html = "<div style='overflow-y:hidden' class='view-content-wrapper'>";
		html += "<div class='weekday-list'><div style='color:grey'>S<span>unday</span></div><div>M<span>onday</span></div><div>T<span>uesday</span></div><div>W<span>ednesday</span></div><div>T<span>hursday</span></div><div>F<span>riday</span></div><div style='color:grey'>S<span>aturday</span></div></div><div id='months-expanded-container'>";
		
		for (var j=0;j<12;j++) {
			const month = j;
			const numDays = new Date(year, month + 1, 0).getDate();
			const offset = new Date(year, month, 1).getDay();
			
			if (!numDays || (!offset && offset !== 0)) {
				continue;
			}

			html += "<div class='month-expanded'><h4>" + model.monthAbbreviation(month) + "</h4><div class='days'>";
			
			for(let k=0;k<42;k++) {
				const day = (k + 1) - offset;
				const l = (day > 0 && day <= numDays) ? day : "";
				const dayOfWeek = new Date(year, month, l).getDay();
				const greyClass = (dayOfWeek === 0 || dayOfWeek === 6) ? " grey" : "";
				const todayClass = (year == model._currentYear && month === model._currentMonth && l == model._currentDay) ? "today" : "" ;
				const link = l ? "href='#" + year + "/" + month + "/" + l + "'" : "data-disabled";
				html += "<a " + link + "><p class=" + todayClass + greyClass + "><span>" + l + "</span></p><div class='events'></div></a>";
			}
			html += "<section style='clear:both'></section></div></div>";
		}
		html += "</div>";
		html += "</div>";
		this._element.innerHTML = html;
		
		//	scroll to selected month functionality
		const month = document.querySelectorAll(".month-expanded")[model._month];
		const offsetY = month.offsetTop - 30 // month y pos - (month heading height + any extra padding)
		this._element.querySelector("#months-expanded-container").scrollTop = offsetY || 0;
	}
}

class WeekView extends View {
	refreshHTML(model) {
		var html = "<div class='view-content-wrapper'><div id='swiper' style='overflow:hidden'><div class='day-wrapper'>";
		
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
		
		html += "</div></div></div>";
		this._element.innerHTML = html;
		
		const refCell = this._element.querySelector(".reference-cell");
		const events = model._eventManager.eventsForDay(parseInt(model._year), parseInt(model._month), parseInt(model._day));
		
		var map = {};
		
		for (var i=0;i<events.length;i++) {
			const event = new Event(events[i]);
			const eventElement = event.html();
			eventElement.onclick = this.onEventClick(event._id);
			refCell.appendChild(eventElement);
						
			const increments = event.span();
			for (var j=0;j<increments.length;j++) {
				const v = map[increments[j]];
				const nv = v || [];
				nv.push(event);
				map[increments[j]] = nv;
// 				max = nv > max ? nv : max;
			}
			
			//	this isn't gonna work
			//	max number determines the left position and the width
			//	basic width is 25%. 
			//const l = max < 2 ? 1 : max;
			//eventElement.style.left = (l - 1) + "00%";
		}
		
		//	loop through map
		for (var key in map) {
			if (map.hasOwnProperty(key)) {
				const arr = map[key];
				const max = arr.length;
				for (var j=0;j<arr.length;j++) {
					const e = arr[j];
					console.log(e);
					const p = e.dataset.position;
					if (p) {
						if (max > p) {
							e.dataset.position = max;
						}
					} else {
						e.dataset.positon = 1;
					}
				}
		   	}
		}
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