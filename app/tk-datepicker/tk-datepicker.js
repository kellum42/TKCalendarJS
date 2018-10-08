//	create the element in the div passed
//	init function
//	reachable selected date object
//	on new date clicked
	
	class TKDatepicker {
		constructor(obj){
			const self = this;
			const element = window.document.querySelector(obj.element) || false;
			if (!element || element.nodeName.toLowerCase() !== "input" || element.type !== "text") {
				throw "Must pass a text input element to TKDatepicker.";
				return;
			}
			
			self._inputElement = element;
			self._onNewDateTappedCallback = obj.onNewDateTapped;
			self._date = obj.startingDate || new Date();
			self._hour = 12;
			self._mins = 0;
			self._isOpen;
			
			//	everytime datepicker closes, reset these
			self._setYear;
			self._setMonth;
			
			//	open datepicker
			self._inputElement.onfocus = function(){
				this.blur();
				if (!self._isOpen) {
					self.open();
				}
			}
						
			self.linkCSS();
			self._datepickerElement = self.createPicker();
			self.close();
			
			document.body.onclick = (function(){
				return function(e){
					var el = e.target.parentNode;
					console.log(el);
					while (el && !el.classList.contains("tk-datepicker")){
						el  = el.parentElement;
					}
				}
			}());
		}
		
		linkCSS(){
			const head  = document.getElementsByTagName('head')[0];
		    const link  = document.createElement('link');
		    link.rel  = 'stylesheet';
		    link.type = 'text/css';
		    link.href = 'app/tk-datepicker/tk-datepicker.css';
		    head.appendChild(link);
		    
		    const fontLink = document.createElement('link');
		    fontLink.rel = "stylesheet";
		    fontLink.href = "https://fonts.googleapis.com/css?family=K2D";
		    head.appendChild(fontLink);
		}
		
		refreshDatePicker() {
			const self = this;
			const el = self._datepickerElement;
			const d = self._date instanceof Date ? self._date : new Date(); // currently selected date
			
			const year = self._setYear = self._setYear || d.getFullYear();
			const month = self._setMonth = (self._setMonth || self._setMonth === 0) ? self._setMonth: false ||  d.getMonth();
			
			//	configure banner and calendar header
			el.querySelector(".tk-datepicker-banner > p").innerHTML = this.fullMonthName(d.getMonth()) + " " + this.dayWithPrefix(d.getDate()) + ", " + d.getFullYear();
			el.querySelector(".tk-datepicker-month > h4").innerHTML = this.fullMonthName(month) + " " + year;
				
			const numDays = new Date(year, month + 1, 0).getDate();
			const offset = new Date(year, month, 1).getDay();
			
			if (numDays && (offset || offset === 0)) {
				const daysDiv = el.querySelector(".tk-datepicker-days");
				
				daysDiv.innerHTML = "";	// clear div
				for (let k=0;k<42;k++) {
					const day = (k + 1) - offset;
					const l = (day > 0 && day <= numDays) ? day : "";
					const cd = new Date(year, month, day);
					var active = cd.getTime() < new Date().getTime() ? " disabled" : "";
					active = l ? active : " disabled";
					const selected = year === d.getFullYear() && month === d.getMonth() && l === d.getDate() ? " selected" : "";
					const span = document.createElement("span");
					span.className =  active + selected;
					span.innerHTML = l;
					span.onclick = (function(a,b,c){
						return function(){
							if (!a && typeof c === "function") {
								self._date = b;
								self.refreshDatePicker();
								self._onNewDateTappedCallback(b);
								self._inputElement.value = b.getMonth() + "/" + b.getDate() + "/" + b.getFullYear();
// 								self.close();
							}	
						}
					}(active, cd, self._onNewDateTappedCallback));
					
					daysDiv.appendChild(span);
				}		
			}
			
			//	configure arrow functionality
			const arrows = el.querySelectorAll(".tk-arrow");
			for (var i = 0;i<arrows.length;i++) {
				arrows[i].onclick = (function(b, c, d){
					return function(){
						const increment = d === 0 ? -1 : 1;
						const newMonth = parseInt(b) + increment;
						c._setMonth = newMonth;
						if (newMonth > 11) {
							c._setYear = parseInt(c._setYear) + 1; // if new month brings a new year
							c._setMonth = 0;
							
						} else if (newMonth < 0) {
							c._setYear = parseInt(c._setYear) - 1; // if new month goes back a year
							c._setMonth = 11;
						} 
						
						c.refreshDatePicker();
					}	
				}(month, self, i));	
			}	
		}
		
		refreshTimePicker(){
			//	configure time picker
			//	setup time and day click functionality
			
			const hoursEl = el.querySelector(".tk-datepicker-time > .hours");
			const minsEl = el.querySelector(".tk-datepicker-time > .minutes");
			
			//	configure hours
			const currentHour = self._hour || 12;
			for (var i=1;i<13;i++) {
				const selected = parseInt(currentHour) === i ? "selected" : "";
				const span = document.createElement("span");
				span.className = selected;
				span.innerHTML = i;
				span.onclick = (function(){
					return function(){
						
					}
				}());
				hoursEl.appendChild(span);
			}
			
			//	configure mins
			const ht = ["00", "15", "30", "45"];
			for (var i=0;i<4;i++) {
				const m = ht[i];
				const span = document.createElement("span");
				span.innerHTML = m;
				span.onclick = (function(){
					return function(){
						
					}
				}());
				minsEl.appendChild(span);
			}
		}
		
		createPicker(){
			const el = document.createElement("div");
			el.classList.add("tk-datepicker");
			document.body.appendChild(el);
			el.innerHTML = "<div class='tk-datepicker-banner'><p></p><p class='time'>12:00 PM</p></div><div class='tk-datepicker-dt'><p class='selected'>DATE</p><p>TIME</p><section style='clear:both'></section></div><div class='tk-datepicker-month'><h4></h4><div class='tk-date-list'><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><section style='clear:both'></section></div><div class='tk-datepicker-days'></div></div><div class='tk-datepicker-time' style='display:none'><section class='time-preview'><p><span class='preview-hours'>4</span>:<span class='preview-minutes'>00</span></p></section><div class='hours'></div><div class='minutes'></div><section style='clear:both'></section></div><div class='done-block'><p>DONE</p></div>";
			
			//	create arrows
			const datepickerMonth = el.querySelector(".tk-datepicker-month");
			for (var i=0;i<2;i++) {
				const arrow = document.createElement("span");
				arrow.className = i === 0 ? "tk-arrow tk-datepicker-left-arrow" : "tk-arrow tk-datepicker-right-arrow";
				arrow.innerHTML = i === 0 ? "<img src='https://kellumwebdev.com/pics/angle-left.png' />" : "<img src='https://kellumwebdev.com/pics/angle-right.png' />";
				datepickerMonth.appendChild(arrow);
			}
			
			//	configure date/time switch
			const divs = el.querySelectorAll(".tk-datepicker-dt > p");
			for (var i=0;i<divs.length;i++) {
				divs[i].onclick = (function(a, b, c){
					return function(){
						a[b].classList.add("selected");
						a[1-b].classList.remove("selected");
						c.querySelector(".tk-datepicker-month").style.display = b === 0 ? "block": "none";
						c.querySelector(".tk-datepicker-time").style.display = b === 0 ? "none": "block";
					}
				}(divs, i, el));
			}
			return el;
		}
		
		open(){
			this._isOpen = true;
			this.refreshDatePicker();
			this._datepickerElement.style.top = this._inputElement.getBoundingClientRect().bottom;
			this._datepickerElement.style.left = this._inputElement.getBoundingClientRect().left;
			this._datepickerElement.style.display = "block";
		}
		
		close(){
			this._isOpen = false;
			this._datepickerElement.style.display = "none";
			this._setYear = null;
			this._setMonth = null;
		}
		
		fullMonthName(month){
			const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			return months[month] || "";
		}
		
		dayWithPrefix(day){
			const days = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th", "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th", "29th", "30th", "31st"];
			return days[day] || "";
		}
	}	