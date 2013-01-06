// Handle history in detailed view

History = {};

History.stack = [];

History.count = 0;

// Push a new screen into history
History.push = function(s) {
    this.stack[this.count] = s;
	this.count = this.count+1;
}

// Pop the last screen of the history
History.pop = function() {
	this.count = this.count-1;
	return this.stack[this.count];
}

// Get last screen in the history
History.getTop = function() {
	return this.stack[this.count-1];
}

// Clean the stack
History.clean = function() {
	this.stack = [];
	this.count = 0;
}

// Handle view of back button
History.displayButton = function() {
	app.setToolbarDetail({"backbutton": (this.count > 0)})
}
