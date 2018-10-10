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
		
		self._rightIcon.innerHTML = "Add Event";
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
		self._leftIcon.innerHTML = "< " + self._model._year;
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
			console.log(id);
		} 
	}
	
	setHeaderFooterItems(){
		const self = this;
		self._leftIcon.innerHTML = "< " + self._model.monthAbbreviation(self._model._month);
		self._leftIcon.onclick = function(){
			window.location.hash = self._model._year + "/" + self._model._month;
		}
	}
	
	load() {
		super.load();
		
		var mySwiper = new Swiper ('.swiper-container', {
			// Optional parameters
			direction: 'horizontal',
			loop: true,
			
			// If we need pagination
			pagination: {
			  el: '.swiper-pagination',
			},
			
			// Navigation arrows
			navigation: {
			  nextEl: '.swiper-button-next',
			  prevEl: '.swiper-button-prev',
			},
			
			// And if we need scrollbar
			scrollbar: {
			  el: '.swiper-scrollbar',
			},
		})
	}
}

class Popup extends Controller {
	constructor(el, name, view, model) {
		super(el, name, view, model);
		const self = this;
		this._view._element.classList.add("modal");
		
		//	add overlay
		const o = this._overlay = document.createElement("div");
		o.id = "overlay";
		o.onclick = function(){
			window.location.hash = window.location.hash.replace("?ae", "");	// dismisses the controller
		}
		document.body.appendChild(o);
		
		setTimeout(function(){
			self._view._element.style.right = "0px";
		}, 100);
	}
	
	dismiss(){
		const self = this;
		const o = document.querySelector("#overlay");
		const v = self._view._element;
		
		v.style.right = "-300px";
		setTimeout(function(){
			document.body.removeChild(o);			
			self._element.removeChild(v);
		
		}, 300);
	}
}

class AddEventPopup extends Popup {
	constructor(el, name, view, model) {
		super(el, name, view, model);
		
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
		super.dismiss();
// 		window.location.hash = window.location.hash.replace("?ae", "");
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