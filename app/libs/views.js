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
		for (var i=0;i<model._years.length;i++) {
			const year = model._years[i];
			
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
		//	scroll to selected month functionality
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
		
		//	set month offset
		const month = document.querySelectorAll(".month-expanded")[model._month];
		const offsetY = month.offsetTop - 30 // month y pos - (month heading height + any extra padding)
		this._element.querySelector("#months-expanded-container").scrollTop = offsetY || 0;
	}
}

class WeekView extends View {
	refreshHTML(model) {
		var html = "";
		html = "<div class='swiper-container'>Swiper</div>";
		this._element.innerHTML = html;
	}
}

class AddEventView extends View {
	
	refreshHTML(model) {
		var html = "<div class='view-content-wrapper'>";
		const desktopMode = model.viewWidth() > 1000;
		if (desktopMode) {
			
		} else {
			html += "<h1>mobile mode</h1>";
		}
		html += "</div>";
		this._element.innerHTML = html;
	}
}