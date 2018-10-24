class Controller {
	constructor(el, name, view, model){
		this._name = name || "";
		this._view = view || {};
		this._model = model || {};
		this._element = el;
		
		//	create element for the view and add to DOM
		const v = document.createElement("div");
		v.classList.add('view-wrapper');
		v.classList.add(name);
		this._view._element = v;
		this._element.appendChild(v);	
		
		this._leftIcon = document.querySelector('#left-icon');
		this._rightIcon = document.querySelector('#right-icon');	
	}
	
	load(){
		this._view.refreshHTML(this._model);			
		this.setHeaderFooterItems();		
	}
	
	setHeaderFooterItems(){
		const self = this;
		self._leftIcon.innerHTML = "";
		self._leftIcon.onclick = "";
		
		self._rightIcon.innerHTML = "<img src='imgs/red-plus.svg'/>";
		self._rightIcon.onclick = function(){
			window.location.hash = window.location.hash + "?ae";
		}	
	}
	
	dismiss(){
		this._element.removeChild(this._view._element);
	}
	
	proxify(model) {
		const self = this;
	    return new Proxy(model, {
	    	set(target, property, value) {
	        	console.log('Changing', property, 'from', target[property], 'to', value);
				target[property] = value;
				
				//self.updateView();
				return true;
	      	}
		});
	}
}

class MonthsController extends Controller {
	constructor(el, name, view, model){
		super(el, name, view, model);
	}
	
	setHeaderFooterItems(){
		const self = this;
		self._leftIcon.innerHTML = "<img src='imgs/red-back-arrow.svg' /><span>" + self._model._year + "</span>";
		self._leftIcon.onclick = function(){
			window.location.hash = self._model._year;
		}
	}
}


class WeekController extends Controller {
	constructor(el, name, view, model) {
		super(el, name, view, model);
		
		this._view.onEventClick = function(id) {
			//	on event click
			window.location.hash += "?eo" + id; 
		} 
	}
	
	setHeaderFooterItems(){
		const self = this;
		self._leftIcon.innerHTML = "<img src='imgs/red-back-arrow.svg' /><span>" + self._model.monthAbbreviation(self._model._month) + "</span>";
		self._leftIcon.onclick = function(){
			window.location.hash = self._model._year + "/" + self._model._month;
		}
	}
	
	load() {
		super.load();
		
		const self = this;		
		
		const div = self._view.getPageHTML(self._model, self._model.getDate());
		self._view._sliderElement.appendChild(div);
		
		const swiper = new Swiper('.swiper-container', {
			simulateTouch: false
		});
		swiper.prependSlide(self._view.getPageHTML(self._model, self._model.getDate().addDays(-1)));	// make previous slide
		swiper.appendSlide(self._view.getPageHTML(self._model, self._model.getDate().addDays(1)));	// make next slide
		swiper.update();
				
		//	on swipe gesture - forward slide (can only swipe on days - can't swipe weeks)	
		swiper.on('slideNextTransitionEnd', function(){
			self._model.addDaysToDate(1); //	updates the date on the model
			self._view.setWeekdayNumbers(self._model);
			self.setBoundaryPages(this);
		});
		
		//	on swipe gesture - backwards slide (can only swipe on days - can't swipe weeks)	
		swiper.on('slidePrevTransitionEnd', function(){
			self._model.addDaysToDate(-1);	//	updates the date on the model
			self._view.setWeekdayNumbers(self._model);
			self.setBoundaryPages(this);
		});

		self._view.tappedDateInWeekdayList = function(newDate, direction){
			self._model.setDate(newDate.addDays( direction === "forward" ? -1 : 1 ));	// account for day added/subtracted in the callback
			const div = self._view.getPageHTML(self._model, newDate);
			self.removeAllSlidesExceptActive(swiper);
			
			if (direction === "back") {
				swiper.prependSlide(div);
				swiper.update();
				swiper.slidePrev();
				
			} else {
				swiper.appendSlide(div);
				swiper.update();
				swiper.slideNext();
			}
		}
		
		self._view.didTapPrevWeek = function() {
			const newDate = self._model.getDate().addDays(-7);
			const div = self._view.getPageHTML(self._model, newDate);
			
			self.removeAllSlidesExceptActive(swiper);
			swiper.prependSlide(div);
			
			self._model.setDate(newDate.addDays(1));	// account for day added/subtracted in the callback
			swiper.update();
			swiper.slidePrev();
		}
		
		self._view.didTapNextWeek = function() {
			const newDate = self._model.getDate().addDays(7);
			const div = self._view.getPageHTML(self._model, newDate);
			
			self.removeAllSlidesExceptActive(swiper);
			swiper.appendSlide(div);
			
			self._model.setDate(newDate.addDays(-1));	// account for day added/subtracted in the callback
			swiper.update();
			swiper.slideNext();
		}
	}
	
	setBoundaryPages(swiper){
		const self = this;
		self.removeAllSlidesExceptActive(swiper);
	
		const p = self._view.getPageHTML(self._model, self._model.getDate().addDays(-1));
		swiper.prependSlide(p);
		
		const n = self._view.getPageHTML(self._model, self._model.getDate().addDays(1));
		swiper.appendSlide(n);
		
		swiper.update();
	}
	
	removeAllSlidesExceptActive(swiper){
		const slides = swiper.slides;
		const currentIndex = swiper.realIndex;
		
		var removals = [];
		//	remove all slides except for active
		for (var i=0;i<slides.length;i++) {
			if (i !== currentIndex) {
				removals.push(i);
			}	
		}
		
		swiper.removeSlide(removals);
		swiper.update();
	}
}

class Popup extends Controller {
	constructor(el, name, view, model, replaceString) {
		el = document.body;
		super(el, name, view, model);
		const self = this;
		
		view._element.classList.add("modal");
		
		//	add overlay
		const o = self._overlay = document.createElement("div");
		o.id = "overlay";
		o.onclick = function(){
// 			window.location.hash = window.location.hash.replace("?ae", "");	// dismisses the controller
			window.location.hash = window.location.hash.replace(replaceString, "");
		}
		document.body.appendChild(o);
		
		setTimeout(function(){
			self._view._element.style.right = "0px";
		}, 100);
	}
	
	load(){
		this._view.refreshHTML(this._model);
		//	removed set headers for popups	
	}
	
	dismiss(){
		const self = this;
		const o = document.querySelector("#overlay");
		const v = self._view._element;
		
		v.style.right = "-300px";
		setTimeout(function(){
			document.body.removeChild(o);			
			document.body.removeChild(v);
		
		}, 300);
	}
}

class ShowEventPopup extends Popup {
	constructor(el, name, view, model, replaceString) {
		super(el, name, view, model, replaceString);
		const self = this;
		
		this._queryString;
	}
	
	eventId() {
		var id = this._queryString.split("=");
		return id[1];
	}
}

class AddEventPopup extends Popup {
	constructor(el, name, view, model, replaceString) {
		super(el, name, view, model, replaceString);
		
		const self = this;
		
		self._view._onAddEventClicked = function(){
			const validation = self.validate();
			if (validation.status === "ok") {
				
				if (self._endDatepicker.extractDate() < self._startDatepicker.extractDate()) { 
					//	TODO: do some type of error message here
					//	error - end date is before start date
					console.log("end date is before start date");
					return;
				}
				
				//	create event
				const event = {
					name: self._view._eventName.value,
					start_date: self._startDatepicker.extractDate(),
					end_date: self._endDatepicker.extractDate(),
					description: self._view._eventDescription.value || ""
				}
				self._model._eventManager.saveEvent(event);
				window.location.hash = window.location.hash.replace("?ae", ""); // dismiss the controller
				
				//	reload controller that is on top
				//	keep the scroll offset so it doesn't look any different
				
			} else {
				//	TODO: do some type of error message here
				console.log(validation.message);
			}
		}
	}
	
	load(){
		super.load();
		const self = this;
		
		self._startDatepicker = new TKDatepicker({ 
			element: "#event-start",
			startingDate: false
		});
		
		self._endDatepicker = new TKDatepicker({
			element: "#event-end",
			startingDate: false
		});
		
		//	Closes datepicker on wrapper click (excluding input element)
		self._view._element.onclick = function(e){
			if (e.target.id !== self._startDatepicker._inputElement.id) {
				self._startDatepicker.close();
			}
			
			if (e.target.id !== self._endDatepicker._inputElement.id) {
				self._endDatepicker.close();
			}
		}
	}
	
	dismiss(){
		this._startDatepicker.close(); // closes datepicker whenever view is dismissed
		this._endDatepicker.close();
		
		this._startDatepicker.kill();
		this._endDatepicker.kill();
		
		super.dismiss();
	}
	
	validate(){
		const self = this;
		const validationData = [
			{ 
				element: self._view._eventName,
				required: true,
				name: "Event Name"
			},
			{ 
				element: self._view._eventStart,
				required: true,
				name: "Event Start"
			},
			{ 
				element: self._view._eventEnd,
				required: true,
				name: "Event End"
			}	
		];
		return self._model._validator.validate(validationData);
	}
}