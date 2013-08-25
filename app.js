// FA.com mobile tablet version

// Constants
var leftButton = "images/left.png";
var rightButton = "images/right.png";

// Main app class
enyo.kind({
	name: "FADotCom.TabletApp",
	kind: "FittableRows",
	fit: false,
	components: [
		{kind: "Image", src: "images/fadotcom-title.png", classes: "fadotcom-title"},
		{kind: "FittableColumns", classes: "fitscreen enyo-fit", components: [
			{name: "fitnav", kind: "FittableRows", classes: "fitnav",  ondragover: "dragover", ondrop: "drop", components: [
				{name: "navitems", fit: true, components: [
					{name: "navune", classes: "nav-item", content: "A la une", ontap: "cmdUne"},
					{name: "navelite", classes: "nav-item", content: "Elite", ontap: "cmdElite"},
					{name: "navncaa", classes: "nav-item", content: "NCAA", ontap: "cmdNCAA"},
					{name: "navnfl", classes: "nav-item", content: "NFL", ontap: "cmdNFL"},
					{name: "navmatchs", classes: "nav-item", content: "Scores", ontap: "cmdMatchs"},
					{name: "navclassements", classes: "nav-item", content: "Classements", ontap: "cmdClassements"},
					{name: "navfavorite", classes: "nav-item", content: "Favoris", ontap: "cmdFavoris"}
				]},	
				{kind: "onyx.Toolbar", components: [
					{content: "", classes: "fitnav-toolbar" },
					{kind: "onyx.IconButton", src: "images/prefs.png", showing: true, classes: "prefs-button", ontap: "showPref"}
				]}
			]},
			{name: "fitlist", kind: "FittableRows", classes: "fitlist fittable-shadow", ondragover: "dragover", ondragstart: "dragstart", ondrop: "drop", components: [
				{kind: "Panels", fit: true, name: "listcontent", components: []},
				{kind: "onyx.Toolbar", components: [
					{name: "grabberlist", kind: "onyx.Grabber", ondblclick: "doubleclick"},
					{name: "spinnerlist", showing: false, kind: "Image", src: "images/spinner-dark.gif", classes: "list-spinner"},
					{name: "refresh", showing: true, kind: "onyx.IconButton", src: "images/refresh.png", classes: "refresh-button", ontap: "refreshList"},
					{name: "plus", showing: false, kind: "onyx.IconButton", src: "images/plus.png", classes: "plus-button", ontap: "selectFavorites"}
				]}
			]},
			{name: "fitdetail", kind: "FittableRows", fit: true, classes: "fitdetail fittable-shadow", ondragover: "dragover", ondragstart: "dragstart", ondrop: "drop", components: [
				{kind: "Panels", fit: true, name: "detailcontent", components: []},
				{name: "toolbardetail", kind: "onyx.Toolbar", components: [
					{name: "grabberdetail", kind: "onyx.Grabber", ondblclick: "doubleclick"},
					{name: "spinnerdetail", showing: false, kind: "Image", src: "images/spinner-dark.gif", classes: "list-spinner"},
					{name: "viewswitch", kind: "Image", src: rightButton, classes: "switchview-button", ontap: "switchView" },
					{name: "backbutton", kind: "onyx.IconButton", src: "images/back.png", showing: false, classes: "back-button", ontap: "historyBack"},
					{name: "commentbutton", kind: "onyx.IconButton", src: "images/comment.png", showing: false, classes: "comment-button", ontap: "openComment"},
					{name: "commentnumber", content: "00", classes: "comment-number", showing: false },
					{name: "webbutton", kind: "onyx.IconButton", src: "images/web.png", showing: false, classes: "web-button", ontap: "openWebsite"},
					{name: "sendbutton", kind: "onyx.IconButton", src: "images/send.png", showing: false, classes: "send-button", ontap: "openMail"},
					{name: "favbutton", kind: "onyx.ToggleIconButton", src: "images/favorite.png", showing: false, value: false, classes: "fav-button", ontap: "markFavorite"}
				]}
			]},
			{name: "pref", kind: "FADotCom.Preferences", onHide: "prefHidden"},
			{name: "error", classes: "error-popup", kind: "onyx.Popup", centered: true, modal: true, floating: true, components: [
				{content: "ERREUR :-(", classes: "error-title"}, {tag: "hr"},
				{content: "Ooops, une erreur est survenue...", classes: "error-message"},
				{content: "V\xE9rifiez votre connexion Internet et r\xE9essayez ult\xE9rieurement.", classes: "error-message"},
				{name: "errorcode", classes: "error-code"}
			]}			
		]}
	],

	// Constructor
	create: function() {
		// Init
		this.inherited(arguments); 
		this.navselection = null;
		this.toolbarweburl = null;
		this.toolbarcommenturl = null;
		this.toolbarmailurl = null;
		this.favorite = null;
		app = this; // HACK: force global setting
		Stats.init();
		Stats.trace("/tablet/home");
		
		// Change view depending of preferences
		this.setNavigationVisibility(Preferences.load());
		
		// Select first item
		this.refresh = this.cmdUne;
		this.cmdUne();
	},
	
	// Rendering, store init size
	rendered: function() {
		this.inherited(arguments);	
		this.fitnavinitsize = this.$.fitnav.hasNode().clientWidth;
		this.fitlistinitsize = this.$.fitlist.hasNode().clientWidth;
	},
	
	// View articles
	cmdUne: function() {
		this.refresh = this.cmdUne;	
		Stats.trace("/tablet/une");		
		this.viewArticles("1,2,3", "navune", Preferences.unemaxitems);
	},
	
	cmdElite: function() {
		this.refresh = this.cmdElite;	
		Stats.trace("/tablet/elite");		
		this.viewArticles("3", "navelite", -1);
	},
	
	cmdNCAA: function() {
		this.refresh = this.cmdNCAA;	
		Stats.trace("/tablet/ncaa");
		this.viewArticles("2", "navncaa", -1);
	},
	
	cmdNFL: function() {
		this.refresh = this.cmdNFL;	
		Stats.trace("/tablet/nfl");
		this.viewArticles("1", "navnfl", -1);
	},
	
	viewArticles: function(ligues, index, maxitem) {
		this.showList(index, {kind: "FADotCom.Articles", ligues: ligues, maxitem: maxitem}, true);
	},
	
	// View matchs
	cmdMatchs: function() {
		this.refresh = this.cmdMatchs;	
		Stats.trace("/tablet/scores");
		this.showList("navmatchs", {kind: "FADotCom.Matchs"}, true);	
	},
	
	// View scores
	cmdClassements: function() {
		this.refresh = this.cmdClassements;	
		Stats.trace("/tablet/classements");
		this.showList("navclassements", {kind: "FADotCom.Classements"}, true);	
	},
	
	// View favorites
	cmdFavoris: function() {
		this.refresh = this.cmdFavoris;
		Stats.trace("/tablet/favoris");
		this.showList("navfavorite", {kind: "FADotCom.Favoris"}, true);
		this.$.plus.show();
	},
	
	selectFavorites: function() {
		this.spinnerDetail(true);
		this.showDetail({kind: "FADotCom.FavorisSelect"});
	},
	
	updateFavorites: function() {
		this.showList("navfavorite", {kind: "FADotCom.Favoris"}, false);	
		this.$.plus.show();		
	},
	
	// Refresh list
	refreshList: function() {
		this.refresh();
	},
	
	// Change selection
	selectItem: function(key) {
		if (this.navselection != null) 
			this.navselection.removeClass("nav-item-selected")
		var navitems = this.$.navitems.getControls();
		for (var i = 0 ; i < navitems.length ; i++) {
			var navitem = navitems[i];
			if (navitem.name == key) {
				navitem.addClass("nav-item-selected");
				this.navselection = navitem;
				break;
			}
		}
	},
	
	// Show a new content in the list view
	showList: function(item, component, cleardetail) {
		// Select item, clear panel and toolbar
		this.selectItem(item);	
		this.clearPanel(this.$.listcontent, false);
		if (cleardetail) {
			this.clearPanel(this.$.detailcontent, true);
			History.clean();
			this.setToolbarDetail({"sendbutton": false, "commentbutton": false, "commentnumber": false, "webbutton": false, "backbutton": false, "favbutton": false});
		}
		this.$.plus.hide();

		// Launch processing component
		this.spinnerList(true);
		this.$.listcontent.createComponent(component, {owner: this});	
		this.$.listcontent.render();	
	},
	
	// Show a new content in the detailed view
	showDetail: function(args) {
		// Clear panel and hide buttons
		this.clearPanel(this.$.detailcontent, false);
		this.setToolbarDetail({"sendbutton": false, "commentbutton": false, "commentnumber": false, "webbutton": false, "backbutton": false, "favbutton": false});
		
		// Create the detail view using the right class and parameter
		this.$.detailcontent.createComponent(args, {owner: this});
		this.$.detailcontent.render();
	},
	
	// Util function, destroy all controls in the panel
	clearPanel: function(panel, empty) {
		var controls = panel.getControls();
		for (var i = 0, c; c = controls[i]; i++) c.destroy();
		if (panel == this.$.detailcontent && empty) {
			this.$.detailcontent.createComponent({components:[{kind: "Image", src: "images/fadotcom_bg.jpg", classes: "fadotcom-bg"}]}, {owner: this});
		}
		panel.render();
	},
	
	// Activate or desactivate spinner detail
	spinnerList: function(value) {
		if (value)
			this.$.spinnerlist.show();
		else
			this.$.spinnerlist.hide();
	},
	
	// Activate or desactivate spinner detail
	spinnerDetail: function(value) {
		if (value)
			this.$.spinnerdetail.show();
		else
			this.$.spinnerdetail.hide();
	},
	
	// Update menu visibility
	setNavigationVisibility: function(menu) {
		for(var item in menu) {
			if (menu[item]) {
				this.$[item].show();
			} else {
				this.$[item].hide();
				if (this.navselection == this.$[item])
					this.cmdUne();
			}
		}	
	},
	
	// Change button visibility in detail toolbar
	setToolbarDetail: function(values) {
		// Get toolbar buttons
		var buttons = this.$.toolbardetail.getControls();

		// Iterate on settings
		for(var key in values) {
			// Look for that button in the toolbar
			for (var i = 0 ; i < buttons.length ; i++) {
				var button = buttons[i];
				if (button.name == key) {
					// Found, change visibility
					if (values[key])
						button.show();
					else
						button.hide();
				}
			}
		}
	},
	
	// Handling toolbar button to web, mail, history and favorites
	setToolbarWebsite: function(url) {
		this.toolbarweburl = url;
	},
	
	setToolbarComment: function(number, url) {
		this.toolbarcommenturl = url;
		this.$.commentnumber.setContent(number);
	},

	setToolbarMailto: function(url) {
		this.toolbarmailurl = url;
	},
	
	openWebsite: function() {
		window.open(this.toolbarweburl);
	},
	
	openComment: function() {
		window.open(this.toolbarcommenturl);
	},
	
	openMail: function() {
		window.location.href = this.toolbarmailurl;	
	},
	
	setFavorite: function(favorite) {
		this.favorite = favorite;
		this.$.favbutton.setValue(TeamFavorites.is(favorite));
	},
	
	markFavorite: function() {
		if (this.$.favbutton.getValue())
			TeamFavorites.add(this.favorite);
		else
			TeamFavorites.remove(this.favorite);
		if (this.refresh == this.cmdFavoris)
			this.updateFavorites();
	},
	
	historyBack: function() {
		this.spinnerDetail(true);
		this.showDetail(History.pop());
	},
	
	// Preference handling
	showPref: function() {
		this.$.pref.show();
	},
	
	prefHidden: function() {
		this.$.pref.cancelPref();
	},
	
	// Process error
	error: function(code) {
		this.$.errorcode.setContent(code);
		this.$.error.show();
		this.spinnerDetail(false);
		this.spinnerList(false);
	},
	
	// Switch between 3-column view and 1-column view
	switchView: function() {
		if (this.$.viewswitch.src != leftButton) {	
			this.$.fitlist.hide();
			this.$.fitnav.hide();		
			this.$.viewswitch.setSrc(leftButton);
		} else {
			this.$.fitlist.applyStyle("width", this.fitlistinitsize+"px");
			this.$.fitlist.show();
			this.$.fitnav.applyStyle("width", this.fitnavinitsize+"px");			
			this.$.fitnav.show();		
			this.$.viewswitch.setSrc(rightButton);
		}
		this.resized();			
	},
	
	// Start dragging a row
	dragstart: function(s, e) {
		// Reming the dragging object
		this.dragobject = s.name;
		this.dragx = e.dx;
		var tofit;
		
		// Resize the previous row
		if (this.dragobject == "fitlist") {
			tofit = this.$.fitnav;
		} else if (this.dragobject == "fitdetail") {
			tofit = this.$.fitlist;
		} else 
			return true;	
		var newsize = tofit.hasNode().clientWidth+e.dx;
		tofit.applyStyle("width", newsize+"px");
		
		return true;
	},
	
	// Dragging over a row
	dragover: function(s, e) {
		// Nothing to drag
		if (this.dragobject == null)
			return true;
			
		// Resize the previous row
		var tofit;
		if (this.dragobject == "fitlist") {
			tofit = this.$.fitnav;
		} else if (this.dragobject == "fitdetail") {
			tofit = this.$.fitlist;
		} else 
			return true;
			
		// Resize previous row
		var newsize = tofit.hasNode().clientWidth+(e.dx-this.dragx);
		tofit.applyStyle("width", newsize+"px");		
		this.dragx = e.dx;	
		
		// Signal to the fittable to redraw
		this.resized();
		
		// Event processed
		e.preventDefault();
		return false;
	},
	
	// Drop a row
	drop: function(s, e) {
		// Compute final size to simplify handling
		if (this.dragobject == "fitlist") {
			if (this.dragx < 0) {
				this.$.fitnav.hide();
			} else {
				this.$.fitnav.applyStyle("width", this.fitnavinitsize+"px");	
				this.$.fitnav.show();
			}
			this.resized();		
		} else if (this.dragobject == "fitdetail") {
			if (this.dragx < 0) {
				this.$.fitlist.hide();
				this.$.fitnav.hide();
				this.$.viewswitch.setSrc(leftButton);
			} else {
				this.$.fitlist.applyStyle("width", this.fitlistinitsize+"px");
				this.$.fitlist.show();	
				this.$.viewswitch.setSrc(rightButton);				
			}
			this.resized();				
		}
		
		// Reset objects
		this.dragobject = null;
		this.dragx = 0;
		return true;
	},

	// Double click on a row grabber
	doubleclick: function(s, e) {
		// On the second row, hide the first row
		if (s.name == "grabberlist") {
			if (this.$.fitnav.showing)
				this.$.fitnav.hide();
			else
				this.$.fitnav.show();
			this.resized();	
		} 
		
		// On the third row, hide the first and the second row
		else if (s.name == "grabberdetail") {
			if (this.$.fitlist.showing) {
				this.$.fitlist.hide();
				this.$.fitnav.hide();
			} else {
				this.$.fitlist.show();
			}
			this.resized();				
		}
	}
});
