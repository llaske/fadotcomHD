// HTML5 local storage handling

enyo.kind({
	name: "FADotCom.LocalStorage",

	// Constructor
	create: function() {
		this.inherited(arguments);
	},
	
	// Test if HTML5 storage is available
	test: function() {
		return (typeof(Storage)!=="undefined" && typeof(window.localStorage)!=="undefined");
	},
	
	// Set a value in the storage
	setValue: function(key, value) {
		if (this.test()) {	
			window.localStorage.setItem(key, JSON.stringify(value));
		}
	},
	
	// Get a value in the storage
	getValue: function(key) {
		if (this.test()) {
			return JSON.parse(window.localStorage.getItem(key));
		}
		return null;
	}
});