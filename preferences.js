Preferences = {};

Preferences.backoffice = "http://m.footballamericain.com/backoffice/v1/";
//Preferences.backoffice = "http://localhost/mobile/backoffice/";

Preferences.key = Preferences.backoffice + "preferences";
Preferences.menu = null;
Preferences.defaultmenu = {
	"navune": true,
	"navelite": true,
	"navncaa": true,
	"navnfl": true,
	"navmatchs": true,
	"navclassements": true,
	"navfavorite": true
};
Preferences.storage = null;
Preferences.unemaxitems = 6;
Preferences.matchseasoncount = 16;
Preferences.debug = false;

// Log
Preferences.log = function(message) {
	if (Preferences.debug)
		console.log(message);
}


// Load preferences
Preferences.load = function() {
	if (this.storage == null)
		this.storage = new FADotCom.LocalStorage();
	var menu = this.storage.getValue(this.key);
	if (menu == null) {
		this.menu = this.defaultmenu;
		this.save();
	} else
		this.menu = menu;
	return this.menu;
}

// Save preferences
Preferences.save = function() {
	if (this.storage == null)
		this.storage = new FADotCom.LocalStorage();
	this.storage.setValue(this.key, this.menu);
}



// Preferences screen
enyo.kind({
	name: "FADotCom.Preferences",
	kind: "onyx.Popup",
	classes: "pref-popup",
	centered: true,
	modal: true,
	floating: true,
	components: [
		{content: "Pr\xE9f\xE9rences", classes: "pref-title"},
		{tag: "hr", classes: "pref-line"},		
		{classes: "pref-item", components: [
			{content: "A la une", classes: "pref-text"},
			{name: "navune", kind:"onyx.ToggleButton", value: true, disabled: true, classes: "pref-toggle"}
		]},
		{classes: "pref-item", components: [
			{content: "Elite", classes: "pref-text"},		
			{name: "navelite", kind:"onyx.ToggleButton", value: true, classes: "pref-toggle"}
		]},
		{classes: "pref-item", components: [
			{content: "NCAA", classes: "pref-text"},		
			{name: "navncaa", kind:"onyx.ToggleButton", value: true, classes: "pref-toggle"}
		]},
		{classes: "pref-item", components: [
			{content: "NFL", classes: "pref-text"},		
			{name: "navnfl", kind:"onyx.ToggleButton", value: true, classes: "pref-toggle"}
		]},
		{classes: "pref-item", components: [
			{content: "Scores", classes: "pref-text"},		
			{name: "navmatchs", kind:"onyx.ToggleButton", value: true, classes: "pref-toggle"}
		]},
		{classes: "pref-item", components: [
			{content: "Classements", classes: "pref-text"},		
			{name: "navclassements", kind:"onyx.ToggleButton", value: true, classes: "pref-toggle"}
		]},
		{classes: "pref-item", components: [
			{content: "Favoris", classes: "pref-text"},		
			{name: "navfavorite", kind:"onyx.ToggleButton", value: true, classes: "pref-toggle"}
		]},
		{tag: "hr", classes: "pref-line"},		
		{kind: "onyx.Button", content: "OK", ontap: "savePref", classes: "pref-okbutton"},
		{kind: "onyx.Button", content: "Annuler", ontap: "cancelPref", classes: "pref-cancelbutton"}
	],

	// Constructor
	create: function() {
		this.inherited(arguments);
	},
	
	// Preferences displayed, load from local storage
	rendered: function() {
		this.inherited(arguments);
		
		// Load preferences
		var menu = Preferences.load();
		
		// Set toggle button settings
		for(var item in menu) {
			this.$[item].setValue(menu[item]);
		}	
	},

	// Save current preference to local storage, update main menu
	savePref: function() {
		// Get menu
		var menu = Preferences.menu;

		// Get toggle button settings
		for(var item in menu) {
			// Save storage
			menu[item] = this.$[item].getValue();
		}
		Preferences.save();
		app.setNavigationVisibility(menu);
		
		this.hide();
	},
	
	// Do pref
	cancelPref: function() {
		this.rendered();
		
		this.hide();	
	}
});
