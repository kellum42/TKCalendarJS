class Controller {
	constructor(name, view, model){
		this._name = name || "";
		this._view = view || {};
		this._model = model || {};
		
		this._leftIcon = document.querySelector('#left-icon');
		this._rightIcon = document.querySelector('#right-icon');
	}
	
	load(el){
		el.innerHTML = this._view.html(this._model) ||  "<h2>Oops. Error</h2>";
		
		// scroll to cached offset
		el.scrollTop = this._model._scrollPosition || 0;
		
		this._leftIcon.innerHTML = "";
		this._leftIcon.onclick = "";
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
	constructor(name, view, model){
		super(name, view, model);
	}
	
	load(el){
		super.load(el);
		const self = this;
		//	scroll to month
		const month = document.querySelectorAll(".month-expanded")[self._model._month];
		const offsetY = month.offsetTop - (el.children[0].scrollHeight + 10) // month y pos - (month heading height + any extra padding)
		el.children[1].scrollTop = offsetY || 0;
		
		self._leftIcon.innerHTML = "< " + self._model._year;
		self._leftIcon.onclick = function(){
			window.location.hash = self._model._year;
		}
	}
}

class WeekController extends Controller {
	constructor(name, view, model) {
		super(name, view, model);
	}
	
	load(el) {
		super.load(el);
		const self = this;
		
		self._leftIcon.innerHTML = "< " + self._model.monthAbbreviation(self._model._month);
		self._leftIcon.onclick = function(){
			window.location.hash = self._model._year + "/" + self._model._month;
		}
		
		self._rightIcon.innerHTML = "Add Event";
		self._rightIcon.onclick = function(){
			window.location.hash = window.location.hash + "?ae";
		}
		
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

class AddEventController extends Controller {
	constructor(name, view, model) {
		super(name, view, model);
	}
	
	load(el) {
		super.load(el);
		const self = this;		
	}
}