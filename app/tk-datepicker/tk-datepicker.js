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
			self._ap = "am"; // am or pm
			self._isOpen;
			
			//	everytime datepicker closes, these are reset to the current date
			self._showingYear; // the year shown on the calendar of the datepicker
			self._showingMonth;	// the month shown on the calendar of the datepicker
			
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
			
			self._datepickerElement.querySelector(".done-block").onclick = function(){
				self.close();
			}
		}
		
		linkCSS(){
			const head  = document.querySelector("head");
			head.innerHTML += "<link rel='stylesheet' type='text/css' href='app/tk-datepicker/tk-datepicker.css' />";
			head.innerHTML += "<link rel='stylesheet' href='https://fonts.googleapis.com/css?family=K2D' />";
		}
		
		refreshBanner(){
			const self = this;
			const d = self._date instanceof Date ? self._date : new Date(); // currently selected date
			const year = self._showingYear = self._showingYear || d.getFullYear();
			const month = self._showingMonth = (self._showingMonth || self._showingMonth === 0) ? self._showingMonth: false ||  d.getMonth();
			const el = self._datepickerElement;
			const mins = self._mins < 10 ? "0" + self._mins: self._mins;
			const hour = self._hour;
			const ap = self._ap.toUpperCase();
			
			el.querySelector(".tk-datepicker-banner > p:nth-of-type(1)").innerHTML = this.fullMonthName(d.getMonth()) + " " + this.dayWithPrefix(d.getDate()) + ", " + d.getFullYear();
			el.querySelector(".tk-datepicker-banner > p:nth-of-type(2)").innerHTML = hour + ":" + mins + " " + ap;
		}
		
		refreshDatePicker() {
			const self = this;
			const el = self._datepickerElement;
			const d = self._date instanceof Date ? self._date : new Date(); // currently selected date
			
			const year = self._showingYear = self._showingYear || d.getFullYear();	// set showing year if not set
			const month = self._showingMonth = (self._showingMonth || self._showingMonth === 0) ? self._showingMonth: false ||  d.getMonth(); // set showing month if not set
					
			const numDays = new Date(year, month + 1, 0).getDate();
			const offset = new Date(year, month, 1).getDay();
			
			//	refresh calendar month
			el.querySelector(".tk-datepicker-month > h4").innerHTML = this.fullMonthName(month) + " " + year;
			
			if (numDays && (offset || offset === 0)) {
				const daysDiv = el.querySelector(".tk-datepicker-days");
				
				daysDiv.innerHTML = "";	// clear div
				for (let k=0;k<42;k++) {
					const day = (k + 1) - offset;
					const l = (day > 0 && day <= numDays) ? day : "";
					const cd = new Date(year, month, day);
					var active = cd.getTime() < self.todayZeroed().getTime() ? " disabled" : "";
					active = l ? active : " disabled";
					const selected = year === d.getFullYear() && month === d.getMonth() && l === d.getDate() ? " selected" : "";
					const span = document.createElement("span");
					span.className =  active + selected;
					span.innerHTML = l;
					span.onclick = (function(a,b,c){
						return function(){
							if (!a) {
								self._date = b;
								self.refreshBanner();
								self.refreshDatePicker();
								self.refreshInputValue();
								if (typeof c === "function"){
									self._onNewDateTappedCallback(b);
								}
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
						c._showingMonth = newMonth;
						if (newMonth > 11) {
							c._showingYear = parseInt(c._showingYear) + 1; // if new month brings a new year
							c._showingMonth = 0;
							
						} else if (newMonth < 0) {
							c._showingYear = parseInt(c._showingYear) - 1; // if new month goes back a year
							c._showingMonth = 11;
						} 
						
						c.refreshDatePicker();
					}	
				}(month, self, i));	
			}
		}
		
		refreshTimePicker(){
			//	configure time picker
			//	setup time and day click functionality
			const self = this;
			const el = self._datepickerElement;
			const hoursEl = el.querySelector(".tk-datepicker-time > .hours");
			const minsEl = el.querySelector(".tk-datepicker-time > .minutes");
			
			//	configure preview element
			const m = self._mins < 10 ? "0" + self._mins: self._mins;	// add leading zero to minutes
			el.querySelector(".tk-datepicker-time > .time-preview > p > span:nth-of-type(1)").innerHTML = self._hour;
			el.querySelector(".tk-datepicker-time > .time-preview > p > span:nth-of-type(2)").innerHTML = m;
			
			
			//	reset contents
			hoursEl.innerHTML = minsEl.innerHTML = "";
			
			//	configure hours
			const currentHour = self._hour || 12;
			for (var i=1;i<13;i++) {
				const selected = parseInt(currentHour) === i ? "selected" : "";
				const span = document.createElement("span");
				span.className = selected;
				span.innerHTML = i;
				span.onclick = (function(a, b, c){
					return function(){
// 						const ap = c.querySelectorAll(".tk-datepicker-time > .time-preview > span.selected");
// 						const isPM = ap ? ap.innerText !== "AM" && a !== 12 : true;
// 						const h = b._ap === "am" ? a : a + 12;
						b._hour = a;
// 						b._date.setHours(a);
						b.refreshTimePicker();
						b.refreshBanner();
						b.refreshInputValue();
					}
				}(i, self, el));
				hoursEl.appendChild(span);
			}
			
			//	configure mins
			const ht = ["00", "15", "30", "45"];
			for (var i=0;i<4;i++) {
				const m = ht[i];
				const selected = parseInt(m) === self._mins ? "selected" : "";
				const span = document.createElement("span");
				span.innerHTML = m;
				span.className = selected;
				span.onclick = (function(a, b){
					return function(){
						b._mins = parseInt(a);
// 						b._date.setMinutes(parseInt(a));
						b.refreshTimePicker();
						b.refreshBanner();
						self.refreshInputValue();
					}
				}(m, self));
				minsEl.appendChild(span);
			}
			
			//	configure am/pm switch
			const apButtons = el.querySelectorAll(".tk-datepicker-time > .time-preview > span");
			apButtons[0].className = self._ap === "am" ? "selected" : "";
			apButtons[1].className = self._ap === "am" ? "" : "selected";
			for (var i=0;i<apButtons.length;i++) {
				const button = apButtons[i];
				button.onclick = (function(a, b){
					return function(){
						b._ap = a === 0 ? "am" : "pm";
						b.refreshTimePicker();
						b.refreshBanner();
						b.refreshInputValue();
					}
				}(i, self));
			}
		}
		
		refreshInputValue(){
			const month = this._date.getMonth();
			const day = this._date.getDate();
			const year = this._date.getFullYear();
			const hour = this._hour;
			const mins = this._mins < 10 ? "0" + this._mins: this._mins;	// add leading zero
			const ap = this._ap;
			
			this._inputElement.value = month + "/" + day + "/" + year + " " + hour + ":" + mins + " " + ap;
		}
		
		createPicker(){
			const self = this;
			const el = document.createElement("div");
			
			el.classList.add("tk-datepicker");
			document.body.appendChild(el);
			el.innerHTML = "<div class='tk-datepicker-banner'><p></p><p class='time'>12:00 PM</p></div><div class='tk-datepicker-dt'><p class='selected'>DATE</p><p>TIME</p><section style='clear:both'></section></div><div class='tk-datepicker-month'><h4></h4><div class='tk-date-list'><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><section style='clear:both'></section></div><div class='tk-datepicker-days'></div></div><div class='tk-datepicker-time' style='display:none'><section class='time-preview'><p><span></span>:<span></span></p><span>AM</span><span>PM</span></section><div class='hours'></div><div class='minutes'></div><section style='clear:both'></section></div><div class='done-block'><p>DONE</p></div>";
			
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
				divs[i].onclick = (function(a, b, c, d){
					return function(){
						a[b].classList.add("selected");
						a[1-b].classList.remove("selected");
						c.querySelector(".tk-datepicker-month").style.display = b === 0 ? "block": "none";
						c.querySelector(".tk-datepicker-time").style.display = b === 0 ? "none": "block";
					}
				}(divs, i, el, self));
			}
			return el;
		}
		
		kill(){
			document.body.removeChild(this._datepickerElement);
		}
		
		open(){
			this._isOpen = true;
			this.refreshBanner();
			this.refreshDatePicker();
			this.refreshTimePicker();
			this._datepickerElement.style.top = this._inputElement.getBoundingClientRect().bottom;
			this._datepickerElement.style.left = this._inputElement.getBoundingClientRect().left;
			this._datepickerElement.style.display = "block";
		}
		
		close(){
			this._isOpen = false;
			this._datepickerElement.style.display = "none";
			this._showingYear = null;
			this._showingMonth = null;
		}
		
		extractDate(){
			const self = this;
			const y = self._date.getFullYear();
			const m = self._date.getMonth();
			const d = self._date.getDate();
			var h = parseInt(self._hour);
			h = self._ap === "am" && h === 12 ? 0 : h;
			h = self._ap === "pm" && h !== 12 ? h + 12 : h; // get hours in military time
			const mn = self._mins;
			return new Date(y, m, d, h, mn, 0, 0);
		}
		
		fullMonthName(month){
			const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			return months[month] || "";
		}
		
		dayWithPrefix(day){
			const days = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th", "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th", "29th", "30th", "31st"];
			return days[day] || "";
		}
		
		todayZeroed(){
			const t = new Date();
			const y = t.getFullYear();
			const m = t.getMonth();
			const d = t.getDate();
			return new Date(y, m, d, 0, 0);
		}
	}	