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
	}
	
	load(){
		this._view.refreshHTML(this._model);		
		this._leftIcon = document.querySelector('#left-icon');
		this._rightIcon = document.querySelector('#right-icon');	
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
		const o = document.createElement("div");
		o.id = "overlay";
		o.onclick = function(){
			window.location.hash = window.location.hash.replace("?ae", "");
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
	}
	
	load(){
		super.load();
		
		this._datepicker = new TKDatepicker({ 
			element: "#add-event-date",
			startingDate: false,
			onNewDateTapped: function(date){
// 				console.log(date);
			}
		});
	}
}