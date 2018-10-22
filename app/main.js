const app = new App('#calendar');

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

Date.prototype.isToday = function() {
	const today = new Date();
	return today.getFullYear() === this.getFullYear() && today.getMonth() === this.getMonth() && today.getDate() === this.getDate();
}
